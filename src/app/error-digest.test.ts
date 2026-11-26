import { describe, expect, it } from "vitest";
import { errorDigest } from "./error-digest";

describe("errorDigest", () => {
  it("returns a string digest", () => {
    expect(errorDigest(Object.assign(new Error("x"), { digest: "1a2b3c" }))).toBe("1a2b3c");
    expect(errorDigest({ digest: "abc" })).toBe("abc");
  });

  it("returns undefined when there is no usable digest", () => {
    expect(errorDigest(new Error("x"))).toBeUndefined();
    expect(errorDigest({ digest: 42 })).toBeUndefined();
    expect(errorDigest({ digest: "" })).toBeUndefined();
    expect(errorDigest(null)).toBeUndefined();
    expect(errorDigest(undefined)).toBeUndefined();
    expect(errorDigest("boom")).toBeUndefined();
  });
});
