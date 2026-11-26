"use client";

import { useEffect } from "react";
import { Button } from "@/shared/ui";
import { SystemScreen } from "./_system/SystemScreen";
import { errorDigest } from "./error-digest";

export default function ErrorScreen({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest = errorDigest(error);
  // Never render the message or a stack: they can leak details to the visitor.
  return (
    <SystemScreen
      title="ระบบของเรามีปัญหาชั่วคราว"
      description="ไม่ใช่ความผิดของคุณนะ รอสักครู่แล้วลองอีกครั้งได้เลย"
      action={<Button onClick={() => retry()}>ลองอีกครั้ง</Button>}
      secondaryAction={
        <Button variant="secondary" href="/">
          กลับหน้าหลัก
        </Button>
      }
      reference={digest ? `รหัสอ้างอิง ${digest}` : undefined}
    />
  );
}
