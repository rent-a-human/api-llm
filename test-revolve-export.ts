import { LocalCADClient } from './src/mcp/cad/local-cad-client';

async function testRevolve() {
    const client = new LocalCADClient();
    const mockOperations = [
        {
            id: 'sketch-1',
            type: 'sketch',
            params: { plane: 'alzado' },
            sketch: [
                {
                    id: 'rect-1',
                    type: 'polygon',
                    points: [[10, -5], [20, -5], [20, 5], [10, 5]]
                }
            ]
        },
        {
            id: 'revolve-1',
            type: 'revolve',
            params: {
                angle: 360,
                axisId: 'y',
                opType: 'add',
                plane: 'alzado'
            },
            sketch: [
                {
                    id: 'rect-1',
                    type: 'polygon',
                    points: [[10, -5], [20, -5], [20, 5], [10, 5]]
                }
            ]
        }
    ];

    try {
        console.log('Testing Revolve Export...');
        const result = await client.createCustomModel('test-donut', 'Test Donut', mockOperations);
        console.log('Export Result:', result);
    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testRevolve();
