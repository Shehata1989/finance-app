// src/app/(dashboard)/expenses/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, TrendingDown, Search } from "lucide-react";
import { Expense, FilterParams } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button, Card, Modal, EmptyState, Spinner } from "@/components/ui";
import CategoryBadge from "@/components/ui/CategoryBadge";
import Filters from "@/components/ui/Filters";
import ExpenseForm from "@/components/forms/ExpenseForm";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [filters, setFilters] = useState<FilterParams>({});
  const [search, setSearch] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchExpenses = useCallback(async () => {
    if (!isInitialized) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.category) params.set("category", filters.category);
    if (filters.accountId) params.set("accountId", filters.accountId);
    const data = await fetch(`/api/expenses?${params}`).then((r) => r.json());
    setExpenses(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filters, isInitialized]);

  // Pre-load accounts to set default filter
  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((accounts) => {
        if (Array.isArray(accounts)) {
          const main = accounts.find((a) => a.name.includes("رئيسي"));
          if (main) setFilters((f) => ({ ...f, accountId: main.id }));
        }
        setIsInitialized(true);
      });
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleCreate = async (data: Record<string, unknown>) => {
    setSubmitting(true);
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("تم إضافة المصروف");
      setModalOpen(false);
      fetchExpenses();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "فشل إضافة المصروف");
    }
    setSubmitting(false);
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!editTarget) return;
    setSubmitting(true);
    const res = await fetch(`/api/expenses/${editTarget.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("تم تحديث المصروف");
      setEditTarget(null);
      fetchExpenses();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "فشل التحديث");
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/expenses/${deleteTarget.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("تم حذف المصروف");
      setDeleteTarget(null);
      fetchExpenses();
    } else {
      toast.error("فشل الحذف");
    }
  };

  const filtered = expenses.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.notes ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">المصروفات</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {filtered.length} سجل · الإجمالي:{" "}
            <span style={{ color: "var(--danger)" }}>
              {formatCurrency(total)}
            </span>
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> إضافة مصروف
        </Button>
      </div>

      <Card className="!p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--muted)" }}
            />
            <input
              type="text"
              placeholder="بحث في المصروفات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-9 pl-4 py-2.5 rounded-lg text-sm"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <Filters filters={filters} onChange={setFilters} />
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner className="w-6 h-6" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            message="لا توجد مصروفات"
            icon={<TrendingDown className="w-10 h-10" />}
            action={
              <Button onClick={() => setModalOpen(true)} size="sm">
                <Plus className="w-3.5 h-3.5" />
                أضف أول مصروف
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className="border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  {[
                    "العنوان",
                    "الفئة",
                    "الحساب",
                    "المبلغ",
                    "التاريخ",
                    "ملاحظات",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-right px-5 py-3.5 text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((expense, i) => (
                  <tr
                    key={expense.id}
                    className="border-b last:border-0 transition-colors hover:opacity-90"
                    style={{
                      borderColor: "var(--border-subtle)",
                      background:
                        i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                    }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: "rgba(248,113,113,0.12)",
                            color: "var(--danger)",
                          }}
                        >
                          <TrendingDown className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-medium">
                          {expense.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <CategoryBadge category={expense.category} />
                    </td>
                    <td
                      className="px-5 py-3.5 text-sm"
                      style={{ color: "var(--muted)" }}
                    >
                      {expense.account?.name || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="font-mono text-sm font-medium"
                        style={{ color: "var(--danger)" }}
                      >
                        -{formatCurrency(expense.amount)}
                      </span>
                    </td>
                    <td
                      className="px-5 py-3.5 text-sm"
                      style={{ color: "var(--muted)" }}
                    >
                      {formatDate(expense.date)}
                    </td>
                    <td
                      className="px-5 py-3.5 text-sm max-w-[180px] truncate"
                      style={{ color: "var(--muted)" }}
                    >
                      {expense.notes || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setEditTarget(expense)}
                          className="p-1.5 rounded-lg transition-colors hover:opacity-70"
                          style={{ color: "var(--muted)" }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(expense)}
                          className="p-1.5 rounded-lg transition-colors hover:opacity-70"
                          style={{ color: "var(--danger)" }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="إضافة مصروف"
      >
        <ExpenseForm
          onSubmit={handleCreate}
          onCancel={() => setModalOpen(false)}
          loading={submitting}
        />
      </Modal>

      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="تعديل مصروف"
      >
        {editTarget && (
          <ExpenseForm
            expense={editTarget}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
            loading={submitting}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="حذف مصروف"
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            هل أنت متأكد من حذف{" "}
            <strong style={{ color: "var(--foreground)" }}>
              {deleteTarget?.title}
            </strong>
            ؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              حذف
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
