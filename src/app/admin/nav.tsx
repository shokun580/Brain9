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
import type { AdminNavSection } from "@/shared/ui";

// Menu of the admin area. OWNER: infra (team lead).
// A lane changes only its own lines here, through a PR the lead approves, and adds the same
// href to nav.test.tsx. The owning lane is named above each group.
const icon = { "aria-hidden": true, className: "size-icon" } as const;

export const adminNav: AdminNavSection[] = [
  {
    id: "overview",
    label: "ภาพรวม",
    railLabel: "ภาพรวม",
    icon: <LayoutDashboard {...icon} />,
    groups: [
      // infra
      { items: [{ href: "/admin", label: "ภาพรวม", icon: <LayoutDashboard {...icon} /> }] },
    ],
  },
  {
    id: "people",
    label: "ผู้ใช้และศูนย์",
    railLabel: "ผู้ใช้",
    icon: <Users {...icon} />,
    groups: [
      // identity
      {
        label: "ผู้ใช้",
        items: [
          { href: "/admin/users", label: "ผู้ใช้งาน", icon: <Users {...icon} /> },
          { href: "/admin/privacy", label: "คำขอข้อมูลส่วนบุคคล", icon: <ShieldCheck {...icon} /> },
        ],
      },
      // identity
      {
        label: "ศูนย์",
        items: [{ href: "/admin/centers", label: "ศูนย์และเครื่อง", icon: <Building2 {...icon} /> }],
      },
    ],
  },
  {
    id: "booking",
    label: "การจอง",
    railLabel: "การจอง",
    icon: <CalendarDays {...icon} />,
    groups: [
      // booking
      {
        label: "การจอง",
        items: [
          { href: "/admin/schedule", label: "ตารางเวลา", icon: <Clock {...icon} /> },
          { href: "/admin/bookings", label: "รายการจอง", icon: <CalendarDays {...icon} /> },
        ],
      },
    ],
  },
  {
    id: "content",
    label: "เนื้อหาและผล",
    railLabel: "เนื้อหา",
    icon: <BookOpen {...icon} />,
    groups: [
      // content
      {
        label: "เนื้อหา",
        items: [
          { href: "/admin/content/courses", label: "คอร์สและแบบฝึก", icon: <BookOpen {...icon} /> },
        ],
      },
      // analytics
      {
        label: "ผลการฝึก",
        items: [{ href: "/admin/analytics", label: "วิเคราะห์ผล", icon: <ChartLine {...icon} /> }],
      },
    ],
  },
];
