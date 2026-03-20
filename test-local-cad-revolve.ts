import { executeBackendTool } from './src/mcp/server';

async function testRevolve() {
    console.log("Starting Local CAD Revolve test...");

    const operations = [
        // 1. A Goblet/Vase - 360 degree revolve around Y axis
        {
            type: 'revolve',
            params: {
                angle: 360,
                axisId: 'y',
                opType: 'add',
                plane: 'alzado'
            },
            sketch: [
                {
                    type: 'polygon',
                    points: [
                        [0, 0],   // Base center
                        [20, 0],  // Base edge
                        [18, 5],  // Stem start
                        [5, 5],   // Stem inner
                        [5, 25],  // Stem upper
                        [25, 45], // Bowl outer
                        [25, 50], // Rim outer
                        [23, 50], // Rim inner
                        [3, 30],  // Bowl inner
                        [0, 30]   // Center line finish
                    ]
                }
            ]
        },
        // 2. A Partial Revolve (180 deg) to create a "Half Dome" or "Niche" - Separated in space
        {
            type: 'revolve',
            params: {
                angle: 180,
                axisId: 'y',
                opType: 'add',
                plane: 'alzado',
                offset: 60 // This offset might not be supported by revolve yet, but let's see. 
                           // Actually, revolve doesn't use offset in local-cad-client.ts.
                           // Let's just use points offset in the sketch.
            },
            sketch: [
                {
                    type: 'circle',
                    points: [[60, 25]], // Center at X=60
                    radius: 20
                }
            ]
        }
    ];

    const result = await executeBackendTool("local_cad_create_custom_model", {
        id: "revolve-test-" + Date.now(),
        name: "Revolve Verification Test",
        operations: operations
    });

    console.log("Result:");
    console.log(JSON.stringify(result, null, 2));
    
    if (result.content && result.content[0] && result.content[0].text) {
        const data = JSON.parse(result.content[0].text);
        console.log("\nSUCCESS! Viewer URL:");
        console.log(data.viewerUrl);
    }
}

testRevolve().catch(error => {
    console.error("Test failed:");
    console.error(error);
});
