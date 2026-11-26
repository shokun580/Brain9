"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import {
  Button,
  Checkbox,
  ConfirmDialog,
  ElderHeader,
  Notice,
  PageHeader,
  PhonePad,
  PinPad,
  Section,
  StepProgress,
  TextField,
  TextLink,
} from "@/shared/ui";

// Working pictures of the sign-in, sign-up, forgotten-PIN and sign-out recipes. They follow the
// samples in docs/design-system.md section 5 line for line, except that nothing is sent
// anywhere: a demo keeps its state in the browser and links stay on this page.

const PIN_LENGTH = 4;

/** A phone pad with its own label and hint. */
export function PhoneEntryDemo({ label, hint }: { label: string; hint?: string }) {
  const [phone, setPhone] = useState("");
  return <PhonePad label={label} value={phone} onChange={setPhone} hint={hint} />;
}

/** A PIN pad that says which PIN it asks for. It counts digits and never keeps them. */
export function LabelledPinPadDemo({ label, hint }: { label: string; hint?: string }) {
  const [filled, setFilled] = useState(0);
  return (
    <PinPad
      label={label}
      hint={hint}
      length={PIN_LENGTH}
      filled={filled}
      onDigit={() => setFilled((count) => Math.min(count + 1, PIN_LENGTH))}
      onDelete={() => setFilled((count) => Math.max(count - 1, 0))}
    />
  );
}

/**
 * The "PIN entered twice" step, live: the fourth digit of the first entry moves on to the
 * second, and two entries that differ start again with a message. The digits live only in this
 * component's state, as in the real step.
 */
