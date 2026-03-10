import { test, expect } from '@playwright/test';

// This test suite runs AFTER auth.setup.ts and uses the saved session state
test.describe('CAD Agent Interoperability - Modeling Tools', () => {

    test('Agent Tool: create_sketch', async ({ page }) => {
        // 1. Open the specific test document parameterized by the agent or defaulted
        const targetUrl = process.env.TEST_TARGET_URL || '/documents?resourceType=resourceuserowner&nodeId=69ac7368013efc4f64891644';
        await page.goto(targetUrl, { timeout: 60000 });

        // Wait for the WebGL canvas and feature tree to fully load
        await page.waitForTimeout(10000); // hard wait for canvas render

        // Take an initial screenshot
        await page.screenshot({ path: 'cad-screenshots/1-initial-document-load.png' });

        // 2. Select "Sketch" tool from the toolbar
        // Uses the generic 'New sketch' button or toolbar shortcut
        await page.keyboard.press('Shift+S'); // shortcut for new sketch
        await page.waitForTimeout(1000);

        // 3. Select a plane (e.g., Top plane) from the feature list
        const topPlane = page.locator('.feature-list-item:has-text("Top")');
        if (await topPlane.isVisible()) {
            await topPlane.click();
        } else {
            console.warn("Top plane not found in feature tree list.");
        }
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'cad-screenshots/2-sketch-active.png' });

        // 4. Draw a 2D shape (Rectangle)
        // Press 'r' for center point rectangle
        await page.keyboard.press('r');
        await page.waitForTimeout(1000);

        // Click center of the canvas
        const canvas = page.locator('canvas');
        const box = await canvas.boundingBox();
        if (box) {
            // Click center
            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
            // Move mouse and click to create rectangle
            await page.mouse.click(box.x + box.width / 2 + 100, box.y + box.height / 2 + 100);
        }

        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'cad-screenshots/3-rectangle-drawn.png' });

        // 5. Confirm Sketch (Green checkmark)
        // The confirm button class/id changes frequently, often easiest to use Enter if dialog is focused
        await page.keyboard.press('Escape'); // Drop tool
        await page.waitForTimeout(500);
        // Try to click the checkmark button in the sketch dialog (often has an svg or specific tooltip)
        const confirmBtn = page.locator('.button-commit, [tooltip="Accept"]');
        if (await confirmBtn.first().isVisible()) {
            await confirmBtn.first().click();
        } else {
            await page.keyboard.press('Enter');
        }

        await page.waitForTimeout(2000);

        // Assert sketch was created by checking for it in the feature tree
        // We expect it to be named Sketch 1, or just verify a new sketch exists
        await page.screenshot({ path: 'cad-screenshots/4-sketch-confirmed.png' });
        const newSketch = page.locator('.feature-list-item:has-text("Sketch")').last();
        await expect(newSketch).toBeVisible({ timeout: 10000 });
    });

    test('Agent Tool: create_extrusion (Pieces)', async ({ page }) => {
        // Select the sketch
        await page.locator('text="Sketch 1"').click();

        // Click Extrude
        await page.getByRole('button', { name: 'Extrude' }).click();

        // Set depth
        await page.getByLabel('Depth').fill('50 mm');

        // Confirm Extrusion (Add piece)
        await page.getByRole('button', { name: 'Confirm extrude' }).click();

        await expect(page.locator('text="Extrude 1"')).toBeVisible();
    });

});
