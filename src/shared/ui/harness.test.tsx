import { Check } from "lucide-react";
import { expect, it } from "vitest";
import { html } from "../../../test/render";

it("renders React elements and lucide icons to static HTML", () => {
  const out = html(
    <p className="x">
      สวัสดี <Check aria-hidden />
    </p>,
  );
  expect(out).toContain('<p class="x">สวัสดี');
  expect(out).toContain("<svg");
});
