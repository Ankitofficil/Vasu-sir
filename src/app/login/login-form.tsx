"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Users, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

type RoleTab = "STUDENT" | "STAFF";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [role, setRole] = React.useState<RoleTab>("STUDENT");
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      role,
      redirect: false,
    });
    setLoading(false);

    if (!res || res.error) {
      setServerError(
        "Invalid email or password for the selected role. Please try again."
      );
      return;
    }
    const callbackUrl = params.get("callbackUrl");
    router.push(callbackUrl ?? (role === "STAFF" ? "/staff" : "/dashboard"));
    router.refresh();
  }

  return (
    <Card className="border-white/40 bg-card/80 shadow-elevated backdrop-blur-xl dark:border-white/10">
      <CardContent className="pt-6">
        {/* Role toggle pill */}
        <div
          role="tablist"
          aria-label="Select role"
          className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
        >
          {(
            [
              { key: "STUDENT", label: "Student", icon: GraduationCap },
              { key: "STAFF", label: "Staff", icon: Users },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={role === key}
              onClick={() => setRole(key)}
              className={cn(
                "flex h-10 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
                role === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@coach.local"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input accent-[hsl(var(--primary))]"
                {...register("remember")}
              />
              Remember me
            </label>
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() =>
                setServerError(
                  "Please contact your institute to reset your password."
                )
              }
            >
              Forgot password?
            </button>
          </div>

          {serverError && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {serverError}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in as {role === "STAFF" ? "Staff" : "Student"}
          </Button>
        </form>

        <div className="mt-5 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Demo accounts</p>
          <p>Staff — admin@coach.local / admin123</p>
          <p>Student — aarav@coach.local / student123</p>
        </div>
      </CardContent>
    </Card>
  );
}
