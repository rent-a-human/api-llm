import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import fs from "fs";

async function runTests() {
    console.log("=========================================");
    console.log("🧪 Running Background Task: Local Minimax Agent Test");
    console.log("=========================================\n");

    const transport = new SSEClientTransport(new URL("http://localhost:3000/mcp/sse?sessionId=test-minimax"));
    const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });

    console.log("🔌 Connecting to MCP Server...");
    await client.connect(transport);
    console.log("✅ Connected!\n");

    try {
        const response = await client.callTool({
            name: "createTask",
            arguments: {
                description: "This is a simple test for the local Minimax agent to execute: list the files in the backend directory using the get_directory_tree tool."
            }
        });
        
        console.log("✅ createTask SUCCESS:");
        console.log(response.content?.[0]?.text);

    } catch (e) {
        console.log("❌ createTask FAILED:", e?.message || e);
    }

    console.log("\n=========================================");
    process.exit(0);
}

runTests().catch(e => {
    console.error("Test execution failed:", e);
    process.exit(1);
});
