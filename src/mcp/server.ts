import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import Fastify from "fastify";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import puppeteer from "puppeteer";
import { extractPdfPayload } from "../services/pdf-service";
import { taskQueue } from "../workflows/queue";

const execPromise = promisify(exec);

// CAD Integration Imports
import { OnShapeClient } from "./cad/onshape-client";
import { LocalCADClient } from "./cad/local-cad-client";
import { CADAnalysisEngine } from "./cad/analysis-engine";
import { CADCollaborationManager } from "./cad/collaboration-manager";

// CAD Configuration (would normally come from environment variables)
const CAD_CONFIG = {
  onshape: {
    clientId: process.env.ONSHAPE_CLIENT_ID,
    clientSecret: process.env.ONSHAPE_CLIENT_SECRET,
    redirectUri: process.env.ONSHAPE_REDIRECT_URI || "http://localhost:3000/callback",
    accessKey: process.env.ONSHAPE_ACCESS_KEY,
    secretKey: process.env.ONSHAPE_SECRET_KEY,
    baseUrl: "https://cad.onshape.com"
  }
};

// Initialize CAD Components
const onshapeClient = new OnShapeClient(CAD_CONFIG.onshape);
const localCADClient = new LocalCADClient();
const analysisEngine = new CADAnalysisEngine(onshapeClient);
const collaborationManager = new CADCollaborationManager(onshapeClient);


