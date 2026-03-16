// src/app/api/reports/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiError, CATEGORY_COLORS, getPreviousMonths } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  const { searchParams } = req.nextUrl;
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const monthParam = searchParams.get("month");
  const accountId = searchParams.get("accountId");

  let start: Date, end: Date;

  if (startDateParam && endDateParam) {
    start = new Date(startDateParam);
    end = new Date(endDateParam);
    end.setHours(23, 59, 59, 999);
  } else if (monthParam) {
    const [year, month] = monthParam.split("-").map(Number);
    start = new Date(year, month - 1, 1);
    end = new Date(year, month, 0, 23, 59, 59);
  } else {
    const now = new Date();
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }

  const userId = session.userId;
  const whereCommon = {
    userId,
    date: { gte: start, lte: end },
    ...(accountId && accountId !== "ALL" ? { accountId } : {}),
  };

  const [expenses, incomes] = await Promise.all([
    prisma.expense.findMany({
      where: whereCommon,
      orderBy: { date: "desc" },
    }),
    prisma.income.findMany({
      where: whereCommon,
      orderBy: { date: "desc" },
    }),
  ]);

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalSpending = totalExpenses;

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] ?? 0) + e.amount;
  });

  const categoryBreakdown = Object.entries(categoryMap).map(
    ([category, amount]) => ({
      category,
      amount,
      color: CATEGORY_COLORS[category] ?? "#6b7280",
      percentage:
        totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0,
    }),
  );

  // Monthly trend (last 6 months)
  const months = getPreviousMonths(6);
  const monthlyTrend = await Promise.all(
    months.map(async ({ label, start: mStart, end: mEnd }) => {
      const trendWhere = {
        userId,
        date: { gte: mStart, lte: mEnd },
        ...(accountId && accountId !== "ALL" ? { accountId } : {}),
      };
      const [inc, exp] = await Promise.all([
        prisma.income.aggregate({ where: trendWhere, _sum: { amount: true } }),
        prisma.expense.aggregate({ where: trendWhere, _sum: { amount: true } }),
      ]);
      return {
        month: label,
        income: inc._sum.amount ?? 0,
        expenses: exp._sum.amount ?? 0,
      };
    }),
  );

  return Response.json({
    period: { start: start.toISOString(), end: end.toISOString() },
    summary: {
      totalIncome,
      totalExpenses,
      totalSpending,
      balance: totalIncome - totalSpending,
    },
    categoryBreakdown,
    monthlyTrend,
    expenses: expenses.map((e) => ({ ...e, date: e.date.toISOString() })),
    incomes: incomes.map((i) => ({ ...i, date: i.date.toISOString() })),
  });
}
