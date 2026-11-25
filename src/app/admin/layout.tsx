import { Suspense } from "react";
import { getCurrentUser, requireAdmin } from "@/modules/identity";
import { env } from "@/shared/lib/env";
import { AdminShell } from "@/shared/ui";
import { adminNav } from "./nav";

// Shell for the admin area. OWNER: infra (team lead).
// The menu lives in ./nav.tsx; a lane edits only its own lines there, through a PR the lead
// approves. Keep this file free of data access outside <Suspense>.

/**
 * Redirects non-admins away. A layout is NOT a security boundary — it does not re-run on
 * every navigation — so each page, query and Server Action must still authorize itself.
 */
async function AdminGate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}

/** Name and role only: no phone number or other personal field reaches the top bar. */
async function AdminUser() {
  const user = await getCurrentUser();
  // A non-admin is about to be redirected by AdminGate: never label them as an admin.
  if (!user || user.role !== "ADMIN") return null;
  return (
    <div className="min-w-0 leading-tight">
      <p className="truncate text-small">
        {user.firstName} {user.lastName}
      </p>
      <p className="text-micro text-fg-muted">ผู้ดูแลระบบ</p>
    </div>
  );
}

/** Names a non-production deployment in the footer; production shows nothing. */
function environmentLabel(): string | undefined {
  const appEnv = env().APP_ENV;
  return appEnv === "production" ? undefined : appEnv;
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AdminShell
      brand="Brain9"
      roleLabel="ผู้ดูแล"
      nav={adminNav}
      environmentLabel={environmentLabel()}
      user={
        <Suspense fallback={null}>
          <AdminUser />
        </Suspense>
      }
    >
      <Suspense fallback={<p className="text-body text-fg-2">กำลังตรวจสอบสิทธิ์…</p>}>
        <AdminGate>{children}</AdminGate>
      </Suspense>
    </AdminShell>
  );
}
