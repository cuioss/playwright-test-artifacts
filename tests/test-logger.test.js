import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { TestLogger } from "../src/test-logger.js";

function createMockPage() {
    const handlers = new Map();
    return {
        on(event, handler) {
            if (!handlers.has(event)) {
                handlers.set(event, []);
            }
            handlers.get(event).push(handler);
        },
        emit(event, ...args) {
            const fns = handlers.get(event) || [];
            for (const fn of fns) {
                fn(...args);
            }
        },
        async screenshot() {},
    };
}

describe("TestLogger", () => {
    let logger;
    let tempDir;

    beforeEach(() => {
        logger = new TestLogger();
        tempDir = mkdtempSync(join(tmpdir(), "test-logger-"));
    });

    afterEach(() => {
        rmSync(tempDir, { recursive: true, force: true });
    });

    it("startTest clears previous logs and sets testId", () => {
        logger.startTest("test-1");
        logger.log("browser", "info", "first");
        assert.equal(logger.getLogs().length, 1);

        logger.startTest("test-2");
        assert.equal(logger.getLogs().length, 0);
    });

    it("log records entries with correct fields and valid timestamp", () => {
        logger.startTest("test-1");
        logger.log("browser", "info", "hello world");

        const logs = logger.getLogs();
        assert.equal(logs.length, 1);
        assert.equal(logs[0].source, "browser");
        assert.equal(logs[0].level, "info");
        assert.equal(logs[0].message, "hello world");
        assert.ok(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(logs[0].timestamp));
    });

    it("log does nothing before startTest is called", () => {
        logger.log("browser", "info", "ignored");
        assert.equal(logger.getLogs().length, 0);
    });

    it("info sets correct level", () => {
        logger.startTest("test-1");
        logger.info("Auth", "logged in");
        const logs = logger.getLogs();
        assert.equal(logs[0].source, "Auth");
        assert.equal(logs[0].level, "info");
        assert.equal(logs[0].message, "logged in");
    });

    it("warn sets correct level", () => {
        logger.startTest("test-1");
        logger.warn("Auth", "token expiring");
        const logs = logger.getLogs();
        assert.equal(logs[0].level, "warn");
    });

    it("error sets correct level", () => {
        logger.startTest("test-1");
        logger.error("Auth", "failed");
        const logs = logger.getLogs();
        assert.equal(logs[0].level, "error");
    });

    it("setupBrowserCapture registers handlers for console, pageerror, response", () => {
        const page = createMockPage();
        logger.setupBrowserCapture(page);

        // Verify handlers were registered by checking the map has entries
        // We test indirectly by emitting events below
        assert.ok(page);
    });

    it("console handler captures message type and text", () => {
        logger.startTest("test-1");
        const page = createMockPage();
        logger.setupBrowserCapture(page);

        page.emit("console", { type: () => "warning", text: () => "deprecation notice" });

        const logs = logger.getLogs();
        assert.equal(logs.length, 1);
        assert.equal(logs[0].source, "browser");
        assert.equal(logs[0].level, "warning");
        assert.equal(logs[0].message, "deprecation notice");
    });

    it("pageerror handler captures exception message", () => {
        logger.startTest("test-1");
        const page = createMockPage();
        logger.setupBrowserCapture(page);

        page.emit("pageerror", { message: "Uncaught TypeError: x is not a function" });

        const logs = logger.getLogs();
        assert.equal(logs.length, 1);
        assert.equal(logs[0].level, "exception");
        assert.equal(logs[0].message, "Uncaught TypeError: x is not a function");
    });

    it("response handler captures network errors (status >= 400)", () => {
        logger.startTest("test-1");
        const page = createMockPage();
        logger.setupBrowserCapture(page);

        page.emit("response", {
            status: () => 404,
            url: () => "https://example.com/missing",
        });

        const logs = logger.getLogs();
        assert.equal(logs.length, 1);
        assert.equal(logs[0].level, "network-error");
        assert.equal(logs[0].message, "HTTP 404 - https://example.com/missing");
    });

    it("response handler ignores OK responses", () => {
        logger.startTest("test-1");
        const page = createMockPage();
        logger.setupBrowserCapture(page);

        page.emit("response", {
            status: () => 200,
            url: () => "https://example.com/ok",
        });

        assert.equal(logger.getLogs().length, 0);
    });

    it("writeLogs creates browser.log and test-run.log with correct format", () => {
        logger.startTest("test-1");
        logger.log("browser", "info", "console message");
        logger.log("Auth", "info", "node message");

        logger.writeLogs({ outputDir: tempDir });

        const browserLog = readFileSync(join(tempDir, "browser.log"), "utf-8");
        assert.ok(browserLog.includes("[info] console message"));
        assert.ok(!browserLog.includes("node message"));

        const testRunLog = readFileSync(join(tempDir, "test-run.log"), "utf-8");
        assert.ok(testRunLog.includes("[Auth] [info] node message"));
        assert.ok(!testRunLog.includes("console message"));
    });

    it("writeLogs clears logs after writing", () => {
        logger.startTest("test-1");
        logger.log("browser", "info", "msg");
        logger.writeLogs({ outputDir: tempDir });

        assert.equal(logger.getLogs().length, 0);
    });

    it("getLogs returns a defensive copy", () => {
        logger.startTest("test-1");
        logger.log("browser", "info", "msg");

        const copy = logger.getLogs();
        copy.push({ timestamp: "fake", source: "fake", level: "fake", message: "fake" });

        assert.equal(logger.getLogs().length, 1);
    });
});
