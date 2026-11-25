import { ViewTransition, type ReactNode } from "react";
import { pageEnter, pageExit } from "@/shared/lib/motion";

// Only typed navigations animate (the tab bar's links); every other link, and anything inside a
// training exercise, is untyped and resolves to "none". Do not add types to other links.
export default function ElderTemplate({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={pageEnter} exit={pageExit} default="none">
      {children}
    </ViewTransition>
  );
}
