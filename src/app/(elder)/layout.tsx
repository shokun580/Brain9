// Shell for every elderly-facing screen. OWNER: infra (team lead).
// Keep it free of data access: anything that reads the session belongs in a component
// rendered inside <Suspense> on the page.
export default function ElderLayout({ children }: LayoutProps<"/">) {
  return <main className="mx-auto w-full max-w-2xl flex-1 p-5">{children}</main>;
}
