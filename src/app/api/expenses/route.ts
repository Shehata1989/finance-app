// src/app/api/expenses/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiError } from "@/lib/utils";

const expenseSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  amount: z.number().positive("المبلغ يجب أن يكون موجباً"),
  category: z.string().min(1, "الفئة مطلوبة"),
  date: z.string().min(1, "التاريخ مطلوب"),
  notes: z.string().optional().nullable(),
  accountId: z.string().min(1, "الحساب مطلوب"),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  const { searchParams } = req.nextUrl;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const category = searchParams.get("category");
  const accountId = searchParams.get("accountId");

  const where: Record<string, unknown> = { userId: session.userId };

  if (startDate || endDate) {
    where.date = {
      ...(startDate ? { gte: new Date(startDate) } : {}),
      ...(endDate ? { lte: new Date(endDate + "T23:59:59") } : {}),
    };
  }

  if (category && category !== "ALL") {
    where.category = category;
  }

  if (accountId && accountId !== "ALL") {
    where.accountId = accountId;
  }

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return Response.json(expenses.map((e) => ({ ...e, date: e.date.toISOString() })));
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  try {
    const body = await req.json();
    const result = expenseSchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0].message, 400);
    }

    const expense = await prisma.expense.create({
      data: {
        ...result.data,
        date: new Date(result.data.date),
        userId: session.userId,
      },
    });

    return Response.json({ ...expense, date: expense.date.toISOString() }, { status: 201 });
  } catch (error) {
    console.error("Create expense error:", error);
    return apiError("Internal server error", 500);
  }
}
