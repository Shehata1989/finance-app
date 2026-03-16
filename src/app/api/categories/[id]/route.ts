// src/app/api/categories/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiError } from "@/lib/utils";

const categorySchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  color: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  try {
    const body = await req.json();
    const result = categorySchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0].message, 400);
    }

    console.log(`Updating category ${params.id} for user ${session.userId}`);
    const category = await prisma.customCategory.update({
      where: { id: params.id, userId: session.userId },
      data: result.data,
    });
    console.log("Category updated successfully");
    return Response.json(category);
  } catch (error: any) {
    console.error("Update category error:", error);
    if (error.code === 'P2002') {
      return apiError("هذه الفئة موجودة بالفعل", 400);
    }
    return apiError(error.message || "Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  try {
    // Check if category name is used in expenses
    // First get the category name
    const category = await prisma.customCategory.findUnique({
      where: { id: params.id, userId: session.userId }
    });

    if (!category) return apiError("Category not found", 404);

    const expenseCount = await prisma.expense.count({
      where: { category: category.name, userId: session.userId }
    });

    if (expenseCount > 0) {
      return apiError("لا يمكن حذف فئة مستخدمة بالفعل في المصروفات", 400);
    }

    await prisma.customCategory.delete({
      where: { id: params.id, userId: session.userId },
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Delete category error:", error);
    return apiError(error.message || "Internal server error", 500);
  }
}
