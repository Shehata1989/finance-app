// src/components/ui/CategoryBadge.tsx
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/utils";

interface Props {
  category: string;
  size?: "sm" | "md";
}

export default function CategoryBadge({ category, size = "sm" }: Props) {
  // Try to find in hardcoded first (for seeded ones)
  const color = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ?? "#7c6af7";
  const label = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ?? category;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}`}
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      {label}
    </span>
  );
}
