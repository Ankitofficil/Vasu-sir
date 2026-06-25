import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export async function getSession() {
  return getServerSession(authOptions);
}

/** Require a logged-in student; redirect otherwise. Returns the session user. */
export async function requireStudent() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/staff");
  return session.user;
}

/** Require any logged-in user (either role). Used for shared pages. */
export async function requireUser() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return session.user;
}

/** Require a logged-in staff member; redirect otherwise. */
export async function requireStaff() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STAFF") redirect("/dashboard");
  return session.user;
}
