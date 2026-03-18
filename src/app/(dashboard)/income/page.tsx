// src/app/(dashboard)/income/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  Search,
  Settings,
} from "lucide-react";
import { Income, FilterParams } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button, Card, Modal, EmptyState, Spinner } from "@/components/ui";
import Filters from "@/components/ui/Filters";
import IncomeForm from "@/components/forms/IncomeForm";
import SourceManager from "@/components/forms/SourceManager";

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Income | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Income | null>(null);
  const [filters, setFilters] = useState<FilterParams>({});
  const [search, setSearch] = useState("");
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchIncomes = useCallback(async () => {
    if (!isInitialized) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.accountId) params.set("accountId", filters.accountId);
    const data = await fetch(`/api/income?${params}`).then((r) => r.json());
    setIncomes(Array.isArray(data) ? data : []);
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
    fetchIncomes();
  }, [fetchIncomes]);

  const handleCreate = async (data: Record<string, unknown>) => {
    setSubmitting(true);
    const res = await fetch("/api/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("تم إضافة الدخل");
      setModalOpen(false);
      fetchIncomes();
    } else {
      const e = await res.json();
      toast.error(e.error ?? "فشل الإضافة");
    }
    setSubmitting(false);
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!editTarget) return;
    setSubmitting(true);
    const res = await fetch(`/api/income/${editTarget.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("تم تحديث الدخل");
      setEditTarget(null);
      fetchIncomes();
    } else {
      const e = await res.json();
      toast.error(e.error ?? "فشل التحديث");
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/income/${deleteTarget.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("تم حذف الدخل");
      setDeleteTarget(null);
      fetchIncomes();
    } else toast.error("فشل الحذف");
  };

  const filtered = incomes.filter(
    (i) =>
      i.source.toLowerCase().includes(search.toLowerCase()) ||
      (i.notes ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const total = filtered.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">الدخل</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {filtered.length} سجل · الإجمالي:{" "}
            <span style={{ color: "var(--success)" }}>
              {formatCurrency(total)}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setSourcesModalOpen(true)}>
            <Settings className="w-4 h-4 ml-1" /> إدارة المصادر
          </Button>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 ml-1" /> إضافة دخل
          </Button>
        </div>
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
              placeholder="بحث في الدخل..."
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
          <Filters
            filters={filters}
            onChange={setFilters}
            showCategory={false}
          />
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner className="w-6 h-6" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            message="لا توجد سجلات دخل"
            icon={<TrendingUp className="w-10 h-10" />}
            action={
              <Button onClick={() => setModalOpen(true)} size="sm">
                <Plus className="w-3.5 h-3.5" />
                أضف أول دخل
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
                  {["المصدر", "الحساب", "المبلغ", "التاريخ", "ملاحظات", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-right px-5 py-3.5 text-xs font-medium uppercase tracking-wider"
                        style={{ color: "var(--muted)" }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((income, i) => (
                  <tr
                    key={income.id}
                    className="border-b last:border-0"
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
                            background: "rgba(52,211,153,0.12)",
                            color: "var(--success)",
                          }}
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-medium">
                          {income.source}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-5 py-3.5 text-sm"
                      style={{ color: "var(--muted)" }}
                    >
                      {income.account?.name || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="font-mono text-sm font-medium"
                        style={{ color: "var(--success)" }}
                      >
                        +{formatCurrency(income.amount)}
                      </span>
                    </td>
                    <td
                      className="px-5 py-3.5 text-sm"
                      style={{ color: "var(--muted)" }}
                    >
                      {formatDate(income.date)}
                    </td>
                    <td
                      className="px-5 py-3.5 text-sm max-w-[200px] truncate"
                      style={{ color: "var(--muted)" }}
                    >
                      {income.notes || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setEditTarget(income)}
                          className="p-1.5 rounded-lg hover:opacity-70"
                          style={{ color: "var(--muted)" }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(income)}
                          className="p-1.5 rounded-lg hover:opacity-70"
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
        title="إضافة دخل"
      >
        <IncomeForm
          onSubmit={handleCreate}
          onCancel={() => setModalOpen(false)}
          loading={submitting}
        />
      </Modal>
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="تعديل دخل"
      >
        {editTarget && (
          <IncomeForm
            income={editTarget}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
            loading={submitting}
          />
        )}
      </Modal>
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="حذف دخل"
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            حذف الدخل من{" "}
            <strong style={{ color: "var(--foreground)" }}>
              {deleteTarget?.source}
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

      <Modal
        isOpen={sourcesModalOpen}
        onClose={() => setSourcesModalOpen(false)}
        title="إدارة مصادر الدخل"
      >
        <SourceManager onClose={() => setSourcesModalOpen(false)} />
      </Modal>
    </div>
  );
}
