import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, signToken, COOKIE_NAME } from "@/lib/auth";
import { apiError } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const updateSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").optional().nullable(),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) return apiError("المستخدم غير موجود", 404);
    return NextResponse.json(user);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  try {
    const body = await req.json();
    const result = updateSchema.safeParse(body);
    if (!result.success) return apiError(result.error.errors[0].message, 400);

    const { name, email, password } = result.data;

    // Check if email is already taken by another user
    if (email !== session.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return apiError("البريد الإلكتروني مستخدم بالفعل", 400);
    }

    const updateData: any = { name, email };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
    });

    // Sign a new token with updated info
    const token = await signToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
    });

    const response = NextResponse.json({
      message: "تم تحديث الملف الشخصي بنجاح",
      user: { name: updatedUser.name, email: updatedUser.email }
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  try {
    await prisma.user.delete({
      where: { id: session.userId },
    });

    const response = NextResponse.json({ message: "تم حذف الحساب بنجاح" });
    response.cookies.delete(COOKIE_NAME);
    
    return response;
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
