import { describe, expect, it } from "vitest";
import {
  applyDisplayPrefs,
  clearDisplayPrefs,
  DEFAULT_DISPLAY_PREFS,
  DISPLAY_PREFS_KEY,
  DISPLAY_PREFS_RESET_SCRIPT,
  DISPLAY_PREFS_SCRIPT,
  loadDisplayPrefs,
  resetDisplayPrefs,
  saveDisplayPrefs,
  parseDisplayPrefs,
  readAppliedDisplayPrefs,
  serializeDisplayPrefs,
  syncDisplayPrefs,
  toDisplayPrefs,
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
    // The key is written out in the script (nothing is interpolated into code): keep it equal.
    expect(DISPLAY_PREFS_SCRIPT).toContain(
      `localStorage.getItem(${JSON.stringify(DISPLAY_PREFS_KEY)})`,
    );
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

describe("loadDisplayPrefs", () => {
  it("returns the defaults without storage or when reading throws", () => {
    expect(loadDisplayPrefs(undefined)).toEqual(defaults);
    expect(
      loadDisplayPrefs({
        getItem() {
          throw new Error("blocked");
        },
      }),
    ).toEqual(defaults);
  });
  it("reads a stored value under the shared key", () => {
    const storage = {
      getItem: (key: string) => (key === DISPLAY_PREFS_KEY ? '{"size":3,"contrast":"high"}' : null),
    };
    expect(loadDisplayPrefs(storage)).toEqual({ size: 3, contrast: "high" });
  });
});

describe("saveDisplayPrefs", () => {
  it("writes the serialized value and returns true", () => {
    const written: Record<string, string> = {};
    const ok = saveDisplayPrefs(
      {
        setItem: (key, value) => {
          written[key] = value;
        },
      },
      { size: 2, contrast: "high" },
    );
    expect(ok).toBe(true);
    expect(written[DISPLAY_PREFS_KEY]).toBe(serializeDisplayPrefs({ size: 2, contrast: "high" }));
  });
  it("returns false without throwing when storage is missing or blocked", () => {
    expect(saveDisplayPrefs(undefined, { size: 2, contrast: "high" })).toBe(false);
    expect(
      saveDisplayPrefs(
        {
          setItem() {
            throw new Error("quota");
          },
        },
        { size: 2, contrast: "high" },
      ),
    ).toBe(false);
  });
});

describe("toDisplayPrefs", () => {
  it("normalises an unknown value field by field", () => {
    expect(toDisplayPrefs(undefined)).toEqual(defaults);
    expect(toDisplayPrefs("high")).toEqual(defaults);
    expect(toDisplayPrefs([3, "high"])).toEqual(defaults);
    expect(toDisplayPrefs({ size: 3, contrast: "x" })).toEqual({ size: 3, contrast: "normal" });
    expect(toDisplayPrefs({ size: 2, contrast: "high", extra: 1 })).toEqual({
      size: 2,
      contrast: "high",
    });
  });
});

/** A fake localStorage holding one value; `blocked` makes every call throw. */
function fakeStorage(initial: string | null, blocked = false) {
  const state = { value: initial };
  const guard = () => {
    if (blocked) throw new Error("blocked");
  };
  return {
    state,
    getItem(key: string): string | null {
      guard();
      return key === DISPLAY_PREFS_KEY ? state.value : null;
    },
    setItem(key: string, value: string): void {
      guard();
      if (key === DISPLAY_PREFS_KEY) state.value = value;
    },
    removeItem(key: string): void {
      guard();
      if (key === DISPLAY_PREFS_KEY) state.value = null;
    },
  };
}

describe("clearDisplayPrefs", () => {
  it("removes the stored value and returns true", () => {
    const storage = fakeStorage('{"size":3,"contrast":"high"}');
    expect(clearDisplayPrefs(storage)).toBe(true);
    expect(storage.state.value).toBeNull();
  });
  it("returns false without throwing when storage is missing or blocked", () => {
    expect(clearDisplayPrefs(undefined)).toBe(false);
    expect(clearDisplayPrefs(fakeStorage("x", true))).toBe(false);
  });
});

describe("syncDisplayPrefs (signed in: the account's value reaches the device)", () => {
  it("applies the account's value over what the device holds, and stores it", () => {
    const root = { dataset: { size: "3", contrast: "high" } as DOMStringMap };
    const storage = fakeStorage('{"size":3,"contrast":"high"}');
    syncDisplayPrefs({ size: 2, contrast: "normal" }, root, storage);
    expect(root.dataset).toEqual({ size: "2" });
    expect(parseDisplayPrefs(storage.state.value)).toEqual({ size: 2, contrast: "normal" });
  });
  it("gives an account at the default a device at the default", () => {
    const root = { dataset: { size: "3", contrast: "high" } as DOMStringMap };
    const storage = fakeStorage('{"size":3,"contrast":"high"}');
    syncDisplayPrefs({ size: 1, contrast: "normal" }, root, storage);
    expect(root.dataset).toEqual({});
    expect(parseDisplayPrefs(storage.state.value)).toEqual(defaults);
  });
  it("still applies to the page when storage is missing or blocked", () => {
    for (const storage of [undefined, fakeStorage(null, true)]) {
      const root = { dataset: {} as DOMStringMap };
      syncDisplayPrefs({ size: 3, contrast: "high" }, root, storage);
      expect(root.dataset).toEqual({ size: "3", contrast: "high" });
    }
  });
});

describe("resetDisplayPrefs (signed out: the device is back at the default)", () => {
  it("removes the attributes and the stored value", () => {
    const root = { dataset: { size: "3", contrast: "high" } as DOMStringMap };
    const storage = fakeStorage('{"size":3,"contrast":"high"}');
    resetDisplayPrefs(root, storage);
    expect(root.dataset).toEqual({});
    expect(storage.state.value).toBeNull();
  });
  it("still resets the page when storage is missing or blocked", () => {
    for (const storage of [undefined, fakeStorage("x", true)]) {
      const root = { dataset: { size: "2", contrast: "high" } as DOMStringMap };
      resetDisplayPrefs(root, storage);
      expect(root.dataset).toEqual({});
    }
  });
});

describe("DISPLAY_PREFS_RESET_SCRIPT", () => {
  function runReset(root: { dataset: DOMStringMap }, storage: ReturnType<typeof fakeStorage>) {
    new Function("document", "localStorage", DISPLAY_PREFS_RESET_SCRIPT)(
      { documentElement: root },
      storage,
    );
  }
  it("names the storage key, written out because nothing is interpolated into code", () => {
    expect(DISPLAY_PREFS_RESET_SCRIPT).toContain(
      `localStorage.removeItem(${JSON.stringify(DISPLAY_PREFS_KEY)})`,
    );
  });
  it("leaves the page and the storage exactly as resetDisplayPrefs does", () => {
    for (const blocked of [false, true]) {
      const viaScript = { dataset: { size: "3", contrast: "high" } as DOMStringMap };
      const scriptStorage = fakeStorage('{"size":3,"contrast":"high"}', blocked);
      runReset(viaScript, scriptStorage);

      const viaFunction = { dataset: { size: "3", contrast: "high" } as DOMStringMap };
      const functionStorage = fakeStorage('{"size":3,"contrast":"high"}', blocked);
      resetDisplayPrefs(viaFunction, functionStorage);

      expect(viaScript.dataset).toEqual(viaFunction.dataset);
      expect(viaScript.dataset).toEqual({});
      expect(scriptStorage.state.value).toEqual(functionStorage.state.value);
    }
  });
  it("undoes the apply script whichever of the two runs first", () => {
    const stored = '{"size":3,"contrast":"high"}';
    for (const order of [
      [DISPLAY_PREFS_SCRIPT, DISPLAY_PREFS_RESET_SCRIPT],
      [DISPLAY_PREFS_RESET_SCRIPT, DISPLAY_PREFS_SCRIPT],
    ]) {
      const root = { dataset: {} as DOMStringMap };
      const storage = fakeStorage(stored);
      for (const script of order) {
        new Function("document", "localStorage", script)({ documentElement: root }, storage);
      }
      expect(root.dataset).toEqual({});
      expect(storage.state.value).toBeNull();
    }
  });
});
