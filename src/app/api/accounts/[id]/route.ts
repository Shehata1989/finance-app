// src/app/api/accounts/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiError } from "@/lib/utils";

const accountSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  type: z.string().default("CASH"),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  try {
    const body = await req.json();
    const result = accountSchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0].message, 400);
    }

    const account = await prisma.account.update({
      where: {
        id: params.id,
        userId: session.userId,
      },
      data: result.data,
    });

    return Response.json(account);
  } catch (error: any) {
    console.error("Update account error:", error);
    if (error.code === 'P2002') {
      return apiError("هذا الحساب موجود بالفعل", 400);
    }
    return apiError(error.message || "Internal server error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  try {
    // Check if it's the last account
    const count = await prisma.account.count({
      where: { userId: session.userId },
    });

    if (count <= 1) {
      return apiError("لا يمكن حذف آخر حساب. يجب أن يكون لديك حساب واحد على الأقل.", 400);
    }

    await prisma.account.delete({
      where: {
        id: params.id,
        userId: session.userId,
      },
    });

    return Response.json({ message: "Account deleted successfully" });
  } catch (error: any) {
    console.error("Delete account error:", error);
    return apiError(error.message || "Internal server error", 500);
  }
}
