import { ViewTransition, isValidElement, type ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { pageEnter, pageExit } from "@/shared/lib/motion";
import AdminTemplate from "./admin/template";
import ElderTemplate from "./(elder)/template";

type VtProps = { enter?: unknown; exit?: unknown; default?: unknown; children?: unknown };

function asElement(node: unknown): ReactElement<VtProps> {
  if (!isValidElement<VtProps>(node)) throw new Error("expected a React element");
  return node;
}

const child = <p>หน้า</p>;

describe.each([
  ["admin", AdminTemplate],
  ["elder", ElderTemplate],
])("%s template", (_name, Template) => {
  const el = asElement(Template({ children: child }));

  it("has a ViewTransition as its outermost element", () => {
    expect(el.type).toBe(ViewTransition);
    expect(el.props.children).toBe(child);
  });

  it("fades only typed navigations", () => {
    expect(el.props.enter).toBe(pageEnter);
    expect(el.props.exit).toBe(pageExit);
    expect(el.props.default).toBe("none");
    expect(pageEnter.default).toBe("none");
    expect(pageExit.default).toBe("none");
  });
});
