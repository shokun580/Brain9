import { Card } from "@/shared/ui";

export const metadata = { title: "ผู้ดูแล" };

export default function AdminHomePage() {
  return (
    <Card>
      <h1 className="text-2xl font-extrabold">หน้าผู้ดูแล</h1>
      <p className="mt-2 text-text-2">เลือกเมนูด้านบนเพื่อจัดการส่วนต่าง ๆ ของระบบ</p>
    </Card>
  );
}
