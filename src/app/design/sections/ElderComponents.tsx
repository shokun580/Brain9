import { Part } from "../chrome";
import { ElderActions } from "./ElderActions";
import { ElderBoard } from "./ElderBoard";
import { ElderForms } from "./ElderForms";
import { ElderLayoutParts } from "./ElderLayoutParts";
import { ElderStatus } from "./ElderStatus";

export function ElderComponentsSection() {
  return (
    <Part
      id="elder"
      intro="ทุกตัวอย่างอยู่ใน data-ui='elder': ตัวอักษรอย่างน้อย 17.5 พิกเซล ปุ่มสูงอย่างน้อย 64 พิกเซล ไอคอนมีคำกำกับเสมอ ไม่มีการ์ด"
    >
      <ElderActions />
      <ElderForms />
      <ElderStatus />
      <ElderLayoutParts />
      <ElderBoard />
    </Part>
  );
}
