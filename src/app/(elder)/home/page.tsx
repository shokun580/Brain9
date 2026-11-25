import { CalendarDays, ChartNoAxesColumn, Play, UserRound } from "lucide-react";
import { Badge, Button, DisplaySettings, ElderHeader, ListRow, Meter, Section } from "@/shared/ui";

export const metadata = { title: "หน้าหลัก" };

const rowIcon = { strokeWidth: 1.9, className: "size-icon text-primary-press" } as const;

// OWNER: infra for the layout of this screen; every placeholder value below is replaced by
// the lane named in its TODO. Static on purpose: no data or session access in a page.
export default function Page() {
  return (
    <>
      {/* TODO(identity): greeting by time of day and the signed-in person's name. */}
      <ElderHeader greeting="สวัสดีตอนเช้า" name="คุณตัวอย่าง" action={<DisplaySettings />} />

      <Section first eyebrow="แบบฝึกวันนี้" title="จำลำดับ 3 ช่อง">
        {/* TODO(engine): today's exercise title, its course and the estimated time. */}
        <p className="mb-4 text-small text-fg-muted">คอร์สเริ่มต้น · ประมาณ 5 นาที</p>
        {/* TODO(engine): link to the exercise itself instead of the course list. */}
        <Button href="/courses" fullWidth>
          <Play aria-hidden="true" strokeWidth={1.9} className="size-icon shrink-0" />
          เริ่มฝึก
        </Button>
      </Section>

      <Section>
        {/* TODO(analytics): training days this week for the signed-in person. */}
        <Meter label="สัปดาห์นี้" value={3} max={5} segments valueText="ฝึกแล้ว 3 จาก 5 วัน เก่งมากเลยนะ" />
      </Section>

      <Section>
        {/* TODO(analytics): latest result summary. */}
        <ListRow
          href="/results"
          icon={<ChartNoAxesColumn aria-hidden="true" {...rowIcon} />}
          title="ผลลัพธ์ของฉัน"
          subtitle="ครั้งล่าสุด ถูก 4 จาก 5 ข้อ"
        />
        {/* TODO(booking): next appointment at the community centre. */}
        <ListRow
          href="/booking"
          icon={<CalendarDays aria-hidden="true" {...rowIcon} />}
          title="นัดที่ศูนย์ชุมชน"
          subtitle="พฤหัสบดี 28 พ.ย. · 10:00 น."
          badge={<Badge tone="primary">ยืนยันแล้ว</Badge>}
        />
        <ListRow
          href="/profile"
          icon={<UserRound aria-hidden="true" {...rowIcon} />}
          title="ข้อมูลของฉัน"
          subtitle="ความเป็นส่วนตัวและการตั้งค่า"
        />
      </Section>
    </>
  );
}
