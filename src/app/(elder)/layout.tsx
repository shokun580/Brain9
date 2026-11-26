import { CalendarDays, ChartNoAxesColumn, House, LayoutGrid } from "lucide-react";
import { Suspense } from "react";
import { TabBar, TabBarView, type TabBarItem } from "@/shared/ui";

// Shell for every elderly-facing screen. OWNER: infra (team lead).
// Keep it free of data access: anything that reads the session belongs in a component
// rendered inside <Suspense> on the page.
const iconProps = { "aria-hidden": true, className: "size-icon" } as const;

const tabs: TabBarItem[] = [
  { href: "/home", label: "หน้าหลัก", icon: <House {...iconProps} /> },
  { href: "/courses", label: "คอร์ส", icon: <LayoutGrid {...iconProps} /> },
  { href: "/results", label: "ผลลัพธ์", icon: <ChartNoAxesColumn {...iconProps} /> },
  { href: "/booking", label: "จองคิว", icon: <CalendarDays {...iconProps} /> },
];

export default function ElderLayout({ children }: LayoutProps<"/">) {
  return (
    <div data-ui="elder" className="min-h-dvh bg-page text-fg">
      <div className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col bg-surface">
        <main className="flex-1 p-5">{children}</main>
        {/* usePathname may suspend on routes with unresolved params under Cache Components. */}
        <Suspense fallback={<TabBarView items={tabs} pathname={null} hideOn={["/play"]} />}>
          <TabBar items={tabs} hideOn={["/play"]} />
        </Suspense>
      </div>
    </div>
  );
}