// Extracted tools array for internal use
export const backendTools = [
  {
    name: "get_system_time",
    description: "Returns the current system time from the Node.js backend server. Useful for getting accurate time without relying on the browser.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "read_backend_file",
    description: "Reads the contents of a file from the backend server's file system. Takes an absolute or relative path to a file. ONLY USE THIS if asked to read backend files. DO NOT USE FOR BROWSER FILES.",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "The path to the file to read (e.g. 'package.json' or '/etc/hosts')",
        },
        rangeToShow: {
          type: "array",
          items: { type: "number" },
          description: "Optional 1-indexed line range [startLine, endLine] to only read a specific section of the file. Extremely useful for large files to save context.",
        }
      },
      required: ["filePath"],
    },
  },
  {
    name: "write_backend_file",
    description: "Writes or modifies content in a file on the backend server's file system. Can either overwrite the entire file using 'content', or make precise multi-line replacements using 'edits'.",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "The path to the file to modify",
        },
        content: {
          type: "string",
          description: "The full content to write. If 'edits' is provided, this property is IGNORED.",
        },
        edits: {
          type: "array",
          description: "An array of precise edits to make. The file will be read, and every targetText found will be replaced with replacementText. This is HIGHLY recommended to save token context bandwidth instead of rewriting an entire file just to change one line.",
          items: {
            type: "object",
            properties: {
              targetText: { type: "string" },
              replacementText: { type: "string" }
            },
            required: ["targetText", "replacementText"]
          }
        }
      },
      required: ["filePath"],
    },
  },
  {
    name: "search_web",
    description: "Searches the web using DuckDuckGo for a given query and returns a text summary of the results.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "execute_terminal_command",
    description: "Executes a bash/shell command on the backend server. Use this to list directories (ls), make folders (mkdir), or run other safe terminal tasks.",
    inputSchema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "The terminal command to execute. IMPORTANT: DO NOT attempt to explore directories outside of the project root. If you need to explore files, use the get_directory_tree tool instead of ls or find.",
        },
      },
      required: ["command"],
    },
  },
  {
    name: "get_directory_tree",
    description: "Returns a curated, clean tree structure of files in the backend directory. Ignores noisy folders like node_modules or .git. Always use this tool for exploring available files instead of executing terminal ls commands.",
    inputSchema: {
      type: "object",
      properties: {
        dirPath: {
          type: "string",
          description: "The directory path to list. To list the root backend directory, you MUST use '.'. Do not use placeholders.",
        },
        maxDepth: {
          type: "number",
          description: "Maximum depth to recurse. Defaults to 3.",
        }
      },
      required: ["dirPath"]
    },
  },
  {
    name: "find_image",
    description: "Searches for and returns direct image URLs based on a descriptive query (Uncensored search included)",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Natural language description of the desired image (e.g., 'beautiful pomeranian dog', 'sunset over mountains')"
        },
        size: {
          type: "string",
          enum: ["small", "medium", "large", "original"],
          description: "Preferred image size",
          default: "medium"
        },
        format: {
          type: "string",
          enum: ["any", "jpg", "png", "webp", "gif"],
          description: "Preferred image format",
          default: "any"
        },
        maxResults: {
          type: "integer",
          description: "Maximum number of image URLs to return",
          default: 5,
          minimum: 1,
          maximum: 20
        }
      },
      required: ["query"]
    }
  },
  {
    name: "analyze_webpage",
    description: "Navigates to a URL using a headless browser, waits for JavaScript and Canvas to render, and returns a Base64 screenshot along with extracted text. Use this for highly interactive or 3D websites.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The full URL to analyze",
        }
      },
      required: ["url"],
    }
  },
  {
    name: "analyze_image",
    description: "Analyzes an image file on the local filesystem using a vision-capable LLM. Use this to answer questions like 'what's this image about?'.",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "The absolute or relative path to the image file to analyze."
        },
        prompt: {
          type: "string",
          description: "The question or instruction about the image. E.g., 'Describe this image in detail' or 'Extract the text from this image'."
        }
      },
      required: ["filePath", "prompt"]
    }
  },
  {
    name: "analyze_pdf",
    description: "Extracts text from a local PDF file or downloads and extracts text from a PDF URL. If the PDF points to a scanned document, it will automatically fallback to analyzing the visual pages.",
    inputSchema: {
      type: "object",
      properties: {
        filePathOrUrl: {
          type: "string",
          description: "The absolute or relative path to the local PDF file, or a direct HTTP URL to a PDF."
        }
      },
      required: ["filePathOrUrl"]
    }
  },
  {
    name: "createTask",
    description: "Creates a long-running background task to be handled by the backend orchestrator (like a Perplexity mini-agent). Use this when the user asks to perform complex or long-running work.",
    inputSchema: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description: "The clear, robust instruction and context defining what the background task should exactly do."
        }
      },
      required: ["description"]
    }
  },
  {
    name: "sign_pdf_document",
    description: "Digitally signs a PDF document by placing a signature image at the correct location based on the signer's name and signing line detection.",
    inputSchema: {
      type: "object",
      properties: {
        pdfFile: {
          type: "string",
          description: "Path to the PDF file to be signed (absolute or relative path)"
        },
        signerName: {
          type: "string",
          description: "Name of the person who needs to sign the document"
        },
        signatureImage: {
          type: "string",
          description: "Path to the signature image file (PNG, JPG, etc.)"
        }
      },
      required: ["pdfFile", "signerName", "signatureImage"]
    }
  },

  // === CAD INTEGRATION TOOLS ===

  {
    name: "cad_get_onshape_auth_url",
    description: "Get the OAuth authorization URL for OnShape CAD platform authentication",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "local_cad_create_bolt",
    description: "Generates a parametric 3D bolt locally (no Onshape API called). Use this for mass-generation or simulations. Returns a local URL for the Jarvis Dashboard.",
    inputSchema: {
      type: "object",
      properties: {
        headWidth: { type: "number", description: "Width across flats (e.g. 19 for M12)" },
        headHeight: { type: "number", description: "Height of the hex head" },
        shaftDiameter: { type: "number", description: "Diameter of the shaft (e.g. 12 for M12)" },
        shaftLength: { type: "number", description: "Length of the shaft" },
        threadLength: { type: "number", description: "Length of the threaded portion (e.g. 50)" },
        threadPitch: { type: "number", description: "Distance between threads (e.g. 2.54 for 10 TPI)" }
      },
      required: ["headWidth", "headHeight", "shaftDiameter", "shaftLength"]
    }
  },
  {
    name: "local_cad_create_nut",
    description: "Generates a parametric 3D nut locally. Includes internal threads and professional rounding.",
    inputSchema: {
      type: "object",
      properties: {
        width: { type: "number", description: "Width across flats (e.g. 19 for M12)" },
        height: { type: "number", description: "Height of the nut" },
        holeDiameter: { type: "number", description: "Diameter of the internal hole" },
        threadPitch: { type: "number", description: "Pitch of the internal thread" }
      },
      required: ["width", "height", "holeDiameter"]
    }
  },
  {
    name: "local_cad_create_gear",
    description: "Generates a parametric 3D spur gear locally.",
    inputSchema: {
      type: "object",
      properties: {
        teeth: { type: "number", description: "Number of teeth" },
        module: { type: "number", description: "Gear module (size factor)" },
        thickness: { type: "number", description: "Thickness of the gear" },
        holeDiameter: { type: "number", description: "Diameter of the center hole" }
      },
      required: ["teeth", "module", "thickness", "holeDiameter"]
    }
  },
  {
    name: "cad_list_documents",
    description: "List all OnShape documents accessible to the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of documents to return",
          default: 50,
          minimum: 1,
          maximum: 100
        },
        offset: {
          type: "number",
          description: "Number of documents to skip",
          default: 0,
          minimum: 0
        }
      },
      required: []
    }
  },

  {
    name: "cad_create_document",
    description: "Create a new OnShape document",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the document to create"
        },
        description: {
          type: "string",
          description: "Description of the document",
          default: ""
        },
        units: {
          type: "string",
          enum: ["mm", "cm", "in", "ft"],
          description: "Units for the document",
          default: "mm"
        }
      },
      required: ["name"]
    }
  },

  {
    name: "cad_create_sketch",
    description: "Create a new sketch. 🟥 CRITICAL SPATIAL RULE: Only use 'Top' for all sketches in a single part. Using 'Top' for head and 'Front' for shaft will create a broken 90-degree bolt. STICK TO ONE PLANE.",
    inputSchema: {
      type: "object",
      properties: {
        documentId: {
          type: "string",
          description: "ID of the OnShape document"
        },
        featureName: {
          type: "string",
          description: "Name for the sketch feature"
        },
        sketchType: {
          type: "string",
          description: "Plane name (e.g. 'Top', 'Front', 'Right') or a face ID",
          default: "Top"
        },
        geometry: {
          type: "array",
          description: "Array of geometry objects. Hexagon requires [cx, cy, inradius].",
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["line", "circle", "rectangle", "arc", "spline", "hexagon"]
              },
              coordinates: {
                type: "array",
                items: { type: "number" },
                description: "Coordinates. Hexagon: [cx, cy, inradius]."
              },
              properties: {
                type: "object",
                description: "Additional geometry properties"
              }
            }
          }
        },
        partStudioEid: {
          type: "string",
          description: "Optional: Target a specific Part Studio tab ID"
        }
      },
      required: ["documentId", "featureName"]
    }
  },
  {
    name: "cad_create_extrude",
    description: "Create an extrude feature. Use 'ADD' to merge with existing bodies (e.g. bolt shaft to head).",
    inputSchema: {
      type: "object",
      properties: {
        documentId: {
          type: "string",
          description: "ID of the OnShape document"
        },
        sketchId: {
          type: "string",
          description: "ID of the sketch feature to extrude"
        },
        distance: {
          type: "number",
          description: "Extrusion distance in mm"
        },
        direction: {
          type: "string",
          enum: ["positive", "negative", "both"],
          description: "Extrusion direction",
          default: "positive"
        },
        operationType: {
          type: "string",
          enum: ["NEW", "ADD", "REMOVE", "INTERSECT"],
          description: "Operation: 'ADD' to merge, 'REMOVE' to subtract (holes)",
          default: "NEW"
        },
        featureName: {
          type: "string",
          description: "Optional: Name for the extrude feature"
        },
        partStudioEid: {
          type: "string",
          description: "Optional: Target a specific Part Studio tab ID"
        }
      },
      required: ["documentId", "sketchId", "distance"]
    }
  },
  {
    name: "cad_create_revolve",
    description: "Create a revolve feature from a sketch in OnShape",
    inputSchema: {
      type: "object",
      properties: {
        documentId: {
          type: "string",
          description: "ID of the OnShape document"
        },
        sketchId: {
          type: "string",
          description: "ID of the sketch feature to revolve"
        },
        axisId: {
          type: "string",
          description: "ID of the sketch feature or axis to revolve around"
        },
        revolveType: {
          type: "string",
          enum: ["FULL", "ONE_WAY", "TWO_WAY", "SYMMETRIC"],
          description: "Type of revolution",
          default: "FULL"
        },
        angle: {
          type: "number",
          description: "Revolution angle in degrees",
          default: 360
        },
        partStudioEid: {
          type: "string",
          description: "Optional: Target a specific Part Studio tab ID"
        }
      },
      required: ["documentId", "sketchId", "axisId"]
    }
  },
  {
    name: "cad_create_sweep",
    description: "Create a sweep feature in OnShape",
    inputSchema: {
      type: "object",
      properties: {
        documentId: {
          type: "string",
          description: "ID of the OnShape document"
        },
        profileSketchId: {
          type: "string",
          description: "ID of the sketch feature for the profile"
        },
        pathId: {
          type: "string",
          description: "ID of the sketch feature for the path"
        },
        partStudioEid: {
          type: "string",
          description: "Optional: Target a specific Part Studio tab ID"
        }
      },
      required: ["documentId", "profileSketchId", "pathId"]
    }
  },
  {
    name: "cad_create_loft",
    description: "Create a loft feature between multiple sketches in OnShape",
    inputSchema: {
      type: "object",
      properties: {
        documentId: {
          type: "string",
          description: "ID of the OnShape document"
        },
        profileIds: {
          type: "array",
          items: { type: "string" },
          description: "IDs of the sketch features to loft through"
        },
        partStudioEid: {
          type: "string",
          description: "Optional: Target a specific Part Studio tab ID"
        }
      },
      required: ["documentId", "profileIds"]
    }
  },
  {
    name: "cad_create_plane",
    description: "Create a construction plane in OnShape",
    inputSchema: {
      type: "object",
      properties: {
        documentId: {
          type: "string",
          description: "ID of the OnShape document"
        },
        entities: {
          type: "array",
          items: { type: "string" },
          description: "List of reference entities (plane names like 'Top' or face/feature IDs)"
        },
        offset: {
          type: "number",
          description: "Offset distance in mm"
        },
        partStudioEid: {
          type: "string",
          description: "Optional: Target a specific Part Studio tab ID"
        },
        name: {
          type: "string",
          description: "Optional: Name for the construction plane"
        }
      },
      required: ["documentId", "entities"]
    }
  },
  {
    name: "cad_create_fillet",
    description: "Create a fillet feature in OnShape",
    inputSchema: {
      type: "object",
      properties: {
        documentId: {
          type: "string",
          description: "ID of the OnShape document"
        },
        entities: {
          type: "array",
          items: { type: "string" },
          description: "IDs of edges or faces to fillet"
        },
        radius: {
          type: "number",
          description: "Fillet radius in mm"
        },
        partStudioEid: {
          type: "string",
          description: "Optional: Target a specific Part Studio tab ID"
        },
        featureName: {
          type: "string",
          description: "Optional: Name for the fillet feature"
        }
      },
      required: ["documentId", "entities", "radius"]
    }
  },
  {
    name: "cad_create_hole",
    description: "Create a hole feature in OnShape",
    inputSchema: {
      type: "object",
      properties: {
        documentId: {
          type: "string",
          description: "ID of the OnShape document"
        },
        locationSketchId: {
          type: "string",
          description: "ID of a sketch containing points for hole locations"
        },
        faceId: {
          type: "string",
          description: "ID of the face to place the hole on"
        },
        diameter: {
          type: "number",
          description: "Hole diameter in mm"
        },
        depth: {
          type: "number",
          description: "Hole depth in mm (omit for through-hole)"
        },
        holeType: {
          type: "string",
          enum: ["SIMPLE", "COUNTERBORE", "COUNTERSINK"],
          default: "SIMPLE"
        },
        partStudioEid: {
          type: "string",
          description: "Optional: Target a specific Part Studio tab ID"
        },
        featureName: {
          type: "string",
          description: "Optional: Name for the hole feature"
        }
      },
      required: ["documentId", "diameter"]
    }
  },

  {
    name: "cad_run_stress_analysis",
    description: "Run finite element stress analysis on a CAD part",
    inputSchema: {
      type: "object",
      properties: {
        documentId: {
          type: "string",
          description: "ID of the OnShape document"
        },
        partId: {
          type: "string",
          description: "ID of the part to analyze"
        },
        materialProperties: {
          type: "object",
          description: "Material properties (youngsModulus, poissonsRatio, density, etc.)",
          properties: {
            name: { type: "string" },
            youngsModulus: { type: "number" },
            poissonsRatio: { type: "number" },
            density: { type: "number" },
            yieldStrength: { type: "number" },
            tensileStrength: { type: "number" }
          },
          required: ["youngsModulus", "poissonsRatio"]
        },
        boundaryConditions: {
          type: "array",
          description: "Array of boundary conditions",
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["fixed", "pinned", "displacement", "force", "pressure"]
              },
              faces: {
                type: "array",
                items: { type: "string" },
                description: "Face IDs where condition is applied"
              },
              values: {
                type: "object",
                description: "Values for the boundary condition"
              }
            }
          }
        },
        loadCases: {
          type: "array",
          description: "Array of load cases to apply",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              type: {
                type: "string",
                enum: ["force", "pressure", "gravity", "thermal"]
              },
              magnitude: { type: "number" },
              direction: {
                type: "array",
                items: { type: "number" },
                description: "Load direction [x, y, z]"
              },
              applicationPoint: {
                type: "array",
                items: { type: "number" },
                description: "Application point [x, y, z]"
              }
            }
          }
        }
      },
      required: ["documentId", "partId", "materialProperties"]
    }
  },

  {
    name: "cad_run_motion_analysis",
    description: "Run motion analysis study on a CAD assembly",
    inputSchema: {
      type: "object",
      properties: {
        documentId: {
          type: "string",
          description: "ID of the OnShape document"
        },
        assemblyId: {
          type: "string",
          description: "ID of the assembly to analyze"
        },
        studyName: {
          type: "string",
          description: "Name for the motion study"
        },
        timeRange: {
          type: "number",
          description: "Duration of the analysis in seconds",
          minimum: 0.1
        },
        timeSteps: {
          type: "number",
          description: "Number of time steps for the analysis",
          minimum: 10,
          maximum: 1000,
          default: 100
        },
        gravity: {
          type: "array",
          items: { type: "number" },
          description: "Gravity vector [x, y, z] in m/s²",
          default: [0, 0, -9.81]
        },
        constraints: {
          type: "array",
          description: "Assembly constraints for motion analysis",
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["revolute", "prismatic", "ball", "fixed", "planar"]
              },
              part1: { type: "string" },
              part2: { type: "string" },
              origin: {
                type: "array",
                items: { type: "number" }
              },
              axis: {
                type: "array",
                items: { type: "number" }
              }
            }
          }
        }
      },
      required: ["documentId", "assemblyId", "studyName"]
    }
  },

  {
    name: "cad_get_analysis_status",
    description: "Get the status of a running CAD analysis",
    inputSchema: {
      type: "object",
      properties: {
        analysisId: {
          type: "string",
          description: "ID of the analysis to check"
        }
      },
      required: ["analysisId"]
    }
  },

  {
    name: "cad_share_document",
    description: "Share an OnShape document with specific users",
    inputSchema: {
      type: "object",
      properties: {
        documentId: {
          type: "string",
          description: "ID of the document to share"
        },
        userEmails: {
          type: "array",
          items: { type: "string" },
          description: "Array of email addresses to share with"
        },
        permissionLevel: {
          type: "string",
          enum: ["view", "edit", "admin"],
          description: "Permission level for shared users",
          default: "view"
        },
        message: {
          type: "string",
          description: "Optional message to include with the share invitation"
        }
      },
      required: ["documentId", "userEmails"]
    }
  },

  {
    name: "cad_get_change_events",
    description: "Get change events for a CAD document",
    inputSchema: {
      type: "object",
      properties: {
        documentId: {
          type: "string",
          description: "ID of the document to get events for"
        },
        startTime: {
          type: "string",
          description: "Start time for event filtering (ISO string)"
        },
        endTime: {
          type: "string",
          description: "End time for event filtering (ISO string)"
        },
        eventType: {
          type: "string",
          description: "Type of events to filter by"
        },
        userId: {
          type: "string",
          description: "User ID to filter events by"
        },
        limit: {
          type: "number",
          description: "Maximum number of events to return",
          default: 50,
          minimum: 1,
          maximum: 200
        }
      },
      required: ["documentId"]
    }
  }

];

