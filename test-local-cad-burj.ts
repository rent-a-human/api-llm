import { executeBackendTool } from './src/mcp/server';

/**
 * Generates a valid CCW perimeter for the Burj Khalifa Y-profile.
 */
function createYProfile(w1: number, w2: number, w3: number, wingWidth: number = 20) {
    const hw = wingWidth / 2;
    const innerDist = hw / Math.sin(Math.PI / 3); 

    const degToRad = (deg: number) => (deg * Math.PI) / 180;
    
    const getSidePoint = (len: number, axisAngle: number, isRightSide: boolean) => {
        const rad = degToRad(axisAngle);
        // Right side is axisAngle - 90, Left side is axisAngle + 90
        const sideRad = isRightSide ? rad - Math.PI / 2 : rad + Math.PI / 2;
        return [
            len * Math.cos(rad) + hw * Math.cos(sideRad),
            len * Math.sin(rad) + hw * Math.sin(sideRad)
        ];
    };

    const getConcavePoint = (angle: number) => [
        innerDist * Math.cos(degToRad(angle)),
        innerDist * Math.sin(degToRad(angle))
    ];

    // CCW Order: Wing 1 Right -> Wing 1 Left -> Corner 12 -> Wing 2 Right -> Wing 2 Left -> Corner 23 -> Wing 3 Right -> Wing 3 Left -> Corner 31
    return [
        getSidePoint(w1, 90, true),
        getSidePoint(w1, 90, false),
        getConcavePoint(150),
        getSidePoint(w2, 210, true),
        getSidePoint(w2, 210, false),
        getConcavePoint(270),
        getSidePoint(w3, 330, true),
        getSidePoint(w3, 330, false),
        getConcavePoint(30)
    ];
}

async function testBurj() {
    console.log("Starting Local CAD Burj Khalifa (Perimeter Fix) test...");

    const ops = [];
    let currentHeight = 0;
    const levelHeight = 25; // 25 units per level
    
    // Level 1: Foundation
    ops.push({
        type: 'extrude',
        params: { depth: levelHeight, direction: 'pos', opType: 'add', plane: 'planta', offset: currentHeight },
        sketch: [{ type: 'polygon', points: createYProfile(100, 100, 100, 20) }]
    });
    currentHeight += levelHeight;

    // Setback phases - Progressively narrowing wings
    const setbacks = [
        [100, 100, 100],
        [100, 100, 80],
        [100, 80, 80],
        [80, 80, 80],
        [80, 80, 60],
        [80, 60, 60],
        [60, 60, 60],
        [60, 60, 40],
        [60, 40, 40],
        [40, 40, 40],
        [40, 40, 20],
        [20, 20, 20]
    ];

    for (const [w1, w2, w3] of setbacks) {
        ops.push({
            type: 'extrude',
            params: { depth: levelHeight, direction: 'pos', opType: 'add', plane: 'planta', offset: currentHeight },
            sketch: [{ type: 'polygon', points: createYProfile(w1, w2, w3, 15) }]
        });
        currentHeight += levelHeight;
    }

    // Spire
    ops.push({
        type: 'extrude',
        params: { depth: 100, direction: 'pos', opType: 'add', plane: 'planta', offset: currentHeight },
        sketch: [{ type: 'circle', points: [[0, 0]], radius: 8 }]
    });
    currentHeight += 100;
    
    ops.push({
        type: 'extrude',
        params: { depth: 50, direction: 'pos', opType: 'add', plane: 'planta', offset: currentHeight },
        sketch: [{ type: 'circle', points: [[0, 0]], radius: 3 }]
    });

    const result = await executeBackendTool("local_cad_create_custom_model", {
        id: "burj-perimeter-fixed-" + Date.now(),
        name: "Burj Perimeter Fixed",
        operations: ops
    });

    if (result.content && result.content[0] && result.content[0].text) {
        const data = JSON.parse(result.content[0].text);
        console.log("\nSUCCESS! Viewer URL:");
        console.log(data.viewerUrl);
    }
}

testBurj().catch(error => {
    console.error("Test failed:");
    console.error(error);
});
