import { describe, expect, it } from "vitest";
import { z } from "zod";
import { fail, failFromZod, ok } from "./action-result";

describe("action-result helpers", () => {
  it("builds a success result", () => {
    expect(ok({ id: "1" })).toEqual({ ok: true, data: { id: "1" } });
  });

  it("builds a failure without fieldErrors when none are given", () => {
    expect(fail("FORBIDDEN", "no")).toEqual({ ok: false, code: "FORBIDDEN", message: "no" });
  });

  it("groups Zod issues by field", () => {
    const schema = z.object({ title: z.string().min(1, "required"), level: z.number() });
    const parsed = schema.safeParse({ title: "", level: "x" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const result = failFromZod(parsed.error);
      expect(result.code).toBe("VALIDATION");
      expect(result.fieldErrors?.title).toEqual(["required"]);
      expect(result.fieldErrors?.level).toHaveLength(1);
    }
  });
});
