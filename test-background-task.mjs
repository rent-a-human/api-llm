import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function runTests() {
    console.log("=========================================");
    console.log("🧪 Running Background Task Test via MCP Tool");
    console.log("=========================================\n");

    const transport = new SSEClientTransport(new URL("http://localhost:3000/mcp/sse?sessionId=test-client"));
    const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });

    console.log("🔌 Connecting to MCP Server...");
    await client.connect(transport);
    console.log("✅ Connected!\n");

    // Test 1: createTask
    console.log("➡️ Test 1: createTask (index codebase)");
    try {
        const response = await client.callTool({
            name: "createTask",
            arguments: {
                description: "List the top-level files in this directory and print them out."
            }
        });
        
        console.log("✅ createTask SUCCESS (Dispatched to orchestrator):");
        console.log("Response:", JSON.stringify(response, null, 2));

        if (response.content && response.content[0] && response.content[0].text) {
            console.log("\nParsed ID details:", response.content[0].text);
        }

    } catch (e) {
        console.log("❌ createTask FAILED:", e?.message || e);
    }

    console.log("\n=========================================");
    console.log("🏁 Tests Complete - Check Jarvis Dashboard UI or server logs to track execution!");
    console.log("=========================================");
    
    // We can exit early. The task is handled by the backend queue now.
    // Process exit to kill SSE loops
    process.exit(0);
}

runTests().catch(e => {
    console.error("Test execution failed:", e);
    process.exit(1);
});
