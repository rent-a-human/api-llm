import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
    console.log("Connecting to MCP server...");
    const transport = new SSEClientTransport(new URL("http://localhost:3000/mcp/sse"));
    const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });
    await client.connect(transport);
    console.log("Connected successfully.");

    try {
        console.log("\n--- Testing read_backend_file (Valid) ---");
        const readResult = await client.callTool({
            name: "read_backend_file",
            arguments: {
                filePath: "package.json"
            }
        }, { timeout: 10000 });
        console.log("Result:", readResult.content[0].text.substring(0, 50));
    } catch (error) {
        console.error("Test failed with error:", error);
    } finally {
        process.exit(0);
    }
}

runTest();
