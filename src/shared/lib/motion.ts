/** Transition types carried by typed navigations (Link transitionTypes, router.push). */
export const NAV_TYPES = {
  section: "b9-section",
  page: "b9-page",
  tab: "b9-tab",
} as const;

// Class maps for <ViewTransition enter/exit>. `default: "none"` keeps untyped transitions
// (browser back/forward, router.refresh) from animating. The classes are styled in globals.css.
export const pageEnter: Record<string, string> = {
  [NAV_TYPES.section]: "b9-page-in",
  [NAV_TYPES.page]: "b9-page-in",
  [NAV_TYPES.tab]: "b9-page-in",
  default: "none",
};

export const pageExit: Record<string, string> = {
  [NAV_TYPES.section]: "b9-page-out",
  [NAV_TYPES.page]: "b9-page-out",
  [NAV_TYPES.tab]: "b9-page-out",
  default: "none",
};

export const panelEnter: Record<string, string> = {
  [NAV_TYPES.section]: "b9-panel-in",
  default: "none",
};

/** Suspense reveal: the skeleton fades out, then the content fades in. */
export const revealEnter = "b9-content-in";
export const revealExit = "b9-skeleton-out";
