import Link from "next/link";
import { Card } from "@/shared/ui";

// Temporary landing page that lists every area and its owner. The identity module will
// replace it with the real entry flow (login / center-device mode).
const areas = [
  { href: "/login", label: "เข้าสู่ระบบ / สมัครสมาชิก", owner: "identity" },
  { href: "/courses", label: "คอร์สและแบบฝึก", owner: "engine" },
  { href: "/results", label: "ผลลัพธ์ของฉัน", owner: "analytics" },
  { href: "/booking", label: "จองคิวศูนย์ชุมชน", owner: "booking" },
  { href: "/profile", label: "ข้อมูลของฉันและความเป็นส่วนตัว", owner: "identity" },
  { href: "/admin", label: "สำหรับผู้ดูแล", owner: "infra" },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-5">
      <h1 className="text-3xl font-extrabold">Brain9</h1>
      <p className="text-text-2">ระบบฝึกสมองสำหรับผู้สูงอายุ</p>
      <ul className="flex flex-col gap-3">
        {areas.map((area) => (
          <li key={area.href}>
            <Link
              href={area.href}
              className="block focus-visible:outline-4 focus-visible:outline-focus"
            >
              <Card className="flex min-h-16 items-center justify-between gap-3">
                <span className="text-lg font-bold">{area.label}</span>
                <span className="text-sm text-text-2">{area.owner}</span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
