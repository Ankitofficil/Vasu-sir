// String-union "enums" — since SQLite can't store Prisma native enums, these are
// the canonical allowed values and are enforced in zod schemas / app logic.

export const ROLES = ["STUDENT", "STAFF"] as const;
export type Role = (typeof ROLES)[number];

export const ATT_STATUSES = ["PRESENT", "ABSENT", "HOLIDAY"] as const;
export type AttStatus = (typeof ATT_STATUSES)[number];

export const FEE_STATUSES = ["PAID", "PENDING", "OVERDUE"] as const;
export type FeeStatus = (typeof FEE_STATUSES)[number];

export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const NOTE_TAGS = ["NOTES", "WORKSHEET", "PYQ", "REFERENCE"] as const;
export type NoteTag = (typeof NOTE_TAGS)[number];

export const NOTE_TAG_LABEL: Record<NoteTag, string> = {
  NOTES: "Notes",
  WORKSHEET: "Worksheet",
  PYQ: "Previous-Year Paper",
  REFERENCE: "Reference",
};
