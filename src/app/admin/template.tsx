import { ViewTransition, type ReactNode } from "react";
import { pageEnter, pageExit } from "@/shared/lib/motion";

// Fades the page area when a typed link (NAV_TYPES) navigates. The ViewTransition must be the
// outermost element; untyped transitions (back/forward, refresh) resolve to "none".
export default function AdminTemplate({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={pageEnter} exit={pageExit} default="none">
      {children}
    </ViewTransition>
  );
}
