import { contrastRatio } from "@/shared/lib/contrast";
import { Table, TableCard, TBody, Td, Th, THead, Tr } from "@/shared/ui";
import { Part, SubHeading } from "../chrome";
import { COLOUR_GROUPS, COLOUR_TOKENS, type ColourToken } from "../colour-tokens";

const byVar = new Map(COLOUR_TOKENS.map((token) => [token.cssVar, token]));

function contrastText(token: ColourToken): string {
  const other = token.against ? byVar.get(token.against) : undefined;
  if (!token.hex || !other?.hex) return "—";
  const ratio = contrastRatio(token.hex, other.hex).toFixed(2);
  return `${ratio} : 1 กับ ${other.cssVar.replace("--b9-", "")}`;
}

export function ColoursSection() {
  return (
    <Part
      id="colours"
      intro="ทุกสีมาจาก globals.css ใช้ผ่านชื่อ utility ในคอลัมน์ “utility ที่ใช้” เท่านั้น ส่วนสีที่ไม่มี utility ให้อ่านผ่านตัวแปร CSS"
    >
      {COLOUR_GROUPS.map((group) => (
        <div key={group.id}>
          <SubHeading>{group.title}</SubHeading>
          <p className="mt-0.5 mb-3 text-small text-fg-muted">{group.note}</p>
          <TableCard>
            <Table aria-label={group.title}>
              <THead>
                <Tr>
                  <Th>สี</Th>
                  <Th>โทเคน</Th>
                  <Th>utility ที่ใช้</Th>
                  <Th>ค่า</Th>
                  <Th>คอนทราสต์</Th>
                </Tr>
              </THead>
              <TBody>
                {COLOUR_TOKENS.filter((token) => token.group === group.id).map((token) => (
                  <Tr key={token.cssVar}>
                    <Td>
                      <span
                        aria-hidden="true"
                        style={{ backgroundColor: `var(${token.cssVar})` }}
                        className="block size-8 rounded-control border-[length:var(--b9-border)] border-line-strong"
                      />
                    </Td>
                    <Td primary>
                      <code className="font-mono text-small">{token.cssVar}</code>
                    </Td>
                    <Td>
                      <code className="font-mono text-small">
                        {token.utilities.length
                          ? token.utilities.join(" ")
                          : `var(${token.cssVar})`}
                      </code>
                    </Td>
                    <Td>
                      <code className="font-mono text-small">{token.hex ?? token.declared}</code>
                    </Td>
                    <Td muted>{contrastText(token)}</Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </TableCard>
        </div>
      ))}
      <p className="mt-6 text-small text-fg-muted">
        ในโหมดสีตัดกันสูง (ฝั่งผู้สูงอายุเท่านั้น) ค่าของสีเหล่านี้ถูกแทนที่ทั้งชุด จึงต้องใช้ชื่อโทเคนเสมอ
      </p>
    </Part>
  );
}