export function NewPinDemo({ firstLabel, againLabel }: { firstLabel: string; againLabel: string }) {
  const [first, setFirst] = useState<string>();
  const [entry, setEntry] = useState("");
  const [problem, setProblem] = useState<string>();
  const [done, setDone] = useState(false);

  function press(digit: string) {
    const next = entry + digit;
    setProblem(undefined);
    setDone(false);
    if (next.length < PIN_LENGTH) {
      setEntry(next);
      return;
    }
    setEntry("");
    if (first === undefined) {
      setFirst(next);
    } else {
      setFirst(undefined);
      if (next === first) setDone(true);
      else setProblem("รหัสทั้งสองครั้งไม่ตรงกัน กรุณาตั้งรหัสใหม่อีกครั้ง");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {problem ? <Notice tone="danger">{problem}</Notice> : null}
      {done ? <Notice tone="success">รหัสตรงกันทั้งสองครั้ง (ตัวอย่างเท่านั้น ไม่มีการบันทึก)</Notice> : null}
      <PinPad
        label={first === undefined ? firstLabel : againLabel}
        hint={first === undefined ? "เลือกเลขที่จำได้ง่าย" : "เพื่อยืนยันว่าจำรหัสได้"}
        length={PIN_LENGTH}
        filled={entry.length}
        onDigit={press}
        onDelete={() => setEntry((current) => current.slice(0, -1))}
      />
    </div>
  );
}

const policies = {
  privacy: {
    title: "ประกาศความเป็นส่วนตัว",
    summary:
      "เราเก็บชื่อ เบอร์โทรศัพท์ และผลการฝึกของคุณ เพื่อให้คุณเข้าใช้งานและดูพัฒนาการของตัวเองได้ เราไม่ขายและไม่ส่งต่อข้อมูลให้ผู้อื่น คุณขอดู แก้ไข หรือขอลบข้อมูลได้ทุกเมื่อ (ข้อความตัวอย่าง)",
    content:
      "ข้อ 1 ข้อมูลที่เราเก็บ ได้แก่ ชื่อ นามสกุล เบอร์โทรศัพท์ และผลการฝึกสมองของคุณ (ข้อความตัวอย่าง)\n\nข้อ 2 เราใช้ข้อมูลเพื่อให้คุณเข้าสู่ระบบ ติดต่อกลับเมื่อคุณขอความช่วยเหลือ และแสดงพัฒนาการของคุณ (ข้อความตัวอย่าง)\n\nข้อ 3 คุณขอดู แก้ไข ถอนความยินยอม หรือขอลบข้อมูลได้ทุกเมื่อ (ข้อความตัวอย่าง)",
  },
  terms: {
    title: "ข้อตกลงการใช้งาน",
    summary:
      "Brain9 เป็นแบบฝึกสมอง ไม่ใช่การตรวจหรือรักษาโรค หากกังวลเรื่องสุขภาพ ควรปรึกษาแพทย์ (ข้อความตัวอย่าง)",
    content:
      "ข้อ 1 Brain9 เป็นแบบฝึกสมอง ไม่ใช่การตรวจ วินิจฉัย หรือรักษาโรค (ข้อความตัวอย่าง)\n\nข้อ 2 ผู้ใช้หนึ่งคนใช้หนึ่งบัญชี และดูแลรหัสของตนเอง (ข้อความตัวอย่าง)",
  },
} as const;

type PolicyKey = keyof typeof policies;

/**
 * Step 4 of sign-up, live: the two summaries, the way to the full text (a screen inside the
 * same step, so the ticks survive), three boxes that start empty, and the one primary button.
 */
export function ConsentStepDemo() {
  const [reading, setReading] = useState<PolicyKey>();
  const [consents, setConsents] = useState({ terms: false, personal: false, cognitive: false });
  const [asked, setAsked] = useState(false);
  const missing = (ticked: boolean) => (asked && !ticked ? ["กรุณาเลือกข้อนี้ก่อนสมัครสมาชิก"] : undefined);

  if (reading) {
    const policy = policies[reading];
    return (
      <>
        <ElderHeader title={policy.title} onBack={() => setReading(undefined)} />
        <Section first>
          <div className="flex flex-col gap-4 text-body text-fg">
            {policy.content.split(/\n{2,}/).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Section>
        <Section>
          <Button fullWidth onClick={() => setReading(undefined)}>
            กลับไปสมัครสมาชิกต่อ
          </Button>
        </Section>
      </>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setAsked(true);
      }}
    >
      <ElderHeader title="สมัครสมาชิก" backHref="#recipe-elder-signup" />
      <Section first>
        <StepProgress current={4} total={4} />
      </Section>
      <Section eyebrow={policies.privacy.title}>
        <p className="text-lead text-fg">{policies.privacy.summary}</p>
        <TextLink onClick={() => setReading("privacy")}>อ่านประกาศฉบับเต็ม</TextLink>
      </Section>
      <Section eyebrow={policies.terms.title}>
        <p className="text-lead text-fg">{policies.terms.summary}</p>
        <TextLink onClick={() => setReading("terms")}>อ่านข้อตกลงฉบับเต็ม</TextLink>
      </Section>
      <Section eyebrow="กรุณาเลือกให้ครบทั้ง 3 ข้อ">
        <div className="flex flex-col gap-2">
          <Checkbox
            label="ยอมรับข้อตกลงการใช้งาน"
            name="r-consent-terms"
            checked={consents.terms}
            onChange={(event) => setConsents({ ...consents, terms: event.target.checked })}
            errors={missing(consents.terms)}
          />
          <Checkbox
            label="ยินยอมให้เก็บชื่อและเบอร์โทรศัพท์"
            name="r-consent-personal"
            checked={consents.personal}
            onChange={(event) => setConsents({ ...consents, personal: event.target.checked })}
            errors={missing(consents.personal)}
          />
          <Checkbox
            label="ยินยอมให้เก็บผลการฝึกสมอง"
            name="r-consent-cognitive"
            checked={consents.cognitive}
            onChange={(event) => setConsents({ ...consents, cognitive: event.target.checked })}
            errors={missing(consents.cognitive)}
          />
        </div>
      </Section>
      <Section>
        <Button type="submit" fullWidth>
          สมัครสมาชิก
        </Button>
      </Section>
    </form>
  );
}

/** The staff sign-in form, live: the password can be shown, and nothing is sent. */
export function StaffSignInDemo() {
  const [show, setShow] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <>
      <PageHeader title="เข้าสู่ระบบ" description="สำหรับเจ้าหน้าที่ศูนย์และผู้ดูแลระบบ" />
      <form
        className="mt-6 flex flex-col gap-5"
        onChange={() => setFailed(false)}
        onSubmit={(event) => {
          event.preventDefault();
          setFailed(true);
        }}
      >
        <TextField
          label="ชื่อผู้ใช้"
          name="r-staff-username"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
        />
        <TextField
          label="รหัสผ่าน"
          name="r-staff-password"
          type={show ? "text" : "password"}
          autoComplete="off"
        />
        <Checkbox
          label="แสดงรหัสผ่าน"
          name="r-staff-show"
          checked={show}
          onChange={(event) => setShow(event.target.checked)}
        />
        {failed ? <Notice tone="danger">ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (ตัวอย่างเท่านั้น)</Notice> : null}
        <Button type="submit" fullWidth>
          เข้าสู่ระบบ
        </Button>
      </form>
      <div className="mt-4 flex justify-center">
        <TextLink href="#recipe-elder-signin">ไปหน้าเข้าสู่ระบบของผู้ใช้ทั่วไป</TextLink>
      </div>
    </>
  );
}

/** Sign-out on the elderly profile, live: a secondary button, then a confirmation in words. */
export function SignOutDemo() {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  return (
    <div className="flex flex-col gap-3">
      <Button variant="secondary" fullWidth onClick={() => setOpen(true)}>
        <LogOut aria-hidden="true" strokeWidth={1.9} className="size-icon shrink-0" />
        ออกจากระบบ
      </Button>
      {answer ? (
        <p role="status" className="text-small text-fg-muted">
          {answer}
        </p>
      ) : null}
      <ConfirmDialog
        open={open}
        title="ต้องการออกจากระบบหรือไม่"
        confirmLabel="ออกจากระบบ"
        onCancel={() => {
          setOpen(false);
          setAnswer("ยกเลิกแล้ว ยังอยู่ในระบบ");
        }}
        onConfirm={() => {
          setOpen(false);
          setAnswer("ยืนยันแล้ว (ตัวอย่างเท่านั้น ไม่ได้ออกจากระบบจริง)");
        }}
      >
        การเข้าใช้ครั้งถัดไปต้องใส่เบอร์โทรศัพท์และรหัส 4 หลักอีกครั้ง
      </ConfirmDialog>
    </div>
  );
}
