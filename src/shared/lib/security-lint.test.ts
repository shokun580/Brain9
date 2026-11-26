import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * Proves that the project's ESLint config (the real `eslint.config.mjs`) rejects the ways
 * around React's escaping and around the Content Security Policy (docs/security.md).
 * The snippets are linted as text; the file path only decides which config blocks apply.
 */
const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

let eslint: ESLint;
beforeAll(() => {
  eslint = new ESLint({ cwd: repoRoot });
});

async function errors(code: string, filePath: string) {
  const [result] = await eslint.lintText(code, { filePath });
  return (result?.messages ?? []).filter((message) => message.severity === 2);
}

const RAW_HTML = `export function Example({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
`;

describe("ESLint: no raw HTML injection in feature code", () => {
  it.each([
    ["a module component", "src/modules/example/ui/Example.tsx"],
    ["a route file", "src/app/admin/example/page.tsx"],
    ["the design page", "src/app/design/sections/Example.tsx"],
    ["the root layout", "src/app/layout.tsx"],
  ])("rejects dangerouslySetInnerHTML in %s", async (_name, filePath) => {
    const found = (await errors(RAW_HTML, filePath)).filter(
      (message) => message.ruleId === "no-restricted-syntax",
    );
    expect(found).toHaveLength(1);
    expect(found[0]?.message).toContain("docs/security.md");
  });

  it("rejects it when passed as a plain prop object too", async () => {
    const code = `import { createElement } from "react";
export function Example({ html }: { html: string }) {
  return createElement("div", { dangerouslySetInnerHTML: { __html: html } });
}
`;
    const found = (await errors(code, "src/modules/example/ui/Example.tsx")).filter(
      (message) => message.ruleId === "no-restricted-syntax",
    );
    expect(found).toHaveLength(1);
  });

  it("allows it in src/shared, where the one reviewed use lives", async () => {
    const found = (await errors(RAW_HTML, "src/shared/ui/Example.tsx")).filter(
      (message) => message.ruleId === "no-restricted-syntax",
    );
    expect(found).toHaveLength(0);
  });

  it("still rejects hard deletes and raw colours in the same files", async () => {
    const code = `export async function run() {
  await db.course.delete({ where: { id } });
  return "bg-[#fff]";
}
`;
    const found = (await errors(code, "src/modules/example/server/example.ts")).filter(
      (message) => message.ruleId === "no-restricted-syntax",
    );
    expect(found).toHaveLength(2);
  });
});

describe("ESLint: no code built from strings", () => {
  it.each([
    ["eval", "export const run = (source: string) => eval(source);", "no-eval"],
    ["new Function", "export const run = (source: string) => new Function(source);", "no-new-func"],
    [
      "setTimeout with a string",
      "export const run = () => setTimeout('doWork()', 100);",
      "no-implied-eval",
    ],
  ])("rejects %s anywhere under src/", async (_name, code, ruleId) => {
    for (const filePath of ["src/modules/example/server/example.ts", "src/shared/lib/example.ts"]) {
      const found = (await errors(`${code}\n`, filePath)).filter(
        (message) => message.ruleId === ruleId,
      );
      expect(found).toHaveLength(1);
    }
  });
});

describe("ESLint: no SQL built from strings", () => {
  it.each([
    [
      "$queryRawUnsafe",
      "await db.$queryRawUnsafe(`SELECT * FROM users WHERE phone = '${phone}'`);",
    ],
    ["$executeRawUnsafe", "await tx.$executeRawUnsafe('UPDATE users SET status = ' + status);"],
  ])("rejects %s everywhere under src/", async (_name, statement) => {
    const code = `export async function run() {\n  ${statement}\n}\n`;
    for (const filePath of [
      "src/modules/example/server/example.ts",
      "src/app/api/example/route.ts",
      "src/app/design/sections/Example.tsx",
      "src/shared/lib/example.ts",
    ]) {
      const found = (await errors(code, filePath)).filter(
        (message) => message.ruleId === "no-restricted-syntax",
      );
      expect(found).toHaveLength(1);
      expect(found[0]?.message).toContain("docs/security.md");
    }
  });

  it("allows the tagged template, which sends values as parameters", async () => {
    const code = "export async function run() {\n  await db.$queryRaw`SELECT 1`;\n}\n";
    const found = (await errors(code, "src/modules/example/server/example.ts")).filter(
      (message) => message.ruleId === "no-restricted-syntax",
    );
    expect(found).toHaveLength(0);
  });
});
