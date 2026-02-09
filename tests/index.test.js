import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    TestLogger,
    testLogger,
    takeStartScreenshot,
    createArtifactFixture,
} from "../src/index.js";

describe("@cuioss/playwright-test-artifacts public API", () => {
    it("exports TestLogger as a constructor", () => {
        assert.equal(typeof TestLogger, "function");
        const instance = new TestLogger();
        assert.ok(instance instanceof TestLogger);
    });

    it("exports testLogger as an instance of TestLogger", () => {
        assert.ok(testLogger instanceof TestLogger);
    });

    it("exports takeStartScreenshot as a function", () => {
        assert.equal(typeof takeStartScreenshot, "function");
    });

    it("exports createArtifactFixture as a function", () => {
        assert.equal(typeof createArtifactFixture, "function");
    });
});
