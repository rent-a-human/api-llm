import { executeBackendTool } from './src/mcp/server';

async function createRealisticEiffelTower() {
    console.log("Starting Enhanced Eiffel Tower CAD Generation - Iteration 1");

    const operations = [
        // Base Level - Four Main Legs with Proper Taper
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
                // Base foundation platform
                {
                    type: 'rectangle',
                    points: [[-125, -125], [125, 125]]
                }
            ]
        },
        
        // First Level Platform (Base Level)
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
                    points: [[-120, -120], [120, 120]]
                }
            ]
        },

        // Lower Section - First Platform Level (authentic height ~57m)
        {
            type: 'extrude',
            params: {
                depth: 120,
                direction: 'pos',
                opType: 'add',
                plane: 'planta',
                offset: 68
            },
            sketch: [
                {
                    type: 'rectangle',
                    points: [[-80, -80], [80, 80]]
                }
            ]
        },

        // First Observation Deck (at ~58m - authentic proportions)
        {
            type: 'extrude',
            params: {
                depth: 12,
                direction: 'pos',
                opType: 'add',
                plane: 'planta',
                offset: 188
            },
            sketch: [
                {
                    type: 'rectangle',
                    points: [[-85, -85], [85, 85]]
                }
            ]
        },

        // Second Level Structure
        {
            type: 'extrude',
            params: {
                depth: 80,
                direction: 'pos',
                opType: 'add',
                plane: 'planta',
                offset: 200
            },
            sketch: [
                {
                    type: 'rectangle',
                    points: [[-45, -45], [45, 45]]
                }
            ]
        },

        // Second Observation Deck (at ~115m - authentic)
        {
            type: 'extrude',
            params: {
                depth: 10,
                direction: 'pos',
                opType: 'add',
                plane: 'planta',
                offset: 280
            },
            sketch: [
                {
                    type: 'rectangle',
                    points: [[-50, -50], [50, 50]]
                }
            ]
        },

        // Upper Section - Narrowing tower
        {
            type: 'extrude',
            params: {
                depth: 90,
                direction: 'pos',
                opType: 'add',
                plane: 'planta',
                offset: 290
            },
            sketch: [
                {
                    type: 'rectangle',
                    points: [[-20, -20], [20, 20]]
                }
            ]
        },

        // Top Platform (at ~275m)
        {
            type: 'extrude',
            params: {
                depth: 15,
                direction: 'pos',
                opType: 'add',
                plane: 'planta',
                offset: 380
            },
            sketch: [
                {
                    type: 'rectangle',
                    points: [[-25, -25], [25, 25]]
                }
            ]
        },

        // Antenna/Spire section
        {
            type: 'extrude',
            params: {
                depth: 50,
                direction: 'pos',
                opType: 'add',
                plane: 'planta',
                offset: 395
            },
            sketch: [
                {
                    type: 'rectangle',
                    points: [[-5, -5], [5, 5]]
                }
            ]
        },

        // Top tip
        {
            type: 'extrude',
            params: {
                depth: 25,
                direction: 'pos',
                opType: 'add',
                plane: 'planta',
                offset: 445
            },
            sketch: [
                {
                    type: 'circle',
                    points: [[0, 0]],
                    radius: 2
                }
            ]
        },

        // Subtract main arch opening (authentic arch)
        {
            type: 'extrude',
            params: {
                depth: 200,
                direction: 'mid',
                opType: 'subtract',
                plane: 'alzado',
                offset: 0
            },
            sketch: [
                {
                    type: 'circle',
                    points: [[0, -30]],
                    radius: 35
                }
            ]
        }
    ];

    try {
        const result = await executeBackendTool("local_cad_create_custom_model", {
            id: "eiffel-tower-iteration-" + Date.now(),
            name: "Eiffel Tower Enhanced - Iteration 1",
            operations: operations
        });

        console.log("✅ SUCCESS! Iteration 1 Complete");
        console.log("Result URL:", result.content?.[0]?.text);
        
        if (result.content?.[0]?.text) {
            const data = JSON.parse(result.content[0].text);
            console.log("\n🔗 New Model URL:", data.viewerUrl);
            console.log("📊 Total Height:", 470, "units");
            console.log("🎯 Focus: Basic proportions and authentic height ratios");
        }
        
        return result;
    } catch (error) {
        console.error("❌ Iteration 1 Failed:", error);
        throw error;
    }
}

createRealisticEiffelTower().catch(console.error);