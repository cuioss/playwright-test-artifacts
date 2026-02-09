import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { takeStartScreenshot } from "../src/screenshot.js";

describe("takeStartScreenshot", () => {
    let tempDir;

    afterEach(() => {
        if (tempDir) {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    it("creates outputDir and calls page.screenshot with correct arguments", async () => {
        tempDir = join(mkdtempSync(join(tmpdir(), "screenshot-")), "nested");
        let capturedArgs = null;

        const mockPage = {
            async screenshot(args) {
                capturedArgs = args;
            },
        };

        await takeStartScreenshot(mockPage, { outputDir: tempDir });

        assert.ok(existsSync(tempDir));
        assert.deepEqual(capturedArgs, {
            path: join(tempDir, "start-test.png"),
            fullPage: true,
        });
    });

    it("works when outputDir already exists", async () => {
        tempDir = mkdtempSync(join(tmpdir(), "screenshot-"));
        let capturedArgs = null;

        const mockPage = {
            async screenshot(args) {
                capturedArgs = args;
            },
        };

        await takeStartScreenshot(mockPage, { outputDir: tempDir });

        assert.deepEqual(capturedArgs, {
            path: join(tempDir, "start-test.png"),
            fullPage: true,
        });
    });
});
