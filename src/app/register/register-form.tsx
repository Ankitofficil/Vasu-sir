"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const schema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  rollNo: z.string().min(1, "Roll number is required"),
  classOf: z.enum(["11", "12"]),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { classOf: "11" },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
        rollNo: values.rollNo,
        classOf: Number(values.classOf),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setServerError(data.error ?? "Registration failed. Please try again.");
      setLoading(false);
      return;
    }

    setDone(true);
    // Auto sign-in then redirect to dashboard.
    await signIn("credentials", {
      email: values.email,
      password: values.password,
      role: "STUDENT",
      redirect: false,
    });
    router.push("/dashboard");
    router.refresh();
  }

  if (done) {
    return (
      <Card className="border-white/40 bg-card/80 shadow-elevated backdrop-blur-xl dark:border-white/10">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle2 className="h-12 w-12 text-success" />
          <p className="font-medium">Account created!</p>
          <p className="text-sm text-muted-foreground">
            Signing you in as {getValues("name")}…
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/40 bg-card/80 shadow-elevated backdrop-blur-xl dark:border-white/10">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" placeholder="Aarav Gupta" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rollNo">Roll number</Label>
              <Input id="rollNo" placeholder="11-09" {...register("rollNo")} />
              {errors.rollNo && (
                <p className="text-xs text-destructive">
                  {errors.rollNo.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="classOf">Class</Label>
              <Select id="classOf" {...register("classOf")}>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
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
            Create account
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
