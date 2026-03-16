// src/components/forms/CategoryManager.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { Category } from "@/types";
import { Button, Input } from "@/components/ui";
import { toast } from "sonner";

interface Props {
  onCategoriesChange?: () => void;
}

export default function CategoryManager({ onCategoriesChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
        }
      } else if (res.status === 401) {
        toast.error("انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى");
      }
    } catch (error) {
      toast.error("فشل في تحميل الفئات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        setNewName("");
        fetchCategories();
        onCategoriesChange?.();
        toast.success("تمت إضافة الفئة بنجاح");
      } else {
        const data = await res.json();
        toast.error(data.error || "فشل في الإضافة");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleUpdate = async (id: string, oldName: string) => {
    if (!editName.trim() || editName.trim() === oldName) {
      setEditingId(null);
      return;
    }
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchCategories();
        onCategoriesChange?.();
        toast.success("تم تعديل الفئة");
      } else {
        const data = await res.json();
        toast.error(data.error || "فشل في التعديل");
      }
    } catch (error) {
      toast.error("فشل في التعديل");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الفئة؟")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCategories();
        onCategoriesChange?.();
        toast.success("تم حذف الفئة");
      } else {
        const data = await res.json();
        toast.error(data.error || "فشل في الحذف");
      }
    } catch (error) {
      toast.error("فشل في الحذف");
    }
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex gap-2">
        <Input
          placeholder="اسم الفئة الجديدة..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={adding || !newName.trim()} size="sm">
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </Button>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--accent)" }} />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-sm py-4" style={{ color: "var(--muted)" }}>لا توجد فئات حالياً</p>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-2 rounded-lg group transition-colors"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              {editingId === cat.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    autoFocus
                    className="bg-transparent border-none outline-none text-sm w-full"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUpdate(cat.id, cat.name)}
                  />
                  <button onClick={() => handleUpdate(cat.id, cat.name)} className="text-green-500 hover:opacity-80">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-red-500 hover:opacity-80">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                      className="p-1.5 rounded-md hover:bg-black/5"
                      style={{ color: "var(--muted)" }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-md hover:bg-red-50 text-red-500"
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
    </div>
  );
}
