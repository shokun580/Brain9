import {
  Button,
  Checkbox,
  EmptyState,
  Notice,
  NumberField,
  Select,
  TextField,
  Textarea,
} from "@/shared/ui";
import { ConfirmDialogDemo } from "../Demos";
import { AdminScope, SubHeading } from "../chrome";
import { Example } from "../Example";

export function AdminForms() {
  return (
    <>
      <SubHeading>ฟอร์ม และข้อความ</SubHeading>

      <Example
        title="ช่องกรอกข้อมูลฝั่งผู้ดูแล"
        importLine='import { Button, Checkbox, NumberField, Select, TextField, Textarea } from "@/shared/ui";'
        note="ชุดเดียวกับฝั่งผู้สูงอายุ แต่ขนาดมาจาก data-ui='admin' ฟอร์มเป็นคอลัมน์เดียวกว้างไม่เกิน 560 พิกเซล ปุ่มส่งอยู่ใต้ช่องทางซ้าย ไม่ห่อด้วยการ์ด"
      >
        <AdminScope>
          <div className="flex max-w-[35rem] flex-col gap-5">
            <TextField
              label="ชื่อคอร์ส"
              name="a-title"
              hint="ไม่เกิน 200 ตัวอักษร"
              defaultValue="คอร์สตัวอย่าง 01"
            />
            <TextField
              label="รหัสศูนย์"
              name="a-code"
              errors={["รหัสนี้ถูกใช้แล้ว"]}
              defaultValue="CTR-01"
            />
            <Textarea label="คำอธิบาย (ไม่บังคับ)" name="a-description" />
            <NumberField label="เวลาต่อรอบ" name="a-seconds" unit="วินาที" defaultValue={30} />
            <Select
              label="ระดับความยาก"
              name="a-level"
              options={[
                { value: "1", label: "ระดับ 1" },
                { value: "2", label: "ระดับ 2" },
              ]}
            />
            <Checkbox label="เผยแพร่ทันที" name="a-publish" />
            <div>
              <Button type="submit">สร้างคอร์ส</Button>
            </div>
          </div>
        </AdminScope>
      </Example>

      <Example
        title="Notice, EmptyState"
        importLine='import { EmptyState, Notice } from "@/shared/ui";'
        note="ข้อความผิดพลาดของฟอร์มทั้งฟอร์มใช้ Notice โทน danger ส่วนผลลัพธ์ว่างใช้ EmptyState"
      >
        <AdminScope>
          <div className="flex flex-col gap-3">
            <Notice tone="primary">ข้อมูลที่แก้ไขจะมีผลกับผู้ใช้ทันที</Notice>
            <Notice tone="success">สร้างคอร์สเรียบร้อยแล้ว</Notice>
            <Notice tone="danger">บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง</Notice>
            <Notice tone="attention" title="ยังไม่ได้เผยแพร่">
              คอร์สนี้ยังเป็นฉบับร่าง ผู้ใช้จะยังไม่เห็น
            </Notice>
            <EmptyState title="ยังไม่มีคอร์ส" description="เริ่มสร้างคอร์สแรกได้จากแบบฟอร์ม" />
          </div>
        </AdminScope>
      </Example>

      <Example
        title="ConfirmDialog ฝั่งผู้ดูแล"
        importLine='import { ConfirmDialog } from "@/shared/ui";'
        note="สิ่งที่ย้อนไม่ได้ต้องยืนยันก่อนเสมอ และบอกผลเป็นรายการสั้น ๆ ปุ่ม danger ใช้กับการระงับหรือลบ"
      >
        <AdminScope>
          <ConfirmDialogDemo
            triggerLabel="ระงับบัญชีตัวอย่าง"
            title="ต้องการระงับบัญชีนี้หรือไม่"
            confirmLabel="ระงับบัญชี"
            tone="danger"
          >
            <ul className="list-disc pl-5">
              <li>ผู้ใช้จะเข้าสู่ระบบไม่ได้ทันที</li>
              <li>ข้อมูลและผลการฝึกยังอยู่ครบ</li>
              <li>เปิดบัญชีกลับมาได้ภายหลัง</li>
            </ul>
          </ConfirmDialogDemo>
        </AdminScope>
      </Example>
    </>
  );
}
