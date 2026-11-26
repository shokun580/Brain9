import type { ReactNode } from "react";
import {
  AdminSection,
  BrandMark,
  Button,
  ChoiceList,
  ElderHeader,
  ListRow,
  Meter,
  Notice,
  PageHeader,
  ResultBanner,
  Section,
  StaffAuthShell,
  StatTile,
  StatusDot,
  StepProgress,
  TableCard,
  TableSkeleton,
  Tabs,
  TextField,
  TextLink,
} from "@/shared/ui";
import { Activity, CalendarDays, Play, Users } from "lucide-react";
import { SystemScreen } from "../../_system/SystemScreen";
import {
  ConsentStepDemo,
  LabelledPinPadDemo,
  NewPinDemo,
  PhoneEntryDemo,
  SignOutDemo,
  StaffSignInDemo,
} from "../AuthDemos";
import { CourseTable } from "../CourseTable";
import { AdminScope, ElderScope, Part } from "../chrome";
import { ConfirmDialogDemo, EditFormDemo, PhonePadDemo } from "../Demos";
import { courseColumns } from "../fake-courses";
import { Example } from "../Example";
import { Cell } from "./ElderBoard";

/**
 * The approved page recipes, in the order of docs/design-system.md section 5. `name` is the
 * document's `###` heading (a test keeps the two lists equal); `title` is the page's heading.
 */
export const RECIPES = [
  { id: "admin-list", name: "Admin list page", title: "หน้ารายการของผู้ดูแล" },
  { id: "admin-form", name: "Admin form page", title: "หน้าฟอร์มของผู้ดูแล" },
  { id: "admin-detail", name: "Admin detail page", title: "หน้ารายละเอียดของผู้ดูแล" },
  { id: "admin-overview", name: "Admin overview with figures", title: "หน้าภาพรวมของผู้ดูแล" },
  { id: "admin-loading", name: "Admin page while loading", title: "หน้าระหว่างโหลด" },
  { id: "staff-signin", name: "Staff sign-in", title: "หน้าเข้าสู่ระบบของผู้ดูแล" },
  { id: "elder-step", name: "Elderly step screen", title: "หน้าจอผู้สูงอายุทีละขั้น" },
  { id: "elder-signin", name: "Elderly sign-in steps", title: "ขั้นตอนเข้าสู่ระบบของผู้สูงอายุ" },
  { id: "elder-signup", name: "Elderly sign-up steps", title: "ขั้นตอนสมัครสมาชิกของผู้สูงอายุ" },
  { id: "elder-forgot-pin", name: "Forgotten PIN screens", title: "หน้าลืมรหัสและตั้งรหัสใหม่" },
  { id: "elder-list", name: "Elderly list screen", title: "หน้ารายการของผู้สูงอายุ" },
  {
    id: "elder-play",
    name: "Elderly play and result screens",
    title: "หน้าเล่นและหน้าผลของผู้สูงอายุ",
  },
  {
    id: "elder-profile",
    name: "Elderly profile and sign-out",
    title: "หน้าข้อมูลของฉันและการออกจากระบบ",
  },
  { id: "system-screens", name: "System screens", title: "หน้าระบบ (ไม่พบหน้า และข้อผิดพลาด)" },
] as const;

type RecipeId = (typeof RECIPES)[number]["id"];

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-control bg-surface-muted px-3 py-2 font-mono text-small text-fg-2">
      <code>{children}</code>
    </pre>
  );
}

/** One recipe: its anchor, heading and note, the live composition, then the code shape. */
function Recipe({
  id,
  importLine,
  note,
  code,
  children,
}: {
  id: RecipeId;
  importLine: string;
  note: string;
  code: string;
  children: ReactNode;
}) {
  const recipe = RECIPES.find((entry) => entry.id === id);
  return (
    <div id={`recipe-${id}`}>
      <Example headingLevel={3} title={recipe?.title ?? id} importLine={importLine} note={note}>
        {children}
        <Code>{code}</Code>
      </Example>
    </div>
  );
}

const icon = { "aria-hidden": true, strokeWidth: 1.9, className: "size-icon" } as const;
const rowIcon = {
  "aria-hidden": true,
  strokeWidth: 1.9,
  className: "size-icon text-primary-press",
} as const;

const listCode = `{/* ไม่มีการแบ่งหน้าหรือตัวกรอง: หน้าห่อ TableCard รอบรายการ */}
<PageHeader title="คอร์สและแบบฝึก" breadcrumbs={[…]} action={<Button href="…">สร้างคอร์สใหม่</Button>} />
<AdminSection title="คอร์สทั้งหมด">
  <Reveal fallback={<ThingListSkeleton />}>
    <TableCard>
      <ThingList /> {/* async: ตรวจสิทธิ์แล้วอ่านข้อมูล */}
    </TableCard>
  </Reveal>
</AdminSection>

{/* มีการแบ่งหน้าหรือตัวกรอง: คอมโพเนนต์รายการเป็นเจ้าของ TableCard (toolbar ตาราง footer ที่มี Pagination) */}
<AdminSection title="คอร์สทั้งหมด">
  <Reveal fallback={<ThingListSkeleton />}>
    <ThingPagedList searchParams={searchParams} />
  </Reveal>
</AdminSection>`;

const formCode = `{/* หน้าสร้างใหม่: ปุ่มส่งอยู่ใต้ช่องทางซ้าย ไม่มี SaveBar */}
<form action={formAction} className="flex max-w-[35rem] flex-col gap-5">
  <TextField … />
  <div><Button type="submit">สร้างรายการ</Button></div>
</form>

{/* หน้าแก้ข้อมูลเดิม: "use client" ฟอร์มเป็นเจ้าของ dirty */}
const [dirty, setDirty] = useState(false);
const [state, formAction, pending] = useActionState(async (previous, formData) => {
  const result = await updateThingAction(previous, formData);
  if (result?.ok) setDirty(false); // บันทึกแล้ว ไม่มีอะไรค้าง
  return result;
}, null);

<form action={formAction} onChange={() => setDirty(true)}>
  <AdminSection title="ข้อมูลคอร์ส">
    <div className="flex max-w-[35rem] flex-col gap-5"><TextField … /></div>
  </AdminSection>
  {/* ผิดพลาด: <Notice tone="danger"> ข้างฟอร์ม  สำเร็จ: <Toast message="บันทึกเรียบร้อยแล้ว" /> */}
  <SaveBar dirty={dirty}>
    <Button variant="secondary" href="…">ยกเลิก</Button>
    <Button type="submit" disabled={pending}>บันทึก</Button> {/* ปุ่มส่งปุ่มเดียวของฟอร์ม */}
  </SaveBar>
</form>`;

