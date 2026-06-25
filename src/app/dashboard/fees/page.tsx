import { Wallet, CheckCircle2, AlertCircle, CalendarClock, Download } from "lucide-react";
import { requireStudent } from "@/lib/session";
import { getFeeSummary } from "@/lib/queries";
import { formatINR, formatDate, cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FeeStatusBadge } from "@/components/fees/fee-status-badge";

export default async function FeesPage() {
  const user = await requireStudent();
  const fees = await getFeeSummary(user.id);

  return (
    <div>
      <PageHeader
        title="My fees"
        description="Installment breakdown and payment history."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total fee" value={formatINR(fees.total)} icon={Wallet} />
        <StatCard
          label="Paid"
          value={formatINR(fees.paid)}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Pending"
          value={formatINR(fees.pending)}
          icon={AlertCircle}
          tone={fees.pending > 0 ? "warning" : "success"}
        />
        <StatCard
          label="Next due"
          value={fees.nextDue ? formatDate(fees.nextDue.dueDate) : "—"}
          icon={CalendarClock}
          hint={fees.nextDue ? formatINR(fees.nextDue.amount) : "All cleared"}
        />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Installments</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {/* Desktop table */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid on</TableHead>
                  <TableHead className="text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.records.map((r) => (
                  <TableRow
                    key={r.id}
                    className={cn(
                      r.status === "OVERDUE" && "bg-destructive/5",
                      r.status === "PENDING" && "bg-warning/5"
                    )}
                  >
                    <TableCell className="font-medium">{r.installment}</TableCell>
                    <TableCell>{formatDate(r.dueDate)}</TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {formatINR(r.amount)}
                    </TableCell>
                    <TableCell>
                      <FeeStatusBadge status={r.status} />
                    </TableCell>
                    <TableCell>
                      {r.paidOn ? formatDate(r.paidOn) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.status === "PAID" ? (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={r.receiptUrl ?? "#"} download>
                            <Download className="h-4 w-4" /> PDF
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y sm:hidden">
            {fees.records.map((r) => (
              <li key={r.id} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Installment {r.installment}</span>
                  <FeeStatusBadge status={r.status} />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1 text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-right font-mono tabular-nums">
                    {formatINR(r.amount)}
                  </span>
                  <span className="text-muted-foreground">Due</span>
                  <span className="text-right">{formatDate(r.dueDate)}</span>
                  {r.paidOn && (
                    <>
                      <span className="text-muted-foreground">Paid on</span>
                      <span className="text-right">{formatDate(r.paidOn)}</span>
                    </>
                  )}
                </div>
                {r.status === "PAID" && (
                  <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                    <a href={r.receiptUrl ?? "#"} download>
                      <Download className="h-4 w-4" /> Download receipt
                    </a>
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
