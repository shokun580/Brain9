import { Badge, Checkbox, ChoiceList, NumberField, Select, TextField, Textarea } from "@/shared/ui";
import { PinPadDemo } from "../Demos";
import { ElderScope, SubHeading } from "../chrome";
import { Example } from "../Example";

const levels = [
  { value: "1", label: "ระดับ 1 เริ่มต้น" },
  { value: "2", label: "ระดับ 2 ปานกลาง" },
  { value: "3", label: "ระดับ 3 ท้าทาย" },
];

export function ElderForms() {
  return (
    <>
      <SubHeading>ช่องกรอกข้อมูล</SubHeading>

      <Example
        title="TextField, Textarea"
        importLine='import { TextField, Textarea } from "@/shared/ui";'
        note="ป้ายชื่ออยู่เหนือช่องเสมอ ข้อความช่วย (hint) หายไปเมื่อมีข้อผิดพลาด ข้อผิดพลาดขึ้นต้นด้วย ✕ และบอกวิธีแก้"
      >
        <ElderScope>
          <div className="flex flex-col gap-5">
            <TextField
              label="ชื่อที่ใช้เรียก"
              name="e-nickname"
              hint="ใช้เรียกในแอป"
              placeholder="เช่น คุณตัวอย่าง"
            />
            <TextField
              label="อีเมล"
              name="e-email"
              defaultValue="ตัวอย่าง"
              errors={["กรุณากรอกอีเมลให้ครบ เช่น name@example.com"]}
            />
            <TextField label="รหัสศูนย์" name="e-center" defaultValue="ศูนย์ตัวอย่าง" disabled />
            <Textarea label="ข้อความถึงผู้ดูแล" name="e-message" hint="ไม่บังคับ" />
          </div>
        </ElderScope>
      </Example>

      <Example
        title="NumberField, Select, Checkbox"
        importLine='import { Checkbox, NumberField, Select } from "@/shared/ui";'
        note="NumberField มีหน่วยต่อท้ายในกรอบเดียวกัน (unit) Select และ Checkbox ใช้ตัวควบคุมของเบราว์เซอร์ที่ปรับแต่งแล้ว ทั้งแถวของ Checkbox กดได้"
      >
        <ElderScope>
          <div className="flex flex-col gap-5">
            <NumberField
              label="เวลาฝึกต่อวัน"
              name="e-minutes"
              unit="นาที"
              defaultValue={10}
              hint="ตั้งได้ 5 ถึง 30 นาที"
            />
            <NumberField label="อายุ" name="e-age" unit="ปี" errors={["กรุณากรอกตัวเลข"]} />
            <Select label="ระดับความยาก" name="e-level" options={levels} defaultValue="2" />
            <Checkbox
              label="ให้แจ้งเตือนก่อนถึงเวลาฝึก"
              name="e-remind"
              hint="แจ้งเตือนเวลา 9:00 น."
              defaultChecked
            />
            <Checkbox label="ฉันยอมรับเงื่อนไข" name="e-accept" errors={["กรุณาติ๊กเพื่อไปต่อ"]} />
          </div>
        </ElderScope>
      </Example>

      <Example
        title="ChoiceList"
        importLine='import { Badge, ChoiceList } from "@/shared/ui";'
        note="ตัวเลือกใหญ่ เลือกได้หนึ่งอย่าง ตัวที่เลือกแล้วมีเครื่องหมาย ✓ และพื้นสี ตัวเลือกที่ปิดอยู่ต้องบอกเหตุผลใน description"
      >
        <ElderScope>
          <div className="flex flex-col gap-8">
            <ChoiceList
              name="e-mode"
              legend="เลือกโหมดการฝึก"
              defaultValue="train"
              hint="เปลี่ยนได้ทุกเมื่อ"
              options={[
                {
                  value: "train",
                  title: "ฝึกทีละขั้น",
                  description: "มีคำใบ้ช่วยระหว่างทาง",
                  badge: <Badge tone="primary">แนะนำ</Badge>,
                },
                { value: "test", title: "ทดสอบ", description: "ไม่มีคำใบ้ ใช้ดูพัฒนาการ" },
                {
                  value: "expert",
                  title: "ระดับสูง",
                  description: "ยังเลือกไม่ได้ ต้องฝึกระดับ 3 ให้ครบก่อน",
                  disabled: true,
                },
              ]}
            />
            <ChoiceList
              name="e-mode-error"
              legend="เลือกวันที่สะดวก"
              errors={["กรุณาเลือกหนึ่งวันก่อนไปต่อ"]}
              options={[
                { value: "mon", title: "วันจันทร์" },
                { value: "wed", title: "วันพุธ" },
              ]}
            />
          </div>
        </ElderScope>
      </Example>

      <Example
        title="PinPad"
        importLine='import { PinPad } from "@/shared/ui";'
        note="ลองกดได้ ปุ่มแจ้งว่ากดตัวเลขใด แต่หน้าจอไม่เก็บและไม่โชว์ตัวเลข มีแค่จุดบอกความคืบหน้า (4 หรือ 6 หลัก)"
      >
        <ElderScope>
          <PinPadDemo />
        </ElderScope>
      </Example>
    </>
  );
}
