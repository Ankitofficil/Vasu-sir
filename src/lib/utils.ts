import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format paise (integer) as Indian Rupees, e.g. 1250000 -> "₹12,500". */
export function formatINR(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  }).format(rupees);
}

/** Format a date in the user's locale, e.g. "20 Jun 2026". */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Map a quiz score percent to a semantic performance band, used consistently
 * for score badges and fraction colouring (UI-REVIEW: red <40, amber 40–69,
 * green ≥70).
 */
export function performanceTone(
  percent: number
): "success" | "warning" | "destructive" {
  if (percent >= 70) return "success";
  if (percent >= 40) return "warning";
  return "destructive";
}

export function initials(name: string): string {
  // Keep only word tokens that start with a letter (skips "(", parentheses, etc.)
  const letters = name
    .split(/\s+/)
    .map((p) => p.replace(/[^a-zA-Z]/g, ""))
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase());
  return letters.slice(0, 2).join("") || name.trim()[0]?.toUpperCase() || "?";
}
