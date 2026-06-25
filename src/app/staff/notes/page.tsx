import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { StaffNotesManager } from "@/components/notes/staff-notes-manager";
import type { NoteItem } from "@/components/notes/notes-browser";

export default async function StaffNotesPage() {
  await requireStaff();
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
        title="Manage notes"
        description="Upload study material and remove outdated files."
      />
      <StaffNotesManager notes={items} />
    </div>
  );
}
