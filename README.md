# @cuioss/playwright-test-artifacts

## Status

[![Node.js CI](https://github.com/cuioss/playwright-test-artifacts/actions/workflows/npm-build.yml/badge.svg)](https://github.com/cuioss/playwright-test-artifacts/actions/workflows/npm-build.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![npm](https://img.shields.io/npm/v/@cuioss/playwright-test-artifacts)](https://www.npmjs.com/package/@cuioss/playwright-test-artifacts)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=cuioss_playwright-test-artifacts&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=cuioss_playwright-test-artifacts)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=cuioss_playwright-test-artifacts&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=cuioss_playwright-test-artifacts)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=cuioss_playwright-test-artifacts&metric=coverage)](https://sonarcloud.io/summary/new_code?id=cuioss_playwright-test-artifacts)

## What is it?

A standalone npm package providing Playwright test artifact infrastructure.
It captures browser console logs, JavaScript errors, network failures, and full-page screenshots for every test — automatically.
All artifacts are persisted to Playwright's per-test `testInfo.outputDir`, making them immediately available in CI reports and local debugging.

### Installation

```bash
npm install @cuioss/playwright-test-artifacts
```

### Quick Start

```javascript
// tests/fixtures.js
import { test as base } from "@playwright/test";
import { createArtifactFixture } from "@cuioss/playwright-test-artifacts";

export const test = base.extend(createArtifactFixture());
export { expect } from "@playwright/test";
```

```javascript
// tests/example.spec.js
import { test, expect } from "./fixtures.js";

test("homepage loads", async ({ page }) => {
    await page.goto("https://example.com");
    await expect(page).toHaveTitle(/Example/);
});
// -> Artifacts automatically saved: start-test.png (if using takeStartScreenshot),
//    browser.log, test-run.log, end-tests.png
```

## API

| Export | Type | Description |
|--------|------|-------------|
| `TestLogger` | Class | Unified logger capturing browser and Node-side logs per test. |
| `testLogger` | Instance | Singleton `TestLogger` instance for convenient reuse. |
| `takeStartScreenshot` | `async function(page, testInfo)` | Takes a full-page screenshot named `start-test.png` at the start of a test. |
| `createArtifactFixture` | `function(options?)` | Factory returning a Playwright fixture definition for `test.extend()`. |

### Per-Test Artifact Contract

Each test using the artifact fixture produces these files in `testInfo.outputDir`:

| File | Description |
|------|-------------|
| `start-test.png` | Full-page screenshot taken at test start (requires explicit `takeStartScreenshot` call or `beforeUse` hook). |
| `browser.log` | Browser console messages, JavaScript exceptions, and HTTP errors (status >= 400). |
| `test-run.log` | Node-side log entries from custom `logger.info()` / `logger.warn()` / `logger.error()` calls. |
| `end-tests.png` | Full-page screenshot taken automatically during teardown. |

### Output Directory

Playwright automatically creates a **separate subdirectory per test** inside `outputDir`, so each test's artifacts are isolated.
The subdirectory name is derived from the test file and test title.

```
test-results/
├── homepage-loads-chromium/
│   ├── browser.log
│   ├── test-run.log
│   └── end-tests.png
└── login-works-chromium/
    ├── browser.log
    ├── test-run.log
    └── end-tests.png
```

The base `outputDir` is configured in your `playwright.config.js`.
Playwright's default is `test-results/` at your project root.

```javascript
// playwright.config.js — default (npm projects)
import { defineConfig } from "@playwright/test";

export default defineConfig({
    outputDir: "test-results",
});
```

For Maven-style projects that follow the `target/` convention:

```javascript
// playwright.config.js — Maven-style project
import { defineConfig } from "@playwright/test";

export default defineConfig({
    outputDir: "target/test-results",
});
```

### Advanced Usage

#### Custom logger instance

```javascript
import { test as base } from "@playwright/test";
import { TestLogger, createArtifactFixture } from "@cuioss/playwright-test-artifacts";

const myLogger = new TestLogger();
export const test = base.extend(createArtifactFixture({ logger: myLogger }));
```

#### beforeUse / afterUse hooks

```javascript
import { test as base } from "@playwright/test";
import {
    createArtifactFixture,
    takeStartScreenshot,
} from "@cuioss/playwright-test-artifacts";

export const test = base.extend(
    createArtifactFixture({
        async beforeUse(page, testInfo) {
            // Runs after logger setup, before test body
            await takeStartScreenshot(page, testInfo);
        },
        async afterUse(page, testInfo) {
            // Runs after logs are written — e.g. custom cleanup
            console.log(`Artifacts saved to ${testInfo.outputDir}`);
        },
    }),
);
```

#### Manual TestLogger usage

```javascript
import { testLogger } from "@cuioss/playwright-test-artifacts";

// Inside a Playwright test or helper
testLogger.info("MyHelper", "Navigating to login page");
testLogger.warn("MyHelper", "Unexpected redirect detected");
testLogger.error("MyHelper", "Login failed with status 401");
```

## License

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
