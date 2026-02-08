import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { VERSION } from "../src/index.js";

describe("@cuioss/playwright-test-artifacts", () => {
    it("exports VERSION", () => {
        assert.equal(typeof VERSION, "string");
    });
});
