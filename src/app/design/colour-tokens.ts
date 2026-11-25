export type ColourGroup = "surface" | "brand" | "status" | "menu" | "skeleton" | "chart";

export type ColourToken = {
  /** The custom property, exactly as `:root` in globals.css declares it. */
  cssVar: string;
  /** The declared value, copied from globals.css (checked by colour-tokens.test.ts). */
  declared: string;
  /** The resolved opaque colour; absent for transparent and translucent tokens. */
  hex?: string;
  group: ColourGroup;
  /** The utilities people write for it (checked against @theme); empty: use the CSS variable. */
  utilities: string[];
  /** The token it is usually seen against, for the contrast figure. */
  against?: string;
};

/** The utility prefixes each colour is used with in `src/shared/ui` and the layouts. */
const USED_AS: Record<string, string[]> = {
  page: ["bg"],
  surface: ["bg"],
  "surface-subtle": ["bg"],
  "surface-muted": ["bg"],
  fg: ["text"],
  "fg-2": ["text"],
  "fg-muted": ["text"],
  line: ["border"],
  "line-strong": ["border"],
  primary: ["bg", "text"],
  "primary-press": ["text"],
  "primary-soft": ["bg"],
  "primary-tint": ["bg"],
  "on-primary": ["text"],
  focus: ["outline"],
  success: ["bg", "text"],
  "success-soft": ["bg"],
  danger: ["bg", "text"],
  "danger-soft": ["bg"],
  "on-danger": ["text"],
  attention: ["bg", "text"],
  "attention-soft": ["bg"],
  ink: ["bg"],
  "on-ink": ["text"],
  "on-ink-2": ["text"],
  "on-ink-muted": ["text"],
  "nav-rail": ["bg"],
  "nav-fill": ["bg"],
  "nav-line": ["border"],
  skeleton: ["bg"],
  edge: ["border"],
  // primary-bright, skeleton-shine and the chart colours are read as variables: no utility.
};

function token(group: ColourGroup, name: string, declared: string, against?: string): ColourToken {
  return {
    cssVar: name.startsWith("chart-") ? `--${name}` : `--b9-${name}`,
    declared,
    hex: declared.startsWith("#") ? declared : undefined,
    group,
    utilities: (USED_AS[name] ?? []).map((prefix) => `${prefix}-${name}`),
    against: against ? `--b9-${against}` : undefined,
  };
}

/** Every colour in `:root` of src/app/globals.css, mirrored by hand and checked by a test. */
export const COLOUR_TOKENS: ColourToken[] = [
  token("surface", "page", "#f5f7f8", "fg"),
  token("surface", "surface", "#ffffff", "fg"),
  token("surface", "surface-subtle", "#f8fafb", "fg"),
  token("surface", "surface-muted", "#eef2f4", "fg-2"),
  token("surface", "fg", "#14202b", "surface"),
  token("surface", "fg-2", "#3b4854", "surface"),
  token("surface", "fg-muted", "#5a6873", "surface"),
  token("surface", "line", "#e1e7ea", "surface"),
  token("surface", "line-strong", "#c3cdd3", "surface"),

  token("brand", "primary", "#0b7a75", "surface"),
  token("brand", "primary-press", "#08625e", "primary-soft"),
  token("brand", "primary-soft", "#e3f2f0", "primary-press"),
  token("brand", "primary-tint", "#bde2dd", "primary-soft"),
  token("brand", "primary-bright", "#4fd1c5", "ink"),
  token("brand", "on-primary", "#ffffff", "primary"),
  token("brand", "focus", "#0b7a75", "surface"),

  token("status", "success", "#1e7a3c", "success-soft"),
  token("status", "success-soft", "#e4f3e8", "success"),
  token("status", "danger", "#b42318", "danger-soft"),
  token("status", "danger-soft", "#fdecea", "danger"),
  token("status", "on-danger", "#ffffff", "danger"),
  token("status", "attention", "#9a5b00", "attention-soft"),
  token("status", "attention-soft", "#fff1dc", "attention"),

  token("menu", "ink", "#122029", "on-ink"),
  token("menu", "on-ink", "#ffffff", "ink"),
  token("menu", "on-ink-2", "#c5d0d6", "ink"),
  token("menu", "on-ink-muted", "#9fb0b9", "ink"),
  token("menu", "nav-rail", "#0c161d", "on-ink-2"),
  token("menu", "nav-fill", "rgb(255 255 255 / 0.1)"),
  token("menu", "nav-line", "rgb(255 255 255 / 0.14)"),

  token("skeleton", "skeleton", "#e3e9ec", "surface"),
  token("skeleton", "skeleton-shine", "#f6f9fa", "skeleton"),
  token("skeleton", "edge", "transparent"),

  { ...token("chart", "chart-1", "var(--b9-primary)", "surface"), hex: "#0b7a75" },
  token("chart", "chart-2", "#3b6fb6", "surface"),
  token("chart", "chart-3", "#9a5b00", "surface"),
  token("chart", "chart-4", "#6b4fa8", "surface"),
];

export const COLOUR_GROUPS: { id: ColourGroup; title: string; note: string }[] = [
  { id: "surface", title: "พื้นผิว ตัวอักษร และเส้น", note: "ใช้ได้ทั้งสองฝั่ง" },
  { id: "brand", title: "สีหลักของแบรนด์", note: "ข้อความบน primary-soft ใช้ primary-press เสมอ" },
  { id: "status", title: "สถานะ", note: "คู่กับ ✓ หรือ ✕ และคำเสมอ ไม่ใช้สีอย่างเดียว" },
  { id: "menu", title: "เมนูฝั่งผู้ดูแล", note: "พื้นเข้มของแถบเมนู" },
  { id: "skeleton", title: "โครงระหว่างโหลดและเส้นขอบ", note: "edge จะเป็นสีขาวเฉพาะโหมดสีตัดกันสูง" },
  { id: "chart", title: "สีกราฟ", note: "อ่านเป็นตัวแปร CSS ห้ามเขียนเลขสีเอง" },
];
