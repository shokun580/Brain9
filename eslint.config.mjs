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

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [DEEP_MODULE_IMPORT, DEEPER_MODULE_IMPORT, PRISMA_DIRECT] },
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
          patterns: [
            PRISMA_DIRECT,
            {
              group: ["@/modules/**", "@/app/**"],
              message: "src/shared must not import from modules or routes.",
            },
          ],
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
          patterns: [
            DEEP_MODULE_IMPORT,
            DEEPER_MODULE_IMPORT,
            PRISMA_DIRECT,
            { group: ["@/app/**"], message: "Modules must not import from src/app." },
          ],
        },
      ],
    },
  },
  {
    // Command-line scripts may print to the terminal.
    files: ["prisma/**", "scripts/**"],
    rules: { "no-console": "off" },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/generated/**",
    "coverage/**",
  ]),
]);

export default eslintConfig;
