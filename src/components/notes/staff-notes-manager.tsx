"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2, Loader2, FileText } from "lucide-react";
import { CLASS_11_CHAPTERS, CLASS_12_CHAPTERS, chapterName } from "@/lib/chapters";
import { NOTE_TAGS, NOTE_TAG_LABEL, type NoteTag } from "@/lib/enums";
import { formatDate } from "@/lib/utils";
import { toast } from "@/stores/toastStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { NoteItem } from "./notes-browser";

export function StaffNotesManager({ notes }: { notes: NoteItem[] }) {
  const router = useRouter();
  const [classOf, setClassOf] = React.useState<11 | 12>(11);
  const [chapterId, setChapterId] = React.useState(CLASS_11_CHAPTERS[0].id);
  const [tag, setTag] = React.useState<NoteTag>("NOTES");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [fileType, setFileType] = React.useState("pdf");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const chapters = classOf === 11 ? CLASS_11_CHAPTERS : CLASS_12_CHAPTERS;

  React.useEffect(() => {
    setChapterId(chapters[0].id);
  }, [classOf]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (title.trim().length < 2) {
      setError("Please enter a title.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        classOf,
        chapterId,
        tag,
        fileType,
        sizeKb: 300,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const message = data.error ?? "Upload failed.";
      setError(message);
      toast.error("Upload failed", { description: message });
      return;
    }
    toast.success("Material uploaded", { description: title });
    setTitle("");
    setDescription("");
    router.refresh();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete material", {
        description: "Please try again.",
      });
      return;
    }
    toast.success("Material deleted");
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <Card className="min-w-0 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-5 w-5 text-primary" />
            Upload material
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Journal Entries — Full Notes"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="class">Class</Label>
                <Select
                  id="class"
                  value={classOf}
                  onChange={(e) => setClassOf(Number(e.target.value) as 11 | 12)}
                >
                  <option value={11}>Class 11</option>
                  <option value={12}>Class 12</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tag">Tag</Label>
                <Select
                  id="tag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value as NoteTag)}
                >
                  {NOTE_TAGS.map((t) => (
                    <option key={t} value={t}>
                      {NOTE_TAG_LABEL[t]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="chapter">Chapter</Label>
              <Select
                id="chapter"
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="filetype">File type</Label>
                <Select
                  id="filetype"
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                >
                  <option value="pdf">PDF</option>
                  <option value="ppt">PPT</option>
                  <option value="video">Video link</option>
                </Select>
              </div>
              <div className="flex items-end">
                <Input type="file" disabled className="cursor-not-allowed" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Description (optional)</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Add material
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              File handling is stubbed in dev — a placeholder URL is stored.
            </p>
          </form>
        </CardContent>
      </Card>

      <Card className="min-w-0 lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-base">
            Uploaded material ({notes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {notes.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No material uploaded yet.
            </p>
          ) : (
            <ul className="divide-y">
              {notes.map((n) => (
                <li
                  key={n.id}
                  className="flex items-start gap-3 p-4"
                >
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{n.title}</p>
                    <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                      <Badge variant="secondary">Class {n.classOf}</Badge>
                      <span>{chapterName(n.chapterId)}</span>
                      <span>· {formatDate(n.createdAt)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete"
                    onClick={() => remove(n.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
