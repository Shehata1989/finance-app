// src/components/forms/ExpenseForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Expense, Category, Account } from "@/types";
import { formatDateForInput } from "@/lib/utils";
import { Button, Input, Select, Textarea, Modal } from "@/components/ui";
import { Settings2 } from "lucide-react";
import CategoryManager from "./CategoryManager";

const schema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  amount: z.coerce.number().positive("يجب أن يكون المبلغ موجباً"),
  category: z.string().min(1, "الفئة مطلوبة"),
  date: z.string().min(1, "التاريخ مطلوب"),
  notes: z.string().optional(),
  accountId: z.string().min(1, "الحساب مطلوب"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  expense?: Expense;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ExpenseForm({ expense, onSubmit, onCancel, loading }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [managerOpen, setManagerOpen] = useState(false);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    }
  };

  const fetchAccounts = async () => {
    const res = await fetch("/api/accounts");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setAccounts(data);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAccounts();
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: expense ? {
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: formatDateForInput(expense.date),
      notes: expense.notes ?? "",
      accountId: expense.accountId,
    } : {
      date: formatDateForInput(new Date()),
      accountId: accounts[0]?.id || "",
    },
  });

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="العنوان"
          placeholder="مثال: تسوق البقالة"
          error={errors.title?.message}
          {...register("title")}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="المبلغ (ج.م)"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register("amount")}
          />
          <Input
            label="التاريخ"
            type="date"
            error={errors.date?.message}
            {...register("date")}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium">الفئة</label>
              <button
                type="button"
                onClick={() => setManagerOpen(true)}
                className="text-xs flex items-center gap-1 hover:opacity-80 transition-all"
                style={{ color: "var(--accent)" }}
              >
                <Settings2 className="w-3 h-3" />
                تعديل
              </button>
            </div>
            <Select
              error={errors.category?.message}
              options={categories.map((c) => ({ value: c.name, label: c.name }))}
              {...register("category")}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">الحساب</label>
            <Select
              error={errors.accountId?.message}
              options={accounts.map((a) => ({ value: a.id, label: a.name }))}
              {...register("accountId")}
            />
          </div>
        </div>

        <Textarea
          label="ملاحظات (اختياري)"
          placeholder="أي تفاصيل إضافية..."
          rows={3}
          {...register("notes")}
        />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
            إلغاء
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            {expense ? "حفظ التغييرات" : "إضافة مصروف"}
          </Button>
        </div>
      </form>

      <Modal isOpen={managerOpen} onClose={() => setManagerOpen(false)} title="إدارة الفئات">
        <CategoryManager onCategoriesChange={fetchCategories} />
      </Modal>
    </>
  );
}
