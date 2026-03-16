// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "EGP"): string {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd/MM/yyyy");
}

export function formatDateForInput(date: string | Date): string {
  return format(new Date(date), "yyyy-MM-dd");
}

export function getMonthRange(date: Date = new Date()) {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function getPreviousMonths(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      label: format(date, "MMM yyyy"),
      month: format(date, "yyyy-MM"),
      start: startOfMonth(date),
      end: endOfMonth(date),
    };
  }).reverse();
}

export const CATEGORY_LABELS: Record<string, string> = {
  FOOD: "طعام",
  BILLS: "فواتير",
  TRANSPORT: "مواصلات",
  SHOPPING: "تسوق",
  RENT: "إيجار",
  HEALTH: "صحة",
  ENTERTAINMENT: "ترفيه",
  EDUCATION: "تعليم",
  SAVINGS: "مدخرات",
  OTHER: "أخرى",
};

export const CATEGORY_COLORS: Record<string, string> = {
  FOOD: "#f59e0b",
  BILLS: "#ef4444",
  TRANSPORT: "#3b82f6",
  SHOPPING: "#8b5cf6",
  RENT: "#ec4899",
  HEALTH: "#10b981",
  ENTERTAINMENT: "#f97316",
  EDUCATION: "#06b6d4",
  SAVINGS: "#22c55e",
  OTHER: "#6b7280",
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS);

export function apiResponse<T>(data: T, status = 200) {
  return Response.json(data, { status });
}

export function apiError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
