import { test, expect } from '@playwright/test';
import { OnShapeClient, OnShapeConfig } from '../../src/mcp/cad/onshape-client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load the root .env file where CAD credentials should be
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

test.describe('CAD Agent Interoperability - Pure REST API Integration', () => {
    let client: OnShapeClient;
    let testDocumentId: string;
    // Note: To test this in reality, valid ONSHAPE_CLIENT_ID and ONSHAPE_CLIENT_SECRET are required in .env
    // or we can test with direct API Keys if OnshapeClient is configured for it.

    test.beforeAll(async () => {
        // Initialize the client
        const config: OnShapeConfig = {
            clientId: process.env.ONSHAPE_CLIENT_ID,
            clientSecret: process.env.ONSHAPE_CLIENT_SECRET,
            redirectUri: process.env.ONSHAPE_REDIRECT_URI || 'http://localhost:3000/callback',
            accessKey: process.env.ONSHAPE_ACCESS_KEY,
            secretKey: process.env.ONSHAPE_SECRET_KEY,
            baseUrl: 'https://cad.onshape.com'
        };
        client = new OnShapeClient(config);

        // For testing, we simulate authorization if keys aren't present
        const hasAuth = (config.accessKey && config.secretKey) || process.env.ONSHAPE_ACCESS_TOKEN;
        if (!hasAuth) {
            console.log("No ONSHAPE Auth found in .env. Mocking authentication for test...");
            // Simulate an event emission to unblock anything waiting
            client.emit('authenticated', { accessToken: 'mock_token', refreshToken: 'mock_refresh', expiresIn: 3600, tokenType: 'Bearer' });
        }

        // Create a dedicated test document
        console.log("Creating fresh OnShape test document...");
        const docResult = await client.createDocument({ name: `CAD_Agent_Test_${Date.now()}` });
        testDocumentId = docResult.id;
        console.log(`Document created: ${testDocumentId}`);
    });

    test('Agent API Tool: Modeling Flow (Sketch + Extrude)', async () => {
        // 1. Create Sketch
        console.log("Step 1: Creating Sketch...");
        const sketchResult = await client.createSketch(testDocumentId, {
            featureName: 'Agent_Rectangle_Sketch',
            sketchType: 'plane',
            geometry: [
                {
                    type: 'rectangle',
                    coordinates: [0, 0, 100, 100]
                }
            ]
        });

        expect(sketchResult).toBeDefined();
        expect(sketchResult.id).toBeDefined();
        const sketchId = sketchResult.id;
        console.log(`Sketch created with ID: ${sketchId}`);

        // 2. Create Extrude from that Sketch
        console.log("Step 2: Creating Extrude...");
        const extrudeResult = await client.createExtrude(testDocumentId, {
            sketchId: sketchId,
            distance: 50.0,
            direction: 'positive'
        });

        expect(extrudeResult).toBeDefined();
        expect(extrudeResult.id).toBeDefined();
        expect(extrudeResult.volume).toBeGreaterThan(0);
        console.log(`Extrude created with ID: ${extrudeResult.id}`);
    });
});
