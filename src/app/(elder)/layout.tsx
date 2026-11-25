// Shell for every elderly-facing screen. OWNER: infra (team lead).
// Keep it free of data access: anything that reads the session belongs in a component
// rendered inside <Suspense> on the page.
export default function ElderLayout({ children }: LayoutProps<"/">) {
  return (
    <div data-ui="elder" className="min-h-dvh bg-page text-fg">
      <main className="mx-auto w-full max-w-2xl p-5">{children}</main>
    </div>
  );
}
