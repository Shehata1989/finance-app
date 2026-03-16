// src/components/ui/index.tsx
"use client";

import { cn } from "@/lib/utils";
import { Loader2, X } from "lucide-react";
import React from "react";

// ─── Button ──────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  children, variant = "primary", size = "md", loading, className, disabled, ...props
}: ButtonProps) {
  const styles = {
    primary: { background: "var(--accent)", color: "white", boxShadow: "0 0 16px rgba(124,106,247,0.25)" },
    secondary: { background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" },
    ghost: { background: "transparent", color: "var(--muted)" },
    danger: { background: "rgba(248,113,113,0.12)", color: "var(--danger)", border: "1px solid rgba(248,113,113,0.2)" },
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2.5 text-sm", lg: "px-6 py-3 text-base" };

  return (
    <button
      className={cn("inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-85 active:scale-[0.98]", sizes[size], className)}
      style={styles[variant]}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium mb-1.5">{label}</label>}
      <input
        ref={ref}
        className={cn("w-full px-3.5 py-2.5 rounded-lg text-sm transition-all", className)}
        style={{
          background: "var(--surface-2)",
          border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
          color: "var(--foreground)",
        }}
        {...props}
      />
      {error && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{error}</p>}
    </div>
  );
});

// ─── Select ──────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, placeholder, options, className, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium mb-1.5">{label}</label>}
      <select
        ref={ref}
        className={cn("w-full px-3.5 py-2.5 rounded-lg text-sm transition-all appearance-none cursor-pointer", className)}
        style={{
          background: "var(--surface-2)",
          border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
          color: "var(--foreground)",
        }}
        {...props}
      >
        {placeholder && (
          <option value="" disabled style={{ background: "var(--surface-2)" }}>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "var(--surface-2)" }}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{error}</p>}
    </div>
  );
});

// ─── Textarea ────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium mb-1.5">{label}</label>}
      <textarea
        ref={ref}
        className={cn("w-full px-3.5 py-2.5 rounded-lg text-sm transition-all resize-none", className)}
        style={{
          background: "var(--surface-2)",
          border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
          color: "var(--foreground)",
        }}
        {...props}
      />
      {error && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{error}</p>}
    </div>
  );
});

// ─── Card ────────────────────────────────────────────────────────────────────
interface CardProps { children: React.ReactNode; className?: string; }

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("rounded-2xl p-6", className)}
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      {children}
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl animate-slide-up"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-display text-xl">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:opacity-70"
            style={{ color: "var(--muted)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
interface BadgeProps { children: React.ReactNode; color?: string; }

export function Badge({ children, color = "var(--accent)" }: BadgeProps) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
      {children}
    </span>
  );
}

// ─── EmptyState ──────────────────────────────────────────────────────────────
interface EmptyStateProps { message: string; action?: React.ReactNode; icon?: React.ReactNode; }

export function EmptyState({ message, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4" style={{ color: "var(--muted)" }}>{icon}</div>}
      <p className="text-sm" style={{ color: "var(--muted)" }}>{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("animate-spin", className)} style={{ color: "var(--accent)" }} />;
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  accentColor?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, accentColor = "var(--accent)" }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--muted)" }}>{title}</p>
          <p className="font-display text-3xl truncate" style={{ color: "var(--foreground)" }}>{value}</p>
          {subtitle && <p className="text-xs mt-1.5" style={{ color: "var(--muted)" }}>{subtitle}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-4"
          style={{ background: `${accentColor}1a`, color: accentColor }}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
