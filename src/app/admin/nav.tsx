import {
  BookOpen,
  Building2,
  CalendarDays,
  ChartLine,
  Clock,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { AdminNavGroup } from "@/shared/ui";

// Menu of the admin area. OWNER: infra (team lead).
// A lane changes only its own lines here, through a PR the lead approves, and adds the same
// href to nav.test.tsx.
const icon = { "aria-hidden": true, strokeWidth: 1.9, className: "size-icon" } as const;

export const adminNav: AdminNavGroup[] = [
  { items: [{ href: "/admin", label: "ภาพรวม", icon: <LayoutDashboard {...icon} /> }] },
  {
    label: "ผู้ใช้และศูนย์",
    items: [
      { href: "/admin/users", label: "ผู้ใช้งาน", icon: <Users {...icon} /> },
      { href: "/admin/centers", label: "ศูนย์และเครื่อง", icon: <Building2 {...icon} /> },
      { href: "/admin/privacy", label: "คำขอข้อมูลส่วนบุคคล", icon: <ShieldCheck {...icon} /> },
    ],
  },
  {
    label: "การจอง",
    items: [
      { href: "/admin/schedule", label: "ตารางเวลา", icon: <Clock {...icon} /> },
      { href: "/admin/bookings", label: "รายการจอง", icon: <CalendarDays {...icon} /> },
    ],
  },
  {
    label: "เนื้อหาและผล",
    items: [
      { href: "/admin/content/courses", label: "คอร์สและแบบฝึก", icon: <BookOpen {...icon} /> },
      { href: "/admin/analytics", label: "วิเคราะห์ผล", icon: <ChartLine {...icon} /> },
    ],
  },
];
