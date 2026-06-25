import { requireUser } from "@/lib/session";
import { AppShell } from "@/components/layout/app-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware allows staff onto /dashboard/leaderboard only; all other
  // /dashboard/* paths are student-only and already gated there.
  const user = await requireUser();
  const isStaff = user.role === "STAFF";
  return (
    <AppShell
      navKey={isStaff ? "STAFF" : "STUDENT"}
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        subtitle: isStaff
          ? "Staff portal"
          : `Class ${user.classOf} · Roll ${user.rollNo}`,
      }}
    >
      {children}
    </AppShell>
  );
}