const detailCode = `{/* page.tsx: <Reveal fallback={<AdminPageSkeleton />}><ThingDetail params={params} /></Reveal> */}
{/* ThingDetail (async) ตรวจสิทธิ์ อ่านรายการ แล้วแสดง: */}
<PageHeader title={thing.name} breadcrumbs={[…]} action={<Button href={\`\${base}/edit\`}>แก้ไข</Button>} />
<div className="mt-4">
  <Tabs label="มุมมองของรายการ" items={[{ href: base, label: "ข้อมูล", active: true }, { href: \`\${base}/history\`, label: "ประวัติ" }]} />
</div>
<AdminSection title="ข้อมูลทั่วไป">
  <dl className="flex flex-col gap-4">
    <div><dt className="text-small text-fg-muted">ชื่อ</dt><dd className="text-body text-fg">{thing.name}</dd></div>
  </dl>
</AdminSection>
<AdminSection title="เก็บเข้าคลัง" description="…">
  <ArchiveThingButton thingId={thing.id} thingName={thing.name} /> {/* ปุ่ม danger → ConfirmDialog */}
</AdminSection>`;

const overviewCode = `<PageHeader title="ภาพรวม" description="…" />
<AdminSection title="สรุปวันนี้">
  <Reveal fallback={<StatTileSkeleton label="กำลังโหลดตัวเลขสรุป" count={3} />}>
    <OverviewStats /> {/* async: <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3"><StatTile … /></div> */}
  </Reveal>
</AdminSection>`;

const loadingCode = `<PageHeader title="คอร์สและแบบฝึก" … />
<AdminSection title="คอร์สทั้งหมด">
  <Reveal fallback={<CourseListSkeleton />}> {/* การ์ดและหัวตารางอยู่ใน fallback */}
    <TableCard>
      <CourseList /> {/* async: อ่านฐานข้อมูล */}
    </TableCard>
  </Reveal>
</AdminSection>`;

const stepCode = `<ElderHeader title="เลือกแบบฝึก" backHref="/home" />
<form action="/courses">
  <Section first>
    <StepProgress current={1} total={3} />
  </Section>
  <Section>
    <ChoiceList name="mode" legend="วันนี้ต้องการฝึกแบบใด" defaultValue="training" options={[…]} />
  </Section>
  <Section>
    <Button type="submit" fullWidth>ไปต่อ</Button> {/* ปุ่มหลักหนึ่งปุ่ม */}
  </Section>
</form>`;

const signInCode = `{/* หน้าแรก /login: เลือกก่อนว่าจะเข้าสู่ระบบหรือสมัครสมาชิก ปุ่มหลักหนึ่งปุ่ม */}
<BrandMark className="mb-4 size-14" />
<ElderHeader title="ยินดีต้อนรับสู่ Brain9" />
<Section first>
  <div className="flex flex-col gap-3">
    <p className="text-body text-fg-2">มีบัญชีอยู่แล้ว</p>
    <Button fullWidth href="/login/pin">เข้าสู่ระบบ</Button>
  </div>
</Section>
<Section>
  <div className="flex flex-col gap-3">
    <p className="text-body text-fg-2">ยังไม่มีบัญชี</p>
    <Button variant="secondary" fullWidth href="/signup">สมัครสมาชิก</Button>
  </div>
</Section>

{/* ขั้นที่ 1 (/login/pin): "use client" ของตัวเอง เป็นเจ้าของ phone */}
<ElderHeader title="เข้าสู่ระบบ" backHref="/login" />
<Section first><StepProgress current={1} total={2} /></Section>
<Section>
  <PhonePad label="เบอร์โทรศัพท์" value={phone} onChange={setPhone} hint="กดตัวเลขทีละตัว ใช้เวลาได้ตามสะดวก" error={error} />
</Section>
<Section><Button fullWidth onClick={next}>ถัดไป</Button></Section> {/* ปุ่มหลักหนึ่งปุ่ม */}
<Section>
  <div className="flex flex-wrap items-center justify-center gap-x-2">
    <span className="text-body text-fg-2">ยังไม่มีบัญชี</span>
    <TextLink href="/signup">สมัครสมาชิก</TextLink>
  </div>
</Section>

{/* ขั้นที่ 2: "use client" ของตัวเอง เป็นเจ้าของ pin กดตัวสุดท้ายแล้วส่งทันที ไม่มีปุ่ม */}
<ElderHeader title="เข้าสู่ระบบ" onBack={onBack} />
<Section first><StepProgress current={2} total={2} /></Section>
<Section>
  <div className="flex flex-col items-center gap-4">
    {wrong ? <Notice tone="danger">รหัสยังไม่ถูกต้อง กรุณาใส่อีกครั้ง</Notice> : null}
    <PinPad label="ใส่รหัส 4 หลัก" length={4} filled={pin.length} disabled={checking} onDigit={press} onDelete={back} />
    <TextLink href="/login/forgot">ลืมรหัส</TextLink>
  </div>
</Section>`;

const staffSignInCode = `{/* src/app/(staff)/admin/login/page.tsx: หน้าบาง layout ของ (staff) วาดโครง StaffAuthShell ให้แล้ว */}
{/* StaffSignInForm: "use client" ใช้ useActionState กับ action ของทีม identity */}
<PageHeader title="เข้าสู่ระบบ" description="สำหรับเจ้าหน้าที่ศูนย์และผู้ดูแลระบบ" />
<form action={formAction} className="mt-6 flex flex-col gap-5">
  <TextField label="ชื่อผู้ใช้" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required errors={fieldErrors?.username} />
  <TextField label="รหัสผ่าน" name="password" type={show ? "text" : "password"} autoComplete="current-password" required errors={fieldErrors?.password} />
  <Checkbox label="แสดงรหัสผ่าน" name="showPassword" checked={show} onChange={(event) => setShow(event.target.checked)} />
  {/* เข้าไม่สำเร็จ: <Notice tone="danger">{state.message}</Notice> เหนือปุ่ม */}
  <Button type="submit" fullWidth disabled={pending}>เข้าสู่ระบบ</Button> {/* ปุ่มหลักหนึ่งปุ่ม */}
</form>
<div className="mt-4 flex justify-center">
  <TextLink href="/login">ไปหน้าเข้าสู่ระบบของผู้ใช้ทั่วไป</TextLink>
</div>`;

