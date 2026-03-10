import { test, expect } from '@playwright/test';
import { OnShapeClient, OnShapeConfig } from '../../src/mcp/cad/onshape-client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

test.describe('CAD Advanced Modeling - Revolve, Sweep, Loft', () => {
    let client: OnShapeClient;
    let testDocumentId: string;

    test.beforeAll(async () => {
        const config: OnShapeConfig = {
            accessKey: process.env.ONSHAPE_ACCESS_KEY,
            secretKey: process.env.ONSHAPE_SECRET_KEY,
            baseUrl: 'https://cad.onshape.com'
        };
        client = new OnShapeClient(config);

        console.log("Creating fresh OnShape test document for advanced modeling...");
        const docResult = await client.createDocument({ name: `Advanced_Modeling_Test_${Date.now()}` });
        testDocumentId = docResult.id;
        console.log(`Document created: ${testDocumentId}`);
    });

    test('Create Revolve Feature', async () => {
        console.log("Step 1: Creating Profile Sketch...");
        const profileSketch = await client.createSketch(testDocumentId, {
            featureName: 'Profile_Sketch',
            sketchType: 'Top',
            geometry: [
                {
                    type: 'circle',
                    coordinates: [50, 0, 20] // x=50, y=0, radius=20
                }
            ]
        });

        console.log("Step 2: Creating Axis Sketch...");
        const axisSketch = await client.createSketch(testDocumentId, {
            featureName: 'Axis_Sketch',
            sketchType: 'Top',
            geometry: [
                {
                    type: 'line',
                    coordinates: [0, -50, 0, 50] // x=0, y=-50 to x=0, y=50 (Along Y axis at origin)
                }
            ]
        });

        console.log("Step 3: Performing Revolve...");
        const revolveResult = await client.createRevolve(testDocumentId, {
            sketchId: profileSketch.id,
            axisId: axisSketch.id,
            revolveType: 'FULL'
        });

        expect(revolveResult).toBeDefined();
        expect(revolveResult.id).toBeDefined();
        console.log(`Revolve created with ID: ${revolveResult.id}`);
    });

    test('Create Sweep Feature', async () => {
        console.log("Step 1: Creating Profile Sketch (Top Plane)...");
        const profileSketch = await client.createSketch(testDocumentId, {
            featureName: 'Sweep_Profile',
            sketchType: 'Top',
            geometry: [
                {
                    type: 'circle',
                    coordinates: [0, 0, 10]
                }
            ]
        });

        console.log("Step 2: Creating Path Sketch (Front Plane)...");
        const pathSketch = await client.createSketch(testDocumentId, {
            featureName: 'Sweep_Path',
            sketchType: 'Front',
            geometry: [
                {
                    type: 'line',
                    coordinates: [0, 0, 0, 100] // Start at origin, go up 100 on Z (which is Y in Front plane terms for Onshape if no rotation)
                }
            ]
        });

        console.log("Step 3: Performing Sweep...");
        const sweepResult = await client.createSweep(testDocumentId, {
            profileSketchId: profileSketch.id,
            pathId: pathSketch.id
        });

        expect(sweepResult).toBeDefined();
        expect(sweepResult.id).toBeDefined();
        console.log(`Sweep created with ID: ${sweepResult.id}`);
    });

    test('Create Loft Feature', async () => {
        console.log("Step 1: Creating Profile 1 (Top Plane)...");
        const profile1 = await client.createSketch(testDocumentId, {
            featureName: 'Loft_Profile_1',
            sketchType: 'Top',
            geometry: [
                {
                    type: 'rectangle',
                    coordinates: [0, 0, 50, 50]
                }
            ]
        });

        console.log("Step 2: Creating Offset Plane...");
        const offsetPlane = await client.createPlane(testDocumentId, {
            entities: ['Top'],
            offset: 100
        });
        console.log(`Offset Plane created: ${offsetPlane.id}`);

        console.log("Step 3: Creating Profile 2 (on Offset Plane)...");
        const profile2 = await client.createSketch(testDocumentId, {
            featureName: 'Loft_Profile_2',
            sketchType: offsetPlane.id,
            geometry: [
                {
                    type: 'circle',
                    coordinates: [25, 25, 15]
                }
            ]
        });

        console.log("Step 4: Performing Loft...");
        const loftResult = await client.createLoft(testDocumentId, {
            profileIds: [profile1.id, profile2.id]
        });

        expect(loftResult).toBeDefined();
        expect(loftResult.id).toBeDefined();
        console.log(`Loft created with ID: ${loftResult.id}`);
    });
});
