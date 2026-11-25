import { Suspense, ViewTransition, type ReactNode } from "react";
import { revealEnter, revealExit } from "@/shared/lib/motion";

export type RevealProps = {
  /** The skeleton shown while `children` loads. It fades out when the content is ready. */
  fallback: ReactNode;
  children: ReactNode;
};

/**
 * Suspense boundary whose skeleton fades into the content. `default="none"` keeps both
 * wrappers from animating on unrelated transitions (only the reveal itself plays).
 */
export function Reveal({ fallback, children }: RevealProps): ReactNode {
  return (
    <Suspense
      fallback={
        <ViewTransition exit={revealExit} default="none">
          {fallback}
        </ViewTransition>
      }
    >
      <ViewTransition enter={revealEnter} default="none">
        {children}
      </ViewTransition>
    </Suspense>
  );
}