const signUpCode = `{/* SignUpFlow ("use client") เป็นเจ้าของขั้นและค่าที่กรอก ย้อนกลับแล้วค่าไม่หาย ยกเว้นรหัส */}

{/* ขั้นที่ 1: เบอร์โทรศัพท์ */}
<ElderHeader title="สมัครสมาชิก" backHref="/login" />
<Section first><StepProgress current={1} total={4} /></Section>
<Section>
  <PhonePad label="เบอร์โทรศัพท์ของคุณ" value={phone} onChange={setPhone} hint="ใช้เบอร์นี้เข้าสู่ระบบในครั้งต่อไป" error={error} />
</Section>
<Section><Button fullWidth onClick={next}>ถัดไป</Button></Section>
<Section>
  <div className="flex flex-wrap items-center justify-center gap-x-2">
    <span className="text-body text-fg-2">มีบัญชีอยู่แล้ว</span>
    <TextLink href="/login/pin">เข้าสู่ระบบ</TextLink>
  </div>
</Section>

{/* ขั้นที่ 2: NewPinStep ใส่รหัสสองครั้ง ไม่มีปุ่ม ป้ายเหนือจุดบอกว่าเป็นครั้งไหน */}
<ElderHeader title="สมัครสมาชิก" onBack={back} />
<Section first><StepProgress current={2} total={4} /></Section>
<Section>
  <NewPinStep firstLabel="ตั้งรหัส 4 หลัก" againLabel="ใส่รหัสเดิมอีกครั้ง" refuse={weakPinMessage} onDone={next} />
</Section>

{/* ขั้นที่ 3: ชื่อและนามสกุล (ใช้แป้นพิมพ์ได้) */}
<Section>
  <div className="flex flex-col gap-5">
    <TextField label="ชื่อ" name="firstName" autoComplete="given-name" … />
    <TextField label="นามสกุล" name="lastName" autoComplete="family-name" … />
  </div>
</Section>
<Section><Button type="submit" fullWidth>ถัดไป</Button></Section>

{/* ขั้นที่ 4: สรุปนโยบายตัวใหญ่ ลิงก์อ่านฉบับเต็ม Checkbox สามข้อที่ไม่ติ๊กไว้ก่อน */}
<Section eyebrow={privacy.title}>
  <p className="text-lead text-fg">{privacy.summary}</p>
  <TextLink onClick={() => setReading(privacy)}>อ่านประกาศฉบับเต็ม</TextLink>
</Section>
<Section eyebrow={terms.title}>…</Section>
<Section eyebrow="กรุณาเลือกให้ครบทั้ง 3 ข้อ">
  <div className="flex flex-col gap-2">
    <Checkbox label="ยอมรับข้อตกลงการใช้งาน" name="terms" checked={…} onChange={…} errors={fieldErrors?.terms} />
    <Checkbox label="ยินยอมให้เก็บชื่อและเบอร์โทรศัพท์" name="personalData" … />
    <Checkbox label="ยินยอมให้เก็บผลการฝึกสมอง" name="cognitiveData" … />
  </div>
</Section>
<Section><Button type="submit" fullWidth disabled={pending}>สมัครสมาชิก</Button></Section>`;

const forgotPinCode = `{/* /login/forgot: "use client" เป็นเจ้าของ phone และ sent */}
<ElderHeader title="ลืมรหัส" backHref="/login/pin" />
<Section first>
  <p className="text-lead text-fg">กรุณาใส่เบอร์โทรศัพท์ที่ใช้สมัคร เจ้าหน้าที่จะโทรกลับเพื่อช่วยตั้งรหัสใหม่</p>
</Section>
<Section><PhonePad label="เบอร์โทรศัพท์ที่ใช้สมัคร" value={phone} onChange={setPhone} error={error} /></Section>
<Section><Button fullWidth onClick={send}>ขอให้เจ้าหน้าที่โทรกลับ</Button></Section>

{/* หลังส่ง: หน้าตาเดียวกันทุกเบอร์ หัวข้อ สองประโยค ปุ่มหลักหนึ่งปุ่ม */}
<ElderHeader title="ได้รับคำขอแล้ว" />
<Section first>
  <div className="flex flex-col gap-4 text-lead text-fg">
    <p>เจ้าหน้าที่จะโทรกลับที่เบอร์นี้ในเวลาทำการ</p>
    <p>หลังคุยกับเจ้าหน้าที่แล้ว กรุณาเปิด Brain9 บนเครื่องนี้อีกครั้งเพื่อตั้งรหัสใหม่</p>
  </div>
</Section>
<Section><Button fullWidth href="/login">กลับหน้าแรก</Button></Section>

{/* /login/new-pin: NewPinStep ตัวเดียวกับขั้นที่ 2 ของการสมัคร */}
<ElderHeader title="ตั้งรหัสใหม่" />
<Section first><Notice tone="success">เจ้าหน้าที่ยืนยันแล้ว ตั้งรหัสใหม่ได้</Notice></Section>
<Section>
  <NewPinStep firstLabel="ตั้งรหัสใหม่ 4 หลัก" againLabel="ใส่รหัสใหม่อีกครั้ง" refuse={weakPinMessage} disabled={saving} onDone={save} />
</Section>`;

const profileCode = `<ElderHeader title="ข้อมูลของฉัน" backHref="/home" />
<Section first>
  <Reveal fallback={<SkeletonRegion label="กำลังโหลดชื่อ"><SkeletonLine width="md" text="heading" /></SkeletonRegion>}>
    <ProfileName /> {/* async: requireUser() แล้วแสดงชื่อ */}
  </Reveal>
</Section>
<Section>
  <SignOutButton /> {/* ส่วนล่างสุดของหน้า: ปุ่มรอง → ConfirmDialog → signOutAction */}
</Section>

{/* ProfileName */}
<p className="text-small text-fg-muted">ชื่อและนามสกุล</p>
<p className="text-heading font-bold text-fg">{user.firstName} {user.lastName}</p>

{/* SignOutButton ("use client") */}
<Button variant="secondary" fullWidth onClick={() => setOpen(true)}>
  <LogOut aria-hidden="true" strokeWidth={1.9} className="size-icon shrink-0" />
  ออกจากระบบ
</Button>
<ConfirmDialog open={open} title="ต้องการออกจากระบบหรือไม่" confirmLabel="ออกจากระบบ" onConfirm={signOut} onCancel={() => setOpen(false)}>
  การเข้าใช้ครั้งถัดไปต้องใส่เบอร์โทรศัพท์และรหัส 4 หลักอีกครั้ง
</ConfirmDialog>`;

