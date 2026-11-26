import { Suspense, ViewTransition, isValidElement, type ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { revealEnter, revealExit } from "@/shared/lib/motion";
import { Reveal } from "./Reveal";

type VtProps = { enter?: unknown; exit?: unknown; default?: unknown; children?: unknown };

function asElement(node: unknown): ReactElement<Record<string, unknown>> {
  if (!isValidElement<Record<string, unknown>>(node)) throw new Error("expected a React element");
  return node;
}

describe("Reveal", () => {
  const fallback = <p>กำลังโหลด</p>;
  const content = <p>เนื้อหา</p>;
  const outer = asElement(Reveal({ fallback, children: content }));

  it("is a Suspense boundary", () => {
    expect(outer.type).toBe(Suspense);
  });

  it("fades the skeleton out through a ViewTransition that only reacts to reveals", () => {
    const wrapped = asElement(outer.props.fallback);
    const props = wrapped.props as VtProps;
    expect(wrapped.type).toBe(ViewTransition);
    expect(props.exit).toBe(revealExit);
    expect(props.default).toBe("none");
    expect(props.children).toBe(fallback);
  });

  it("fades the content in through a ViewTransition that only reacts to reveals", () => {
    const wrapped = asElement(outer.props.children);
    const props = wrapped.props as VtProps;
    expect(wrapped.type).toBe(ViewTransition);
    expect(props.enter).toBe(revealEnter);
    expect(props.default).toBe("none");
    expect(props.children).toBe(content);
  });
});
