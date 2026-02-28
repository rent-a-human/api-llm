import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function runTest() {
    console.log("Connecting to MCP server...");
    const transport = new SSEClientTransport(new URL("http://localhost:3000/mcp/sse"));
    
    // Add raw interceptor to see exactly what comes across the wire
    const originalOnMessage = transport.onmessage;
    transport.onmessage = (msg) => {
        console.log("[Raw SSE Message]", JSON.stringify(msg, null, 2));
        if (originalOnMessage) originalOnMessage(msg);
    };

    const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });
    await client.connect(transport);
    console.log("Connected successfully.");

    try {
        console.log("\n--- Testing read_backend_file ---");
        const readRes = await client.callTool({
            name: "read_backend_file",
            arguments: { filePath: "./package.json" }
        }, { timeout: 10000 });
        console.log("Read Result Snippet:", JSON.stringify(readRes).substring(0, 50));

        console.log("\n--- Testing write_backend_file ---");
        const writeRes = await client.callTool({
            name: "write_backend_file",
            arguments: { filePath: "test/hello_world_test3.ts", content: "hello" }
        }, { timeout: 10000 });
        console.log("Write Result:", writeRes);
    } catch (error) {
        console.error("Test failed with error:", error);
    } finally {
        process.exit(0);
    }
}
runTest();
