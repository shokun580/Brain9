import type { StatusDotProps } from "@/shared/ui";

/** Header of the sample course table. The table and its skeleton both read this list. */
export const courseColumns: { label: string; numeric?: boolean }[] = [
  { label: "คอร์ส" },
  { label: "โหมด" },
  { label: "แบบฝึก", numeric: true },
  { label: "สถานะ" },
  { label: "จัดการ" },
];

type Status = { tone: StatusDotProps["tone"]; label: string };

const statuses: Status[] = [
  { tone: "ok", label: "เปิดใช้งาน" },
  { tone: "draft", label: "ฉบับร่าง" },
  { tone: "off", label: "ปิดอยู่" },
  { tone: "danger", label: "มีปัญหา" },
];

export type FakeCourse = {
  title: string;
  mode: "ฝึก" | "ทดสอบ";
  exercises: number;
  status: Status;
};

/** Made-up rows: `คอร์สตัวอย่าง 01` … `12`. */
export const fakeCourses: FakeCourse[] = Array.from({ length: 12 }, (_, index) => ({
  title: `คอร์สตัวอย่าง ${String(index + 1).padStart(2, "0")}`,
  mode: index % 3 === 2 ? "ทดสอบ" : "ฝึก",
  exercises: 4 + ((index * 7) % 9),
  status: statuses[index % statuses.length] ?? { tone: "ok", label: "เปิดใช้งาน" },
}));
