import { BarChart, LineChart } from "@/shared/ui";
import { AdminScope, SubHeading } from "../chrome";
import { Example } from "../Example";

const weeks = ["สัปดาห์ 1", "สัปดาห์ 2", "สัปดาห์ 3", "สัปดาห์ 4", "สัปดาห์ 5", "สัปดาห์ 6"];

const accuracy = weeks.map((week, i) => ({
  week,
  centreA: [62, 65, 64, 70, 72, 78][i] ?? null,
  centreB: [55, 58, null, 63, 66, 69][i] ?? null,
}));

const sessions = weeks.map((week, i) => ({
  week,
  sessions: [34, 41, 38, 47, 52, 58][i] ?? null,
}));

const sessionsByCentre = weeks.map((week, i) => ({
  week,
  centreA: [20, 24, 22, 27, 30, 33][i] ?? null,
  centreB: [14, 17, 16, 20, 22, 25][i] ?? null,
}));

const centres = [
  { key: "centreA", label: "ศูนย์ตัวอย่าง ก" },
  { key: "centreB", label: "ศูนย์ตัวอย่าง ข" },
];

export function AdminCharts() {
  return (
    <>
      <SubHeading>แผนภูมิ</SubHeading>
      <p className="mt-3 text-body text-fg-2">
        ใช้ในหน้าผู้ดูแลเท่านั้น วางในหัวข้อ AdminSection ไม่ใส่การ์ดครอบ ส่งเฉพาะข้อมูล สีและเส้นกำหนดไว้แล้ว
        ฝั่งผู้สูงอายุใช้ Meter และคำพูด ไม่ใช้แผนภูมิ
      </p>

      <Example
        title="LineChart: หนึ่งชุดข้อมูล"
        importLine='import { LineChart } from "@/shared/ui";'
        note="ใช้ดูแนวโน้มตามเวลา ต้องมี summary หนึ่งประโยคบอกสิ่งที่พบเป็นคำพูด และมีตารางตัวเลขให้เปิดดู"
      >
        <AdminScope>
          <LineChart
            title="ความแม่นยำเฉลี่ยของศูนย์ตัวอย่าง ก"
            summary="ความแม่นยำสูงขึ้นจาก 62% เป็น 78% ใน 6 สัปดาห์"
            data={accuracy}
            xKey="week"
            xLabel="สัปดาห์"
            series={[{ key: "centreA", label: "ศูนย์ตัวอย่าง ก" }]}
            unit="%"
            yMax={100}
          />
        </AdminScope>
      </Example>

      <Example
        title="LineChart: สองชุดข้อมูล"
        importLine='import { LineChart } from "@/shared/ui";'
        note="ชุดแรกเป็นเส้นทึบ ชุดถัดไปต่างกันที่ลายเส้นและรูปจุด ไม่ใช้สีอย่างเดียว ค่า null ทำให้เส้นขาดช่วง"
      >
        <AdminScope>
          <LineChart
            title="ความแม่นยำเฉลี่ยแยกตามศูนย์"
            summary="ศูนย์ตัวอย่าง ก สูงกว่าศูนย์ตัวอย่าง ข ทุกสัปดาห์ที่มีข้อมูล"
            data={accuracy}
            xKey="week"
            xLabel="สัปดาห์"
            series={centres}
            unit="%"
            yMax={100}
          />
        </AdminScope>
      </Example>

      <Example
        title="BarChart: หนึ่งชุดข้อมูล"
        importLine='import { BarChart } from "@/shared/ui";'
        note="ใช้เทียบจำนวนหรือปริมาณ แกนเริ่มที่ 0 เสมอ"
      >
        <AdminScope>
          <BarChart
            title="จำนวนครั้งที่ฝึกต่อสัปดาห์ ที่ศูนย์ตัวอย่าง ก"
            summary="สัปดาห์ที่ 6 ฝึกมากที่สุด 58 ครั้ง มากกว่าสัปดาห์ที่ 1 อยู่ 24 ครั้ง"
            data={sessions}
            xKey="week"
            xLabel="สัปดาห์"
            series={[{ key: "sessions", label: "จำนวนครั้งที่ฝึก" }]}
            unit="ครั้ง"
          />
        </AdminScope>
      </Example>

      <Example
        title="BarChart: แท่งเรียงข้างกัน"
        importLine='import { BarChart } from "@/shared/ui";'
        note="ลำดับในคำอธิบายสัญลักษณ์ตรงกับลำดับของแท่ง"
      >
        <AdminScope>
          <BarChart
            title="จำนวนครั้งที่ฝึกแยกตามศูนย์"
            summary="ศูนย์ตัวอย่าง ก ฝึกมากกว่าศูนย์ตัวอย่าง ข ทุกสัปดาห์"
            data={sessionsByCentre}
            xKey="week"
            xLabel="สัปดาห์"
            series={centres}
            unit="ครั้ง"
          />
        </AdminScope>
      </Example>

      <Example
        title="BarChart: แท่งซ้อน"
        importLine='import { BarChart } from "@/shared/ui";'
        note="ใส่ stacked เมื่อผลรวมสำคัญพอ ๆ กับส่วนประกอบ ตัวเลขแต่ละส่วนดูในตาราง"
      >
        <AdminScope>
          <BarChart
            stacked
            title="จำนวนครั้งที่ฝึกรวมสองศูนย์"
            summary="รวมสองศูนย์ฝึก 58 ครั้งในสัปดาห์ที่ 6 เพิ่มจาก 34 ครั้งในสัปดาห์ที่ 1"
            data={sessionsByCentre}
            xKey="week"
            xLabel="สัปดาห์"
            series={centres}
            unit="ครั้ง"
          />
        </AdminScope>
      </Example>
    </>
  );
}
