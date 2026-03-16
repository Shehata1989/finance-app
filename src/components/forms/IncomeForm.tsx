import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Account, Income, IncomeSource } from "@/types";
import { formatDateForInput } from "@/lib/utils";
import { Button, Input, Textarea, Modal, Select } from "@/components/ui";
import { Settings, Plus } from "lucide-react";
import SourceManager from "./SourceManager";

const schema = z.object({
  source: z.string().min(1, "المصدر مطلوب"),
  amount: z.coerce.number().positive("يجب أن يكون المبلغ موجباً"),
  date: z.string().min(1, "التاريخ مطلوب"),
  notes: z.string().optional(),
  accountId: z.string().min(1, "الحساب مطلوب"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  income?: Income;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function IncomeForm({
  income,
  onSubmit,
  onCancel,
  loading,
}: Props) {
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [managerOpen, setManagerOpen] = useState(false);

  const fetchSources = async () => {
    setSourcesLoading(true);
    try {
      const res = await fetch("/api/income-sources");
      const data = await res.json();
      setSources(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load sources");
    } finally {
      setSourcesLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      if (Array.isArray(data)) {
        const sorted = [...data].sort((a) => (a.name.includes("رئيسي") ? -1 : 1));
        setAccounts(sorted);
      }
    } catch (e) {
      console.error("Failed to load accounts");
    }
  };

  useEffect(() => {
    fetchSources();
    fetchAccounts();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: income
      ? {
          source: income.source,
          amount: income.amount,
          date: formatDateForInput(income.date),
          notes: income.notes ?? "",
          accountId: income.accountId,
        }
      : {
          date: formatDateForInput(new Date()),
          accountId: "",
        },
  });

  useEffect(() => {
    if (!income && accounts.length > 0) {
      const mainAccount = accounts.find(a => a.name.includes("رئيسي")) || accounts[0];
      if (mainAccount) {
        setValue("accountId", mainAccount.id);
      }
    }
  }, [accounts, income, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label
            className="text-sm font-medium"
            style={{ color: "var(--foreground)" }}
          >
            المصدر
          </label>
          <div className="flex gap-2">
            <select
              {...register("source")}
              className="flex-1 px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              <option value="">اختر المصدر...</option>
              {sources.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setManagerOpen(true)}
              className="px-3"
              title="إدارة المصادر"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          {errors.source?.message && (
            <p className="text-xs text-danger mt-1">{errors.source.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">الحساب</label>
          <Select
            error={errors.accountId?.message}
            placeholder="اختر حساب..."
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
            {...register("accountId")}
          />
        </div>
      </div>

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
      <Textarea
        label="ملاحظات (اختياري)"
        placeholder="أي تفاصيل إضافية..."
        rows={3}
        {...register("notes")}
      />
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          إلغاء
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {income ? "حفظ التغييرات" : "إضافة دخل"}
        </Button>
      </div>
      <Modal
        isOpen={managerOpen}
        onClose={() => setManagerOpen(false)}
        title="إدارة مصادر الدخل"
      >
        <SourceManager
          onClose={() => setManagerOpen(false)}
          onUpdate={fetchSources}
        />
      </Modal>
    </form>
  );
}