const elderListCode = `<ElderHeader title="แบบฝึกของฉัน" />
<Section first title="แบบฝึกทั้งหมด">
  <Reveal fallback={<ListRowSkeleton label="กำลังโหลดรายการ" />}>
    <MyExerciseRows /> {/* async: <ListRow href=… icon=… title=… subtitle=… /> ต่อหนึ่งแบบฝึก */}
  </Reveal>
</Section>`;

const systemCode = `// A page the visitor may not open answers like a page that does not exist.
if (!allowed) notFound();`;

const playCode = `{/* หน้าเล่น: เส้นทางของการฝึก ใช้ Suspense ห้ามใช้ Reveal และไม่มีอะไรเคลื่อนไหว */}
<ElderHeader title="ฝึกจำลำดับ" />
<Section first>
  <Suspense fallback={<SkeletonRegion label="กำลังเตรียมแบบฝึก"><SkeletonLine width="lg" text="title" /></SkeletonRegion>}>
    <PatternGrid /> {/* ของทีม engine จาก "@/modules/engine/ui" ตอนนี้เป็นชื่อแทนไว้ก่อนจนกว่าทีม engine จะส่งมอบ props เป็นไปตามที่ทีม engine กำหนด */}
  </Suspense>
</Section>

{/* หน้าผล: ExerciseResult (async ของทีม engine) ใน Suspense เดียวกัน */}
<Section first>
  <ResultBanner tone="success" headingLevel={2} title="ถูกต้อง ทำได้ดีมาก" detail="ถูก 4 จาก 5 ข้อ" />
</Section>
<Section><PatternGrid /></Section> {/* สถานะสุดท้ายของกระดาน */}
<Section><Meter label="คะแนนรอบนี้" value={4} max={5} segments valueText="ถูก 4 จาก 5 ข้อ" /></Section>
<Section><Button href={result.nextHref} fullWidth>ทำข้อถัดไป</Button></Section>`;

