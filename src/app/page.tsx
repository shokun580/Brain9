import Link from "next/link";

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
    <div data-ui="elder" className="min-h-dvh bg-page text-fg">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-5">
        <h1 className="text-title font-bold">Brain9</h1>
        <p className="text-lead text-fg-2">ระบบฝึกสมองสำหรับผู้สูงอายุ</p>
        <ul className="flex flex-col">
          {areas.map((area) => (
            <li key={area.href} className="border-b border-line">
              <Link
                href={area.href}
                className="flex min-h-control items-center justify-between gap-3 py-3 focus-visible:outline-4 focus-visible:outline-focus"
              >
                <span className="text-body font-bold">{area.label}</span>
                <span className="text-small text-fg-2">{area.owner}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
