// src/app/(dashboard)/reports/page.tsx
"use client";

import { useEffect, useState } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { arSA } from "date-fns/locale";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ChevronRight,
  ChevronLeft,
  Filter,
  Calendar,
} from "lucide-react";
import {
  formatCurrency,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  formatDateForInput,
  cn,
} from "@/lib/utils";
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
  categoryBreakdown: {
    category: string;
    amount: number;
    color: string;
    percentage: number;
  }[];
  monthlyTrend: { month: string; income: number; expenses: number }[];
  expenses: Array<{
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
  }>;
  incomes: Array<{ id: string; source: string; amount: number; date: string }>;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const [startDate, setStartDate] = useState(
    formatDateForInput(startOfMonth(new Date())),
  );
  const [endDate, setEndDate] = useState(
    formatDateForInput(endOfMonth(new Date())),
  );

  const dateLabel = `${format(new Date(startDate), "dd MMM yyyy", { locale: arSA })} - ${format(new Date(endDate), "dd MMM yyyy", { locale: arSA })}`;

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setAccounts(d);
          const main = d.find((a) => a.name.includes("رئيسي"));
          if (main) {
            setSelectedAccountId(main.id);
          }
        }
        setIsInitialized(true);
      });
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    setLoading(true);
    fetch(
      `/api/reports?startDate=${startDate}&endDate=${endDate}&accountId=${selectedAccountId}`,
    )
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [startDate, endDate, selectedAccountId, isInitialized]);

  const setRange = (months: number) => {
    const end = new Date();
    const start = months === 0 ? startOfMonth(end) : subMonths(end, months);
    setStartDate(formatDateForInput(startOfMonth(start)));
    setEndDate(formatDateForInput(endOfMonth(end)));
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header with month picker and account filter */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl">التقارير</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            التوزيع المالي حسب الحساب
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Account Filter */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <Filter className="w-4 h-4" style={{ color: "var(--muted)" }} />
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none min-w-[120px]"
            >
              <option value="ALL" style={{ background: "var(--surface-2)" }}>
                جميع الحسابات
              </option>
              {accounts.map((acc) => (
                <option
                  key={acc.id}
                  value={acc.id}
                  style={{ background: "var(--surface-2)" }}
                >
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-3 bg-surface p-2 rounded-2xl border border-border">
            <div className="flex items-center gap-2 px-2 border-l border-border ml-2 pl-4">
              <Calendar className="w-4 h-4 text-muted" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none"
              />
              <span className="text-muted text-xs mx-1">إلى</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRange(0)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:opacity-75",
                  formatDateForInput(startOfMonth(new Date())) === startDate
                    ? "bg-accent text-white"
                    : "hover:bg-surface-2 text-muted",
                )}
                style={
                  formatDateForInput(startOfMonth(new Date())) === startDate
                    ? { background: "var(--accent)", color: "white" }
                    : {}
                }
              >
                الشهر الحالي
              </button>
              <button
                onClick={() => setRange(3)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-surface-2 text-muted transition-all"
              >
                3 أشهر
              </button>
              <button
                onClick={() => setRange(6)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-surface-2 text-muted transition-all"
              >
                6 أشهر
              </button>
              <button
                onClick={() => setRange(9)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-surface-2 text-muted transition-all"
              >
                9 أشهر
              </button>
              <button
                onClick={() => setRange(12)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-surface-2 text-muted transition-all"
              >
                سنة كاملة
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner className="w-8 h-8" />
        </div>
      ) : !data ? null : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="إجمالي الدخل"
              value={formatCurrency(data.summary.totalIncome)}
              subtitle={dateLabel}
              icon={<TrendingUp className="w-5 h-5" />}
              accentColor="var(--success)"
            />
            <StatCard
              title="المصروفات"
              value={formatCurrency(data.summary.totalExpenses)}
              subtitle={dateLabel}
              icon={<TrendingDown className="w-5 h-5" />}
              accentColor="var(--danger)"
            />
            <StatCard
              title="الرصيد الصافي"
              value={formatCurrency(data.summary.balance)}
              subtitle={data.summary.balance >= 0 ? "فائض" : "عجز"}
              icon={<Wallet className="w-5 h-5" />}
              accentColor={
                data.summary.balance >= 0 ? "var(--success)" : "var(--danger)"
              }
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
                      <div
                        className="w-28 text-xs font-medium flex-shrink-0"
                        style={{ color: "var(--muted)" }}
                      >
                        {CATEGORY_LABELS[category] ?? category}
                      </div>
                      <div
                        className="flex-1 h-2 rounded-full overflow-hidden"
                        style={{ background: "var(--surface-2)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%`, background: color }}
                        />
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className="text-xs w-8 text-right"
                          style={{ color: "var(--muted)" }}
                        >
                          {percentage}%
                        </span>
                        <span className="font-mono text-sm font-medium w-28 text-right">
                          {formatCurrency(amount)}
                        </span>
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
              <h3
                className="font-display text-lg mb-4"
                style={{ color: "var(--danger)" }}
              >
                المصروفات
                <span
                  className="mr-2 text-sm font-sans"
                  style={{ color: "var(--muted)" }}
                >
                  ({data.expenses.length})
                </span>
              </h3>
              {data.expenses.length === 0 ? (
                <p
                  className="text-sm text-center py-6"
                  style={{ color: "var(--muted)" }}
                >
                  لا شيء هذا الشهر
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.expenses.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between py-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {e.title}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--muted)" }}
                        >
                          {CATEGORY_LABELS[e.category]}
                        </p>
                      </div>
                      <span
                        className="text-sm font-mono mr-3 flex-shrink-0"
                        style={{ color: "var(--danger)" }}
                      >
                        -{formatCurrency(e.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Income list */}
            <Card>
              <h3
                className="font-display text-lg mb-4"
                style={{ color: "var(--success)" }}
              >
                الدخل
                <span
                  className="mr-2 text-sm font-sans"
                  style={{ color: "var(--muted)" }}
                >
                  ({data.incomes.length})
                </span>
              </h3>
              {data.incomes.length === 0 ? (
                <p
                  className="text-sm text-center py-6"
                  style={{ color: "var(--muted)" }}
                >
                  لا شيء هذا الشهر
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.incomes.map((inc) => (
                    <div
                      key={inc.id}
                      className="flex items-center justify-between py-1.5"
                    >
                      <p className="text-sm font-medium truncate flex-1">
                        {inc.source}
                      </p>
                      <span
                        className="text-sm font-mono mr-3 flex-shrink-0"
                        style={{ color: "var(--success)" }}
                      >
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
