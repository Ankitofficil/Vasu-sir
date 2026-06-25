import {
  LayoutDashboard,
  CalendarCheck,
  FileText,
  Wallet,
  ListChecks,
  Trophy,
  Users,
  Database,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Show in the mobile bottom bar (max 5). */
  primary?: boolean;
}

export const STUDENT_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, primary: true },
  { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck, primary: true },
  { href: "/dashboard/notes", label: "Notes", icon: FileText, primary: true },
  { href: "/dashboard/quiz", label: "Quiz", icon: ListChecks, primary: true },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy, primary: true },
  { href: "/dashboard/fees", label: "Fees", icon: Wallet },
];

export const STAFF_NAV: NavItem[] = [
  { href: "/staff", label: "Dashboard", icon: LayoutDashboard, primary: true },
  { href: "/staff/attendance", label: "Attendance", icon: CalendarCheck, primary: true },
  { href: "/staff/students", label: "Students", icon: Users, primary: true },
  { href: "/staff/question-bank", label: "Questions", icon: Database, primary: true },
  { href: "/staff/notes", label: "Notes", icon: FileText, primary: true },
  { href: "/staff/fees", label: "Fees", icon: Wallet },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
];
