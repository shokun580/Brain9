// Shell for login and sign-up. OWNER: infra (team lead).
// Keep it free of data access, like the other layouts. No tab bar: these screens come before
// the person is signed in.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div data-ui="elder" className="min-h-dvh bg-page text-fg">
      <main className="mx-auto min-h-dvh w-full max-w-[640px] bg-surface p-5">{children}</main>
    </div>
  );
}
