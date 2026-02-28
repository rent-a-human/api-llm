import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import Fastify from "fastify";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import puppeteer from "puppeteer";
import { extractPdfPayload } from "../services/pdf-service";

const execPromise = promisify(exec);

// Initialize the MCP Server
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
  return {
    tools: [
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
          },
          required: ["filePath"],
        },
      },
      {
        name: "write_backend_file",
        description: "Writes content to a file on the backend server's file system. Takes an absolute or relative path and the content to write. Overwrites the file if it expects.",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "The path to the file to write to",
            },
            content: {
              type: "string",
              description: "The content to write into the file",
            },
          },
          required: ["filePath", "content"],
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
      }
    ],
  };
});

// Implement Tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "analyze_webpage") {
    const { url } = request.params.arguments as { url: string };
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

  if (request.params.name === "analyze_pdf") {
    const { filePathOrUrl } = request.params.arguments as { filePathOrUrl: string };
    console.error(`[MCP Tool Exec] analyze_pdf called for: ${filePathOrUrl}`);
    try {
      let buffer: Buffer;
      if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
        const res = await fetch(filePathOrUrl);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const arrayBuffer = await res.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        const targetPath = path.isAbsolute(filePathOrUrl) ? filePathOrUrl : path.join(process.cwd(), filePathOrUrl);
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

  if (request.params.name === "get_system_time") {
    return {
      content: [
        {
          type: "text",
          text: new Date().toISOString(),
        },
      ],
    };
  }

  if (request.params.name === "read_backend_file") {
    const { filePath } = request.params.arguments as { filePath: string };

    try {
      const targetPath = path.resolve(process.cwd(), filePath);

      // Strict Boundary Check
      if (!targetPath.startsWith(process.cwd())) {
        throw new Error(`Access denied. You cannot read files outside the api-llm project root. Requested: ${targetPath}`);
      }

      const content = await fs.readFile(targetPath, "utf-8");

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

  if (request.params.name === "write_backend_file") {
    const { filePath, content } = request.params.arguments as { filePath: string; content: string };

    try {
      const targetPath = path.resolve(process.cwd(), filePath);

      // Strict Boundary Check
      if (!targetPath.startsWith(process.cwd())) {
        throw new Error(`Access denied. You cannot write to files outside the api-llm project root. Requested: ${targetPath}`);
      }

      // Ensure the directory exists before writing
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, content, "utf-8");

      return {
        content: [
          {
            type: "text",
            text: `Successfully wrote to ${filePath}`,
          },
        ],
      };
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

  if (request.params.name === "search_web") {
    const { query } = request.params.arguments as { query: string };

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

  if (request.params.name === "find_image") {
    const args = request.params.arguments as { query: string, size?: string, format?: string, maxResults?: number };
    const maxResults = args.maxResults || 5;

    try {
      // Using Reddit search API which cleanly returns image URLs and allows uncensored (over_18) results
      const response = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(args.query)}&sort=relevance&t=all&include_over_18=on&limit=50`);
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

          if (args.format && args.format !== 'any' && !post.url.includes(`.${args.format}`)) {
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

  if (request.params.name === "analyze_image") {
    const args = request.params.arguments as { filePath: string, prompt: string };

    try {
      const targetPath = path.resolve(process.cwd(), args.filePath);

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
            { type: 'text', text: args.prompt },
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
        content: [{ type: "text", text: `Failed to analyze image at ${args.filePath}: ${error.message}` }],
      };
    }
  }

  if (request.params.name === "execute_terminal_command") {
    const { command } = request.params.arguments as { command: string };

    try {
      // Very basic sanity check
      if (command.includes('rm -rf /') || command.includes('mv /')) {
        throw new Error("Potentially destructive root command rejected.");
      }

      // Execute command in the context of the api-llm root directory
      const { stdout, stderr } = await execPromise(command, { cwd: process.cwd(), timeout: 15000 });

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

  if (request.params.name === "get_directory_tree") {
    let { dirPath, maxDepth } = request.params.arguments as { dirPath?: string, maxDepth?: number };
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
            if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name.startsWith('.DS_Store')) {
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

  throw new Error(`Unknown tool: ${request.params.name}`);
});

export { server, SSEServerTransport };
