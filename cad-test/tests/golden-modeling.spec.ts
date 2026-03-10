import { test, expect } from '@playwright/test';
import { OnShapeClient, OnShapeConfig } from '../../src/mcp/cad/onshape-client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config: OnShapeConfig = {
    accessKey: process.env.ONSHAPE_ACCESS_KEY,
    secretKey: process.env.ONSHAPE_SECRET_KEY,
    baseUrl: 'https://cad.onshape.com'
};

const client = new OnShapeClient(config);

test.describe('CAD Golden Modeling Tests', () => {
    let documentId: string;

    test.beforeEach(async ({ page }) => {
        // Setup document for the test
        const timestamp = Date.now();
        const docName = `Golden_Model_${test.info().title.replace(/\s+/g, '_')}_${timestamp}`;
        console.log(`Creating document: ${docName}`);
        const doc = await client.createDocument({ name: docName });
        documentId = doc.id;
    });

    async function captureResult(page: any, docId: string, testName: string) {
        await page.goto(`https://cad.onshape.com/documents/${docId}`);
        await page.waitForSelector('.feature-tree-item', { timeout: 30000 });
        // Wait for the graphics to load
        await page.waitForTimeout(5000);
        await page.screenshot({ path: `screenshots/golden_${testName.replace(/\s+/g, '_')}.png`, fullPage: true });
        console.log(`Screenshot saved for ${testName}`);
    }

    test('Extrude and Fillet', async ({ page }) => {
        console.log('Step 1: Creating Rectangle Sketch...');
        const sketch = await client.createSketch(documentId, {
            featureName: 'Base_Sketch',
            sketchType: 'Top',
            geometry: [
                { type: 'rectangle', coordinates: [0, 0, 50, 50] }
            ]
        });

        console.log('Step 2: Extruding...');
        const extrude = await client.createExtrude(documentId, {
            sketchId: sketch.id,
            distance: 50
        });

        console.log('Step 3: Filleting top face...');
        // The top face of the extrusion usually has the same ID as the extrude feature or is reachable via some query
        // For simplicity, we'll try to fillet by targeting the extrude feature ID which often resolves to its generated faces in such simple cases
        // Or we use the sketch entities. 
        // In Onshape, a fillet on a face requires a face query. Targeting the extrude ID might work if it resolves to the faces it created.
        await client.createFillet(documentId, {
            entities: [extrude.id],
            radius: 5
        });

        await captureResult(page, documentId, 'Extrude_Fillet');
    });

    test('Extrude Fillet and Hole', async ({ page }) => {
        console.log('Step 1: Creating Base...');
        const sketch = await client.createSketch(documentId, {
            featureName: 'Base_Sketch',
            sketchType: 'Top',
            geometry: [{ type: 'rectangle', coordinates: [0, 0, 50, 50] }]
        });
        const extrude = await client.createExtrude(documentId, {
            sketchId: sketch.id,
            distance: 50
        });

        console.log('Step 2: Fillet...');
        await client.createFillet(documentId, {
            entities: [extrude.id],
            radius: 5
        });

        console.log('Step 3: Hole...');
        // Place a point for the hole
        const holeSketch = await client.createSketch(documentId, {
            featureName: 'Hole_Point',
            sketchType: 'Top', // Or a face, but 'Top' works for simple through holes
            geometry: [{ type: 'circle', coordinates: [25, 25, 0.1] }] // Tiny circle as a point
        });

        await client.createHole(documentId, {
            locationSketchId: holeSketch.id,
            diameter: 10,
            depth: 30
        });

        await captureResult(page, documentId, 'Extrude_Fillet_Hole');
    });

    test('Pure Revolve', async ({ page }) => {
        console.log('Step 1: Profile Sketch...');
        const profile = await client.createSketch(documentId, {
            featureName: 'Profile',
            sketchType: 'Front',
            geometry: [{ type: 'rectangle', coordinates: [10, 0, 30, 50] }]
        });

        console.log('Step 2: Axis Sketch...');
        const axis = await client.createSketch(documentId, {
            featureName: 'Axis',
            sketchType: 'Front',
            geometry: [{ type: 'line', coordinates: [0, 0, 0, 100] }]
        });

        console.log('Step 3: Revolve...');
        await client.createRevolve(documentId, {
            sketchId: profile.id,
            axisId: axis.id
        });

        await captureResult(page, documentId, 'Pure_Revolve');
    });

    test('Pure Sweep', async ({ page }) => {
        console.log('Step 1: Profile (Circle on Top)...');
        const profile = await client.createSketch(documentId, {
            featureName: 'Profile',
            sketchType: 'Top',
            geometry: [{ type: 'circle', coordinates: [0, 0, 10] }]
        });

        console.log('Step 2: Path (Arc on Front)...');
        const pathSketch = await client.createSketch(documentId, {
            featureName: 'Path',
            sketchType: 'Front',
            geometry: [{ type: 'arc', coordinates: [0, 0, 0, 100, 50, 50] }]
        });

        console.log('Step 3: Sweep...');
        await client.createSweep(documentId, {
            profileSketchId: profile.id,
            pathId: pathSketch.id
        });

        await captureResult(page, documentId, 'Pure_Sweep');
    });

    test('Pure Loft', async ({ page }) => {
        console.log('Step 1: Profile 1 (Top)...');
        const p1 = await client.createSketch(documentId, {
            featureName: 'P1',
            sketchType: 'Top',
            geometry: [{ type: 'rectangle', coordinates: [0, 0, 50, 50] }]
        });

        console.log('Step 2: Plane...');
        const plane = await client.createPlane(documentId, {
            entities: ['Top'],
            offset: 100
        });

        console.log('Step 3: Profile 2 (Offset Plane)...');
        const p2 = await client.createSketch(documentId, {
            featureName: 'P2',
            sketchType: plane.id,
            geometry: [{ type: 'circle', coordinates: [25, 25, 20] }]
        });

        console.log('Step 4: Loft...');
        await client.createLoft(documentId, {
            profileIds: [p1.id, p2.id]
        });

        await captureResult(page, documentId, 'Pure_Loft');
    });
});
