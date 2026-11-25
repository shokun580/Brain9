/** Header of the course table. The real list and its skeleton both render this, so they cannot drift. */
export const courseColumns: { label: string; numeric?: boolean }[] = [
  { label: "คอร์ส" },
  { label: "ความยาก" },
  { label: "แบบฝึก", numeric: true },
  { label: "สถานะ" },
];
