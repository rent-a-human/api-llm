import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { ListToolsResultSchema } from "@modelcontextprotocol/sdk/types.js";

async function runTests() {
    console.log("=========================================");
    console.log("🧪 Running MCP Tool E2E Integration Tests");
    console.log("=========================================\n");

    const transport = new SSEClientTransport(new URL("http://localhost:3000/mcp/sse"));
    const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });

    console.log("🔌 Connecting to MCP Server...");
    await client.connect(transport);
    console.log("✅ Connected!\n");

    // Test 1: get_directory_tree (Success Case)
    console.log("➡️ Test 1: get_directory_tree (root)");
    try {
        const response: any = await client.callTool({
            name: "get_directory_tree",
            arguments: {
                dirPath: ".",
                maxDepth: 2
            }
        });
        console.log("✅ get_directory_tree SUCCESS:");
        console.log(response.content[0].text);
    } catch (e: any) {
        console.log("❌ get_directory_tree FAILED:", e.message);
    }

    console.log("\n-----------------------------------------\n");

    // Test 2: get_directory_tree (Boundary Violation)
    console.log("➡️ Test 2: get_directory_tree outside boundary (../../)");
    try {
        const response: any = await client.callTool({
            name: "get_directory_tree",
            arguments: {
                dirPath: "../../",
                maxDepth: 1
            }
        });

        if (response.isError) {
            console.log("✅ Boundary enforcement SUCCESS (Intercepted by handler):", response.content[0].text);
        } else {
            console.log("❌ get_directory_tree FAILED TO BLOCK BOUNDARY! Output:", response);
        }
    } catch (e: any) {
        console.log("✅ Boundary enforcement SUCCESS (Intercepted by throw):", e.message);
    }

    console.log("\n-----------------------------------------\n");

    // Test 3: read_backend_file (Boundary Violation)
    console.log("➡️ Test 3: read_backend_file to /etc/passwd");
    try {
        const response: any = await client.callTool({
            name: "read_backend_file",
            arguments: {
                filePath: "/etc/passwd"
            }
        });

        if (response.isError) {
            console.log("✅ /etc/passwd block SUCCESS (Intercepted by handler):", response.content[0].text);
        } else {
            console.log("❌ /etc/passwd block FAILED! Output:", response.content[0].text.substring(0, 100) + '...');
        }
    } catch (e: any) {
        console.log("✅ /etc/passwd block SUCCESS (Intercepted by throw):", e.message);
    }

    console.log("\n=========================================");
    console.log("🏁 Tests Complete - Disconnecting");
    console.log("=========================================");

    // Process exit to kill SSE loops
    process.exit(0);
}

runTests().catch(e => {
    console.error("Test execution failed:", e);
    process.exit(1);
});
