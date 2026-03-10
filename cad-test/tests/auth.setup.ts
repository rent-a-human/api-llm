import { test as setup, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
    console.log('Starting CAD Authentication flow...');

    // 1. Navigate to CAD login
    await page.goto('/signin');

    // 2. Perform Login (2-step flow)
    await page.getByPlaceholder('Email').fill(process.env.CAD_USERNAME || '10-10515@usb.ve');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Wait for the password field to appear
    await page.getByPlaceholder('Password').waitFor({ state: 'visible' });
    await page.getByPlaceholder('Password').fill(process.env.CAD_PASSWORD || 'Sofia_2017*');

    await page.getByRole('button', { name: 'Sign in' }).click();

    // 3. Wait for dashboard / document list to load to confirm auth success
    await page.waitForURL('**/documents**', { timeout: 30000 });
    // Wait for the DOM to settle post-navigation
    await page.waitForTimeout(3000);

    // 4. Save storage state (cookies/local storage) for future tests
    await page.context().storageState({ path: authFile });
    console.log('Authentication successful. Session saved.');
});
