"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Check,
  Search,
  Sparkles,
  X,
  UploadCloud,
} from "lucide-react";
import {
  CLASS_11_CHAPTERS,
  CLASS_12_CHAPTERS,
  chapterName,
} from "@/lib/chapters";
import { DIFFICULTIES, type Difficulty } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { toast } from "@/stores/toastStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export interface BankQuestion {
  id: string;
  classOf: number;
  chapterId: string;
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: string;
  explanation: string;
  marks: number;
}

const DIFF_VARIANT: Record<Difficulty, "success" | "warning" | "destructive"> = {
  EASY: "success",
  MEDIUM: "warning",
  HARD: "destructive",
};

const emptyForm = {
  classOf: 11 as 11 | 12,
  chapterId: CLASS_11_CHAPTERS[0].id,
  question: "",
  options: ["", "", "", ""] as string[],
  correctIndex: 0,
  difficulty: "EASY" as Difficulty,
  explanation: "",
  marks: 1,
};

export function QuestionBank({ questions }: { questions: BankQuestion[] }) {
  const router = useRouter();
  const [classFilter, setClassFilter] = React.useState<"11" | "12">("11");
  const [chapterFilter, setChapterFilter] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState("");
  const [editing, setEditing] = React.useState<BankQuestion | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);

  const chapters = classFilter === "11" ? CLASS_11_CHAPTERS : CLASS_12_CHAPTERS;

  const filtered = questions.filter((q) => {
    if (String(q.classOf) !== classFilter) return false;
    if (chapterFilter !== "ALL" && q.chapterId !== chapterFilter) return false;
    if (search && !q.question.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  async function remove(id: string) {
    const res = await fetch(`/api/questions?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete question", {
        description: "Please try again.",
      });
      return;
    }
    toast.success("Question deleted");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={classFilter}
          onChange={(e) => {
            setClassFilter(e.target.value as "11" | "12");
            setChapterFilter("ALL");
          }}
          className="sm:w-36"
        >
          <option value="11">Class 11</option>
          <option value="12">Class 12</option>
        </Select>
        <Select
          value={chapterFilter}
          onChange={(e) => setChapterFilter(e.target.value)}
          className="sm:flex-1"
        >
          <option value="ALL">All chapters</option>
          {chapters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <div className="relative sm:w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search question…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setGenerating(true)}
          className="shrink-0"
        >
          <Sparkles className="h-4 w-4" /> Generate with AI
        </Button>
        <Button
          variant="accent"
          onClick={() => setCreating(true)}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" /> Add MCQ
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} question{filtered.length === 1 ? "" : "s"}
      </p>

      <div className="space-y-3">
        {filtered.map((q) => (
          <Card key={q.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <Badge variant={DIFF_VARIANT[q.difficulty as Difficulty]}>
                      {q.difficulty}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {chapterName(q.chapterId)} · {q.marks} mark
                    </span>
                  </div>
                  <p className="font-medium">{q.question}</p>
                  <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                    {q.options.map((opt, i) => (
                      <li
                        key={i}
                        className={cn(
                          "rounded-md border px-2.5 py-1.5 text-sm",
                          i === q.correctIndex
                            ? "border-success/40 bg-success/10 text-success"
                            : "text-muted-foreground"
                        )}
                      >
                        {i === q.correctIndex && (
                          <Check className="mr-1 inline h-3.5 w-3.5" />
                        )}
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit"
                    onClick={() => setEditing(q)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete"
                    onClick={() => remove(q.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No questions match. Add one to get started.
          </p>
        )}
      </div>

      {(creating || editing) && (
        <QuestionDialog
          initial={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            router.refresh();
          }}
        />
      )}

      {generating && (
        <GenerateDialog
          initialClass={classFilter}
          initialChapter={
            chapterFilter !== "ALL" ? chapterFilter : chapters[0].id
          }
          onClose={() => setGenerating(false)}
          onPublished={() => {
            setGenerating(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function QuestionDialog({
  initial,
  onClose,
  onSaved,
}: {
  initial: BankQuestion | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState(() =>
    initial
      ? {
          classOf: initial.classOf as 11 | 12,
          chapterId: initial.chapterId,
          question: initial.question,
          options: [...initial.options],
          correctIndex: initial.correctIndex,
          difficulty: initial.difficulty as Difficulty,
          explanation: initial.explanation,
          marks: initial.marks,
        }
      : emptyForm
  );
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const chapters = form.classOf === 11 ? CLASS_11_CHAPTERS : CLASS_12_CHAPTERS;

  function setOption(i: number, val: string) {
    setForm((f) => {
      const options = [...f.options];
      options[i] = val;
      return { ...f, options };
    });
  }

  async function save() {
    setError(null);
    if (form.question.trim().length < 5) {
      setError("Question is too short.");
      return;
    }
    if (form.options.some((o) => !o.trim())) {
      setError("All four options are required.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/questions", {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(initial ? { ...form, id: initial.id } : form),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const message = data.error ?? "Save failed.";
      setError(message);
      toast.error("Could not save question", { description: message });
      return;
    }
    toast.success(initial ? "Question updated" : "Question added to the bank");
    onSaved();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit MCQ" : "Add MCQ"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Class</Label>
              <Select
                value={form.classOf}
                onChange={(e) => {
                  const classOf = Number(e.target.value) as 11 | 12;
                  const list =
                    classOf === 11 ? CLASS_11_CHAPTERS : CLASS_12_CHAPTERS;
                  setForm((f) => ({
                    ...f,
                    classOf,
                    chapterId: list[0].id,
                  }));
                }}
              >
                <option value={11}>Class 11</option>
                <option value={12}>Class 12</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Select
                value={form.difficulty}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    difficulty: e.target.value as Difficulty,
                  }))
                }
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Chapter</Label>
            <Select
              value={form.chapterId}
              onChange={(e) =>
                setForm((f) => ({ ...f, chapterId: e.target.value }))
              }
            >
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Question</Label>
            <Textarea
              value={form.question}
              onChange={(e) =>
                setForm((f) => ({ ...f, question: e.target.value }))
              }
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Options (select the correct one)</Label>
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct"
                  checked={form.correctIndex === i}
                  onChange={() => setForm((f) => ({ ...f, correctIndex: i }))}
                  className="h-4 w-4 accent-[hsl(var(--success))]"
                  aria-label={`Mark option ${i + 1} correct`}
                />
                <Input
                  value={opt}
                  onChange={(e) => setOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                />
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label>Explanation</Label>
            <Textarea
              value={form.explanation}
              onChange={(e) =>
                setForm((f) => ({ ...f, explanation: e.target.value }))
              }
              rows={2}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {initial ? "Save changes" : "Add question"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface Draft {
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: Difficulty;
  explanation: string;
}

function GenerateDialog({
  initialClass,
  initialChapter,
  onClose,
  onPublished,
}: {
  initialClass: "11" | "12";
  initialChapter: string;
  onClose: () => void;
  onPublished: () => void;
}) {
  const [classOf, setClassOf] = React.useState<11 | 12>(
    Number(initialClass) as 11 | 12
  );
  const [chapterId, setChapterId] = React.useState(initialChapter);
  const [count, setCount] = React.useState("5");
  const [difficulty, setDifficulty] = React.useState<Difficulty | "MIXED">(
    "MIXED"
  );
  const [drafts, setDrafts] = React.useState<Draft[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const chapters = classOf === 11 ? CLASS_11_CHAPTERS : CLASS_12_CHAPTERS;

  React.useEffect(() => {
    if (!chapters.some((c) => c.id === chapterId)) {
      setChapterId(chapters[0].id);
    }
  }, [classOf]); // eslint-disable-line react-hooks/exhaustive-deps

  async function generate() {
    setLoading(true);
    setError(null);
    setDrafts(null);
    const res = await fetch("/api/questions/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classOf,
        chapterId,
        count: Number(count),
        difficulty,
      }),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Generation failed.");
      return;
    }
    setDrafts(data.questions as Draft[]);
  }

  function setCorrect(i: number, idx: number) {
    setDrafts((d) =>
      d
        ? d.map((q, qi) => (qi === i ? { ...q, correctIndex: idx } : q))
        : d
    );
  }

  function removeDraft(i: number) {
    setDrafts((d) => (d ? d.filter((_, qi) => qi !== i) : d));
  }

  async function publish() {
    if (!drafts || drafts.length === 0) return;
    setPublishing(true);
    setError(null);
    const res = await fetch("/api/questions/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classOf, chapterId, questions: drafts }),
    });
    setPublishing(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const message = data.error ?? "Publish failed.";
      setError(message);
      toast.error("Publish failed", { description: message });
      return;
    }
    const data = await res.json().catch(() => ({}));
    const n = data.published ?? drafts.length;
    toast.success(`Published ${n} question${n === 1 ? "" : "s"} to the bank`);
    onPublished();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate MCQs with AI
          </DialogTitle>
        </DialogHeader>

        {/* Config row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Class</Label>
            <Select
              value={classOf}
              onChange={(e) => setClassOf(Number(e.target.value) as 11 | 12)}
            >
              <option value={11}>Class 11</option>
              <option value={12}>Class 12</option>
            </Select>
          </div>
          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <Label>Count</Label>
            <Select value={count} onChange={(e) => setCount(e.target.value)}>
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </Select>
          </div>
          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <Label>Difficulty</Label>
            <Select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as Difficulty | "MIXED")
              }
            >
              <option value="MIXED">Mixed</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d.charAt(0) + d.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5 col-span-2 sm:col-span-4">
            <Label>Chapter</Label>
            <Select
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
            >
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <Button onClick={generate} disabled={loading} variant="outline">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {drafts ? "Regenerate" : "Generate drafts"}
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Review drafts */}
        {drafts && (
          <div className="max-h-[45vh] space-y-3 overflow-y-auto pr-1">
            <p className="text-xs text-muted-foreground">
              Review the {drafts.length} draft
              {drafts.length === 1 ? "" : "s"} below. Adjust the correct answer
              if needed, remove any you don&apos;t want, then publish to the
              bank.
            </p>
            {drafts.map((q, i) => (
              <div key={i} className="rounded-lg border p-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">
                    {i + 1}. {q.question}
                  </p>
                  <button
                    onClick={() => removeDraft(i)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove draft"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setCorrect(i, oi)}
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm",
                        oi === q.correctIndex
                          ? "border-success/40 bg-success/10 text-success"
                          : "hover:bg-hover"
                      )}
                    >
                      {oi === q.correctIndex && (
                        <Check className="h-3.5 w-3.5 shrink-0" />
                      )}
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                  <Badge variant={DIFF_VARIANT[q.difficulty]} className="shrink-0">
                    {q.difficulty}
                  </Badge>
                  <span>{q.explanation}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={publish}
            disabled={publishing || !drafts || drafts.length === 0}
          >
            {publishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            Publish {drafts?.length ? `${drafts.length} ` : ""}to bank
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
