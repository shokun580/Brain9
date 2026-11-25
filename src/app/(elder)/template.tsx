import { ViewTransition, type ReactNode } from "react";
import { pageEnter, pageExit } from "@/shared/lib/motion";

// Only typed navigations animate (the tab bar's links); every other link, and anything inside a
// training exercise, is untyped and resolves to "none". Do not add types to other links.
// A template remounts only when the first segment under its layout changes, so the fade fires
// between the top-level screens (the tab bar's pages); deeper pages under one screen do not fade
// until that screen adds its own template.tsx with the same ViewTransition.
export default function ElderTemplate({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={pageEnter} exit={pageExit} default="none">
      {children}
    </ViewTransition>
  );
}
