import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * Proves that the real `eslint.config.mjs` keeps raw colours and arbitrary colour or
 * font-size values out of feature code, while the design system itself may use them.
 * The snippets are linted as text; the file path only decides which config blocks apply.
 */
const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const FEATURE_FILE = "src/modules/engine/ui/X.tsx";
// ESLint start-up inside Vitest can take several seconds.
const TIMEOUT = 30_000;

let eslint: ESLint;
beforeAll(() => {
  eslint = new ESLint({ cwd: repoRoot });
});

async function restrictedSyntax(code: string, filePath: string) {
  const [result] = await eslint.lintText(code, { filePath });
  return (result?.messages ?? []).filter((message) => message.ruleId === "no-restricted-syntax");
}

const wrapJsx = (jsx: string) => `export const x = (${jsx});\n`;

describe("ESLint: design tokens only in feature code", () => {
  it.each([
    wrapJsx('<p className="bg-[#fff]" />'),
    wrapJsx('<p className="text-[19px]" />'),
    'export const c = "#0B7A75";\n',
    wrapJsx('<p className="border-[rgb(0,0,0)]" />'),
  ])(
    "rejects %s",
    async (code) => {
      const messages = await restrictedSyntax(code, FEATURE_FILE);
      expect(messages.length).toBeGreaterThanOrEqual(1);
      expect(messages[0]?.message).toContain("Use design tokens");
    },
    TIMEOUT,
  );

  it.each([
    wrapJsx('<p className="bg-primary text-body max-w-[560px]" />'),
    'export const t = "ข้อ #2";\n',
  ])(
    "allows %s",
    async (code) => {
      expect(await restrictedSyntax(code, FEATURE_FILE)).toHaveLength(0);
    },
    TIMEOUT,
  );

  it(
    "does not apply to the design system, the design page or the root layout",
    async () => {
      const code = wrapJsx('<p className="bg-[#fff]" />');
      for (const filePath of [
        "src/shared/ui/X.tsx",
        "src/app/design/sections/X.tsx",
        "src/app/layout.tsx",
      ]) {
        expect(await restrictedSyntax(code, filePath)).toHaveLength(0);
      }
    },
    TIMEOUT,
  );

  it(
    "still reports Prisma hard deletes in the files the colour rule covers",
    async () => {
      const code = "export async function run() {\n  await db.user.delete({ where: { id } });\n}\n";
      for (const filePath of [FEATURE_FILE, "src/app/admin/X.tsx"]) {
        const messages = await restrictedSyntax(code, filePath);
        expect(messages).toHaveLength(1);
        expect(messages[0]?.message).toContain("soft-delete only");
      }
    },
    TIMEOUT,
  );
});
