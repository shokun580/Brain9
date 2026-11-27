import { Children, isValidElement, Suspense, type ReactElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { DisplayPrefsReset } from "@/shared/ui/DisplayPrefsReset";
import { DisplayPrefsSync } from "@/shared/ui/DisplayPrefsSync";
import { html } from "../../../test/render";
import AuthLayout from "../(auth)/layout";
import ElderLayout from "../(elder)/layout";
import { AccountDisplayPrefs } from "./AccountDisplayPrefs";
import { getDisplayPrefs, saveDisplayPrefsAction } from "./account-display-prefs";

type WithChildren = { children?: ReactNode };

/** Every element in a tree of plain host elements (layouts are static, so no rendering). */
function elements(node: ReactNode): ReactElement<WithChildren>[] {
  return Children.toArray(node).flatMap((child) =>
    isValidElement<WithChildren>(child) ? [child, ...elements(child.props.children)] : [],
  );
}

const props = { children: <p>หน้า</p>, params: Promise.resolve({}) };

describe("the stand-in for identity's display settings (issue 50)", () => {
  it("knows no account value, so nothing is synced", async () => {
    expect(await getDisplayPrefs()).toBeNull();
    expect(await AccountDisplayPrefs()).toBeNull();
  });
  it("answers ok with a checked value and never echoes what was sent", async () => {
    expect(await saveDisplayPrefsAction({ size: 3, contrast: "high" })).toEqual({
      ok: true,
      data: { size: 3, contrast: "high" },
    });
    const sent = { size: 9, contrast: "<script>", extra: "x" } as never;
    expect(await saveDisplayPrefsAction(sent)).toEqual({
      ok: true,
      data: { size: 1, contrast: "normal" },
    });
  });
});

describe("signed-in screens", () => {
  it("read the account's settings inside Suspense, with nothing drawn while waiting", () => {
    const tree = elements(ElderLayout(props));
    const boundary = tree.find(
      (el) => el.type === Suspense && elements(el.props.children)[0]?.type === AccountDisplayPrefs,
    );
    expect(boundary).toBeDefined();
    expect((boundary?.props as { fallback?: unknown }).fallback).toBeNull();
  });
  it("do not reset the device", () => {
    const tree = elements(ElderLayout(props));
    expect(tree.some((el) => el.type === DisplayPrefsReset)).toBe(false);
  });
});

describe("screens before sign-in", () => {
  it("reset the device to the default and never sync an account", () => {
    const tree = elements(AuthLayout(props));
    expect(tree.some((el) => el.type === DisplayPrefsReset)).toBe(true);
    expect(tree.some((el) => el.type === AccountDisplayPrefs)).toBe(false);
  });
});

describe("DisplayPrefsSync and DisplayPrefsReset", () => {
  it("draw nothing", () => {
    expect(html(<DisplayPrefsSync prefs={{ size: 3, contrast: "high" }} />)).toBe("");
    expect(html(<DisplayPrefsReset />)).toBe("");
  });
});
