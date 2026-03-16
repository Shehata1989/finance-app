// src/components/ui/Filters.tsx
"use client";

import { useEffect, useState } from "react";
import { CATEGORY_LABELS } from "@/lib/utils";
import { FilterParams, Category, Account } from "@/types";
import { Filter as FilterIcon, X as XIcon } from "lucide-react";

interface Props {
  filters: FilterParams;
  onChange: (f: FilterParams) => void;
  showCategory?: boolean;
}

export default function Filters({
  filters,
  onChange,
  showCategory = true,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const hasFilters =
    filters.startDate ||
    filters.endDate ||
    (filters.category && filters.category !== "ALL") ||
    (filters.accountId && filters.accountId !== "ALL");

  useEffect(() => {
    if (showCategory) {
      fetch("/api/categories")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setCategories(data);
          }
        })
        .catch(() => {});
    }

    fetch("/api/accounts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const sorted = [...data].sort((a) => (a.name.includes("رئيسي") ? -1 : 1));
          setAccounts(sorted);
        }
      })
      .catch(() => {});
  }, [showCategory]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        className="flex items-center gap-1.5 text-xs font-medium"
        style={{ color: "var(--muted)" }}
      >
        <FilterIcon className="w-3.5 h-3.5" />
        تصفية
      </div>

      <input
        type="date"
        value={filters.startDate ?? ""}
        onChange={(e) =>
          onChange({ ...filters, startDate: e.target.value || undefined })
        }
        className="px-3 py-2 rounded-lg text-xs"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
        }}
      />
      <span className="text-xs" style={{ color: "var(--muted)" }}>
        إلى
      </span>
      <input
        type="date"
        value={filters.endDate ?? ""}
        onChange={(e) =>
          onChange({ ...filters, endDate: e.target.value || undefined })
        }
        className="px-3 py-2 rounded-lg text-xs"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
        }}
      />

      {showCategory && (
        <select
          value={filters.category ?? "ALL"}
          onChange={(e) =>
            onChange({
              ...filters,
              category: e.target.value === "ALL" ? undefined : e.target.value,
            })
          }
          className="px-3 py-2 rounded-lg text-xs appearance-none"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color:
              filters.category && filters.category !== "ALL"
                ? "var(--accent-foreground)"
                : "var(--muted)",
          }}
        >
          <option value="ALL" style={{ background: "var(--surface-2)" }}>جميع الفئات</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name} style={{ background: "var(--surface-2)" }}>
              {c.name}
            </option>
          ))}
        </select>
      )}

      <select
        value={filters.accountId ?? "ALL"}
        onChange={(e) =>
          onChange({
            ...filters,
            accountId: e.target.value === "ALL" ? undefined : e.target.value,
          })
        }
        className="px-3 py-2 rounded-lg text-xs appearance-none"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          color:
            filters.accountId && filters.accountId !== "ALL"
              ? "var(--accent-foreground)"
              : "var(--muted)",
        }}
      >
        <option value="ALL" style={{ background: "var(--surface-2)" }}>جميع الحسابات</option>
        {accounts.map((a) => (
          <option
            key={a.id}
            value={a.id}
            style={{ background: "var(--surface-2)" }}
          >
            {a.name}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={() => onChange({})}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors hover:opacity-80"
          style={{
            background: "rgba(248,113,113,0.12)",
            color: "var(--danger)",
            border: "1px solid rgba(248,113,113,0.2)",
          }}
        >
          <XIcon className="w-3 h-3" /> مسح
        </button>
      )}
    </div>
  );
}
