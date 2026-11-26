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
      title="ระบบขัดข้องชั่วคราว"
      description="ขออภัยในความไม่สะดวก กรุณารอสักครู่แล้วลองอีกครั้ง"
      action={
        <Button fullWidth onClick={() => retry()}>
          ลองอีกครั้ง
        </Button>
      }
      secondaryAction={
        <Button fullWidth variant="secondary" href="/">
          กลับหน้าหลัก
        </Button>
      }
      reference={digest ? `รหัสอ้างอิง ${digest}` : undefined}
    />
  );
}
