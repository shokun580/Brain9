import { Part, SubHeading, ElderScope, AdminScope } from "../chrome";

const sizes = [
  { utility: "text-title", elder: 35, admin: 22 },
  { utility: "text-heading", elder: 27, admin: 17 },
  { utility: "text-lead", elder: 22, admin: 15.5 },
  { utility: "text-body", elder: 20, admin: 14.5 },
  { utility: "text-small", elder: 17.5, admin: 13 },
  { utility: "text-micro", elder: 17.5, admin: 12.5 },
] as const;

const bold = new Set<string>(["text-title", "text-heading"]);

const sample = "ฝึกสมองวันละนิด สุขภาพดีทุกวัน";

export function TypeSection() {
  return (
    <Part id="type" intro="หกขนาดเท่ากันทั้งสองฝั่ง แต่ค่าจริงต่างกันตามฝั่ง ใช้ตัวหนา (700) และตัวปกติ (400) เท่านั้น">
      <SubHeading>ฝั่งผู้สูงอายุ</SubHeading>
      <p className="mt-0.5 mb-3 text-small text-fg-muted">
        ค่าที่แสดงคือขนาดเมื่อ data-size เป็น 1 ขนาด 2 ใหญ่ขึ้น 1.2 เท่า ขนาด 3 ใหญ่ขึ้น 1.4 เท่า
      </p>
      <ElderScope>
        <div className="flex flex-col gap-4">
          {sizes.map((size) => (
            <div key={size.utility}>
              <p className={`${size.utility} ${bold.has(size.utility) ? "font-bold" : ""}`}>
                {sample}
              </p>
              <p className="text-small text-fg-muted">
                <code className="font-mono">{size.utility}</code> · {size.elder} พิกเซล
              </p>
            </div>
          ))}
        </div>
      </ElderScope>

      <SubHeading>ฝั่งผู้ดูแล</SubHeading>
      <p className="mt-0.5 mb-3 text-small text-fg-muted">
        ไม่ขึ้นกับ data-size และไม่เล็กกว่า 12.5 พิกเซล
      </p>
      <AdminScope>
        <div className="flex flex-col gap-3">
          {sizes.map((size) => (
            <div key={size.utility}>
              <p className={`${size.utility} ${bold.has(size.utility) ? "font-bold" : ""}`}>
                {sample}
              </p>
              <p className="text-small text-fg-muted">
                <code className="font-mono">{size.utility}</code> · {size.admin} พิกเซล
              </p>
            </div>
          ))}
        </div>
      </AdminScope>
    </Part>
  );
}
