import { executeBackendTool } from './src/mcp/server';

async function testConnectingRod() {
    console.log("Starting Local CAD Connecting Rod (Fix) test...");

    const ops = [
        // 1. Big End Hub
        {
            type: 'extrude',
            params: { depth: 1.2, direction: 'mid', opType: 'add', plane: 'planta', offset: 0 },
            sketch: [{ type: 'circle', points: [[0, 0]], radius: 1.5 }]
        },
        // 2. Big End Ears - Slightly Adjusted X-center for better overlap
        {
            type: 'extrude',
            params: { depth: 1.0, direction: 'mid', opType: 'add', plane: 'planta', offset: 0 },
            sketch: [{ type: 'rectangle', points: [[-1.2, -1.8], [0.8, 1.8]] }]
        },
        // 3. Tapered Shank - FIXED ORDER (CCW) and INCREASED OVERLAP
        {
            type: 'extrude',
            params: { depth: 0.8, direction: 'mid', opType: 'add', plane: 'planta', offset: 0 },
            sketch: [
                {
                    type: 'polygon',
                    points: [
                        [1.0, -0.6],   // Start further inside Big End hub (which extends to 1.5)
                        [6.0, -0.4],   // End further inside Small End hub (which extends to 6.5-0.7 = 5.8)
                        [6.0, 0.4],    
                        [1.0, 0.6]     
                    ]
                }
            ]
        },
        // 4. Small End Hub
        {
            type: 'extrude',
            params: { depth: 1.1, direction: 'mid', opType: 'add', plane: 'planta', offset: 0 },
            sketch: [{ type: 'circle', points: [[6.5, 0]], radius: 0.7 }]
        },
        // 5. Big End Bore (Subtract) - Do subtraction AFTER all adds to ensure hollow centers
        {
            type: 'extrude',
            params: { depth: 2.0, direction: 'mid', opType: 'subtract', plane: 'planta', offset: 0 },
            sketch: [{ type: 'circle', points: [[0, 0]], radius: 1.18725 }] // 2.3745 / 2
        },
        // 6. Small End Bore (Subtract)
        {
            type: 'extrude',
            params: { depth: 2.0, direction: 'mid', opType: 'subtract', plane: 'planta', offset: 0 },
            sketch: [{ type: 'circle', points: [[6.5, 0]], radius: 0.49915 }] // 0.9983 / 2
        },
        // 7. Bolt Holes (Subtract)
        {
            type: 'extrude',
            params: { depth: 3.0, direction: 'mid', opType: 'subtract', plane: 'planta', offset: 0 },
            sketch: [
                { type: 'circle', points: [[-0.2, 1.4]], radius: 0.1946 }, 
                { type: 'circle', points: [[-0.2, -1.4]], radius: 0.1946 } 
            ]
        }
    ];

    const result = await executeBackendTool("local_cad_create_custom_model", {
        id: "connecting-rod-fixed-" + Date.now(),
        name: "Engine Connecting Rod - FIXED",
        operations: ops
    });

    if (result.content && result.content[0] && result.content[0].text) {
        const data = JSON.parse(result.content[0].text);
        console.log("\nSUCCESS! Viewer URL:");
        console.log(data.viewerUrl);
    }
}

testConnectingRod().catch(console.error);
