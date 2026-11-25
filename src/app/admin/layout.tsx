import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/modules/identity";

// Shell for the admin area. OWNER: infra (team lead).
// To add a menu entry for your module, open a PR that edits only the `nav` array.
const nav = [
  { href: "/admin/users", label: "ผู้ใช้งาน" },
  { href: "/admin/schedule", label: "ตารางเวลา" },
  { href: "/admin/content/courses", label: "คอร์ส" },
  { href: "/admin/analytics", label: "วิเคราะห์ผล" },
] as const;

/**
 * Redirects non-admins away. A layout is NOT a security boundary — it does not re-run on
 * every navigation — so each page, query and Server Action must still authorize itself.
 */
async function AdminGate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div data-ui="admin" className="flex min-h-dvh flex-1 flex-col bg-page text-fg">
      <header className="border-b border-line bg-surface">
        <nav
          aria-label="เมนูผู้ดูแล"
          className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 p-3"
        >
          <Link href="/admin" className="mr-4 text-heading font-bold">
            Brain9 Admin
          </Link>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-control px-3 py-2 font-bold text-primary hover:bg-primary-soft"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 p-5">
        <Suspense fallback={<p className="text-body text-fg-2">กำลังตรวจสอบสิทธิ์…</p>}>
          <AdminGate>{children}</AdminGate>
        </Suspense>
      </main>
    </div>
  );
}
