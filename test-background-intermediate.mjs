import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function runTests() {
    console.log("=========================================");
    console.log("🧪 Running Intermediate Background Task: Angular App Creation");
    console.log("=========================================\n");

    const transport = new SSEClientTransport(new URL("http://localhost:3000/mcp/sse?sessionId=test-intermediate"));
    const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });

    console.log("🔌 Connecting to MCP Server...");
    await client.connect(transport);
    console.log("✅ Connected!\n");

    try {
        const response = await client.callTool({
            name: "createTask",
            arguments: {
                description: "Create a new Angular application in the `/Users/usuario1/D/gravity/nuevos/api-llm/test-apps` directory. You will need to make the directory first. Since your terminal command is non-interactive, you MUST use `npx @angular/cli new demo-app --defaults --skip-git` to bypass all interactive prompts."
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
