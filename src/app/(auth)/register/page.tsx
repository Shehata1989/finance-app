// src/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, TrendingUp, ArrowLeft, Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "فشل إنشاء الحساب");
        return;
      }

      toast.success("تم إنشاء الحساب بنجاح!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("حدث خطأ ما");
    } finally {
      setIsLoading(false);
    }
  };

  const fields: Array<{ key: keyof FormData; label: string; type: string; placeholder: string }> = [
    { key: "name", label: "الاسم الكامل", type: "text", placeholder: "أحمد محمد" },
    { key: "email", label: "البريد الإلكتروني", type: "email", placeholder: "you@example.com" },
    { key: "password", label: "كلمة المرور", type: "password", placeholder: "••••••••" },
    { key: "confirmPassword", label: "تأكيد كلمة المرور", type: "password", placeholder: "••••••••" },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "var(--accent)", boxShadow: "0 0 20px rgba(124,106,247,0.4)" }}>
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <span className="font-display text-2xl">FinanceOS</span>
      </div>

      <div className="rounded-2xl p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h1 className="font-display text-3xl mb-1">إنشاء حساب</h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>ابدأ إدارة ميزانيتك اليوم</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map(({ key, label, type, placeholder }) => {
            const isPasswordField = type === "password";
            const showEye = key === "password" || key === "confirmPassword";
            return (
              <div key={key}>
                <label className="block text-sm font-medium mb-1.5">{label}</label>
                <div className="relative">
                  <input
                    {...register(key)}
                    type={isPasswordField ? (showPassword ? "text" : "password") : type}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 rounded-lg text-sm"
                    style={{
                      background: "var(--surface-2)",
                      border: `1px solid ${errors[key] ? "var(--danger)" : "var(--border)"}`,
                      color: "var(--foreground)",
                    }}
                  />
                  {showEye && key === "password" && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {errors[key] && (
                  <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>
                    {errors[key]?.message}
                  </p>
                )}
              </div>
            );
          })}

          <button type="submit" disabled={isLoading}
            className="w-full py-3 mt-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            style={{ background: "var(--accent)", color: "white", boxShadow: "0 0 20px rgba(124,106,247,0.3)" }}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>إنشاء حساب <ArrowLeft className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="mt-6 pt-6 text-center text-sm" style={{ borderTop: "1px solid var(--border)" }}>
          <span style={{ color: "var(--muted)" }}>لديك حساب بالفعل؟ </span>
          <Link href="/login" className="font-medium" style={{ color: "var(--accent-foreground)" }}>تسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
}
