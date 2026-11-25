// Shell for login and sign-up. OWNER: infra (team lead).
// Keep it free of data access, like the other layouts.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div data-ui="elder" className="min-h-dvh bg-page text-fg">
      <main className="mx-auto w-full max-w-2xl p-5">{children}</main>
    </div>
  );
}
