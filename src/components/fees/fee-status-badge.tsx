import { Badge } from "@/components/ui/badge";
import type { FeeStatus } from "@/lib/enums";

export function FeeStatusBadge({ status }: { status: string }) {
  const map: Record<FeeStatus, { variant: "success" | "warning" | "destructive"; label: string }> = {
    PAID: { variant: "success", label: "Paid" },
    PENDING: { variant: "warning", label: "Pending" },
    OVERDUE: { variant: "destructive", label: "Overdue" },
  };
  const cfg = map[status as FeeStatus] ?? { variant: "warning" as const, label: status };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
