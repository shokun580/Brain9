/** The parts of the page, in order: the table of contents and each part's heading read this. */
export const TOC = [
  { id: "start", title: "เริ่มที่นี่" },
  { id: "colours", title: "สี" },
  { id: "type", title: "ตัวอักษร" },
  { id: "elder", title: "ส่วนประกอบฝั่งผู้สูงอายุ" },
  { id: "admin", title: "ส่วนประกอบฝั่งผู้ดูแล" },
  { id: "recipes", title: "แบบหน้าจอที่อนุมัติ" },
  { id: "dodont", title: "ควรทำ และ ไม่ควรทำ" },
] as const;

export type PartId = (typeof TOC)[number]["id"];

export function partTitle(id: PartId): string {
  return TOC.find((part) => part.id === id)?.title ?? id;
}
