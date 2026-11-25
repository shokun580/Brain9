import { ViewTransition, type ReactNode } from "react";
import { pageEnter, pageExit } from "@/shared/lib/motion";

// Fades the page area when a typed link (NAV_TYPES) navigates. The ViewTransition must be the
// outermost element; untyped transitions (back/forward, refresh) resolve to "none".
// A template remounts only when the first segment under its layout changes, so the fade fires
// for navigations between top-level sections. Pages deeper under one section (for example
// /admin/content/courses -> /admin/content/patterns) do not fade until that section adds its
// own template.tsx with the same ViewTransition.
export default function AdminTemplate({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={pageEnter} exit={pageExit} default="none">
      {children}
    </ViewTransition>
  );
}
