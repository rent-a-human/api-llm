import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function main() {
    console.log("Starting MCP test client...");

    const transport = new SSEClientTransport(new URL("http://localhost:3000/mcp/sse"));
    const client = new Client(
        { name: "test-client", version: "1.0.0" },
        { capabilities: { tools: {} } }
    );

    await client.connect(transport);
    console.log("Connected to MCP Server!");

    try {
        console.log("\nTesting search_web tool with direct URL:");
        const result = await client.callTool({
            name: "search_web",
            arguments: { query: "https://soul.md/" }
        });

        console.log("Tool execution completed.\n");
        const results = JSON.stringify(result, null, 2);
        console.log(results.slice(0, 1500) + (results.length > 1500 ? '\n...[truncated]' : ''));

    } catch (e) {
        console.error("Tool execution failed:", e);
    } finally {
        // give the network a second to close
        setTimeout(() => process.exit(0), 1000);
    }
}

main().catch(console.error);
