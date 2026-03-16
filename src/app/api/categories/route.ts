// src/app/api/categories/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiError, CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/utils";

const categorySchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  color: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return apiError("User not found in database", 401);

  try {
    let categories = await prisma.customCategory.findMany({
      where: { userId: session.userId },
      orderBy: { name: "asc" },
    });

    // Seed default categories if none exist
    if (categories.length === 0) {
      const defaults = Object.keys(CATEGORY_LABELS).map((key) => ({
        name: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS],
        color: CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS] || "#7c6af7",
        userId: session.userId,
      }));

      await prisma.customCategory.createMany({
        data: defaults,
      });

      categories = await prisma.customCategory.findMany({
        where: { userId: session.userId },
        orderBy: { name: "asc" },
      });
    }

    return Response.json(categories);
  } catch (error: any) {
    console.error("Fetch categories error:", error);
    return apiError(error.message || "Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return apiError("User not found in database", 401);

  try {
    const body = await req.json();
    const result = categorySchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0].message, 400);
    }

    console.log("POST /api/categories - Attempting to create category for user", session.userId);
    console.log("Prisma keys:", Object.keys(prisma));
    const category = await prisma.customCategory.create({
      data: {
        name: result.data.name,
        color: result.data.color || "#7c6af7",
        userId: session.userId,
      },
    });

    return Response.json(category, { status: 201 });
  } catch (error: any) {
    console.error("Create category error:", error);
    if (error.code === 'P2002') {
      return apiError("هذه الفئة موجودة بالفعل", 400);
    }
    return apiError(error.message || "Internal server error", 500);
  }
}
