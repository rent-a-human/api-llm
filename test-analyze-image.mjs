import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

async function testAnalyzeImage() {
    const transport = new SSEClientTransport(new URL('http://localhost:3000/mcp/sse'));
    const client = new Client(
        { name: 'test-client', version: '1.0.0' },
        { capabilities: {} }
    );

    try {
        console.log("Connecting to MCP Server...");
        await client.connect(transport);
        console.log("Connected!");
        
        console.log("\nAttempting to analyze image-test.jpg...");
        const result = await client.callTool({
            name: "analyze_image",
            arguments: {
                filePath: "image-test.jpg", // From api-llm root as per user message
                prompt: "What is the main subject of this image, described accurately?"
            }
        });
        
        console.log("\n--- RESULT ---");
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        process.exit(0);
    }
}

testAnalyzeImage();
