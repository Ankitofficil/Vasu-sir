import { requireStudent } from "@/lib/session";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { NotesBrowser, type NoteItem } from "@/components/notes/notes-browser";

export default async function NotesPage() {
  await requireStudent();

  const notes = await prisma.noteMaterial.findMany({
    orderBy: { createdAt: "desc" },
  });

  const items: NoteItem[] = notes.map((n) => ({
    id: n.id,
    title: n.title,
    description: n.description,
    classOf: n.classOf,
    chapterId: n.chapterId,
    tag: n.tag,
    fileUrl: n.fileUrl,
    fileType: n.fileType,
    sizeKb: n.sizeKb,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div>
      <PageHeader
        title="Notes & study material"
        description="Browse chapter-wise notes, worksheets and previous-year papers."
      />
      <NotesBrowser notes={items} />
    </div>
  );
}
