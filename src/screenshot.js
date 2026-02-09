/**
 * @file Start-of-test screenshot utility
 * @description Takes a full-page screenshot at the start of a test.
 */

import { mkdirSync } from "fs";
import { join } from "path";

/**
 * Take a screenshot at the start of a test (after preconditions, before test body).
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {import('@playwright/test').TestInfo} testInfo - Playwright testInfo object
 */
export async function takeStartScreenshot(page, testInfo) {
    mkdirSync(testInfo.outputDir, { recursive: true });
    await page.screenshot({
        path: join(testInfo.outputDir, "start-test.png"),
        fullPage: true,
    });
}
