"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, ShieldAlert, Trash2, Save, Loader2 } from "lucide-react";
import { Button, Input, Card, Modal } from "@/components/ui";

const schema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (!res.ok) throw new Error();
      const data = await res.json();
      reset({
        name: data.name,
        email: data.email,
        password: "",
      });
    } catch (e) {
      toast.error("فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onUpdate = async (data: FormData) => {
    setSaving(true);
    try {
      // If password is empty, don't send it
      const { password, ...payload } = data;
      const finalPayload: any = { ...payload };
      if (password) finalPayload.password = password;

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("تم تحديث الملف الشخصي بنجاح");
        router.refresh();
      } else {
        toast.error(result.error || "فشل التحديث");
      }
    } catch (e) {
      toast.error("حدث خطأ ما");
    } finally {
      setSaving(false);
    }
  };

  const onDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/user/profile", { method: "DELETE" });
      if (res.ok) {
        toast.success("تم حذف الحساب نهائياً");
        router.push("/login");
        router.refresh();
      } else {
        const result = await res.json();
        toast.error(result.error || "فشل حذف الحساب");
      }
    } catch (e) {
      toast.error("حدث خطأ ما");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">الملف الشخصي</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            إدارة بيانات حسابك وإعدادات الأمان
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info - Left Column */}
        <div className="md:col-span-2 space-y-6">
          <Card className="!p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                style={{ background: "linear-gradient(135deg, var(--accent), #a78bfa)" }}>
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">إعدادات الحساب</h3>
                <p className="text-sm" style={{ color: "var(--muted)" }}>تحديث اسمك وبريدك الإلكتروني</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onUpdate)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <Input
                  label="الاسم الكامل"
                  placeholder="اسمح الحقيقي..."
                  error={errors.name?.message}
                  {...register("name")}
                />
                <Input
                  label="البريد الإلكتروني"
                  placeholder="name@example.com"
                  type="email"
                  error={errors.email?.message}
                  {...register("email")}
                />
                <Input
                  label="كلمة المرور الجديدة (اتركها فارغة لعدم التغيير)"
                  placeholder="••••••••"
                  type="password"
                  error={errors.password?.message}
                  {...register("password")}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" loading={saving} className="px-8">
                  <Save className="w-4 h-4 ml-2" /> حفظ التغييرات
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Account Status / Danger Zone - Right Column */}
        <div className="space-y-6">
          <Card className="!p-6 border-danger/20">
            <div className="flex items-center gap-3 mb-4 text-danger">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold">منطقة الخطر</h3>
            </div>
            <p className="text-xs mb-6 text-right leading-relaxed" style={{ color: "var(--muted)" }}>
              بمجرد حذف حسابك، سيتم مسح كافة البيانات المرتبطة به بشكل نهائي. تأكد من أنك تريد القيام بذلك.
            </p>
            <Button
              variant="danger"
              className="w-full"
              onClick={() => setDeleteModalOpen(true)}
            >
              <Trash2 className="w-4 h-4 ml-2" /> حذف الحساب نهائياً
            </Button>
          </Card>

          <Card className="!p-6 text-center">
             <div className="mb-4 text-sm font-medium" style={{ color: "var(--muted)" }}>تحتاج لمساعدة؟</div>
             <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
               إذا واجهت أي مشكلة في إدارة حسابك، يمكنك دائماً التواصل مع الدعم الفني.
             </p>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="حذف الحساب نهائياً"
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-danger/10 text-danger text-center">
            <Trash2 className="w-12 h-12 mb-3" />
            <h4 className="font-bold text-lg">هل أنت متأكد تماماً؟</h4>
            <p className="text-sm mt-2">لا يمكن التراجع عن هذا الإجراء بعد تنفيذه. سيتم حذف جميع بياناتك المالية فوراً.</p>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteModalOpen(false)}>
              إلغاء
            </Button>
            <Button variant="danger" className="flex-1" loading={deleting} onClick={onDeleteAccount}>
              نعم، احذف حسابي
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
