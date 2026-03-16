// src/app/api/income/route.ts
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
  accountId: z.string().min(1, "Account is required"),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  const { searchParams } = req.nextUrl;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const accountId = searchParams.get("accountId");

  const where: Record<string, unknown> = { userId: session.userId };

  if (startDate || endDate) {
    where.date = {
      ...(startDate ? { gte: new Date(startDate) } : {}),
      ...(endDate ? { lte: new Date(endDate + "T23:59:59") } : {}),
    };
  }

  if (accountId && accountId !== "ALL") {
    where.accountId = accountId;
  }

  const incomes = await prisma.income.findMany({
    where,
    include: { account: { select: { name: true } } },
    orderBy: { date: "desc" },
  });

  return Response.json(incomes.map((i) => ({ ...i, date: i.date.toISOString() })));
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  try {
    const body = await req.json();
    const result = incomeSchema.safeParse(body);
    if (!result.success) return apiError(result.error.errors[0].message, 400);

    const income = await prisma.income.create({
      data: {
        ...result.data,
        date: new Date(result.data.date),
        userId: session.userId,
      },
    });

    return Response.json({ ...income, date: income.date.toISOString() }, { status: 201 });
  } catch (error) {
    console.error("Create income error:", error);
    return apiError("Internal server error", 500);
  }
}
