import type { CourseSummary } from "../contracts";

type StatusDisplay = { tone: "ok" | "draft" | "off"; label: string };

const display: Record<CourseSummary["status"], StatusDisplay> = {
  PUBLISHED: { tone: "ok", label: "เปิดใช้งาน" },
  DRAFT: { tone: "draft", label: "ฉบับร่าง" },
  ARCHIVED: { tone: "off", label: "เก็บถาวร" },
};

/** Maps a content status to the StatusDot tone and its Thai word. */
export function courseStatusDisplay(status: CourseSummary["status"]): StatusDisplay {
  return display[status];
}
