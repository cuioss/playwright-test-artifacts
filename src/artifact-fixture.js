/**
 * @file Artifact fixture factory for Playwright
 * @description Creates a reusable Playwright fixture that captures logs and screenshots per test.
 */

import { mkdirSync } from "fs";
import { join } from "path";
import { testLogger } from "./test-logger.js";

/**
 * Create a Playwright fixture definition object for `test.extend()`.
 * @example
 * import { test as base } from "@playwright/test";
 * import { createArtifactFixture } from "@cuioss/playwright-test-artifacts";
 * export const test = base.extend(createArtifactFixture());
 * @param {object} [options] - configuration options
 * @param {import('./test-logger.js').TestLogger} [options.logger] - logger instance (defaults to singleton testLogger)
 * @param {function(import('@playwright/test').Page, import('@playwright/test').TestInfo): Promise<void>} [options.beforeUse] - async callback after setup, before use(page)
 * @param {function(import('@playwright/test').Page, import('@playwright/test').TestInfo): Promise<void>} [options.afterUse] - async callback during teardown, after writeLogs
 * @returns {object} fixture definition object for test.extend()
 */
export function createArtifactFixture(options = {}) {
    const logger = options.logger || testLogger;
    const { beforeUse, afterUse } = options;

    return {
        /**
         * Page fixture with automatic log capture and screenshot artifacts.
         * @param {object} fixtures - Playwright fixtures
         * @param {import('@playwright/test').Page} fixtures.page - Playwright page
         * @param {function(import('@playwright/test').Page): Promise<void>} use - Playwright use callback
         * @param {import('@playwright/test').TestInfo} testInfo - Playwright testInfo
         */
        page: async ({ page }, use, testInfo) => {
            // Setup
            logger.startTest(testInfo.testId);
            logger.setupBrowserCapture(page);

            if (beforeUse) {
                await beforeUse(page, testInfo);
            }

            // Test body
            await use(page);

            // Teardown
            mkdirSync(testInfo.outputDir, { recursive: true });
            await page
                .screenshot({
                    path: join(testInfo.outputDir, "end-tests.png"),
                    fullPage: true,
                })
                .catch(() => {});
            logger.writeLogs(testInfo);

            if (afterUse) {
                await afterUse(page, testInfo);
            }
        },
    };
}
