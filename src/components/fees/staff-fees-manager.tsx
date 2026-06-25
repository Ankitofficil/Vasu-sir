"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, Plus, Loader2 } from "lucide-react";
import { formatINR, formatDate } from "@/lib/utils";
import { toast } from "@/stores/toastStore";
import { FEE_STATUSES, type FeeStatus } from "@/lib/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FeeStatusBadge } from "./fee-status-badge";

export interface StudentFees {
  id: string;
  name: string;
  rollNo: string | null;
  classOf: number | null;
  records: {
    id: string;
    installment: number;
    amount: number;
    dueDate: string;
    paidOn: string | null;
    status: string;
  }[];
}

export function StaffFeesManager({ students }: { students: StudentFees[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function updateStatus(id: string, status: FeeStatus) {
    setBusyId(id);
    const res = await fetch("/api/fees", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setBusyId(null);
    if (!res.ok) {
      toast.error("Could not update fee status", {
        description: "Please try again.",
      });
      return;
    }
    toast.success(`Marked as ${status.toLowerCase()}`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {students.map((s) => {
        const pending = s.records
          .filter((r) => r.status !== "PAID")
          .reduce((acc, r) => acc + r.amount, 0);
        return (
          <Card key={s.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{s.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Class {s.classOf} · Roll {s.rollNo} ·{" "}
                  <span className="font-mono">{formatINR(pending)}</span> pending
                </p>
              </div>
              <div className="flex gap-2">
                <AddInstallmentDialog
                  studentId={s.id}
                  nextInstallment={s.records.length + 1}
                  onAdded={() => router.refresh()}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast.success("Reminder sent", {
                      description: `${s.name} was notified. (demo)`,
                    })
                  }
                  disabled={pending === 0}
                >
                  <Bell className="h-4 w-4" /> Remind
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {s.records.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">#{r.installment}</span>
                      <span className="font-mono tabular-nums">
                        {formatINR(r.amount)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        due {formatDate(r.dueDate)}
                      </span>
                      <FeeStatusBadge status={r.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={r.status}
                        onChange={(e) =>
                          updateStatus(r.id, e.target.value as FeeStatus)
                        }
                        className="h-9 w-32"
                        disabled={busyId === r.id}
                      >
                        {FEE_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st.charAt(0) + st.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </Select>
                      {busyId === r.id && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function AddInstallmentDialog({
  studentId,
  nextInstallment,
  onAdded,
}: {
  studentId: string;
  nextInstallment: number;
  onAdded: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState("6000");
  const [dueDate, setDueDate] = React.useState(
    new Date().toISOString().slice(0, 10)
  );
  const [saving, setSaving] = React.useState(false);

  async function submit() {
    setSaving(true);
    const res = await fetch("/api/fees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        installment: nextInstallment,
        amount: Math.round(Number(amount) * 100), // rupees → paise
        dueDate,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not add installment", {
        description: "Please try again.",
      });
      return;
    }
    setOpen(false);
    toast.success("Installment added");
    onAdded();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4" /> Installment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add installment #{nextInstallment}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="amt">Amount (₹)</Label>
            <Input
              id="amt"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="due">Due date</Label>
            <Input
              id="due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Add installment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
