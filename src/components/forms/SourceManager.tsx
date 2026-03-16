// src/components/forms/SourceManager.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IncomeSource } from "@/types";
import { Button, Input } from "@/components/ui";

interface Props {
  onClose: () => void;
  onUpdate?: () => void;
}

export default function SourceManager({ onClose, onUpdate }: Props) {
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [editName, setEditName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/income-sources");
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setSources(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("فشل تحميل المصادر");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/income-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("تم إضافة المصدر");
        setNewName("");
        setAdding(false);
        fetchSources();
        if (onUpdate) onUpdate();
      } else {
        toast.error(data.error || "فشل الإضافة");
      }
    } catch (error) {
      toast.error("حدث خطأ ما");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/income-sources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("تم تحديث المصدر");
        setEditingId(null);
        fetchSources();
        if (onUpdate) onUpdate();
      } else {
        toast.error(data.error || "فشل التحديث");
      }
    } catch (error) {
      toast.error("حدث خطأ ما");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المصدر؟")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/income-sources/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("تم حذف المصدر");
        fetchSources();
        if (onUpdate) onUpdate();
      } else {
        const data = await res.json();
        toast.error(data.error || "فشل الحذف");
      }
    } catch (error) {
      toast.error("حدث خطأ ما");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">مصادر الدخل المتاحة</h3>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4 ml-1" /> إضافة مصدر
          </Button>
        )}
      </div>

      {adding && (
        <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Input
            placeholder="اسم المصدر..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button size="sm" onClick={handleAdd} loading={actionLoading}>
            <Check className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="secondary" onClick={() => { setAdding(false); setNewName(""); }}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--primary)" }} />
          </div>
        ) : sources.length === 0 ? (
          <p className="text-center py-8 text-sm" style={{ color: "var(--muted)" }}>
            لا يوجد مصادر مضافة بعد
          </p>
        ) : (
          sources.map((source) => (
            <div
              key={source.id}
              className="flex items-center justify-between p-3 rounded-xl border transition-all"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border-subtle)",
              }}
            >
              {editingId === source.id ? (
                <div className="flex gap-2 flex-1 mr-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 h-8 text-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdate(source.id)}
                    disabled={actionLoading}
                    className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1.5 rounded-lg bg-muted/10 text-muted hover:bg-muted/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-medium">{source.name}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingId(source.id);
                        setEditName(source.name);
                      }}
                      className="p-1.5 rounded-lg hover:bg-surface-3 transition-colors"
                      style={{ color: "var(--muted)" }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(source.id)}
                      className="p-1.5 rounded-lg hover:bg-danger/10 text-danger transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
        <Button variant="secondary" onClick={onClose} className="w-full">
          إغلاق
        </Button>
      </div>
    </div>
  );
}
