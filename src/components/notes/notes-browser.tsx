"use client";

import * as React from "react";
import {
  Search,
  Download,
  FileText,
  FileSpreadsheet,
  FileQuestion,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { NOTE_TAG_LABEL, type NoteTag } from "@/lib/enums";
import { chapterName } from "@/lib/chapters";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/empty-state";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export interface NoteItem {
  id: string;
  title: string;
  description: string | null;
  classOf: number;
  chapterId: string;
  tag: string;
  fileUrl: string;
  fileType: string;
  sizeKb: number;
  createdAt: string;
}

const TAG_ICON: Record<NoteTag, typeof FileText> = {
  NOTES: FileText,
  WORKSHEET: FileSpreadsheet,
  PYQ: FileQuestion,
  REFERENCE: BookOpen,
};

const TAGS: (NoteTag | "ALL")[] = ["ALL", "NOTES", "WORKSHEET", "PYQ", "REFERENCE"];

function NotesList({
  notes,
  search,
  tag,
}: {
  notes: NoteItem[];
  search: string;
  tag: NoteTag | "ALL";
}) {
  const filtered = notes.filter((n) => {
    const matchesTag = tag === "ALL" || n.tag === tag;
    const haystack = `${n.title} ${chapterName(n.chapterId)}`.toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    return matchesTag && matchesSearch;
  });

  // Group by chapter
  const byChapter = new Map<string, NoteItem[]>();
  for (const n of filtered) {
    const arr = byChapter.get(n.chapterId) ?? [];
    arr.push(n);
    byChapter.set(n.chapterId, arr);
  }

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="No material found"
        description="Nothing matches your search or filters here. Try clearing the filter or switching class."
      />
    );
  }

  return (
    <div className="space-y-5">
      {Array.from(byChapter.entries()).map(([chapterId, items]) => (
        <div key={chapterId}>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <ChevronRight className="h-4 w-4" />
            {chapterName(chapterId)}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((n) => {
              const Icon = TAG_ICON[n.tag as NoteTag] ?? FileText;
              return (
                <Card
                  key={n.id}
                  className="group relative transition-colors hover:border-primary/40"
                >
                  <CardContent className="flex items-start gap-3 p-4">
                    {/* Whole card is the download affordance; icon button is a
                        secondary, explicit hit target. */}
                    <a
                      href={n.fileUrl}
                      download
                      className="absolute inset-0 rounded-[inherit]"
                      aria-label={`Download ${n.title}`}
                    />
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{n.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <Badge variant="secondary">
                          {NOTE_TAG_LABEL[n.tag as NoteTag] ?? n.tag}
                        </Badge>
                        <span className="uppercase">{n.fileType}</span>
                        <span>· {(n.sizeKb / 1024).toFixed(1)} MB</span>
                        <span>· {formatDate(n.createdAt)}</span>
                      </div>
                    </div>
                    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors group-hover:text-primary">
                      <Download className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotesBrowser({ notes }: { notes: NoteItem[] }) {
  const [search, setSearch] = React.useState("");
  const [tag, setTag] = React.useState<NoteTag | "ALL">("ALL");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes or chapters…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={cn(
                "h-9 rounded-full border px-3 text-xs font-medium transition-colors",
                tag === t
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-body hover:bg-hover"
              )}
            >
              {t === "ALL" ? "All" : NOTE_TAG_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="11">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-grid">
          <TabsTrigger value="11">Class 11</TabsTrigger>
          <TabsTrigger value="12">Class 12</TabsTrigger>
        </TabsList>
        <TabsContent value="11">
          <NotesList
            notes={notes.filter((n) => n.classOf === 11)}
            search={search}
            tag={tag}
          />
        </TabsContent>
        <TabsContent value="12">
          <NotesList
            notes={notes.filter((n) => n.classOf === 12)}
            search={search}
            tag={tag}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
