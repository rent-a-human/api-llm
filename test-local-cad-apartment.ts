import { executeBackendTool } from './src/mcp/server';

async function testApartment() {
    console.log("Starting Local CAD Apartment Floor (Refined) test...");

    const operations = [
        // 1. Base Floor Plate (The Slab) - Z: [0, 5]
        {
            type: 'extrude',
            params: { 
                depth: 5, 
                direction: 'pos', 
                opType: 'add', 
                plane: 'planta',
                offset: 0 
            },
            sketch: [
                { type: 'rectangle', points: [[-100, -60], [100, 60]] }
            ]
        },
        // 2. Detailed Walls (Thinner: 2 units) - Z: [5, 35]
        {
            type: 'extrude',
            params: { 
                depth: 30, 
                direction: 'pos', 
                opType: 'add', 
                plane: 'planta',
                offset: 5 
            },
            sketch: [
                { type: 'rectangle', points: [[-100, -60], [100, 60]] }, // Outer perimeter
                { type: 'rectangle', points: [[-98, -58], [-1, 7]] },    // Kitchen/Living Room hollow
                { type: 'rectangle', points: [[-98, 9], [-1, 58]] },     // Bedroom 1 hollow
                { type: 'rectangle', points: [[1, -58], [98, 58]] }      // Master Suite hollow
            ]
        },
        // 3. Subtract door openings
        // 3a. Front Door (Alzado plane cuts front wall)
        {
            type: 'extrude',
            params: {
                depth: 200, 
                direction: 'mid', 
                opType: 'subtract',
                plane: 'alzado'
            },
            sketch: [
                { type: 'rectangle', points: [[-15, 5], [15, 25]] } // Door opening at the base (Y start: 5)
            ]
        },
        // 3b. Internal Door (Lateral plane cuts internal wall at X=0)
        {
            type: 'extrude',
            params: {
                depth: 200,
                direction: 'mid',
                opType: 'subtract',
                plane: 'lateral'
            },
            sketch: [
                // Cut a door between Kitchen and Master Suite
                // Lateral plane: Sketch X is world Z, Sketch Y is world Y
                // Center of Kitchen is roughly world Z = -25 (Sketch X = -25)
                { type: 'rectangle', points: [[-25, 5], [-5, 25]] }
            ]
        },
        // 4. Windows (Alzado plane)
        {
            type: 'extrude',
            params: {
                depth: 200,
                direction: 'mid',
                opType: 'subtract',
                plane: 'alzado'
            },
            sketch: [
                { type: 'rectangle', points: [[-80, 15], [-60, 25]] },
                { type: 'rectangle', points: [[-40, 15], [-20, 25]] },
                { type: 'rectangle', points: [[20, 15], [40, 25]] },
                { type: 'rectangle', points: [[60, 15], [80, 25]] }
            ]
        }
    ];

    const result = await executeBackendTool("local_cad_create_custom_model", {
        id: "apartment-refined-" + Date.now(),
        name: "Refined Apartment Floor Test",
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

testApartment().catch(error => {
    console.error("Test failed:");
    console.error(error);
});
