// src/components/layout/TopBar.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  LogOut,
  ChevronDown,
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Menu,
  X,
  Settings,
  User,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

const NAV_ITEMS = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/expenses", label: "المصروفات", icon: TrendingDown },
  { href: "/income", label: "الدخل", icon: TrendingUp },
  { href: "/reports", label: "التقارير", icon: BarChart3 },
];

interface Props {
  user: { name: string; email: string };
}

export default function TopBar({ user }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("تم تسجيل الخروج");
    router.push("/login");
    router.refresh();
  };

  const currentPage = NAV_ITEMS.find(
    (n) =>
      n.href === pathname ||
      (n.href !== "/dashboard" && pathname.startsWith(n.href)),
  );

  const pageTitle = currentPage?.label ?? "FinanceOS";
  const PageIcon = currentPage?.icon;

  return (
    <>
      <header
        className="flex items-center justify-between px-5 py-0 flex-shrink-0"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          height: "64px",
        }}
      >
        {/* Right side: Mobile trigger + Page Title */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:opacity-70 transition-opacity"
            style={{ color: "var(--muted)" }}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title — desktop only */}
          <div className="hidden lg:flex items-center gap-3">
            {PageIcon && (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--accent)", opacity: 0.9 }}
              >
                <PageIcon className="w-4 h-4 text-white" />
              </div>
            )}
            <div>
              <h2
                className="text-lg font-bold leading-none"
                style={{ color: "var(--foreground)", letterSpacing: "-0.01em" }}
              >
                {pageTitle}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                {new Date().toLocaleDateString("ar-EG", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Left side: Theme Toggle + User menu */}
        <div className="flex items-center gap-3">
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--accent)",
              }}
              title={theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 animate-slide-up" />
              ) : (
                <Moon className="w-5 h-5 animate-slide-up" />
              )}
            </button>
          )}

          <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--accent), #a78bfa)",
                color: "white",
                boxShadow: "0 0 10px rgba(124,106,247,0.4)",
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>

            {/* Name + email */}
            <div className="hidden sm:block text-right">
              <p
                className="text-sm font-semibold leading-none"
                style={{ color: "var(--foreground)" }}
              >
                {user.name}
              </p>
              <p
                className="text-xs mt-0.5 leading-none"
                style={{ color: "var(--muted)" }}
              >
                {user.email}
              </p>
            </div>

            <ChevronDown
              className="w-4 h-4 flex-shrink-0 transition-transform"
              style={{
                color: "var(--muted)",
                transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div
                className="absolute left-0 top-full mt-2 w-60 rounded-2xl overflow-hidden z-20 animate-slide-up"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                }}
              >
                {/* User info section */}
                <div
                  className="px-4 py-4"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(124,106,247,0.08), transparent)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--accent), #a78bfa)",
                        color: "white",
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--foreground)" }}
                      >
                        {user.name}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--muted)" }}
                      >
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="py-1.5 border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all hover:bg-surface-3"
                    style={{ color: "var(--foreground)" }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "rgba(124,106,247,0.12)",
                        color: "var(--accent)",
                      }}
                    >
                      <User className="w-3.5 h-3.5" />
                    </div>
                    الملف الشخصي
                  </Link>
                </div>

                <div className="py-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all hover:opacity-80"
                    style={{ color: "var(--danger)" }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(248,113,113,0.12)" }}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </div>
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="absolute right-0 top-0 bottom-0 w-80 flex flex-col animate-slide-in shadow-2xl"
            style={{
              background: "var(--surface)",
              borderLeft: "1px solid var(--border)",
            }}
          >
            {/* 1. Header Section */}
            <div
              className="flex items-center justify-between px-6 py-5 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: "var(--accent)" }}
                >
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span
                  className="font-bold text-xl tracking-tight"
                  style={{ color: "var(--foreground)" }}
                >
                  FinanceOS
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl hover:bg-surface-2 transition-colors"
                style={{ color: "var(--muted)" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* 2. User Profile Section */}
              <div
                className="mx-4 mt-6 p-4 rounded-2xl border transition-all"
                style={{
                  borderColor: "var(--border)",
                  background: "linear-gradient(135deg, var(--surface-2), transparent)",
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-md"
                    style={{
                      background: "linear-gradient(135deg, var(--accent), #a78bfa)",
                      color: "white",
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-base truncate" style={{ color: "var(--foreground)" }}>
                      {user.name}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>
                      {user.email}
                    </p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "var(--accent)", color: "white" }}
                >
                  <User className="w-3.5 h-3.5" />
                  الملف الشخصي
                </Link>
              </div>

              {/* 3. Main Navigation Section */}
              <div className="px-4 mt-8">
                <p className="px-2 text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
                  القائمة الرئيسية
                </p>
                <nav className="space-y-1.5">
                  {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                    const active =
                      pathname === href ||
                      (href !== "/dashboard" && pathname.startsWith(href));
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all group"
                        style={{
                          background: active ? "var(--accent-muted)" : "transparent",
                          color: active ? "var(--accent)" : "var(--muted)",
                          border: active ? "1px solid var(--accent)" : "1px solid transparent",
                        }}
                      >
                        <div 
                          className={`p-2 rounded-xl transition-colors ${active ? 'bg-accent text-white' : 'bg-surface-2 text-muted group-hover:text-accent'}`}
                          style={active ? { background: 'var(--accent)' } : {}}
                        >
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        {label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* 4. Settings Section */}
              <div className="px-4 mt-8 mb-8">
                <p className="px-2 text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
                  الإعدادات والمظهر
                </p>
                <div className="space-y-1.5">
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all"
                    style={{ background: "var(--surface-2)", color: "var(--muted)" }}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-2 rounded-xl bg-surface-3">
                        {theme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                      </div>
                      <span>{theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}</span>
                    </div>
                    <div className="w-10 h-5 rounded-full p-1 transition-colors" style={{ background: "var(--border)" }}>
                       <div className={`w-3 h-3 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-0' : 'translate-x-[20px]'}`} />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* 5. Footer Section */}
            <div
              className="p-6 border-t"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-bold transition-all hover:bg-danger/10"
                style={{
                  color: "var(--danger)",
                  border: "1px solid var(--danger)",
                }}
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
