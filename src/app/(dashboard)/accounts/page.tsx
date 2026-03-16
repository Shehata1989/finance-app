// src/app/(dashboard)/accounts/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Plus, Wallet, Trash2, Building2, CreditCard } from "lucide-react";
import { Card, Button, Input, Modal, Spinner } from "@/components/ui";
import { Account } from "@/types";
import { toast } from "sonner";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: "", type: "CASH" });
  const [submitting, setSubmitting] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      if (Array.isArray(data)) setAccounts(data);
    } catch (e) {
      toast.error("فشل تحميل الحسابات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        body: JSON.stringify(newAccount),
      });
      if (res.ok) {
        toast.success("تم إضافة الحساب بنجاح");
        setModalOpen(false);
        setNewAccount({ name: "", type: "CASH" });
        fetchAccounts();
      } else {
        const error = await res.json();
        toast.error(error.error || "فشل إضافة الحساب");
      }
    } catch (e) {
      toast.error("حدث خطأ ما");
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "BANK": return <Building2 className="w-5 h-5" />;
      case "SAVINGS": return <CreditCard className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "BANK": return "بنك";
      case "SAVINGS": return "مدخرات";
      default: return "نقدي";
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">الحسابات</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>إدارة محافظك المالية ومصادر النقدية</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة حساب
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Spinner className="w-8 h-8" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map(acc => (
            <Card key={acc.id} className="relative group overflow-hidden border-2 transition-all hover:border-accent">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl" style={{ background: "var(--surface-2)", color: "var(--accent)" }}>
                  {getTypeIcon(acc.type)}
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                    {getTypeLabel(acc.type)}
                  </p>
                  <p className="font-display text-xl">{acc.name}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-6 text-xs" style={{ color: "var(--muted)" }}>
                <span>أنشئ في: {new Date(acc.createdAt).toLocaleDateString('ar-EG')}</span>
              </div>
            </Card>
          ))}
          
          {accounts.length === 0 && (
            <div className="col-span-full py-20 text-center rounded-2xl border-2 border-dashed" style={{ borderColor: "var(--border)" }}>
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p style={{ color: "var(--muted)" }}>لا توجد حسابات مضافة حالياً</p>
              <Button variant="secondary" onClick={() => setModalOpen(true)} className="mt-4">إضافة أول حساب</Button>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="إضافة حساب جديد">
        <form onSubmit={handleAddAccount} className="space-y-4">
          <Input
            label="اسم الحساب"
            placeholder="مثال: البنك الأهلي، محفظة الجيب"
            value={newAccount.name}
            onChange={e => setNewAccount({ ...newAccount, name: e.target.value })}
            required
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium">نوع الحساب</label>
            <select
              className="w-full px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              value={newAccount.type}
              onChange={e => setNewAccount({ ...newAccount, type: e.target.value })}
            >
              <option value="CASH">نقدي / محفظة</option>
              <option value="BANK">حساب بنكي</option>
              <option value="SAVINGS">مدخرات</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>إلغاء</Button>
            <Button type="submit" className="flex-1" loading={submitting}>تأكيد الإضافة</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
