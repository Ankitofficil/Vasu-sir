import Link from "next/link";
import { Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({
  href = "/",
  className,
  compact = false,
}: {
  href?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 font-semibold", className)}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Calculator className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-tight">
          <span className="text-base font-bold tracking-tight">Vasu Sir</span>
          <span className="text-[11px] font-medium text-muted-foreground">
            Accountancy Coaching
          </span>
        </span>
      )}
    </Link>
  );
}
