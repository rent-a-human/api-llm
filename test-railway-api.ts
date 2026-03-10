import fetch from 'node-fetch';

const BASE_URL = 'https://api-llm-production.up.railway.app';

async function testApi() {
    console.log(`\n============== TESTING LIVE RAILWAY API ==============\n`);
    console.log(`Pinging: ${BASE_URL}`);

    try {
        // Test 1: Ask Endpoint (General LLM Routing)
        console.log(`\n[Test 1] POST /ask`);
        const askResponse = await fetch(`${BASE_URL}/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: "What is 2+2? Answer in one word." })
        });

        console.log(`Status: ${askResponse.status} ${askResponse.statusText}`);
        if (askResponse.ok) {
            const data = await askResponse.json();
            console.log(`Response:`, JSON.stringify(data, null, 2));
        } else {
            console.error(`Error Body:`, await askResponse.text());
        }

        // Test 2: Agent Options (CORS check)
        // Since SSE/MCP is hard to test in a simple fetch script, we'll do an OPTIONS check to ensure CORS is accepted
        console.log(`\n[Test 2] OPTIONS /agent (Testing CORS)`);
        const agentResponse = await fetch(`${BASE_URL}/agent`, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'https://you-work.github.io',
                'Access-Control-Request-Method': 'POST'
            }
        });

        console.log(`Status: ${agentResponse.status} ${agentResponse.statusText}`);
        console.log(`CORS Allow Origin:`, agentResponse.headers.get('access-control-allow-origin') || 'Not Set');

    } catch (error) {
        console.error(`\n❌ Failed to connect to API:`, error);
    }
}

testApi();
