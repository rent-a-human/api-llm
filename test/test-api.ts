import http from 'http';

function post(prompt: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ prompt });

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/ask',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve({ error: "Failed to parse JSON", raw: body });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(data);
        req.end();
    });
}

async function runTests() {
    console.log("Starting API Tests...");

    try {
        // Test 1: Simple Question (Likely local)
        console.log("\n--- Test 1: Simple Question ---");
        const res1 = await post("What is 2 + 2?");
        console.log("Result:", JSON.stringify(res1, null, 2));

        // Test 2: Complex Question (Likely local unless confidence fails)
        console.log("\n--- Test 2: Complex Question ---");
        const res2 = await post("Explain the theory of relativity in simple terms.");
        console.log("Result:", JSON.stringify(res2, null, 2));

    } catch (err) {
        console.error("Test failed:", err);
    }
}

runTests();
