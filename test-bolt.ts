import { OnShapeClient } from "./src/mcp/cad/onshape-client";
import * as dotenv from "dotenv";
dotenv.config();

const client = new OnShapeClient({
  accessKey: process.env.ONSHAPE_ACCESS_KEY,
  secretKey: process.env.ONSHAPE_SECRET_KEY,
  baseUrl: "https://cad.onshape.com"
});

async function createTestBolt() {
  console.log("🚀 Starting 19mm Threaded Bolt Test...");

  // 1. Create Document
  const docName = `GOLDEN_19mm_Threaded_Bolt_${Date.now()}`;
  const doc = await client.createDocument({ name: docName });
  console.log(`✅ Document created: ${doc.id}`);
  const did = doc.id;

  try {
    // 2. Head Sketch (Hexagon, 28mm across flats -> 14mm inradius)
    // proportional for a 3/4 inch bolt
    console.log("Drawing Bolt Head (28mm width)...");
    const headSketch = await client.createSketch(did, {
      featureName: "Bolt_Head_Hexagon",
      sketchType: "Top",
      geometry: [
        {
          type: "hexagon",
          coordinates: [0, 0, 14]
        }
      ]
    });

    // 3. Head Extrude (10mm UP)
    console.log("Extruding Head (Positive Z)...");
    const headExtrude = await client.createExtrude(did, {
      featureName: "Bolt_Head_Extrude",
      sketchId: headSketch.id,
      distance: 10,
      operationType: "NEW"
    });

    // 4. Shaft Sketch (Circle, 3/4 inch -> 19.05mm diameter -> 9.525mm radius)
    console.log("Drawing Bolt Shaft (3/4 inch)...");
    const shaftSketch = await client.createSketch(did, {
      featureName: "Bolt_Shaft_Circle",
      sketchType: "Top",
      geometry: [
        {
          type: "circle",
          coordinates: [0, 0, 9.525]
        }
      ]
    });

    // 5. Shaft Extrude (50mm DOWN, ADD to merge)
    console.log("Extruding Shaft (Negative Z)...");
    const shaftExtrude = await client.createExtrude(did, {
      featureName: "Bolt_Shaft_Extrude",
      sketchId: shaftSketch.id,
      distance: 50,
      direction: "negative",
      operationType: "ADD"
    });

    // 6. External Thread (ANSI 3/4-10, 40mm depth)
    console.log("Applying External Thread (ANSI 3/4-10)...");
    const thread = await client.createExternalThread(did, {
      featureName: "External_Thread_ANSI",
      entities: [shaftExtrude.id],
      standard: "ANSI",
      size: "3/4",
      threadsPerInch: 10,
      depth: 40
    });
    console.log(`✅ Thread created: ${thread.id}`);

    console.log("\n✨ TEST SUCCESSFUL!");
    console.log(`🔗 VIEW DOCUMENT: https://cad.onshape.com/documents/${did}`);

  } catch (error: any) {
    console.error("❌ TEST FAILED:", error.message);
  }
}

createTestBolt();
