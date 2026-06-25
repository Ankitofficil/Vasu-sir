import { requireStaff } from "@/lib/session";
import { AppShell } from "@/components/layout/app-shell";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStaff();
  return (
    <AppShell
      navKey="STAFF"
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        subtitle: "Staff portal",
      }}
    >
      {children}
    </AppShell>
  );
}
