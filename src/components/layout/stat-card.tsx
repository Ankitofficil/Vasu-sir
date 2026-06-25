import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { HoverLift } from "@/components/motion/hover-lift";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "success" | "danger" | "warning";
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "border bg-muted text-foreground",
  success: "border border-success/20 bg-success/10 text-success",
  danger: "border border-destructive/20 bg-destructive/10 text-destructive",
  warning: "border border-warning/20 bg-warning/10 text-warning",
};

// Server component: the Lucide `icon` (a function) is rendered here, never
// passed across the server→client boundary. Motion lives in <HoverLift>.
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
}: StatCardProps) {
  return (
    <HoverLift>
      <Card className="transition-colors hover:border-foreground/20">
        <CardContent className="flex items-center gap-4 p-4 sm:p-5">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
              toneClasses[tone]
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm text-body">{label}</p>
            <p className="font-mono text-xl font-bold tabular-nums text-foreground sm:text-2xl">
              {value}
            </p>
            {hint && (
              <p className="truncate text-xs text-muted-foreground">{hint}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </HoverLift>
  );
}
