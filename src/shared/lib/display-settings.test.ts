import { describe, expect, it } from "vitest";
import {
  applyDisplayPrefs,
  DEFAULT_DISPLAY_PREFS,
  DISPLAY_PREFS_KEY,
  DISPLAY_PREFS_SCRIPT,
  parseDisplayPrefs,
  readAppliedDisplayPrefs,
  serializeDisplayPrefs,
} from "./display-settings";

const defaults = { size: 1, contrast: "normal" };

describe("parseDisplayPrefs", () => {
  it("returns the defaults for missing or unreadable input", () => {
    expect(parseDisplayPrefs(null)).toEqual(defaults);
    expect(parseDisplayPrefs("")).toEqual(defaults);
    expect(parseDisplayPrefs("not json")).toEqual(defaults);
    expect(parseDisplayPrefs("{")).toEqual(defaults);
  });
  it("returns the defaults for JSON that is not an object", () => {
    for (const raw of ["null", "3", '"high"', "[]", '[3,"high"]', "true"]) {
      expect(parseDisplayPrefs(raw)).toEqual(defaults);
    }
  });
  it("returns the defaults when both fields are invalid", () => {
    expect(parseDisplayPrefs('{"size":9,"contrast":"x"}')).toEqual(defaults);
  });
  it("validates each field independently", () => {
    expect(parseDisplayPrefs('{"size":3,"contrast":"x"}')).toEqual({ size: 3, contrast: "normal" });
    expect(parseDisplayPrefs('{"size":"2","contrast":"high"}')).toEqual({
      size: 1,
      contrast: "high",
    });
    expect(parseDisplayPrefs('{"size":2.5,"contrast":"high"}')).toEqual({
      size: 1,
      contrast: "high",
    });
    expect(parseDisplayPrefs('{"contrast":"high"}')).toEqual({ size: 1, contrast: "high" });
  });
  it("reads valid values and ignores extra keys", () => {
    expect(parseDisplayPrefs('{"size":3,"contrast":"high"}')).toEqual({
      size: 3,
      contrast: "high",
    });
    expect(parseDisplayPrefs('{"size":2,"contrast":"normal","theme":"dark"}')).toEqual({
      size: 2,
      contrast: "normal",
    });
  });
  it("round-trips through serializeDisplayPrefs", () => {
    expect(parseDisplayPrefs(serializeDisplayPrefs({ size: 2, contrast: "high" }))).toEqual({
      size: 2,
      contrast: "high",
    });
  });
  it("defaults are size 1 and normal contrast", () => {
    expect(DEFAULT_DISPLAY_PREFS).toEqual(defaults);
  });
});

describe("applyDisplayPrefs", () => {
  it("sets and removes the attributes", () => {
    const root = { dataset: {} as DOMStringMap };
    applyDisplayPrefs({ size: 2, contrast: "high" }, root);
    expect(root.dataset).toEqual({ size: "2", contrast: "high" });
    applyDisplayPrefs({ size: 1, contrast: "normal" }, root);
    expect(root.dataset.contrast).toBeUndefined();
    expect(root.dataset.size).toBeUndefined();
    expect("size" in root.dataset).toBe(false);
  });
  it("leaves no size key for size 1 on a fresh root", () => {
    const root = { dataset: {} as DOMStringMap };
    applyDisplayPrefs({ size: 1, contrast: "normal" }, root);
    expect(Object.keys(root.dataset)).toEqual([]);
  });
});

/** Runs the inline script against a fake document and storage. */
function runScript(stored: string | null | "throw"): DOMStringMap {
  const dataset: DOMStringMap = {};
  const document = { documentElement: { dataset } };
  const localStorage = {
    getItem(key: string): string | null {
      if (stored === "throw") throw new Error("blocked");
      return key === DISPLAY_PREFS_KEY ? stored : null;
    },
  };
  new Function("document", "localStorage", DISPLAY_PREFS_SCRIPT)(document, localStorage);
  return dataset;
}

describe("DISPLAY_PREFS_SCRIPT", () => {
  it("contains the storage key and is wrapped in try/catch", () => {
    expect(DISPLAY_PREFS_SCRIPT).toContain(DISPLAY_PREFS_KEY);
    expect(DISPLAY_PREFS_SCRIPT).toContain("try");
    expect(DISPLAY_PREFS_SCRIPT).toContain("catch");
  });
  it("sets the same attributes as parseDisplayPrefs + applyDisplayPrefs", () => {
    const inputs = [
      null,
      "",
      "not json",
      "null",
      "3",
      "[]",
      '{"size":9,"contrast":"x"}',
      '{"size":3,"contrast":"x"}',
      '{"size":"2","contrast":"high"}',
      '{"size":3,"contrast":"high"}',
      '{"size":2,"contrast":"normal","extra":1}',
      '{"size":1,"contrast":"high"}',
    ];
    for (const raw of inputs) {
      const expected = { dataset: {} as DOMStringMap };
      applyDisplayPrefs(parseDisplayPrefs(raw), expected);
      expect(runScript(raw)).toEqual(expected.dataset);
    }
  });
  it("does not throw when storage is unavailable", () => {
    expect(runScript("throw")).toEqual({});
  });
});

describe("readAppliedDisplayPrefs", () => {
  it("reads what is on the root and falls back to the defaults", () => {
    expect(readAppliedDisplayPrefs({ dataset: {} })).toEqual(defaults);
    expect(readAppliedDisplayPrefs({ dataset: { size: "3", contrast: "high" } })).toEqual({
      size: 3,
      contrast: "high",
    });
    expect(readAppliedDisplayPrefs({ dataset: { size: "9", contrast: "x" } })).toEqual(defaults);
  });
});
