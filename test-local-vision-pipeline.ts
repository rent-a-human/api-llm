import { queryGeneralAgent } from './src/services/llm-router';
import config from './src/config';

// Mock config to ensure FORCE_LOCAL is true for this test
config.FORCE_LOCAL = true;

async function testVisionPipeline() {
    console.log("Starting Local Vision+Tools Pipeline verification...");
    console.log("Config FORCE_LOCAL:", config.FORCE_LOCAL);
    console.log("Vision Model:", config.LOCAL_VISION_MODEL);
    console.log("Coding Model:", config.LOCAL_CODING_MODEL);

    // Small black 1x1 pixel image in base64
    const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const messages = [
        {
            role: 'user',
            content: [
                { type: 'text', text: "What is in this image? Also, create a simple cube using the CAD tool." },
                { type: 'image_url', image_url: { url: base64Image } }
            ]
        }
    ];

    const tools = [
        {
            name: "local_cad_create_custom_model",
            description: "Generates a custom CAD model.",
            inputSchema: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    operations: { type: "array" }
                }
            }
        }
    ];

    try {
        const result = await queryGeneralAgent(messages, tools);
        console.log("\n--- TEST RESULT ---");
        console.log("Model Used:", result.modelUsed);
        console.log("Answer:", result.answer);
        
        const data = JSON.parse(result.answer);
        if (data.action) {
            console.log("\nSUCCESS! Tool call detected in local fallback.");
            console.log("Action Name:", data.action.name);
        } else {
            console.log("\nNo tool call detected. Checking if it just responded with text.");
        }
    } catch (error: any) {
        console.error("\nTEST FAILED:");
        console.error(error.message);
    }
}

testVisionPipeline().catch(console.error);
