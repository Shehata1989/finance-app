// src/app/api/dashboard/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiError, getPreviousMonths, CATEGORY_COLORS } from "@/lib/utils";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  const { userId } = session;
  const months = getPreviousMonths(6);

  // Current month range
  const now = new Date();
  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Totals (all time)
  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.income.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { userId }, _sum: { amount: true } }),
  ]);

  const totalIncome = incomeAgg._sum.amount ?? 0;
  const totalExpenses = expenseAgg._sum.amount ?? 0;
  const balance = totalIncome - totalExpenses;

  // Monthly data
  const monthlyData = await Promise.all(
    months.map(async ({ label, start, end }) => {
      const [inc, exp] = await Promise.all([
        prisma.income.aggregate({
          where: { userId, date: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
        prisma.expense.aggregate({
          where: { userId, date: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
      ]);
      return {
        month: label,
        income: inc._sum.amount ?? 0,
        expenses: exp._sum.amount ?? 0,
      };
    })
  );

  // Category breakdown (current month expenses)
  const categoryExpenses = await prisma.expense.groupBy({
    by: ["category"],
    where: { userId, date: { gte: currentStart, lte: currentEnd } },
    _sum: { amount: true },
  });

  const categoryMap: Record<string, number> = {};
  categoryExpenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] ?? 0) + (e._sum.amount ?? 0);
  });

  const categoryBreakdown = Object.entries(categoryMap).map(([category, amount]) => ({
    category,
    amount,
    color: CATEGORY_COLORS[category] ?? "#6b7280",
  }));

  // Recent transactions
  const [recentExpenses, recentIncomes] = await Promise.all([
    prisma.expense.findMany({
      where: { userId },
      include: { account: { select: { name: true } } },
      orderBy: { date: "desc" },
      take: 5,
    }),
    prisma.income.findMany({
      where: { userId },
      include: { account: { select: { name: true } } },
      orderBy: { date: "desc" },
      take: 5,
    }),
  ]);

  return Response.json({
    totalIncome,
    totalExpenses,
    balance,
    monthlyData,
    categoryBreakdown,
    recentExpenses: recentExpenses.map((e) => ({ ...e, date: e.date.toISOString() })),
    recentIncomes: recentIncomes.map((i) => ({ ...i, date: i.date.toISOString() })),
  });
}
