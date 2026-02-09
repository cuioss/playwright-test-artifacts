/**
 * @file Entry point for `@cuioss/playwright-test-artifacts`
 * @description Playwright test artifact infrastructure — captures browser logs,
 * network errors, and screenshots per test.
 */

export { TestLogger, testLogger } from "./test-logger.js";
export { takeStartScreenshot } from "./screenshot.js";
export { createArtifactFixture } from "./artifact-fixture.js";
