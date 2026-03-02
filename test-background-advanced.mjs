import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function runTests() {
    console.log("=========================================");
    console.log("🧪 Running Advanced Background Task: React App Creation with Hardcoded Data");
    console.log("=========================================\n");

    const transport = new SSEClientTransport(new URL("http://localhost:3000/mcp/sse?sessionId=test-advanced"));
    const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });

    console.log("🔌 Connecting to MCP Server...");
    await client.connect(transport);
    console.log("✅ Connected!\n");

    try {
        const response = await client.callTool({
            name: "createTask",
            arguments: {
                description: "Create a hello world React app for 'vacations listings' with demo hardcoded data in the `/Users/usuario1/D/gravity/nuevos/api-llm/test-apps` directory. Since you're running headless, use `npx create-react-app vacations-list` to bypass prompts. Once generated, overwrite new src/App.js to contain a beautiful card grid with 3 hardcoded vacation destinations, using raw CSS. Finally, run npm run build to check if there are not errors. If there are errors, fix them and run npm run build again."
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
