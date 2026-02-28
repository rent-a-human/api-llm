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
        console.log("\n--- Testing write_backend_file ---");
        const writeResult = await client.callTool({
            name: "write_backend_file",
            arguments: {
                filePath: "test/hello_world_test.ts",
                content: "console.log('hello world');"
            }
        }, { timeout: 10000 });
        console.log("Result:", writeResult);
    } catch (error) {
        console.error("Test failed with error:", error);
    } finally {
        process.exit(0);
    }
}

runTest();
