import { describe, expect, it } from "vitest";
import { isDesignPageEnabled } from "./enabled";

describe("isDesignPageEnabled", () => {
  it("is on for local development and staging", () => {
    expect(isDesignPageEnabled("local")).toBe(true);
    expect(isDesignPageEnabled("staging")).toBe(true);
  });

  it("is off in production", () => {
    expect(isDesignPageEnabled("production")).toBe(false);
  });
});
