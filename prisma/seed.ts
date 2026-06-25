import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedQuestions } from "../scripts/seed-questions";
import { CLASS_11_CHAPTERS, CLASS_12_CHAPTERS } from "../src/lib/chapters";
import { computePoints } from "../src/lib/scoring";

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  // ---- Reset (order matters due to FKs) ----
  await prisma.quizAttempt.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.feeRecord.deleteMany();
  await prisma.noteMaterial.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // ---- Staff ----
  const admin = await prisma.user.create({
    data: {
      email: "admin@coach.local",
      passwordHash: hash("admin123"),
      name: "Admin (Vasu Sir)",
      role: "STAFF",
    },
  });

  await prisma.user.create({
    data: {
      email: "staff@coach.local",
      passwordHash: hash("staff123"),
      name: "Priya Sharma",
      role: "STAFF",
    },
  });

  // ---- Students ----
  const studentSeed = [
    { name: "Aarav Gupta", email: "aarav@coach.local", classOf: 11, rollNo: "11-01" },
    { name: "Diya Mehta", email: "diya@coach.local", classOf: 11, rollNo: "11-02" },
    { name: "Kabir Singh", email: "kabir@coach.local", classOf: 12, rollNo: "12-01" },
    { name: "Ananya Rao", email: "ananya@coach.local", classOf: 12, rollNo: "12-02" },
    { name: "Vihaan Joshi", email: "vihaan@coach.local", classOf: 12, rollNo: "12-03" },
  ];

  const students = [];
  for (const s of studentSeed) {
    const u = await prisma.user.create({
      data: {
        email: s.email,
        passwordHash: hash("student123"),
        name: s.name,
        role: "STUDENT",
        classOf: s.classOf,
        rollNo: s.rollNo,
      },
    });
    students.push(u);
  }

  // ---- Attendance: last 30 weekdays per student ----
  for (const student of students) {
    let day = 0;
    let created = 0;
    while (created < 24) {
      const date = daysAgo(day);
      day++;
      const dow = date.getDay();
      if (dow === 0) continue; // skip Sundays (no class)
      // ~10% holidays, ~12% absent, rest present
      const r = Math.random();
      const status = r < 0.08 ? "HOLIDAY" : r < 0.2 ? "ABSENT" : "PRESENT";
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          date,
          status,
          classOf: student.classOf!,
          markedBy: admin.id,
        },
      });
      created++;
    }
  }

  // ---- Fees: 4 installments of ₹6,000 each (in paise) per student ----
  const installmentPaise = 600000; // ₹6,000
  for (const student of students) {
    const schedule = [
      { installment: 1, due: daysAgo(120), status: "PAID", paidOn: daysAgo(118) },
      { installment: 2, due: daysAgo(60), status: "PAID", paidOn: daysAgo(58) },
      { installment: 3, due: daysAgo(5), status: "OVERDUE", paidOn: null },
      { installment: 4, due: daysFromNow(55), status: "PENDING", paidOn: null },
    ] as const;
    // Make one student fully paid for variety
    const fullyPaid = student.rollNo === "11-02";
    for (const f of schedule) {
      const paid = fullyPaid || f.status === "PAID";
      await prisma.feeRecord.create({
        data: {
          studentId: student.id,
          installment: f.installment,
          amount: installmentPaise,
          dueDate: f.due,
          status: paid ? "PAID" : f.status,
          paidOn: paid ? (f.paidOn ?? daysAgo(2)) : null,
          receiptUrl: paid ? `/uploads/receipts/${student.rollNo}-${f.installment}.pdf` : null,
        },
      });
    }
  }

  // ---- Notes: a few per class ----
  const noteSeed = [
    { classOf: 11, chapter: CLASS_11_CHAPTERS[0], tag: "NOTES", title: "Introduction to Accounting — Full Notes", type: "pdf", sizeKb: 820 },
    { classOf: 11, chapter: CLASS_11_CHAPTERS[2], tag: "WORKSHEET", title: "Journal Entries Practice Worksheet", type: "pdf", sizeKb: 410 },
    { classOf: 11, chapter: CLASS_11_CHAPTERS[4], tag: "PYQ", title: "BRS — Previous Year Questions", type: "pdf", sizeKb: 360 },
    { classOf: 11, chapter: CLASS_11_CHAPTERS[6], tag: "REFERENCE", title: "Depreciation Methods — Reference Sheet", type: "pdf", sizeKb: 290 },
    { classOf: 12, chapter: CLASS_12_CHAPTERS[0], tag: "NOTES", title: "Partnership Basics — Chapter Notes", type: "pdf", sizeKb: 940 },
    { classOf: 12, chapter: CLASS_12_CHAPTERS[5], tag: "WORKSHEET", title: "Share Capital — Numerical Worksheet", type: "pdf", sizeKb: 520 },
    { classOf: 12, chapter: CLASS_12_CHAPTERS[9], tag: "PYQ", title: "Accounting Ratios — Board PYQs", type: "pdf", sizeKb: 480 },
    { classOf: 12, chapter: CLASS_12_CHAPTERS[10], tag: "REFERENCE", title: "Cash Flow Statement — Formula Reference", type: "pdf", sizeKb: 220 },
  ];
  for (const n of noteSeed) {
    await prisma.noteMaterial.create({
      data: {
        title: n.title,
        description: `${n.chapter.name} study material.`,
        classOf: n.classOf,
        chapterId: n.chapter.id,
        tag: n.tag,
        fileUrl: `/uploads/notes/${n.chapter.id}-${n.tag.toLowerCase()}.pdf`,
        fileType: n.type,
        sizeKb: n.sizeKb,
        uploadedBy: admin.id,
      },
    });
  }

  // ---- Questions ----
  const qCount = await seedQuestions(prisma);

  // ---- Sample quiz attempts (so leaderboard isn't empty) ----
  const allQuestions = await prisma.question.findMany();
  const byChapter = new Map<string, typeof allQuestions>();
  for (const q of allQuestions) {
    const arr = byChapter.get(q.chapterId) ?? [];
    arr.push(q);
    byChapter.set(q.chapterId, arr);
  }

  for (const student of students) {
    const chapters = student.classOf === 11 ? CLASS_11_CHAPTERS : CLASS_12_CHAPTERS;
    const attemptsCount = 2 + Math.floor(Math.random() * 3); // 2-4 attempts
    for (let i = 0; i < attemptsCount; i++) {
      const chapter = chapters[Math.floor(Math.random() * chapters.length)];
      const qs = byChapter.get(chapter.id) ?? [];
      if (qs.length === 0) continue;

      const answers = qs.map((q) => {
        const correct = Math.random() < 0.7; // ~70% accuracy
        const chosenIndex = correct
          ? q.correctIndex
          : (q.correctIndex + 1) % 4;
        return { questionId: q.id, chosenIndex, correct };
      });
      const score = answers.filter((a) => a.correct).reduce((acc) => acc + 1, 0);
      const totalMarks = qs.length;
      const timeTakenSec = 30 * qs.length + Math.floor(Math.random() * 60);
      const points = computePoints({
        score,
        totalMarks,
        timeTakenSec,
        difficulties: qs.map((q) => q.difficulty as "EASY" | "MEDIUM" | "HARD"),
      });

      await prisma.quizAttempt.create({
        data: {
          studentId: student.id,
          chapterId: chapter.id,
          classOf: student.classOf!,
          score,
          totalMarks,
          timeTakenSec,
          points,
          answers: JSON.stringify(answers),
          createdAt: daysAgo(Math.floor(Math.random() * 14)),
        },
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    `Seed complete: 2 staff, ${students.length} students, ${qCount} questions, attendance/fees/notes/attempts seeded.`
  );
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
