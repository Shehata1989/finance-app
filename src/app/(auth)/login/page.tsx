// src/app/(auth)/login/page.tsx
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
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "فشل تسجيل الدخول");
        return;
      }

      toast.success(`مرحباً بعودتك، ${json.user.name}!`);
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("حدث خطأ ما");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "var(--accent)", boxShadow: "0 0 20px rgba(124,106,247,0.4)" }}>
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <span className="font-display text-2xl" style={{ color: "var(--foreground)" }}>FinanceOS</span>
      </div>

      {/* Card */}
      <div className="rounded-2xl p-8"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h1 className="font-display text-3xl mb-1" style={{ color: "var(--foreground)" }}>مرحباً بعودتك</h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>سجّل الدخول للمتابعة</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
              البريد الإلكتروني
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg text-sm transition-all"
              style={{
                background: "var(--surface-2)",
                border: `1px solid ${errors.email ? "var(--danger)" : "var(--border)"}`,
                color: "var(--foreground)",
              }}
            />
            {errors.email && (
              <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
              كلمة المرور
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pl-10 rounded-lg text-sm transition-all"
                style={{
                  background: "var(--surface-2)",
                  border: `1px solid ${errors.password ? "var(--danger)" : "var(--border)"}`,
                  color: "var(--foreground)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted)" }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            style={{
              background: "var(--accent)",
              color: "white",
              boxShadow: "0 0 20px rgba(124,106,247,0.3)",
            }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>تسجيل الدخول <ArrowLeft className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 text-center text-sm" style={{ borderTop: "1px solid var(--border)" }}>
          <span style={{ color: "var(--muted)" }}>ليس لديك حساب؟ </span>
          <Link href="/register" className="font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--accent-foreground)" }}>
            أنشئ حساباً
          </Link>
        </div>
      </div>
    </div>
  );
}
