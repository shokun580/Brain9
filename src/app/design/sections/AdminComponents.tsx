import Link from "next/link";
import { Part } from "../chrome";
import { AdminCharts } from "./AdminCharts";
import { AdminEditorGrid } from "./AdminEditorGrid";
import { AdminForms } from "./AdminForms";
import { AdminLayoutParts } from "./AdminLayoutParts";
import { AdminLoading } from "./AdminLoading";
import { AdminTables } from "./AdminTables";

export function AdminComponentsSection() {
  return (
    <Part
      id="admin"
      intro="ทุกตัวอย่างอยู่ใน data-ui='admin': กะทัดรัด ตัวอักษรอย่างน้อย 12.5 พิกเซล แบนและเส้นบาง ไม่มีเงา ตัวหนาเฉพาะหัวข้อ ตัวเลขหลัก และปุ่ม"
    >
      <p className="mt-3 text-body text-fg-2">
        AdminShell (เมนูและแถบบนของผู้ดูแล) ไม่แสดงในหน้านี้เพราะต้องอยู่เต็มหน้าจอ ดูของจริงที่{" "}
        <Link href="/admin" className="text-primary-press underline">
          /admin
        </Link>
      </p>
      <AdminLayoutParts />
      <AdminTables />
      <AdminCharts />
      <AdminForms />
      <AdminLoading />
      <AdminEditorGrid />
    </Part>
  );
}
