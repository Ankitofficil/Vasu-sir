"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Menu } from "lucide-react";
import { STUDENT_NAV, STAFF_NAV, type NavItem } from "@/lib/nav";
import { cn, initials } from "@/lib/utils";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PageTransition } from "@/components/motion/page-transition";

interface AppShellProps {
  /** Which nav set to render. Icons can't cross the server→client boundary, so
   *  the client resolves them from a key rather than receiving components. */
  navKey: "STUDENT" | "STAFF";
  user: { name?: string | null; email?: string | null; role: string; subtitle?: string };
  children: React.ReactNode;
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard" || href === "/staff") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({ navKey, user, children }: AppShellProps) {
  const pathname = usePathname();
  const nav: NavItem[] = navKey === "STAFF" ? STAFF_NAV : STUDENT_NAV;
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Close the mobile drawer whenever the route changes.
  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center border-b px-5">
          <Brand href={user.role === "STAFF" ? "/staff" : "/dashboard"} />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-hover hover:text-hover-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen flex-col md:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="-ml-1 flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-hover"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Brand
              href={user.role === "STAFF" ? "/staff" : "/dashboard"}
              compact
            />
          </div>
          <div className="hidden text-sm font-medium text-muted-foreground md:block">
            {user.subtitle}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="flex items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                  {initials(user.name ?? "U")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden leading-tight sm:block">
                <p className="text-xs font-semibold">{user.name}</p>
                <p className="text-[10px] uppercase text-muted-foreground">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* Mobile slide-out drawer (hamburger menu) — opened by the topbar button. */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="flex w-72 flex-col p-0">
          <SheetHeader className="border-b p-5">
            <SheetTitle className="text-left">
              <Brand href={user.role === "STAFF" ? "/staff" : "/dashboard"} />
            </SheetTitle>
          </SheetHeader>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-hover hover:text-hover-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                </SheetClose>
              );
            })}
          </nav>

          <div className="border-t p-3">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
