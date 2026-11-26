import { describe, expect, it } from "vitest";
import { courseStatusDisplay } from "./course-status";

describe("courseStatusDisplay", () => {
  it("shows a published course as active", () => {
    expect(courseStatusDisplay("PUBLISHED")).toEqual({ tone: "ok", label: "เปิดใช้งาน" });
  });

  it("shows a draft course as a draft", () => {
    expect(courseStatusDisplay("DRAFT")).toEqual({ tone: "draft", label: "ฉบับร่าง" });
  });

  it("shows an archived course as off", () => {
    expect(courseStatusDisplay("ARCHIVED")).toEqual({ tone: "off", label: "เก็บถาวร" });
  });
});
