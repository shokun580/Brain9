import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * Proves that the project's ESLint config (the real `eslint.config.mjs`) rejects Prisma
 * hard deletes in `src/**` and leaves the look-alike `.delete()` calls alone.
 * The snippets are linted as text; the file path only decides which config blocks apply.
 */
const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

let eslint: ESLint;
beforeAll(() => {
  eslint = new ESLint({ cwd: repoRoot });
});

async function hardDeleteErrors(code: string, filePath = "src/modules/example/server/example.ts") {
  const [result] = await eslint.lintText(code, { filePath });
  return (result?.messages ?? []).filter(
    (message) => message.ruleId === "no-restricted-syntax" && message.severity === 2,
  );
}

describe("ESLint: no hard deletes (soft delete only)", () => {
  it.each([
    ["delete on the client", "await db.course.delete({ where: { id } });"],
    ["deleteMany on the client", "await db.course.deleteMany({ where: { courseId } });"],
    ["deleteMany without arguments", "await db.recommendation.deleteMany();"],
    ["delete inside a transaction", "await db.$transaction((tx) => tx.booking.delete(args));"],
    ["delete on a client with another name", "await client.user.delete({ where: { id } });"],
  ])("rejects %s", async (_name, statement) => {
    const errors = await hardDeleteErrors(`export async function run() {\n  ${statement}\n}\n`);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain("soft-delete only");
    expect(errors[0]?.message).toContain("AGENTS.md §5");
  });

  it.each([
    ["Map#delete", "cache.delete(key);"],
    ["cookie store delete", "(await cookies()).delete('brain9_session');"],
    ["response cookies delete", "response.cookies.delete('brain9_session');"],
    ["URLSearchParams delete", "url.searchParams.delete('page');"],
    [
      "a soft delete",
      "await db.course.update({ where: { id }, data: { deletedAt: new Date() } });",
    ],
  ])("allows %s", async (_name, statement) => {
    const errors = await hardDeleteErrors(`export async function run() {\n  ${statement}\n}\n`);
    expect(errors).toHaveLength(0);
  });

  it("applies to every file under src/, not only modules", async () => {
    const code = "export async function run() {\n  await db.center.delete({ where: { id } });\n}\n";
    expect(await hardDeleteErrors(code, "src/app/api/example/route.ts")).toHaveLength(1);
    expect(await hardDeleteErrors(code, "src/shared/lib/example.ts")).toHaveLength(1);
  });
});
