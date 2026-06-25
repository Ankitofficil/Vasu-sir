// Single source of truth for CBSE Accountancy chapters (Class 11 & 12).
// chapterId is a stable slug used across questions, notes, quizzes and leaderboard.

export interface Chapter {
  id: string;
  name: string;
  classOf: 11 | 12;
  part?: string;
}

export const CLASS_11_CHAPTERS: Chapter[] = [
  { id: "11-01-introduction", name: "Introduction to Accounting", classOf: 11 },
  { id: "11-02-theory-base", name: "Theory Base of Accounting", classOf: 11 },
  { id: "11-03-journal", name: "Recording of Transactions – I (Journal)", classOf: 11 },
  { id: "11-04-ledger-cashbook", name: "Recording of Transactions – II (Ledger, Cash Book)", classOf: 11 },
  { id: "11-05-brs", name: "Bank Reconciliation Statement", classOf: 11 },
  { id: "11-06-trial-balance", name: "Trial Balance and Rectification of Errors", classOf: 11 },
  { id: "11-07-depreciation", name: "Depreciation, Provisions and Reserves", classOf: 11 },
  { id: "11-08-bills-of-exchange", name: "Bills of Exchange", classOf: 11 },
  { id: "11-09-financial-statements-1", name: "Financial Statements – I (without adjustments)", classOf: 11 },
  { id: "11-10-financial-statements-2", name: "Financial Statements – II (with adjustments)", classOf: 11 },
  { id: "11-11-incomplete-records", name: "Accounts from Incomplete Records", classOf: 11 },
  { id: "11-12-computers-accounting", name: "Applications of Computers in Accounting", classOf: 11 },
  { id: "11-13-computerised-accounting", name: "Computerised Accounting System", classOf: 11 },
];

export const CLASS_12_CHAPTERS: Chapter[] = [
  { id: "12-01-partnership-basics", name: "Accounting for Partnership: Basic Concepts", classOf: 12, part: "Part A" },
  { id: "12-02-change-psr", name: "Reconstitution — Change in Profit-Sharing Ratio", classOf: 12, part: "Part A" },
  { id: "12-03-admission", name: "Reconstitution — Admission of a Partner", classOf: 12, part: "Part A" },
  { id: "12-04-retirement-death", name: "Reconstitution — Retirement / Death of a Partner", classOf: 12, part: "Part A" },
  { id: "12-05-dissolution", name: "Dissolution of Partnership Firm", classOf: 12, part: "Part A" },
  { id: "12-06-share-capital", name: "Accounting for Share Capital", classOf: 12, part: "Part A" },
  { id: "12-07-debentures", name: "Issue and Redemption of Debentures", classOf: 12, part: "Part A" },
  { id: "12-08-company-financial-statements", name: "Financial Statements of a Company", classOf: 12, part: "Part B" },
  { id: "12-09-analysis-financial-statements", name: "Analysis of Financial Statements", classOf: 12, part: "Part B" },
  { id: "12-10-accounting-ratios", name: "Accounting Ratios", classOf: 12, part: "Part B" },
  { id: "12-11-cash-flow", name: "Cash Flow Statement", classOf: 12, part: "Part B" },
];

export const ALL_CHAPTERS: Chapter[] = [
  ...CLASS_11_CHAPTERS,
  ...CLASS_12_CHAPTERS,
];

export function chaptersForClass(classOf: number): Chapter[] {
  return classOf === 11 ? CLASS_11_CHAPTERS : CLASS_12_CHAPTERS;
}

export function getChapter(chapterId: string): Chapter | undefined {
  return ALL_CHAPTERS.find((c) => c.id === chapterId);
}

export function chapterName(chapterId: string | null | undefined): string {
  if (!chapterId) return "Mixed (all chapters)";
  return getChapter(chapterId)?.name ?? chapterId;
}
