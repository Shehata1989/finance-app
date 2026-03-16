// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, TrendingUp, TrendingDown, ShoppingBag, BarChart3, TrendingUpIcon, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/accounts", label: "الحسابات", icon: CreditCard },
  { href: "/expenses", label: "المصروفات", icon: TrendingDown },
  { href: "/income", label: "الدخل", icon: TrendingUp },
  { href: "/reports", label: "التقارير", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-full border-l flex-shrink-0"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--accent)", boxShadow: "0 0 12px rgba(124,106,247,0.4)" }}>
          <TrendingUpIcon className="w-4 h-4 text-white" />
        </div>
        <span className="font-display text-xl">FinanceOS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>
          القائمة
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active ? "text-white" : "hover:opacity-80"
              )}
              style={{
                background: active ? "var(--accent)" : "transparent",
                color: active ? "white" : "var(--muted)",
                boxShadow: active ? "0 0 12px rgba(124,106,247,0.25)" : "none",
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          © 2024 FinanceOS
        </p>
      </div>
    </aside>
  );
}
