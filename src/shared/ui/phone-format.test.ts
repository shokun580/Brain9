import { describe, expect, it } from "vitest";
import { formatPhoneDigits, nextPhoneValue } from "./phone-format";

describe("formatPhoneDigits", () => {
  it("groups a Thai mobile number as 3-3-4", () => {
    expect(formatPhoneDigits("0800000000")).toBe("080-000-0000");
  });
  it("grows as digits arrive", () => {
    expect(formatPhoneDigits("")).toBe("");
    expect(formatPhoneDigits("0")).toBe("0");
    expect(formatPhoneDigits("08")).toBe("08");
    expect(formatPhoneDigits("080")).toBe("080");
    expect(formatPhoneDigits("0800")).toBe("080-0");
    expect(formatPhoneDigits("080000")).toBe("080-000");
    expect(formatPhoneDigits("0800000")).toBe("080-000-0");
  });
  it("drops anything that is not a digit and anything past ten", () => {
    expect(formatPhoneDigits("08a0-00")).toBe("080-00");
    expect(formatPhoneDigits("080000000012345")).toBe("080-000-0000");
  });
});

describe("nextPhoneValue", () => {
  it("appends a digit", () => {
    expect(nextPhoneValue("08", "0")).toBe("080");
    expect(nextPhoneValue("", "5")).toBe("5");
  });
  it("ignores the eleventh digit", () => {
    expect(nextPhoneValue("0800000000", "1")).toBe("0800000000");
  });
  it("ignores anything that is not a single digit", () => {
    expect(nextPhoneValue("08", "x")).toBe("08");
    expect(nextPhoneValue("08", "")).toBe("08");
    expect(nextPhoneValue("08", "12")).toBe("08");
    expect(nextPhoneValue("08", "-")).toBe("08");
  });
});
