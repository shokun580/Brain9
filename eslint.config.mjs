import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// ---------------------------------------------------------------------------------------
// Module boundaries (see AGENTS.md → "Module boundaries").
// A module is reached ONLY through its entry points:
//   @/modules/<name>            server API + types
//   @/modules/<name>/ui         React components
//   @/modules/<name>/contracts  pure types + Zod schemas (safe in the browser)
// Inside a module, use relative imports.
// ---------------------------------------------------------------------------------------
const DEEP_MODULE_IMPORT = {
  group: ["@/modules/*/*", "!@/modules/*/ui", "!@/modules/*/contracts"],
  message:
    "Import a module only through its entry points: '@/modules/<name>', '@/modules/<name>/ui' or '@/modules/<name>/contracts'. Inside the same module use relative imports.",
};
const DEEPER_MODULE_IMPORT = {
  group: ["@/modules/*/*/**"],
  message:
    "Deep imports into a module are not allowed. Ask the owner to export what you need from the module's entry point.",
};
const PRISMA_DIRECT = {
  group: ["@prisma/client", "@prisma/client/*"],
  message:
    "Import the client as `db` from '@/shared/lib/db' and types from '@/generated/prisma/*'.",
};

// Charts are drawn only by the shared LineChart / BarChart (src/shared/ui/ChartDrawing.tsx), which is
// the one file allowed to import Recharts (see docs/design-system.md section 8).
const NO_RECHARTS = {
  name: "recharts",
  message: "Use LineChart / BarChart from @/shared/ui",
};
const NO_RECHARTS_SUBPATH = {
  group: ["recharts/*"],
  message: "Use LineChart / BarChart from @/shared/ui",
};
const SHARED_NO_APP_IMPORT = {
  group: ["@/modules/**", "@/app/**"],
  message: "src/shared must not import from modules or routes.",
};

// ---------------------------------------------------------------------------------------
// Soft delete only (see AGENTS.md → "Database rules").
// No row is ever physically deleted: set `deletedAt` instead. A call is rejected when it
// is `.deleteMany()` (which exists only on the Prisma client), `.delete()` on a model of
// the client (`db.<model>` / `tx.<model>`), or `.delete()` with Prisma's `{ where }`
// argument — so `Map#delete`, `cookies().delete()` and `searchParams.delete()` stay allowed.
// ---------------------------------------------------------------------------------------
const NO_HARD_DELETE = {
  selector: `CallExpression:matches(${[
    "[callee.property.name='deleteMany']",
    "[callee.property.name='delete'][callee.object.object.name=/^(db|tx|prisma)$/]",
    "[callee.property.name='delete'][arguments.0.type='ObjectExpression']:has(Property[key.name='where'])",
  ].join(", ")})`,
  message:
    "Hard deletes are forbidden: every table is soft-delete only (AGENTS.md §5 \"Database rules\"). Set `deletedAt` instead — `data: softDelete()` from '@/shared/lib/soft-delete' — and read with `where: notDeleted`. Append-only ledgers are never deleted at all.",
};

// ---------------------------------------------------------------------------------------
// Design tokens only (see docs/design-system.md). Feature code uses the token utilities and
// `@/shared/ui`: no raw hex colours, no arbitrary colour values (`bg-[#fff]`, `border-[rgb(…)]`)
// and no arbitrary font sizes (`text-[19px]`). Lengths such as `max-w-[560px]` stay allowed.
// ---------------------------------------------------------------------------------------
const RAW_DESIGN_VALUE =
  "#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b|\\b(?:bg|text|border|fill|stroke|ring|outline|from|via|to|shadow|decoration|accent|caret|divide)-\\[(?:#|rgb|hsl|oklch|color)|\\btext-\\[\\d";
const NO_RAW_DESIGN_VALUES = [
  {
    selector: `Literal[value=/${RAW_DESIGN_VALUE}/]`,
    message:
      "Use design tokens and @/shared/ui (docs/design-system.md): no raw colours or arbitrary colour/font-size values.",
  },
  {
    selector: `TemplateElement[value.raw=/${RAW_DESIGN_VALUE}/]`,
    message:
      "Use design tokens and @/shared/ui (docs/design-system.md): no raw colours or arbitrary colour/font-size values.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [NO_RECHARTS],
          patterns: [DEEP_MODULE_IMPORT, DEEPER_MODULE_IMPORT, PRISMA_DIRECT, NO_RECHARTS_SUBPATH],
        },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    // Shared code is the bottom layer: it must not know about any module or route.
    files: ["src/shared/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [NO_RECHARTS],
          patterns: [PRISMA_DIRECT, SHARED_NO_APP_IMPORT, NO_RECHARTS_SUBPATH],
        },
      ],
    },
  },
  {
    // Modules must not depend on route files.
    files: ["src/modules/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [NO_RECHARTS],
          patterns: [
            DEEP_MODULE_IMPORT,
            DEEPER_MODULE_IMPORT,
            PRISMA_DIRECT,
            NO_RECHARTS_SUBPATH,
            { group: ["@/app/**"], message: "Modules must not import from src/app." },
          ],
        },
      ],
    },
  },
  {
    // The one file that may import Recharts. Same options as the src/shared block, minus Recharts.
    files: ["src/shared/ui/ChartDrawing.tsx"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [PRISMA_DIRECT, SHARED_NO_APP_IMPORT] }],
    },
  },
  {
    // Soft delete only: no Prisma hard deletes anywhere in application code.
    files: ["src/**"],
    rules: { "no-restricted-syntax": ["error", NO_HARD_DELETE] },
  },
  {
    // Feature code must use design tokens. `no-restricted-syntax` options are replaced, not
    // merged, between config objects, so this object lists the hard-delete selector as well.
    files: ["src/app/**", "src/modules/**"],
    ignores: ["src/app/design/**", "src/app/layout.tsx", "src/app/globals.css"],
    rules: { "no-restricted-syntax": ["error", NO_HARD_DELETE, ...NO_RAW_DESIGN_VALUES] },
  },
  {
    // Command-line scripts may print to the terminal.
    files: ["prisma/**", "scripts/**"],
    rules: { "no-console": "off" },
  },
  globalIgnores([
    ".next/**",
    ".vercel/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/generated/**",
    "coverage/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
