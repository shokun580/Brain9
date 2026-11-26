import { Suspense } from "react";
import { getCurrentUser, requireAdmin } from "@/modules/identity";
import { env } from "@/shared/lib/env";
import { AdminPageSkeleton, AdminShell, SkeletonLine, SkeletonRegion } from "@/shared/ui";
import { adminNav } from "./nav";

// Shell for the admin area. OWNER: infra (team lead).
// The menu lives in ./nav.tsx; a lane edits only its own lines there, through a PR the lead
// approves. Keep this file free of data access outside <Suspense>.

/**
 * Answers "not found" to anyone who is not an admin. A layout is NOT a security boundary — it
 * does not re-run on every navigation — so each page, query and Server Action must still
 * authorize itself.
 */
async function AdminGate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}

/** Name and role only: no phone number or other personal field reaches the top bar. */
async function AdminUser() {
  const user = await getCurrentUser();
  // A non-admin is about to get "not found" from AdminGate: never label them as an admin.
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

/**
 * Sized like the name (text-small) and the role line (text-micro) of `AdminUser`. The shell
 * mounts the user slot outside the page area, so this is its own status region: it is
 * announced next to the gate's skeleton, but each says a different thing (user, page).
 */
function AdminUserSkeleton() {
  return (
    <SkeletonRegion label="กำลังโหลดชื่อผู้ใช้">
      <div className="w-32 leading-tight">
        <SkeletonLine text="small" width="full" />
        <SkeletonLine text="micro" width="md" />
      </div>
    </SkeletonRegion>
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
      // TODO(infra): pass `signOutAction={signOutAction}` (import it from "@/modules/identity")
      // when issue #23 exports it. The shell draws "ออกจากระบบ" in the top bar only when the
      // action is given, so until then there is no sign-out control in the admin area.
      user={
        <Suspense fallback={<AdminUserSkeleton />}>
          <AdminUser />
        </Suspense>
      }
    >
      <Suspense fallback={<AdminPageSkeleton />}>
        <AdminGate>{children}</AdminGate>
      </Suspense>
    </AdminShell>
  );
}
