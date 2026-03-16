import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiError } from "@/lib/utils";

const sourceSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  try {
    let sources = await prisma.incomeSource.findMany({
      where: { userId: session.userId },
      orderBy: { name: "asc" },
    });

    // Seed default sources if none exist
    if (sources.length === 0) {
      const defaults = [
        { name: "راتب أساسي", userId: session.userId },
        { name: "عمل حر", userId: session.userId },
        { name: "استثمارات", userId: session.userId },
        { name: "أخرى", userId: session.userId },
      ];

      await prisma.incomeSource.createMany({
        data: defaults,
      });

      sources = await prisma.incomeSource.findMany({
        where: { userId: session.userId },
        orderBy: { name: "asc" },
      });
    }

    return Response.json(sources);
  } catch (error: any) {
    console.error("Fetch income sources error:", error);
    return apiError(error.message || "Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  try {
    const body = await req.json();
    const result = sourceSchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0].message, 400);
    }

    const source = await prisma.incomeSource.create({
      data: {
        name: result.data.name,
        userId: session.userId,
      },
    });

    return Response.json(source, { status: 201 });
  } catch (error: any) {
    console.error("Create income source error:", error);
    if (error.code === 'P2002') {
      return apiError("هذا المصدر موجود بالفعل", 400);
    }
    return apiError(error.message || "Internal server error", 500);
  }
}
