const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { SSEClientTransport } = require("@modelcontextprotocol/sdk/client/sse.js");

async function run() {
    const transport = new SSEClientTransport(new URL("http://localhost:3000/mcp/sse"));
    const client = new Client({ name: "test", version: "1" }, { capabilities: {} });
    await client.connect(transport);
    
    console.log("Connected. Waiting 5s to simulate LLM delay...");
    await new Promise(r => setTimeout(r, 5000));
    
    console.log("Calling read_backend_file...");
    try {
        const res = await client.callTool({ name: "read_backend_file", arguments: { filePath: "/etc/passwd" }});
        console.log("Result:", res);
    } catch(e) {
        console.error("Error:", e);
    }
    process.exit(0);
}
run();