export function RecipesSection() {
  return (
    <Part
      id="recipes"
      intro="หน้าจอใหม่ทุกหน้าเริ่มจากหนึ่งในแบบเหล่านี้ ชื่อและลำดับเดียวกับหัวข้อ 5 ของ docs/design-system.md โค้ดใต้ภาพเป็นโครงโดยย่อ ตัวอย่างเต็มอยู่ในเอกสาร"
    >
      <Recipe
        id="admin-list"
        importLine='import { AdminSection, Button, PageHeader, Pagination, Reveal, Table, TableCard } from "@/shared/ui";'
        note="ไม่มีการแบ่งหน้าหรือตัวกรอง: หน้าห่อ TableCard รอบรายการ (เหมือนหน้าคอร์สจริง) มีการแบ่งหน้าหรือตัวกรอง: คอมโพเนนต์รายการเป็นเจ้าของ TableCard (แถบตัวกรอง ตาราง และ Pagination ด้านล่าง) เพราะฟังก์ชันของหน้าอ่านข้อมูลไม่ได้ ภาพคือแบบที่มีการแบ่งหน้า"
        code={listCode}
      >
        <AdminScope>
          <PageHeader
            title="คอร์สและแบบฝึก"
            breadcrumbs={[{ label: "เนื้อหาและผล", href: "#recipes" }, { label: "คอร์สและแบบฝึก" }]}
            action={<Button href="#recipes">สร้างคอร์สใหม่</Button>}
          />
          <AdminSection title="คอร์สทั้งหมด" count="48 รายการ">
            <CourseTable rows={3} label="คอร์สในตัวอย่างหน้ารายการ" />
          </AdminSection>
        </AdminScope>
      </Recipe>

      <Recipe
        id="admin-form"
        importLine='import { AdminSection, Button, Notice, PageHeader, SaveBar, Select, TextField, Toast } from "@/shared/ui";'
        note="ฟอร์มคอลัมน์เดียว (max-w-[35rem]) หน้าสร้างใหม่: ปุ่มส่งอยู่ใต้ช่องทางซ้าย ไม่มี SaveBar หน้าแก้ข้อมูลเดิม: SaveBar อยู่ท้ายฟอร์มภายใน form ปุ่มบันทึกคือ ปุ่ม submit ปุ่มเดียวของฟอร์ม dirty เป็นของ client component ของฟอร์ม เริ่มที่ false เป็น true เมื่อช่องใดเปลี่ยน (onChange ของ form) และกลับเป็น false เมื่อบันทึกสำเร็จ ลองแก้ช่องด้านล่างแล้วกดบันทึก"
        code={formCode}
      >
        <AdminScope>
          <PageHeader
            title="แก้ไขคอร์ส"
            breadcrumbs={[{ label: "คอร์สและแบบฝึก", href: "#recipes" }, { label: "คอร์สตัวอย่าง 01" }]}
          />
          <EditFormDemo />
        </AdminScope>
      </Recipe>

      <Recipe
        id="admin-detail"
        importLine='import { AdminPageSkeleton, AdminSection, Button, ConfirmDialog, PageHeader, Reveal, StatusDot, Tabs } from "@/shared/ui";'
        note="PageHeader มีเส้นทางและปุ่มหลักหนึ่งปุ่ม → Tabs เมื่อรายการมีหลายมุมมอง (แต่ละแท็บคือหนึ่ง URL) → AdminSection ที่แสดงข้อมูลของรายการ → ส่วนสุดท้ายคือการกระทำที่ย้อนไม่ได้ ปุ่ม danger เปิด ConfirmDialog ที่บอกผลที่จะเกิดขึ้น"
        code={detailCode}
      >
        <AdminScope>
          <PageHeader
            title="คอร์สตัวอย่าง 01"
            breadcrumbs={[{ label: "คอร์สและแบบฝึก", href: "#recipes" }, { label: "คอร์สตัวอย่าง 01" }]}
            action={<Button href="#recipe-admin-form">แก้ไข</Button>}
          />
          <div className="mt-4">
            <Tabs
              label="มุมมองของคอร์สตัวอย่าง"
              items={[
                { href: "#recipe-admin-detail", label: "ข้อมูล", active: true },
                { href: "#recipes", label: "ประวัติ" },
              ]}
            />
          </div>
          <AdminSection title="ข้อมูลทั่วไป">
            <dl className="flex flex-col gap-4">
              <div>
                <dt className="text-small text-fg-muted">ชื่อ</dt>
                <dd className="text-body text-fg">คอร์สตัวอย่าง 01</dd>
              </div>
              <div>
                <dt className="text-small text-fg-muted">สถานะ</dt>
                <dd>
                  <StatusDot tone="ok">เปิดใช้งาน</StatusDot>
                </dd>
              </div>
            </dl>
          </AdminSection>
          <AdminSection title="เก็บเข้าคลัง" description="คอร์สจะไม่แสดงในรายการหลัก ผู้ดูแลระบบขอคืนได้">
            <ConfirmDialogDemo
              triggerLabel="เก็บเข้าคลัง"
              title="เก็บ “คอร์สตัวอย่าง 01” เข้าคลัง"
              confirmLabel="เก็บเข้าคลัง"
              tone="danger"
            >
              <ul className="list-disc pl-5">
                <li>คอร์สนี้จะไม่แสดงในรายการหลักอีก</li>
                <li>ข้อมูลเดิมยังอยู่ และผู้ดูแลระบบขอคืนได้</li>
              </ul>
            </ConfirmDialogDemo>
          </AdminSection>
        </AdminScope>
      </Recipe>

      <Recipe
        id="admin-overview"
        importLine='import { AdminSection, PageHeader, Reveal, StatTile, StatTileSkeleton } from "@/shared/ui";'
        note="PageHeader → AdminSection → ตาราง StatTile ใช้คลาสของตารางตามนี้ทุกตัวอักษร ให้ตรงกับ StatTileSkeleton"
        code={overviewCode}
      >
        <AdminScope>
          <PageHeader title="ภาพรวม" description="สรุปการใช้งานของศูนย์ตัวอย่าง" />
          <AdminSection title="สรุปวันนี้">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
              <StatTile
                icon={<Users {...icon} />}
                label="ผู้ใช้งาน"
                value="128"
                unit="คน"
                delta={{ text: "เพิ่มขึ้น 6 คน", tone: "up" }}
              />
              <StatTile icon={<Activity {...icon} />} label="ฝึกแล้ววันนี้" value="42" unit="ครั้ง" />
              <StatTile icon={<CalendarDays {...icon} />} label="นัดสัปดาห์นี้" value="17" unit="นัด" />
            </div>
          </AdminSection>
        </AdminScope>
      </Recipe>

      <Recipe
        id="admin-loading"
        importLine='import { AdminSection, PageHeader, Reveal, TableCard, TableSkeleton } from "@/shared/ui";'
        note="หน้ารายการเดิม แต่ส่วนที่อ่านข้อมูลห่อด้วย Reveal และ fallback คือโครงสร้างจากรายการคอลัมน์เดียวกัน ภาพคือสิ่งที่ fallback แสดง"
        code={loadingCode}
      >
        <AdminScope>
          <PageHeader
            title="คอร์สและแบบฝึก"
            breadcrumbs={[{ label: "เนื้อหาและผล" }, { label: "คอร์สและแบบฝึก" }]}
          />
          <AdminSection title="คอร์สทั้งหมด">
            <TableCard>
              <TableSkeleton label="กำลังโหลดรายการคอร์ส" columns={courseColumns} rows={3} />
            </TableCard>
          </AdminSection>
        </AdminScope>
      </Recipe>

      <Recipe
        id="staff-signin"
        importLine='import { Button, Checkbox, Notice, PageHeader, TextField, TextLink } from "@/shared/ui";'
        note="หน้า /admin/login อยู่ใน scope ผู้ดูแล: โครง StaffAuthShell มาจาก layout ของกลุ่ม (staff) ซึ่งเป็นของ infra หน้าจึงมีแค่ PageHeader กับฟอร์ม พื้นขาวทั้งหน้า ไม่มีการ์ด ช่อง ชื่อผู้ใช้ และ รหัสผ่าน เป็น TextField พิมพ์ด้วยแป้นพิมพ์ รหัสผ่านแสดงได้ด้วย Checkbox แสดงรหัสผ่าน ปุ่มหลักหนึ่งปุ่มเต็มความกว้าง เข้าไม่สำเร็จแสดง Notice เหนือปุ่ม ลิงก์ข้อความใต้ฟอร์มพาไป /login ของผู้ใช้ทั่วไป หน้า /login ไม่มีลิงก์มาที่หน้านี้ และไม่มีทางสมัครจากหน้านี้ บัญชีผู้ดูแลเพิ่มได้จากเมนูในหน้าผู้ดูแลเท่านั้น ตัวอย่างกดได้จริงแต่ไม่ส่งข้อมูล"
        code={staffSignInCode}
      >
        <div className="overflow-hidden rounded-panel border-[length:var(--b9-border)] border-line">
          <StaffAuthShell brand="Brain9" roleLabel="สำหรับผู้ดูแล" environmentLabel="staging" embedded>
            <StaffSignInDemo />
          </StaffAuthShell>
        </div>
      </Recipe>

      <Recipe
        id="elder-step"
        importLine='import { Button, ChoiceList, ElderHeader, Section, StepProgress } from "@/shared/ui";'
        note="ElderHeader → form ที่มีสาม Section: StepProgress, หนึ่งคำถาม, ปุ่มหลักหนึ่งปุ่ม (submit) เต็มความกว้าง ไม่มีการ์ด"
        code={stepCode}
      >
        <ElderScope>
          <ElderHeader title="เลือกแบบฝึก" backHref="#recipes" />
          <form action="#recipe-elder-step">
            <Section first>
              <StepProgress current={1} total={3} />
            </Section>
            <Section>
              <ChoiceList
                name="r-step-mode"
                legend="วันนี้ต้องการฝึกแบบใด"
                defaultValue="training"
                options={[
                  { value: "training", title: "ฝึก", description: "มีคำใบ้ ฝึกได้ไม่จำกัดครั้ง" },
                  { value: "test", title: "ทดสอบ", description: "ไม่มีคำใบ้ มีจำนวนครั้งจำกัด" },
                ]}
              />
            </Section>
            <Section>
              <Button type="submit" fullWidth>
                ไปต่อ
              </Button>
            </Section>
          </form>
        </ElderScope>
      </Recipe>

      <Recipe
        id="elder-signin"
        importLine='import { BrandMark, Button, ElderHeader, Notice, PhonePad, PinPad, Section, StepProgress, TextLink } from "@/shared/ui";'
        note="หน้าแรก (/login) ให้เลือกก่อน: ปุ่มหลัก เข้าสู่ระบบ และปุ่มรอง สมัครสมาชิก ไม่มีทางเข้าของเจ้าหน้าที่ในหน้านี้ (เจ้าหน้าที่เปิด /admin/login เอง) จากนั้นเป็นสองขั้นที่ /login/pin แต่ละขั้นเป็นหน้าจอและ client component เล็ก ๆ ของตัวเองที่เป็นเจ้าของ value หรือ filled ขั้นที่ 1: ElderHeader → StepProgress → PhonePad → ปุ่มหลักหนึ่งปุ่ม (ถัดไป) → ลิงก์ข้อความไปสมัครสมาชิก ขั้นที่ 2: ElderHeader → StepProgress → PinPad ที่มีป้ายบอกเหนือจุด ส่งเองเมื่อกดตัวสุดท้าย จึงไม่มีปุ่ม ลิงก์ข้อความ ลืมรหัส อยู่ใต้แป้นและพาไป /login/forgot รหัสไม่ถูกต้องแสดง Notice หน้าที่มีแป้นทั้งสองหน้าไม่มีช่องที่โฟกัสหรือพิมพ์ได้ (ไม่มี input ที่มองเห็น ซ่อนไว้นอกจอ หรือโปร่งใส และไม่มี contenteditable) แป้นพิมพ์มือถือจึงไม่ขึ้น มีเพียง input type=hidden ของ PhonePad ที่โฟกัสไม่ได้เป็นข้อยกเว้นเดียว ไม่มีการ์ด"
        code={signInCode}
      >
        <div className="flex flex-col gap-4">
          <ElderScope>
            <BrandMark className="mb-4 size-14" />
            <ElderHeader title="ยินดีต้อนรับสู่ Brain9" />
            <Section first>
              <div className="flex flex-col gap-3">
                <p className="text-body text-fg-2">มีบัญชีอยู่แล้ว</p>
                <Button fullWidth href="#recipe-elder-signin">
                  เข้าสู่ระบบ
                </Button>
              </div>
            </Section>
            <Section>
              <div className="flex flex-col gap-3">
                <p className="text-body text-fg-2">ยังไม่มีบัญชี</p>
                <Button variant="secondary" fullWidth href="#recipe-elder-signup">
                  สมัครสมาชิก
                </Button>
              </div>
            </Section>
          </ElderScope>
          <ElderScope>
            <ElderHeader title="เข้าสู่ระบบ" backHref="#recipe-elder-signin" />
            <Section first>
              <StepProgress current={1} total={2} />
            </Section>
            <Section>
              <PhonePadDemo />
            </Section>
            <Section>
              <Button fullWidth>ถัดไป</Button>
            </Section>
            <Section>
              <div className="flex flex-wrap items-center justify-center gap-x-2">
                <span className="text-body text-fg-2">ยังไม่มีบัญชี</span>
                <TextLink href="#recipe-elder-signup">สมัครสมาชิก</TextLink>
              </div>
            </Section>
          </ElderScope>
          <ElderScope>
            <ElderHeader title="เข้าสู่ระบบ" backHref="#recipe-elder-signin" />
            <Section first>
              <StepProgress current={2} total={2} />
            </Section>
            <Section>
              <div className="flex flex-col items-center gap-4">
                <Notice tone="danger">รหัสยังไม่ถูกต้อง กรุณาใส่อีกครั้ง</Notice>
                <LabelledPinPadDemo label="ใส่รหัส 4 หลัก" />
                <TextLink href="#recipe-elder-forgot-pin">ลืมรหัส</TextLink>
              </div>
            </Section>
          </ElderScope>
        </div>
      </Recipe>

      <Recipe
        id="elder-signup"
        importLine='import { Button, Checkbox, ElderHeader, Notice, PhonePad, PinPad, Section, StepProgress, TextField, TextLink } from "@/shared/ui";'
        note="สี่ขั้น ขั้นละหนึ่งคำถาม มี StepProgress ทุกขั้น ขั้นที่ 1 เบอร์โทรศัพท์ด้วย PhonePad ปุ่มหลัก ถัดไป และลิงก์ข้อความไปเข้าสู่ระบบ ขั้นที่ 2 ตั้งรหัสด้วย PinPad สองครั้ง ป้ายเหนือจุดบอกว่าเป็นครั้งไหน กดตัวที่ 4 แล้วไปต่อเอง จึงไม่มีปุ่ม ถ้าสองครั้งไม่ตรงกันจะแจ้งด้วย Notice แล้วเริ่มตั้งใหม่ ขั้นที่ 3 ชื่อและนามสกุลด้วย TextField (ขั้นนี้ใช้แป้นพิมพ์) ขั้นที่ 4 สรุปนโยบายตัวใหญ่ ลิงก์ข้อความเปิดฉบับเต็มเป็นหน้าจอในขั้นเดิม ค่าที่เลือกไว้จึงไม่หาย Checkbox สามข้อไม่ติ๊กไว้ก่อน และปุ่มหลัก สมัครสมาชิก ขั้นที่ 1 และ 2 ไม่มีช่องที่โฟกัสหรือพิมพ์ได้ ตัวอย่างขั้นที่ 2 และ 4 กดได้จริง"
        code={signUpCode}
      >
        <div className="flex flex-col gap-4">
          <ElderScope>
            <ElderHeader title="สมัครสมาชิก" backHref="#recipe-elder-signin" />
            <Section first>
              <StepProgress current={1} total={4} />
            </Section>
            <Section>
              <PhoneEntryDemo label="เบอร์โทรศัพท์ของคุณ" hint="ใช้เบอร์นี้เข้าสู่ระบบในครั้งต่อไป" />
            </Section>
            <Section>
              <Button fullWidth>ถัดไป</Button>
            </Section>
            <Section>
              <div className="flex flex-wrap items-center justify-center gap-x-2">
                <span className="text-body text-fg-2">มีบัญชีอยู่แล้ว</span>
                <TextLink href="#recipe-elder-signin">เข้าสู่ระบบ</TextLink>
              </div>
            </Section>
          </ElderScope>
          <ElderScope>
            <ElderHeader title="สมัครสมาชิก" backHref="#recipe-elder-signup" />
            <Section first>
              <StepProgress current={2} total={4} />
            </Section>
            <Section>
              <NewPinDemo firstLabel="ตั้งรหัส 4 หลัก" againLabel="ใส่รหัสเดิมอีกครั้ง" />
            </Section>
          </ElderScope>
          <ElderScope>
            <ElderHeader title="สมัครสมาชิก" backHref="#recipe-elder-signup" />
            <Section first>
              <StepProgress current={3} total={4} />
            </Section>
            <Section>
              <div className="flex flex-col gap-5">
                <TextField label="ชื่อ" name="r-signup-first" autoComplete="off" />
                <TextField label="นามสกุล" name="r-signup-last" autoComplete="off" />
              </div>
            </Section>
            <Section>
              <Button fullWidth>ถัดไป</Button>
            </Section>
          </ElderScope>
          <ElderScope>
            <ConsentStepDemo />
          </ElderScope>
        </div>
      </Recipe>

      <Recipe
        id="elder-forgot-pin"
        importLine='import { Button, ElderHeader, Notice, PhonePad, PinPad, Section } from "@/shared/ui";'
        note="/login/forgot: ElderHeader → หนึ่งประโยคบอกว่าจะเกิดอะไรขึ้น → PhonePad → ปุ่มหลักหนึ่งปุ่ม หลังส่งแล้วทุกเบอร์ได้หน้าจอเดียวกัน: หัวข้อ ได้รับคำขอแล้ว สองประโยค และปุ่มหลักกลับหน้าแรก ไม่มีกล่องสีและไม่มีรายการ /login/new-pin: Notice บอกว่าเจ้าหน้าที่ยืนยันแล้ว จากนั้นตั้งรหัสสองครั้งด้วย PinPad แบบเดียวกับขั้นที่ 2 ของการสมัคร ทุกหน้าไม่มีช่องที่โฟกัสหรือพิมพ์ได้ หน้ารายการคำขอของเจ้าหน้าที่ใช้แบบ หน้ารายการของผู้ดูแล ตัวอย่างตั้งรหัสกดได้จริง"
        code={forgotPinCode}
      >
        <div className="flex flex-col gap-4">
          <ElderScope>
            <ElderHeader title="ลืมรหัส" backHref="#recipe-elder-signin" />
            <Section first>
              <p className="text-lead text-fg">
                กรุณาใส่เบอร์โทรศัพท์ที่ใช้สมัคร เจ้าหน้าที่จะโทรกลับเพื่อช่วยตั้งรหัสใหม่
              </p>
            </Section>
            <Section>
              <PhoneEntryDemo label="เบอร์โทรศัพท์ที่ใช้สมัคร" />
            </Section>
            <Section>
              <Button fullWidth>ขอให้เจ้าหน้าที่โทรกลับ</Button>
            </Section>
          </ElderScope>
          <ElderScope>
            <ElderHeader title="ได้รับคำขอแล้ว" />
            <Section first>
              <div className="flex flex-col gap-4 text-lead text-fg">
                <p>เจ้าหน้าที่จะโทรกลับที่เบอร์นี้ในเวลาทำการ</p>
                <p>หลังคุยกับเจ้าหน้าที่แล้ว กรุณาเปิด Brain9 บนเครื่องนี้อีกครั้งเพื่อตั้งรหัสใหม่</p>
              </div>
            </Section>
            <Section>
              <Button fullWidth href="#recipe-elder-signin">
                กลับหน้าแรก
              </Button>
            </Section>
          </ElderScope>
          <ElderScope>
            <ElderHeader title="ตั้งรหัสใหม่" />
            <Section first>
              <Notice tone="success">เจ้าหน้าที่ยืนยันแล้ว ตั้งรหัสใหม่ได้</Notice>
            </Section>
            <Section>
              <NewPinDemo firstLabel="ตั้งรหัสใหม่ 4 หลัก" againLabel="ใส่รหัสใหม่อีกครั้ง" />
            </Section>
          </ElderScope>
        </div>
      </Recipe>

      <Recipe
        id="elder-list"
        importLine='import { ElderHeader, ListRow, ListRowSkeleton, Reveal, Section } from "@/shared/ui";'
        note="ElderHeader → Section first ที่มีหัวข้อ → ListRow ทีละแถว แถวทั้งแถวคือลิงก์เดียว ไอคอนมีชื่อแถวกำกับ รายการที่อ่านข้อมูลห่อด้วย Reveal กับ ListRowSkeleton"
        code={elderListCode}
      >
        <ElderScope>
          <ElderHeader title="แบบฝึกของฉัน" />
          <Section first title="แบบฝึกทั้งหมด">
            <ListRow
              href="#recipe-elder-list"
              icon={<Play {...rowIcon} />}
              title="จำลำดับ 3 ช่อง"
              subtitle="ประมาณ 5 นาที"
            />
            <ListRow
              href="#recipe-elder-list"
              icon={<Play {...rowIcon} />}
              title="จำลำดับ 4 ช่อง"
              subtitle="ประมาณ 5 นาที"
            />
          </Section>
        </ElderScope>
      </Recipe>

      <Recipe
        id="elder-play"
        importLine='import { Button, ElderHeader, Meter, Notice, ResultBanner, Section } from "@/shared/ui";'
        note="หน้าเล่น: ElderHeader → กระดานของทีม engine (PatternGrid) ใน Section first คำบอกสองนิ้วเป็น Notice โทน attention เหนือกระดาน ไม่มีอะไรเคลื่อนไหว อ่านข้อมูลใน Suspense ห้ามใช้ Reveal หน้าผล: ResultBanner (✓ หรือ ✕ และคำ) → กระดานในสถานะสุดท้าย → Meter ถ้ามีคะแนน → ปุ่มหลักหนึ่งปุ่ม กระดานในภาพเป็นภาพนิ่ง PatternGrid เป็นคอมโพเนนต์ของทีม engine ในตัวอย่างนี้เป็นชื่อแทนไว้ก่อนจนกว่าทีม engine จะส่งมอบ และใช้ props ตามที่ทีม engine กำหนด"
        code={playCode}
      >
        <div className="flex flex-col gap-4">
          <ElderScope>
            <ElderHeader title="ฝึกจำลำดับ" />
            <Section first>
              <div className="flex flex-col gap-3">
                <Notice tone="attention">ช่องต่อไปต้องแตะสองนิ้วพร้อมกัน</Notice>
                <div
                  role="img"
                  aria-label="ภาพกระดานระหว่างเล่น: ช่องที่ 1 แตะแล้ว ช่องที่ 2 สว่าง ที่เหลือว่าง"
                  className="grid aspect-square max-w-xs grid-cols-3 gap-3 rounded-panel bg-primary-soft p-3.5"
                >
                  <Cell state="tapped">1</Cell>
                  <Cell state="lit" />
                  <Cell state="empty" />
                  <Cell state="empty" />
                  <Cell state="empty" />
                  <Cell state="empty" />
                  <Cell state="empty" />
                  <Cell state="empty" />
                  <Cell state="empty" />
                </div>
              </div>
            </Section>
          </ElderScope>
          <ElderScope>
            <ElderHeader title="ผลการฝึก" />
            <Section first>
              <ResultBanner
                tone="success"
                headingLevel={2}
                title="ถูกต้อง ทำได้ดีมาก"
                detail="ถูก 4 จาก 5 ข้อ"
              />
            </Section>
            <Section>
              <div
                role="img"
                aria-label="ภาพกระดานหลังจบ: ช่องที่ 1 ถึง 3 ถูกต้องตามลำดับ ที่เหลือว่าง"
                className="grid aspect-square max-w-xs grid-cols-3 gap-3 rounded-panel bg-primary-soft p-3.5"
              >
                <Cell state="correct">1</Cell>
                <Cell state="correct">2</Cell>
                <Cell state="correct">3</Cell>
                <Cell state="empty" />
                <Cell state="empty" />
                <Cell state="empty" />
                <Cell state="empty" />
                <Cell state="empty" />
                <Cell state="empty" />
              </div>
            </Section>
            <Section>
              <Meter label="คะแนนรอบนี้" value={4} max={5} segments valueText="ถูก 4 จาก 5 ข้อ" />
            </Section>
            <Section>
              <Button href="#recipe-elder-play" fullWidth>
                ทำข้อถัดไป
              </Button>
            </Section>
          </ElderScope>
        </div>
      </Recipe>
      <Recipe
        id="elder-profile"
        importLine='import { Button, ConfirmDialog, ElderHeader, Reveal, Section, SkeletonLine, SkeletonRegion } from "@/shared/ui";'
        note="ElderHeader → Section first แสดงชื่อและนามสกุล (อ่านข้อมูลใน Reveal พร้อมโครงระหว่างโหลด) → ส่วนล่างสุดของหน้าคือปุ่มรอง ออกจากระบบ เต็มความกว้าง มีไอคอนพร้อมคำกำกับ กดแล้วถามยืนยันด้วย ConfirmDialog ที่บอกว่าครั้งถัดไปต้องใส่เบอร์โทรศัพท์และรหัสอีกครั้ง ปุ่มนี้ไม่ใช้ danger เพราะการออกจากระบบไม่ได้ทำลายอะไร ส่วนอื่นของหน้าข้อมูลของฉันจะเพิ่มไว้เหนือส่วนออกจากระบบ ฝั่งผู้ดูแล ปุ่ม ออกจากระบบ อยู่ขวาสุดของแถบบนใน AdminShell และออกทันทีโดยไม่ถาม"
        code={profileCode}
      >
        <ElderScope>
          <ElderHeader title="ข้อมูลของฉัน" backHref="#recipe-elder-profile" />
          <Section first>
            <p className="text-small text-fg-muted">ชื่อและนามสกุล</p>
            <p className="text-heading font-bold text-fg">ตัวอย่าง ใจดี</p>
          </Section>
          <Section>
            <SignOutDemo />
          </Section>
        </ElderScope>
      </Recipe>

      <Recipe
        id="system-screens"
        importLine='import { notFound } from "next/navigation";'
        note="หน้าไม่พบหน้าและหน้าข้อผิดพลาดใช้ SystemScreen ร่วมกัน ข้อความล้วน ไม่มีการ์ด ไม่มีภาพประกอบ และไม่มีเลขรหัส หน้าที่ผู้เข้าชมไม่มีสิทธิ์เปิดต้องเรียก notFound() ให้ได้หน้าเดียวกับหน้าที่ไม่มีอยู่จริง ห้ามมีหน้าไม่มีสิทธิ์และห้ามเปลี่ยนเส้นทางที่บอกว่ามีหน้านี้ ตัวอย่างนี้เป็นภาพนิ่ง ปุ่มไม่ทำงาน"
        code={systemCode}
      >
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-panel border-[length:var(--b9-border)] border-line">
            <SystemScreen
              embedded
              title="ไม่พบหน้านี้"
              description="กรุณากลับไปหน้าหลักแล้วเริ่มใหม่อีกครั้ง"
              action={
                <Button fullWidth href="#recipe-system-screens">
                  กลับหน้าหลัก
                </Button>
              }
            />
          </div>
          <div className="overflow-hidden rounded-panel border-[length:var(--b9-border)] border-line">
            <SystemScreen
              embedded
              title="ระบบขัดข้องชั่วคราว"
              description="ขออภัยในความไม่สะดวก กรุณารอสักครู่แล้วลองอีกครั้ง"
              action={
                <Button fullWidth href="#recipe-system-screens">
                  ลองอีกครั้ง
                </Button>
              }
              secondaryAction={
                <Button fullWidth variant="secondary" href="#recipe-system-screens">
                  กลับหน้าหลัก
                </Button>
              }
              reference="รหัสอ้างอิง 1a2b3c"
            />
          </div>
        </div>
      </Recipe>
    </Part>
  );
}
