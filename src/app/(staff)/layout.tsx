import { env } from "@/shared/lib/env";
import { StaffAuthShell } from "@/shared/ui";

// Shell for the staff sign-in screen, `/admin/login`. OWNER: infra (team lead).
// The page lives in this route group, not under `src/app/admin/`, on purpose: everything in
// that folder is wrapped by the admin layout, whose gate answers "not found" to a visitor who
// is not signed in as an admin. A route group gives the same address without that layout.
// Keep this file free of data access, like the other layouts: staff are not signed in yet,
// and the page inside reads the session in <Suspense>.

/** Names a non-production deployment in the footer; production shows nothing. */
function environmentLabel(): string | undefined {
  const appEnv = env().APP_ENV;
  return appEnv === "production" ? undefined : appEnv;
}

export default function StaffAuthLayout({ children }: LayoutProps<"/">) {
  return (
    <StaffAuthShell brand="Brain9" roleLabel="สำหรับผู้ดูแล" environmentLabel={environmentLabel()}>
      {children}
    </StaffAuthShell>
  );
}
