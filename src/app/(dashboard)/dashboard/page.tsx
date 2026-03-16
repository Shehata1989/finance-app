// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Wallet, Activity, Plus } from "lucide-react";
import Link from "next/link";
import { DashboardStats } from "@/types";
import { formatCurrency, formatDate, CATEGORY_LABELS } from "@/lib/utils";
import { Card, StatCard, Spinner } from "@/components/ui";
import IncomeExpenseChart from "@/components/charts/IncomeExpenseChart";
import CategoryChart from "@/components/charts/CategoryChart";
import CategoryBadge from "@/components/ui/CategoryBadge";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!stats) return null;

  const balance = stats.balance;
  const balanceColor = balance >= 0 ? "var(--success)" : "var(--danger)";

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">نظرة عامة</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            ملخصك المالي — إجمالي الفترة
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/income"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{ background: "rgba(52,211,153,0.12)", color: "var(--success)", border: "1px solid rgba(52,211,153,0.2)" }}>
            <Plus className="w-4 h-4" /> دخل
          </Link>
          <Link href="/expenses"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{ background: "rgba(248,113,113,0.12)", color: "var(--danger)", border: "1px solid rgba(248,113,113,0.2)" }}>
            <Plus className="w-4 h-4" /> مصروف
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="إجمالي الدخل"
          value={formatCurrency(stats.totalIncome)}
          subtitle="جميع الإيرادات"
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="var(--success)"
        />
        <StatCard
          title="إجمالي المصروفات"
          value={formatCurrency(stats.totalExpenses)}
          subtitle="جميع المصروفات"
          icon={<TrendingDown className="w-5 h-5" />}
          accentColor="var(--danger)"
        />
        <StatCard
          title="الرصيد الصافي"
          value={formatCurrency(Math.abs(balance))}
          subtitle={balance >= 0 ? "فائض" : "عجز"}
          icon={<Wallet className="w-5 h-5" />}
          accentColor={balanceColor}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-display text-xl mb-6">الدخل مقابل المصروفات</h3>
          <IncomeExpenseChart data={stats.monthlyData} />
        </Card>
        <Card>
          <h3 className="font-display text-xl mb-6">هذا الشهر</h3>
          <CategoryChart data={stats.categoryBreakdown} />
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl">آخر المصروفات</h3>
            <Link href="/expenses" className="text-xs font-medium hover:opacity-80"
              style={{ color: "var(--accent-foreground)" }}>عرض الكل ←</Link>
          </div>
          {stats.recentExpenses.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>لا توجد مصروفات بعد</p>
          ) : (
            <div className="space-y-3">
              {stats.recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between py-2.5 border-b last:border-0"
                  style={{ borderColor: "var(--border-subtle)" }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                      style={{ background: "rgba(248,113,113,0.12)", color: "var(--danger)" }}>
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{expense.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <CategoryBadge category={expense.category} />
                        <span className="text-xs" style={{ color: "var(--muted)" }}>{formatDate(expense.date)}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium mr-3 flex-shrink-0" style={{ color: "var(--danger)" }}>
                    -{formatCurrency(expense.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Income */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl">آخر الإيرادات</h3>
            <Link href="/income" className="text-xs font-medium hover:opacity-80"
              style={{ color: "var(--accent-foreground)" }}>عرض الكل ←</Link>
          </div>
          {stats.recentIncomes.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>لا توجد إيرادات بعد</p>
          ) : (
            <div className="space-y-3">
              {stats.recentIncomes.map((income) => (
                <div key={income.id} className="flex items-center justify-between py-2.5 border-b last:border-0"
                  style={{ borderColor: "var(--border-subtle)" }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(52,211,153,0.12)", color: "var(--success)" }}>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{income.source}</p>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>{formatDate(income.date)}</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium mr-3 flex-shrink-0" style={{ color: "var(--success)" }}>
                    +{formatCurrency(income.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
