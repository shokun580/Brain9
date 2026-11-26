import type { Metadata } from "next";
import { Button } from "@/shared/ui";
import { SystemScreen } from "./_system/SystemScreen";

export const metadata: Metadata = { title: "ไม่พบหน้านี้" };

/**
 * Answers both an unknown address and a page the visitor may not open (`notFound()`), so
 * nothing here may reveal whether a route exists: no code number, no "no permission" wording.
 */
export default function NotFound() {
  return (
    <SystemScreen
      title="ไม่พบหน้านี้"
      description="กรุณากลับไปหน้าหลักแล้วเริ่มใหม่อีกครั้ง"
      action={
        <Button fullWidth href="/">
          กลับหน้าหลัก
        </Button>
      }
    />
  );
}
