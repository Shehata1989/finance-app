// src/app/(dashboard)/reports/page.tsx
"use client";

import { useEffect, useState } from "react";
import { format, subMonths } from "date-fns";
import { arSA } from "date-fns/locale";
import { TrendingUp, TrendingDown, Wallet, ChevronRight, ChevronLeft, Filter } from "lucide-react";
import { formatCurrency, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/utils";
import { Card, StatCard, Spinner, Select } from "@/components/ui";
import { Account } from "@/types";
import IncomeExpenseChart from "@/components/charts/IncomeExpenseChart";
import CategoryChart from "@/components/charts/CategoryChart";

interface ReportData {
  period: { start: string; end: string };
  summary: {
    totalIncome: number;
    totalExpenses: number;
    totalSpending: number;
    balance: number;
  };
  categoryBreakdown: { category: string; amount: number; color: string; percentage: number }[];
  monthlyTrend: { month: string; income: number; expenses: number }[];
  expenses: Array<{ id: string; title: string; amount: number; category: string; date: string }>;
  incomes: Array<{ id: string; source: string; amount: number; date: string }>;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthParam = format(currentDate, "yyyy-MM");
  const monthLabel = format(currentDate, "MMMM yyyy", { locale: arSA });

  useEffect(() => {
    fetch("/api/accounts")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) setAccounts(d);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports?month=${monthParam}&accountId=${selectedAccountId}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [monthParam, selectedAccountId]);

  const prevMonth = () => setCurrentDate((d) => subMonths(d, 1));
  const nextMonth = () => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    if (next <= new Date()) setCurrentDate(next);
  };
  const isCurrentMonth = format(currentDate, "yyyy-MM") === format(new Date(), "yyyy-MM");

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header with month picker and account filter */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl">التقارير</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>التوزيع المالي حسب الحساب</p>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          {/* Account Filter */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <Filter className="w-4 h-4" style={{ color: "var(--muted)" }} />
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none min-w-[120px]"
            >
              <option value="ALL">جميع الحسابات</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          {/* Month Picker */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <button onClick={nextMonth} disabled={isCurrentMonth}
              className="p-1 rounded hover:opacity-70 disabled:opacity-30"
              style={{ color: "var(--muted)" }}>
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="font-medium text-sm min-w-[140px] text-center">{monthLabel}</span>
            <button onClick={prevMonth} className="p-1 rounded hover:opacity-70" style={{ color: "var(--muted)" }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Spinner className="w-8 h-8" /></div>
      ) : !data ? null : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="الدخل" value={formatCurrency(data.summary.totalIncome)}
              subtitle={monthLabel} icon={<TrendingUp className="w-5 h-5" />} accentColor="var(--success)" />
            <StatCard title="المصروفات" value={formatCurrency(data.summary.totalExpenses)}
              subtitle={monthLabel} icon={<TrendingDown className="w-5 h-5" />} accentColor="var(--danger)" />
            <StatCard
              title="الرصيد الصافي"
              value={formatCurrency(Math.abs(data.summary.balance))}
              subtitle={data.summary.balance >= 0 ? "فائض" : "عجز"}
              icon={<Wallet className="w-5 h-5" />}
              accentColor={data.summary.balance >= 0 ? "var(--success)" : "var(--danger)"}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <h3 className="font-display text-xl mb-6">اتجاه 6 أشهر</h3>
              <IncomeExpenseChart data={data.monthlyTrend} />
            </Card>
            <Card>
              <h3 className="font-display text-xl mb-6">الإنفاق بالفئات</h3>
              <CategoryChart data={data.categoryBreakdown} />
            </Card>
          </div>

          {/* Category breakdown bars */}
          {data.categoryBreakdown.length > 0 && (
            <Card>
              <h3 className="font-display text-xl mb-6">تفاصيل الفئات</h3>
              <div className="space-y-3">
                {data.categoryBreakdown
                  .sort((a, b) => b.amount - a.amount)
                  .map(({ category, amount, color, percentage }) => (
                    <div key={category} className="flex items-center gap-4">
                      <div className="w-28 text-xs font-medium flex-shrink-0" style={{ color: "var(--muted)" }}>
                        {CATEGORY_LABELS[category] ?? category}
                      </div>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%`, background: color }}
                        />
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs w-8 text-right" style={{ color: "var(--muted)" }}>{percentage}%</span>
                        <span className="font-mono text-sm font-medium w-28 text-right">{formatCurrency(amount)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {/* Transactions for the month */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expenses list */}
            <Card>
              <h3 className="font-display text-lg mb-4" style={{ color: "var(--danger)" }}>
                المصروفات
                <span className="mr-2 text-sm font-sans" style={{ color: "var(--muted)" }}>
                  ({data.expenses.length})
                </span>
              </h3>
              {data.expenses.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: "var(--muted)" }}>لا شيء هذا الشهر</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.expenses.map((e) => (
                    <div key={e.id} className="flex items-center justify-between py-1.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{e.title}</p>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>{CATEGORY_LABELS[e.category]}</p>
                      </div>
                      <span className="text-sm font-mono mr-3 flex-shrink-0" style={{ color: "var(--danger)" }}>
                        -{formatCurrency(e.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Income list */}
            <Card>
              <h3 className="font-display text-lg mb-4" style={{ color: "var(--success)" }}>
                الدخل
                <span className="mr-2 text-sm font-sans" style={{ color: "var(--muted)" }}>
                  ({data.incomes.length})
                </span>
              </h3>
              {data.incomes.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: "var(--muted)" }}>لا شيء هذا الشهر</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.incomes.map((inc) => (
                    <div key={inc.id} className="flex items-center justify-between py-1.5">
                      <p className="text-sm font-medium truncate flex-1">{inc.source}</p>
                      <span className="text-sm font-mono mr-3 flex-shrink-0" style={{ color: "var(--success)" }}>
                        +{formatCurrency(inc.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

          </div>
        </>
      )}
    </div>
  );
}
