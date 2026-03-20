import { executeBackendTool } from './src/mcp/server';

async function testEiffel() {
    console.log("Starting Local CAD Eiffel Tower test...");

    const operations = [
        // 1. Lower Section (Tapered legs base)
        {
            type: 'extrude',
            params: {
                depth: 60,
                direction: 'pos',
                opType: 'add',
                plane: 'planta',
                offset: 0
            },
            sketch: [
                {
                    type: 'rectangle',
                    points: [[-50, -50], [50, 50]] // 100x100 base
                }
            ]
        },
        // 2. Subtractive Arches - From Alzado (X-axis cut)
        {
            type: 'extrude',
            params: {
                depth: 200, // Long enough to cut through
                direction: 'mid',
                opType: 'subtract',
                plane: 'alzado',
                offset: 0
            },
            sketch: [
                {
                    type: 'circle',
                    points: [[0, 0]],
                    radius: 40 // Carves the arch
                }
            ]
        },
        // 3. Subtractive Arches - From Lateral (Y-axis cut)
        {
            type: 'extrude',
            params: {
                depth: 200,
                direction: 'mid',
                opType: 'subtract',
                plane: 'lateral',
                offset: 0
            },
            sketch: [
                {
                    type: 'circle',
                    points: [[0, 0]],
                    radius: 40
                }
            ]
        },
        // 4. First Observation Deck
        {
            type: 'extrude',
            params: {
                depth: 8,
                direction: 'pos',
                opType: 'add',
                plane: 'planta',
                offset: 60
            },
            sketch: [
                {
                    type: 'rectangle',
                    points: [[-55, -55], [55, 55]] // Slight overhang
                }
            ]
        },
        // 5. Middle Section (Narrows)
        {
            type: 'extrude',
            params: {
                depth: 100,
                direction: 'pos',
                opType: 'add',
                plane: 'planta',
                offset: 68
            },
            sketch: [
                {
                    type: 'rectangle',
                    points: [[-30, -30], [30, 30]]
                }
            ]
        },
        // 6. Second Observation Deck
        {
            type: 'extrude',
            params: {
                depth: 6,
                direction: 'pos',
                opType: 'add',
                plane: 'planta',
                offset: 168
            },
            sketch: [
                {
                    type: 'rectangle',
                    points: [[-35, -35], [35, 35]]
                }
            ]
        },
        // 7. Upper Spire section
        {
            type: 'extrude',
            params: {
                depth: 120,
                direction: 'pos',
                opType: 'add',
                plane: 'planta',
                offset: 174
            },
            sketch: [
                {
                    type: 'rectangle',
                    points: [[-8, -8], [8, 8]]
                }
            ]
        },
        // 8. Top Spire tip
        {
            type: 'extrude',
            params: {
                depth: 40,
                direction: 'pos',
                opType: 'add',
                plane: 'planta',
                offset: 294
            },
            sketch: [
                {
                    type: 'circle',
                    points: [[0, 0]],
                    radius: 3
                }
            ]
        }
    ];

    const result = await executeBackendTool("local_cad_create_custom_model", {
        id: "eiffel-tower-" + Date.now(),
        name: "Eiffel Tower Structural Verification",
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

testEiffel().catch(error => {
    console.error("Test failed:");
    console.error(error);
});
