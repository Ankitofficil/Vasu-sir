import Link from "next/link";
import {
  CalendarCheck,
  FileText,
  ListChecks,
  Trophy,
  Wallet,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  { icon: CalendarCheck, title: "Attendance Tracking", desc: "Daily attendance with month-wise calendars and live percentage." },
  { icon: FileText, title: "Notes & Material", desc: "Chapter-wise notes, worksheets and previous-year papers to download." },
  { icon: ListChecks, title: "MCQ Quiz Engine", desc: "Chapter quizzes from a built-in CBSE Accountancy question bank." },
  { icon: Trophy, title: "Leaderboard", desc: "Class-wise rankings that update as you take quizzes." },
  { icon: Wallet, title: "Fee Status", desc: "Installment breakdown, due dates and downloadable receipts." },
  { icon: Users, title: "Staff Console", desc: "Mark attendance, manage students, fees and the question bank." },
];

const stats = [
  { value: "24", label: "Chapters covered" },
  { value: "11–12", label: "CBSE classes" },
  { value: "AI", label: "Question generation" },
  { value: "100%", label: "Mobile friendly" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Brand />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b bg-muted/30">
          <div className="container py-20 sm:py-24">
            <FadeIn className="mx-auto max-w-3xl text-center">
              <span className="eyebrow inline-flex items-center rounded-full border border-accent/40 bg-background px-3 py-1 text-xs">
                CBSE Class 11 &amp; 12 · Accountancy
              </span>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
                Master Accountancy with Vasu Sir
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
                One platform for attendance, notes, fees, chapter-wise MCQ quizzes
                and a live leaderboard. Built for students and staff.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" variant="accent" asChild className="w-full sm:w-auto">
                  <Link href="/register">
                    Start learning <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto"
                >
                  <Link href="/login">I already have an account</Link>
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {["Built-in question bank", "Mobile friendly", "Dark mode"].map(
                  (t) => (
                    <span key={t} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      {t}
                    </span>
                  )
                )}
              </div>
            </FadeIn>

            {/* Stat band */}
            <Stagger className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <StaggerItem key={s.label}>
                  <div className="rounded-lg border bg-card p-4 text-center">
                    <p className="text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
                      {s.value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/40 py-20">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Everything your institute needs
              </h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                One connected workspace for students and staff — no spreadsheets.
              </p>
            </div>
            <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <StaggerItem key={f.title} className="h-full">
                    <Card className="h-full transition-colors hover:border-foreground/20">
                      <CardContent className="p-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg border bg-muted text-foreground">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="mt-4 font-semibold">{f.title}</h3>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                          {f.desc}
                        </p>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <Brand />
          <p>© {new Date().getFullYear()} Vasu Sir Accountancy Coaching.</p>
        </div>
      </footer>
    </div>
  );
}
