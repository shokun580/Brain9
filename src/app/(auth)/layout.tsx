import { DisplayPrefsReset } from "@/shared/ui/DisplayPrefsReset";

// Shell for login and sign-up. OWNER: infra (team lead).
// Keep it free of data access, like the other layouts. No tab bar: these screens come before
// the person is signed in. For the same reason they always show the default text size and
// contrast: DisplayPrefsReset removes the last person's settings from the device.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div data-ui="elder" className="min-h-dvh bg-page text-fg">
      <DisplayPrefsReset />
      <main className="mx-auto min-h-dvh w-full max-w-[640px] bg-surface p-5">{children}</main>
    </div>
  );
}
