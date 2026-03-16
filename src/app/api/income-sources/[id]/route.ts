// src/app/api/income-sources/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiError } from "@/lib/utils";

const sourceSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  try {
    const body = await req.json();
    const result = sourceSchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0].message, 400);
    }

    const source = await prisma.incomeSource.update({
      where: {
        id: params.id,
        userId: session.userId,
      },
      data: {
        name: result.data.name,
      },
    });

    return Response.json(source);
  } catch (error: any) {
    console.error("Update income source error:", error);
    if (error.code === 'P2002') {
      return apiError("هذا المصدر موجود بالفعل", 400);
    }
    return apiError(error.message || "Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  try {
    // Check if source is used in incomes
    // Note: Since we are using string 'source', we check by name
    const sourceToDelete = await prisma.incomeSource.findUnique({
      where: { id: params.id, userId: session.userId }
    });

    if (!sourceToDelete) return apiError("المصدر غير موجود", 404);

    const incomeCount = await prisma.income.count({
      where: { userId: session.userId, source: sourceToDelete.name },
    });

    if (incomeCount > 0) {
      return apiError("لا يمكن حذف مصدر مستخدم بالفعل في الإيرادات", 400);
    }

    await prisma.incomeSource.delete({
      where: {
        id: params.id,
        userId: session.userId,
      },
    });

    return new Response(null, { status: 204 });
  } catch (error: any) {
    console.error("Delete income source error:", error);
    return apiError(error.message || "Internal server error", 500);
  }
}
