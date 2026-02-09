import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { createArtifactFixture } from "../src/artifact-fixture.js";

function createMockLogger() {
    const calls = [];
    return {
        calls,
        startTest(testId) {
            calls.push({ method: "startTest", args: [testId] });
        },
        setupBrowserCapture(page) {
            calls.push({ method: "setupBrowserCapture", args: [page] });
        },
        writeLogs(testInfo) {
            calls.push({ method: "writeLogs", args: [testInfo] });
        },
    };
}

function createMockPage() {
    const screenshotCalls = [];
    return {
        screenshotCalls,
        on() {},
        async screenshot(args) {
            screenshotCalls.push(args);
        },
    };
}

describe("createArtifactFixture", () => {
    let tempDir;

    afterEach(() => {
        if (tempDir) {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    it("returns object with page property that is a function", () => {
        const fixture = createArtifactFixture();
        assert.equal(typeof fixture.page, "function");
    });

    it("fixture calls logger.startTest and logger.setupBrowserCapture during setup", async () => {
        tempDir = mkdtempSync(join(tmpdir(), "fixture-"));
        const logger = createMockLogger();
        const page = createMockPage();
        const fixture = createArtifactFixture({ logger });

        await fixture.page({ page }, async () => {}, { testId: "test-42", outputDir: tempDir });

        const methodNames = logger.calls.map((c) => c.method);
        assert.ok(methodNames.includes("startTest"));
        assert.ok(methodNames.includes("setupBrowserCapture"));
        assert.deepEqual(logger.calls[0], { method: "startTest", args: ["test-42"] });
    });

    it("fixture calls use(page) between setup and teardown", async () => {
        tempDir = mkdtempSync(join(tmpdir(), "fixture-"));
        const logger = createMockLogger();
        const page = createMockPage();
        const fixture = createArtifactFixture({ logger });
        let useCalledWith = null;

        await fixture.page(
            { page },
            async (p) => {
                useCalledWith = p;
            },
            { testId: "test-1", outputDir: tempDir },
        );

        assert.equal(useCalledWith, page);
    });

    it("fixture takes end-tests.png screenshot during teardown", async () => {
        tempDir = mkdtempSync(join(tmpdir(), "fixture-"));
        const logger = createMockLogger();
        const page = createMockPage();
        const fixture = createArtifactFixture({ logger });

        await fixture.page({ page }, async () => {}, { testId: "test-1", outputDir: tempDir });

        assert.equal(page.screenshotCalls.length, 1);
        assert.deepEqual(page.screenshotCalls[0], {
            path: join(tempDir, "end-tests.png"),
            fullPage: true,
        });
    });

    it("fixture calls logger.writeLogs during teardown", async () => {
        tempDir = mkdtempSync(join(tmpdir(), "fixture-"));
        const logger = createMockLogger();
        const page = createMockPage();
        const fixture = createArtifactFixture({ logger });

        await fixture.page({ page }, async () => {}, { testId: "test-1", outputDir: tempDir });

        const writeLogsCalls = logger.calls.filter((c) => c.method === "writeLogs");
        assert.equal(writeLogsCalls.length, 1);
    });

    it("screenshot failure during teardown does not throw", async () => {
        tempDir = mkdtempSync(join(tmpdir(), "fixture-"));
        const logger = createMockLogger();
        const page = {
            on() {},
            async screenshot() {
                throw new Error("page closed");
            },
        };
        const fixture = createArtifactFixture({ logger });

        // Should not throw
        await fixture.page({ page }, async () => {}, { testId: "test-1", outputDir: tempDir });

        // writeLogs should still be called
        const writeLogsCalls = logger.calls.filter((c) => c.method === "writeLogs");
        assert.equal(writeLogsCalls.length, 1);
    });

    it("beforeUse callback is invoked with page and testInfo before use", async () => {
        tempDir = mkdtempSync(join(tmpdir(), "fixture-"));
        const logger = createMockLogger();
        const page = createMockPage();
        const callOrder = [];

        const fixture = createArtifactFixture({
            logger,
            async beforeUse(p, info) {
                callOrder.push("beforeUse");
                assert.equal(p, page);
                assert.equal(info.testId, "test-1");
            },
        });

        await fixture.page(
            { page },
            async () => {
                callOrder.push("use");
            },
            { testId: "test-1", outputDir: tempDir },
        );

        assert.equal(callOrder[0], "beforeUse");
        assert.equal(callOrder[1], "use");
    });

    it("afterUse callback is invoked with page and testInfo after writeLogs", async () => {
        tempDir = mkdtempSync(join(tmpdir(), "fixture-"));
        const logger = createMockLogger();
        const page = createMockPage();
        let afterUseCalled = false;

        const fixture = createArtifactFixture({
            logger,
            async afterUse(p, info) {
                afterUseCalled = true;
                assert.equal(p, page);
                assert.equal(info.testId, "test-1");
                // writeLogs should have been called before afterUse
                const writeLogsCalls = logger.calls.filter((c) => c.method === "writeLogs");
                assert.equal(writeLogsCalls.length, 1);
            },
        });

        await fixture.page({ page }, async () => {}, { testId: "test-1", outputDir: tempDir });

        assert.ok(afterUseCalled);
    });
});
