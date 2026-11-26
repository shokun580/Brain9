"use client";

import localFont from "next/font/local";
import { useEffect } from "react";
import { DisplayPrefsScript } from "@/shared/ui/DisplayPrefsScript";
import { Button } from "@/shared/ui";
import { SystemScreen } from "./_system/SystemScreen";
import { errorDigest } from "./error-digest";
import "./globals.css";

// Same font as the root layout: this file replaces that layout, so it loads the font itself.
const lineSeed = localFont({
  variable: "--font-line-seed",
  display: "swap",
  src: [
    { path: "./fonts/LINESeedSansTH_Rg.ttf", weight: "400", style: "normal" },
    { path: "./fonts/LINESeedSansTH_Bd.ttf", weight: "700", style: "normal" },
  ],
});

/** A failure of the root layout itself. No `metadata` export: unsupported in a client file. */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest = errorDigest(error);
  return (
    <html lang="th" className={`${lineSeed.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans">
        <DisplayPrefsScript />
        <title>ระบบมีปัญหาชั่วคราว · Brain9</title>
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
      </body>
    </html>
  );
}
