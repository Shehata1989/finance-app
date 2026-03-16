// src/app/api/income/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiError } from "@/lib/utils";

const incomeSchema = z.object({
  source: z.string().min(1, "Source is required"),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);
  const { id } = await params;

  const income = await prisma.income.findFirst({ where: { id, userId: session.userId } });
  if (!income) return apiError("Not found", 404);

  return Response.json({ ...income, date: income.date.toISOString() });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);
  const { id } = await params;

  const existing = await prisma.income.findFirst({ where: { id, userId: session.userId } });
  if (!existing) return apiError("Not found", 404);

  try {
    const body = await req.json();
    const result = incomeSchema.safeParse(body);
    if (!result.success) return apiError(result.error.errors[0].message, 400);

    const income = await prisma.income.update({
      where: { id },
      data: { ...result.data, date: new Date(result.data.date) },
    });

    return Response.json({ ...income, date: income.date.toISOString() });
  } catch (error) {
    console.error("Update income error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);
  const { id } = await params;

  const existing = await prisma.income.findFirst({ where: { id, userId: session.userId } });
  if (!existing) return apiError("Not found", 404);

  await prisma.income.delete({ where: { id } });
  return Response.json({ success: true });
}