// Handle Execution for both MCP Server and internal Orchestrator
export async function executeBackendTool(name: string, args: any): Promise<any> {
  if (name === "analyze_webpage") {
    const { url } = args as { url: string };
    console.error(`[MCP Tool Exec] analyze_webpage called with URL: ${url}`);
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });

      // Wait explicitly for 3D/Canvas and JS to finish initial render
      await new Promise(resolve => setTimeout(resolve, 4000));

      const screenshotBase64 = await page.screenshot({ encoding: "base64" });
      const title = await page.title().catch(() => 'Unknown');

      // Basic text extraction matching readability
      const html = await page.content();
      await browser.close();

      const doc = new JSDOM(html, { url });
      const reader = new Readability(doc.window.document);
      const article = reader.parse();

      let textContent = article?.textContent || html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 5000);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              url: url,
              title: article?.title || title,
              textContent: textContent.slice(0, 3000),
              screenshot: `data:image/png;base64,${screenshotBase64}`
            })
          }
        ]
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Failed to analyze webpage: ${error.message}` }]
      };
    }
  }

  if (name === "createTask") {
    const { description } = args as { description: string };
    try {
      const id = taskQueue.addTask(description);
      return {
        content: [
          {
            type: "text",
            text: `Created background task successfully. Task ID: ${id}. I should inform the user that the task was dispatched to the orchestrator.`
          }
        ]
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Failed to create task: ${error.message}` }]
      };
    }
  }

  if (name === "analyze_pdf") {
    const { filePathOrUrl } = args as { filePathOrUrl: string };
    console.error(`[MCP Tool Exec] analyze_pdf called for: ${filePathOrUrl}`);
    try {
      let buffer: Buffer;
      if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
        const res = await fetch(filePathOrUrl);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const arrayBuffer = await res.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        let targetPath = path.isAbsolute(filePathOrUrl) ? filePathOrUrl : path.join(process.cwd(), filePathOrUrl);

        if (!fsSync.existsSync(targetPath)) {
          // Fallback 1: Check in the uploads directory
          const fileName = path.basename(filePathOrUrl);
          const uploadPath = path.join(process.cwd(), 'uploads', fileName);
          console.error(`[MCP Tool Exec] File not found at ${targetPath}. Trying fallback: ${uploadPath}`);
          if (fsSync.existsSync(uploadPath)) {
            targetPath = uploadPath;
          } else {
            // Fallback 2: Exhaustive recursive search in process.cwd()
            console.error(`[MCP Tool Exec] Fallback 1 failed. Starting exhaustive search for: ${fileName}`);
            const searchFile = async (dir: string): Promise<string | null> => {
              const entries = await fs.readdir(dir, { withFileTypes: true });
              for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                  if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
                  const found = await searchFile(fullPath);
                  if (found) return found;
                } else if (entry.name.toLowerCase() === fileName.toLowerCase()) {
                  return fullPath;
                }
              }
              return null;
            };

            const foundPath = await searchFile(process.cwd());
            if (foundPath) {
              console.error(`[MCP Tool Exec] EXHAUSTIVE SEARCH FOUND: ${foundPath}`);
              targetPath = foundPath;
            } else {
              console.error(`[MCP Tool Exec] EXHAUSTIVE SEARCH FAILED to find: ${fileName}`);
            }
          }
        }

        buffer = await fs.readFile(targetPath);
      }

      const pdfData = await extractPdfPayload(buffer);
      if (pdfData.isScanned && pdfData.images) {
        // Scanned document: Return structured JSON with base64 screenshots so llm-router.js can inline them into prompt
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                text: pdfData.text,
                images: pdfData.images.map((img: string) => `data:image/jpeg;base64,${img}`)
              })
            }
          ]
        }
      } else {
        // High text density: just return text 
        return {
          content: [{ type: "text", text: pdfData.text }]
        }
      }
    } catch (error: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Failed to analyze PDF: ${error.message}` }]
      };
    }
  }

  if (name === "get_system_time") {
    return {
      content: [
        {
          type: "text",
          text: new Date().toISOString(),
        },
      ],
    };
  }

  if (name === "read_backend_file") {
    const { filePath, rangeToShow } = args as { filePath: string, rangeToShow?: number[] | string };

    try {
      const targetPath = path.resolve(process.cwd(), filePath);

      // Strict Boundary Check
      if (!targetPath.startsWith(process.cwd())) {
        throw new Error(`Access denied. You cannot read files outside the api-llm project root. Requested: ${targetPath}`);
      }

      let content = await fs.readFile(targetPath, "utf-8");

      if (rangeToShow) {
        try {
          let range = typeof rangeToShow === 'string' ? JSON.parse(rangeToShow) : rangeToShow;
          if (Array.isArray(range) && range.length >= 2) {
            const lines = content.split('\n');
            const start = Math.max(1, range[0]) - 1; // 1-indexed to 0-indexed
            const end = Math.min(lines.length, range[1]);

            if (start < lines.length) {
              let sliced = lines.slice(start, end).map((line, idx) => `${start + 1 + idx}: ${line}`).join('\n');
              content = `[Showing lines ${start + 1} to ${end} of ${lines.length} total lines]\n\n${sliced}`;
            }
          }
        } catch (e) {
          console.error("Failed to parse rangeToShow:", e);
        }
      }

      return {
        content: [
          {
            type: "text",
            text: content,
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Failed to read file at ${filePath}: ${error.message}`,
          },
        ],
      };
    }
  }

  if (name === "write_backend_file") {
    const { filePath, content, edits } = args as { filePath: string; content?: string, edits?: Array<{ targetText: string, replacementText: string }> };

    try {
      const targetPath = path.resolve(process.cwd(), filePath);

      // Strict Boundary Check
      if (!targetPath.startsWith(process.cwd())) {
        throw new Error(`Access denied. You cannot write to files outside the api-llm project root. Requested: ${targetPath}`);
      }

      // Ensure the directory exists before writing
      await fs.mkdir(path.dirname(targetPath), { recursive: true });

      if (edits && edits.length > 0) {
        // Precision editing mode
        let fileContent = await fs.readFile(targetPath, "utf-8");
        for (const edit of edits) {
          if (!fileContent.includes(edit.targetText)) {
            throw new Error(`Could not find targetText in file: ${edit.targetText.substring(0, 50)}... Make sure it matches exactly.`);
          }
          fileContent = fileContent.replace(edit.targetText, edit.replacementText);
        }
        await fs.writeFile(targetPath, fileContent, "utf-8");
        return {
          content: [
            {
              type: "text",
              text: `Successfully executed ${edits.length} precise edits in ${filePath}`,
            },
          ],
        };
      } else if (content !== undefined) {
        // Full overwrite mode
        await fs.writeFile(targetPath, content, "utf-8");
        return {
          content: [
            {
              type: "text",
              text: `Successfully overwrote ${filePath}`,
            },
          ],
        };
      } else {
        throw new Error("You must provide either 'content' or 'edits'.");
      }
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Failed to write file at ${filePath}: ${error.message}`,
          },
        ],
      };
    }
  }

  if (name === "search_web") {
    const { query } = args as { query: string };

    try {
      const isUrl = /^https?:\/\//i.test(query.trim());

      if (isUrl) {
        // If the query is directly a URL, try to fetch and parse its contents
        const url = query.trim();
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/100.0.4896.127 Safari/537.36' }
        });

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        const doc = new JSDOM(html, { url });
        const reader = new Readability(doc.window.document);
        const article = reader.parse();

        let textContent = article?.textContent || html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 10000);

        return {
          content: [
            {
              type: "text",
              text: `Title: ${article?.title || 'Unknown'}\n\n${textContent.slice(0, 8000)}...`
            }
          ]
        };
      } else {
        // Otherwise do a DuckDuckGo HTML search
        const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });

        if (!response.ok) throw new Error(`DDG Fetch Error: ${response.status}`);

        const text = await response.text();
        const snippets = [...text.matchAll(/<a class="result__snippet[^>]*>(.*?)<\/a>/gi)]
          .map(m => m[1].replace(/<[^>]*>/g, '').trim())
          .slice(0, 5)
          .join('\n\n---\n\n');

        return {
          content: [
            {
              type: "text",
              text: snippets || "No results found for exactly that query on DuckDuckGo.",
            },
          ],
        };
      }
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Failed to search the web or fetch URL: ${error.message}`,
          },
        ],
      };
    }
  }

  if (name === "find_image") {
    const searchArgs = args as { query: string, size?: string, format?: string, maxResults?: number };
    const maxResults = searchArgs.maxResults || 5;

    try {
      // Using Reddit search API which cleanly returns image URLs and allows uncensored (over_18) results
      const response = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(searchArgs.query)}&sort=relevance&t=all&include_over_18=on&limit=50`);
      const data = await response.json();

      if (!data.data || !data.data.children) {
        return {
          content: [{ type: "text", text: "No results found." }]
        };
      }

      const images = [];
      for (const child of data.data.children) {
        const post = child.data;
        if (post.url && (post.url.endsWith('.jpg') || post.url.endsWith('.jpeg') || post.url.endsWith('.png') || post.url.endsWith('.gif') || post.url.endsWith('.webp'))) {

          if (searchArgs.format && searchArgs.format !== 'any' && !post.url.includes(`.${searchArgs.format}`)) {
            continue; // Basic format filtering
          }

          images.push({
            title: post.title,
            url: post.url,
            permalink: `https://reddit.com${post.permalink}`
          });
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(images.slice(0, maxResults), null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Failed to find images: ${error.message}`,
          },
        ],
      };
    }
  }

  if (name === "analyze_image") {
    const imageArgs = args as { filePath: string, prompt: string };

    try {
      const targetPath = path.resolve(process.cwd(), imageArgs.filePath);

      // Strict Boundary Check
      if (!targetPath.startsWith(process.cwd())) {
        throw new Error(`Access denied. You cannot read files outside the api-llm project root. Requested: ${targetPath}`);
      }

      // Read file and convert to base64
      const fileBuffer = await fs.readFile(targetPath);
      const mimeType = targetPath.endsWith('.png') ? 'image/png' :
        targetPath.endsWith('.webp') ? 'image/webp' :
          targetPath.endsWith('.gif') ? 'image/gif' : 'image/jpeg';

      const base64Url = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

      // We'll use the existing LLM routing to send the prompt + image to Grok or the local vision model
      const { queryGrokAgent, queryGeneralAgent } = await import('../services/llm-router');
      const messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: imageArgs.prompt },
            { type: 'image_url', image_url: { url: base64Url } }
          ]
        }
      ];

      // Try Grok first if available (since it's vision capable), fallback to general agent (Minimax/Ollama)
      let result;
      try {
        result = await queryGrokAgent(messages);
      } catch (e) {
        console.log("Grok failed or unavailable for vision, falling back to general agent...");
        result = await queryGeneralAgent(messages);
      }

      return {
        content: [{ type: "text", text: result.answer }]
      };

    } catch (error: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Failed to analyze image at ${imageArgs.filePath}: ${error.message}` }],
      };
    }
  }

  if (name === "execute_terminal_command") {
    const { command } = args as { command: string };

    try {
      // Very basic sanity check
      if (command.includes('rm -rf /') || command.includes('mv /')) {
        throw new Error("Potentially destructive root command rejected.");
      }

      // Execute command in the context of the api-llm root directory
      // We increased the timeout to 5 minutes (300000ms) and maxBuffer to 50MB 
      // so long-running tasks like `create-react-app` do not abruptly die.
      const { stdout, stderr } = await execPromise(command, {
        cwd: process.cwd(),
        timeout: 300000,
        maxBuffer: 1024 * 1024 * 50
      });

      let output = "";
      if (stdout) output += `[STDOUT]\n${stdout}\n`;
      if (stderr) output += `[STDERR]\n${stderr}\n`;

      return {
        content: [
          {
            type: "text",
            text: output.trim() || "Command executed successfully with no output.",
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Failed to execute command: ${error.message}\n[STDERR]\n${error.stderr || ''}`,
          },
        ],
      };
    }
  }

  if (name === "get_directory_tree") {
    let { dirPath, maxDepth } = args as { dirPath?: string, maxDepth?: number };
    dirPath = dirPath || ".";
    maxDepth = maxDepth || 3;

    try {
      const rootPath = process.cwd();
      const targetPath = path.resolve(rootPath, dirPath);

      if (!targetPath.startsWith(rootPath)) {
        throw new Error(`Access denied. Cannot list directories outside of project root.`);
      }

      const buildTree = async (currentPath: string, currentDepth: number): Promise<string> => {
        if (currentDepth > (maxDepth as number)) return '  '.repeat(currentDepth) + '... (max depth reached)\n';
        let out = '';

        try {
          const entries = await fs.readdir(currentPath, { withFileTypes: true });

          // Sort directories first, then files
          entries.sort((a, b) => {
            if (a.isDirectory() && !b.isDirectory()) return -1;
            if (!a.isDirectory() && b.isDirectory()) return 1;
            return a.name.localeCompare(b.name);
          });

          for (const entry of entries) {
            if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name.startsWith('.DS_Store') || entry.name === '.angular' || entry.name === 'build' || entry.name === '.next' || entry.name === 'out') {
              continue; // Ignore noisy folders
            }

            const prefix = '  '.repeat(currentDepth);
            if (entry.isDirectory()) {
              out += `${prefix}📂 ${entry.name}/\n`;
              out += await buildTree(path.join(currentPath, entry.name), currentDepth + 1);
            } else {
              out += `${prefix}📄 ${entry.name}\n`;
            }
          }
        } catch (e: any) {
          out += '  '.repeat(currentDepth) + `[Error reading dir: ${e.message}]\n`;
        }
        return out;
      };

      const treeOutput = await buildTree(targetPath, 0);

      return {
        content: [
          {
            type: "text",
            text: treeOutput || "(Empty directory)",
          }
        ]
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Failed to generate directory tree: ${error.message}` }]
      }
    }
  }

  if (name === "sign_pdf_document") {
    const { pdfFile, signerName, signatureImage } = args as {
      pdfFile: string;
      signerName: string;
      signatureImage: string;
    };

    try {
      // Import the PDF signature service
      const { pdfSignatureService } = await import('../services/pdf-signature-service');

      // Call the signature service
      const result = await pdfSignatureService.signPdfDocument(
        pdfFile,
        signerName,
        signatureImage
      );

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: `Successfully signed PDF document. Download URL: ${result.downloadUrl} - Signature placed at page ${result.signaturePosition?.page}, position (${result.signaturePosition?.x}, ${result.signaturePosition?.y}) - Digital certificate: Signer: ${result.certificateInfo?.signer}, Timestamp: ${result.certificateInfo?.timestamp}, Validity: ${result.certificateInfo?.validity ? 'Valid' : 'Invalid'}`
            }
          ]
        };
      } else {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to sign PDF: ${result.error}`
            }
          ]
        };
      }

    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Failed to sign PDF: ${error.message}`
          }
        ]
      };
    }
  }

  // === CAD INTEGRATION TOOLS ===

  switch (name) {
    case "cad_get_onshape_auth_url": {
      try {
        const authUrl = onshapeClient.getAuthorizationUrl();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                authUrl,
                instructions: "Visit this URL to authenticate with OnShape. After authorization, you'll receive a code to exchange for access tokens."
              }, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to get auth URL: ${error.message}` }]
        };
      }
    }

    case "local_cad_create_bolt": {
      const { headWidth, headHeight, shaftDiameter, shaftLength, threadLength, threadPitch } = args as any;
      const result = await localCADClient.createBolt({ headWidth, headHeight, shaftDiameter, shaftLength, threadLength, threadPitch });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: "Local CAD bolt generated successfully",
              ...result,
              viewerUrl: `http://localhost:5173/agent/cad/models/${result.id}`
            }, null, 2)
          }
        ]
      };
    }

    case "local_cad_create_nut": {
      const { width, height, holeDiameter, threadPitch } = args as any;
      const result = await localCADClient.createNut({ width, height, holeDiameter, threadPitch });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: "Local CAD nut generated successfully",
              ...result,
              viewerUrl: `http://localhost:5173/agent/cad/models/${result.id}`
            }, null, 2)
          }
        ]
      };
    }

    case "local_cad_create_gear": {
      const { teeth, module, thickness, holeDiameter } = args as any;
      const result = await localCADClient.createGear({ teeth, module, thickness, holeDiameter });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: "Local CAD gear generated successfully",
              ...result,
              viewerUrl: `http://localhost:5173/agent/cad/models/${result.id}`
            }, null, 2)
          }
        ]
      };
    }

    case "cad_list_documents": {
      const { limit = 50, offset = 0 } = args || {};
      try {
        const documents = await onshapeClient.listDocuments({ limit, offset });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                documents,
                total: documents.length,
                hasMore: documents.length === limit
              }, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to list documents: ${error.message}` }]
        };
      }
    }

    case "cad_create_document": {
      const { name: docName, description = "", units = "mm" } = args;
      try {
        const document = await onshapeClient.createDocument({
          name: docName,
          description,
          units
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: `Document '${docName}' created successfully`,
                document
              }, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create document: ${error.message}` }]
        };
      }
    }

    // Assuming SketchOptions and SketchGeometry are defined elsewhere or implicitly handled by 'args' type.
    // If not, they would need to be added to the file.
    // For the purpose of this edit, we are only ensuring sketchType is treated as a string.
    // export interface SketchOptions {
    //   featureName: string;
    //   sketchType?: string; // e.g., 'Top', 'Front', 'Right' or a face ID
    //   geometry?: SketchGeometry[];
    // }

    case "cad_create_sketch": {
      const { documentId, featureName, sketchType = "Top", geometry = [], partStudioEid } = args;
      try {
        const sketch = await onshapeClient.createSketch(documentId, {
          featureName,
          sketchType,
          geometry,
          partStudioEid
        });

        // Spatial Awareness Check: If agent is mixing planes, warn them in the output
        let spatialWarning = "";
        if (sketchType.toLowerCase() === "front" || sketchType.toLowerCase() === "right") {
          spatialWarning = "\n\n⚠️ SPATIAL WARNING: You are sketching on a vertical plane (Front/Right). If your previous features were on the 'Top' plane, this part will be TILTED 90 DEGREES. Standard hardware should use 'Top' for ALL sketches.";
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: `Sketch '${featureName}' created successfully${spatialWarning}`,
                sketch
              }, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create sketch: ${error.message}` }]
        };
      }
    }

    case "cad_create_extrude": {
      const { documentId, sketchId, distance, direction = "positive", operationType = "NEW", featureName, partStudioEid } = args;
      try {
        const extrude = await onshapeClient.createExtrude(documentId, {
          sketchId,
          distance,
          direction,
          operationType,
          featureName,
          partStudioEid
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: `Extrude created successfully`,
                extrude
              }, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create extrude: ${error.message}` }]
        };
      }
    }

    case "cad_create_plane": {
      const { documentId, entities, offset = 10, partStudioEid, name: planeName } = args;
      try {
        const plane = await onshapeClient.createPlane(documentId, {
          entities,
          offset,
          partStudioEid,
          name: planeName
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: `Plane created successfully`,
                plane
              }, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create plane: ${error.message}` }]
        };
      }
    }

    case "cad_create_fillet": {
      const { documentId, entities, radius, partStudioEid, featureName } = args;
      try {
        const fillet = await onshapeClient.createFillet(documentId, {
          entities,
          radius,
          partStudioEid,
          featureName
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: `Fillet created successfully`,
                fillet
              }, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create fillet: ${error.message}` }]
        };
      }
    }

    case "cad_create_hole": {
      const { documentId, locationSketchId, faceId, diameter, depth, holeType, partStudioEid, featureName } = args;
      try {
        const hole = await onshapeClient.createHole(documentId, {
          locationSketchId,
          faceId,
          diameter,
          depth,
          holeType,
          partStudioEid,
          featureName
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: `Hole created successfully`,
                hole
              }, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create hole: ${error.message}` }]
        };
      }
    }

    case "cad_create_revolve": {
      const { documentId, sketchId, axisId, revolveType = "FULL", angle = 360, partStudioEid } = args;
      try {
        const revolve = await onshapeClient.createRevolve(documentId, {
          sketchId,
          axisId,
          revolveType,
          angle,
          partStudioEid
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: `Revolve created successfully`,
                revolve
              }, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create revolve: ${error.message}` }]
        };
      }
    }

    case "cad_create_sweep": {
      const { documentId, profileSketchId, pathId, partStudioEid } = args;
      try {
        const sweep = await onshapeClient.createSweep(documentId, {
          profileSketchId,
          pathId,
          partStudioEid
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: `Sweep created successfully`,
                sweep
              }, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create sweep: ${error.message}` }]
        };
      }
    }

    case "cad_create_loft": {
      const { documentId, profileIds, partStudioEid } = args;
      try {
        const loft = await onshapeClient.createLoft(documentId, {
          profileIds,
          partStudioEid
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: `Loft created successfully`,
                loft
              }, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create loft: ${error.message}` }]
        };
      }
    }

    case "cad_run_stress_analysis": {
      const { documentId, partId, materialProperties, boundaryConditions = [], loadCases = [] } = args;
      try {
        const analysis = await analysisEngine.runStressAnalysis({
          documentId,
          partId,
          materialProperties,
          boundaryConditions,
          loadCases
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: `Stress analysis started for part ${partId}`,
                analysis
              }, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to run stress analysis: ${error.message}` }]
        };
      }
    }

    case "cad_run_motion_analysis": {
      const { documentId, assemblyId, studyName, timeRange, timeSteps = 100, gravity = [0, 0, -9.81], constraints = [] } = args;
      try {
        const analysis = await analysisEngine.runMotionAnalysis({
          documentId,
          assemblyId,
          studyName,
          timeRange,
          timeSteps,
          gravity,
          constraints
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: `Motion analysis '${studyName}' started for assembly ${assemblyId}`,
                analysis
              }, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to run motion analysis: ${error.message}` }]
        };
      }
    }

    case "cad_get_analysis_status": {
      const { analysisId } = args;
      try {
        const status = analysisEngine.getAnalysisStatus(analysisId);
        if (!status) {
          return {
            isError: true,
            content: [{ type: "text", text: `Analysis ${analysisId} not found` }]
          };
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(status, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to get analysis status: ${error.message}` }]
        };
      }
    }

    case "cad_share_document": {
      const { documentId, userEmails, permissionLevel = "view", message } = args;
      try {
        const shareInfo = await collaborationManager.shareDocument(documentId, {
          userEmails,
          permissionLevel,
          message
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: `Document ${documentId} shared with ${userEmails.length} users`,
                shareInfo
              }, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to share document: ${error.message}` }]
        };
      }
    }

    case "cad_get_change_events": {
      const { documentId, startTime, endTime, eventType, userId, limit = 50 } = args;
      try {
        const events = collaborationManager.getChangeEvents(documentId, {
          startTime,
          endTime,
          eventType,
          userId,
          limit
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                documentId,
                events,
                total: events.length,
                filters: { startTime, endTime, eventType, userId }
              }, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to get change events: ${error.message}` }]
        };
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Initialize the MCP Server Factory
export function createServer() {
  const server = new Server(
    {
      name: "api-llm-backend",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register Tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: backendTools };
  });

  // Implement Tools
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    return await executeBackendTool(request.params.name, request.params.arguments);
  });

  return server;
}

export { SSEServerTransport };
