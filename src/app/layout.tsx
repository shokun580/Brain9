import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { DisplayPrefsScript } from "@/shared/ui/DisplayPrefsScript";
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
    // before React hydrates; DisplayPrefsScript inserts it via useServerInsertedHTML, which avoids
    // the dev warning about <script> in components (see the guide "Preventing flash before hydration").
    <html lang="th" className={`${lineSeed.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans">
        <DisplayPrefsScript />
        {children}
      </body>
    </html>
  );
}
