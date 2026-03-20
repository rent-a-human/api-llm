import { executeBackendTool } from './src/mcp/server';

async function testKnight() {
    console.log("Starting Aesthetic Chess Knight (Final Horse Polish) test...");

    const operations = [
        // 1. Pedestal (Base & Stem) - Revolve 360 around Y
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
                        [0, 0],   
                        [35, 0],  // Wide base
                        [35, 3],  // Flared edge
                        [30, 8],  // Taper start
                        [14, 15], // Tapered stem
                        [16, 18], // Collar bulge start
                        [14, 21], // Collar end
                        [18, 55], // Flared neck transition
                        [0, 55]   // Center line
                    ]
                }
            ]
        },
        // 2. Head & Mane - Extrude side profile
        // Refined for a longer muzzle and arched mane to avoid looking like a dog.
        {
            type: 'extrude',
            params: {
                depth: 18,
                direction: 'mid',
                opType: 'add',
                plane: 'alzado'
            },
            sketch: [
                {
                    type: 'polygon',
                    points: [
                        [18, 55],    // Neck base front
                        [28, 68],    // Chest protrusion (moved forward)
                        [32, 78],    // Lower jaw start
                        [55, 82],    // Muzzle bottom (longer)
                        [65, 88],    // Nose tip (pronounced)
                        [62, 100],   // Bridge of nose
                        [35, 108],   // Forehead/Brow
                        [22, 118],   // Ear front (lower base)
                        [15, 135],   // Ear tip (tilted back)
                        [8, 125],    // Ear back
                        [5, 115],    // Mane peak
                        [-15, 105],  // Arched mane (further back)
                        [-25, 85],   // Deep mane curve
                        [-22, 55]    // Neck base back
                    ]
                }
            ]
        }
    ];

    const result = await executeBackendTool("local_cad_create_custom_model", {
        id: "knight-horse-final-" + Date.now(),
        name: "Final Horse Knight Test",
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

testKnight().catch(error => {
    console.error("Test failed:");
    console.error(error);
});
