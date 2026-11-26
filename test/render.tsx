import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/** Renders a React element to static HTML so component tests run in the node environment. */
export function html(node: ReactElement): string {
  return renderToStaticMarkup(node);
}
