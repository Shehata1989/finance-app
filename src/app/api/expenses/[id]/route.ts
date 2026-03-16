// src/app/api/expenses/[id]/route.ts
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
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);
  const { id } = await params;

  const expense = await prisma.expense.findFirst({ where: { id, userId: session.userId } });
  if (!expense) return apiError("Not found", 404);

  return Response.json({ ...expense, date: expense.date.toISOString() });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);
  const { id } = await params;

  const existing = await prisma.expense.findFirst({ where: { id, userId: session.userId } });
  if (!existing) return apiError("Not found", 404);

  try {
    const body = await req.json();
    const result = expenseSchema.safeParse(body);
    if (!result.success) return apiError(result.error.errors[0].message, 400);

    const expense = await prisma.expense.update({
      where: { id },
      data: { ...result.data, date: new Date(result.data.date) },
    });

    return Response.json({ ...expense, date: expense.date.toISOString() });
  } catch (error) {
    console.error("Update expense error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);
  const { id } = await params;

  const existing = await prisma.expense.findFirst({ where: { id, userId: session.userId } });
  if (!existing) return apiError("Not found", 404);

  await prisma.expense.delete({ where: { id } });
  return Response.json({ success: true });
}
