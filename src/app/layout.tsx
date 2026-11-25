import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { DISPLAY_PREFS_SCRIPT } from "@/shared/lib/display-settings";
import "./globals.css";

// LINE Seed Sans TH (SIL Open Font License 1.1) — same typeface as the demov1 prototype.
const lineSeed = localFont({
  variable: "--font-line-seed",
  display: "swap",
  src: [
    { path: "./fonts/LINESeedSansTH_Rg.ttf", weight: "400", style: "normal" },
    { path: "./fonts/LINESeedSansTH_Bd.ttf", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: { default: "Brain9", template: "%s · Brain9" },
  description: "ระบบฝึกสมองสำหรับผู้สูงอายุ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the inline script sets data-size / data-contrast on <html>
    // before React hydrates (see the Next.js guide "Preventing flash before hydration").
    <html lang="th" className={`${lineSeed.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: DISPLAY_PREFS_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
