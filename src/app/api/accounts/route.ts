// src/app/api/accounts/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiError } from "@/lib/utils";

const accountSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  type: z.string().default("CASH"),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  try {
    let accounts = await prisma.account.findMany({
      where: { userId: session.userId },
      orderBy: { name: "asc" },
    });

    // Seed "Default" account if none exist
    if (accounts.length === 0) {
      const defaultAccount = await prisma.account.create({
        data: {
          name: "رئيسي",
          type: "CASH",
          userId: session.userId,
        },
      });
      accounts = [defaultAccount];

      // Automatically link existing unlinked expenses/incomes to this default account
      await Promise.all([
        prisma.expense.updateMany({
          where: { userId: session.userId, accountId: null },
          data: { accountId: defaultAccount.id },
        }),
        prisma.income.updateMany({
          where: { userId: session.userId, accountId: null },
          data: { accountId: defaultAccount.id },
        }),
      ]);
    }

    // Sort to ensure any account containing "رئيسي" comes first
    accounts.sort((a, b) => {
      const aIsMain = a.name.includes("رئيسي");
      const bIsMain = b.name.includes("رئيسي");
      if (aIsMain && !bIsMain) return -1;
      if (!aIsMain && bIsMain) return 1;
      return 0;
    });

    return Response.json(accounts);
  } catch (error: any) {
    console.error("Fetch accounts error:", error);
    return apiError(error.message || "Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  try {
    const body = await req.json();
    const result = accountSchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0].message, 400);
    }

    const account = await prisma.account.create({
      data: {
        ...result.data,
        userId: session.userId,
      },
    });

    return Response.json(account, { status: 201 });
  } catch (error: any) {
    console.error("Create account error:", error);
    if (error.code === "P2002") {
      return apiError("هذا الحساب موجود بالفعل", 400);
    }
    return apiError(error.message || "Internal server error", 500);
  }
}
