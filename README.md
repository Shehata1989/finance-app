# FinanceOS — Home Finance Manager

A production-ready full-stack home finance app built with Next.js 14 App Router, TypeScript, Prisma, PostgreSQL, and Tailwind CSS.

## ✨ Features

- **Auth** — Register, login, logout with JWT stored in HTTP-only cookies
- **Dashboard** — All-time stats, 6-month income vs expense area chart, category pie chart, recent transactions
- **Expenses** — Full CRUD with title, amount, category, date, notes; date + category filters; search
- **Income** — Full CRUD with source, amount, date, notes; date filters; search
- **Purchases** — Full CRUD with item name, qty, unit price (auto-calculates total), category, date; filters + search
- **Reports** — Month picker, summary cards, trend chart, category breakdown with progress bars, per-category transaction lists
- **Responsive** — Collapsible mobile drawer nav, responsive tables

## 🗂 Folder Structure

```
finance-app/
├── prisma/
│   ├── schema.prisma       # DB schema (User, Expense, Income, Purchase)
│   └── seed.ts             # Demo data seeder
├── src/
│   ├── app/
│   │   ├── (auth)/         # Login & Register pages
│   │   ├── (dashboard)/    # Dashboard, Expenses, Income, Purchases, Reports
│   │   ├── api/            # REST API routes
│   │   │   ├── auth/       # login, register, logout
│   │   │   ├── expenses/   # CRUD
│   │   │   ├── income/     # CRUD
│   │   │   ├── purchases/  # CRUD
│   │   │   ├── dashboard/  # Aggregated stats
│   │   │   └── reports/    # Monthly reports
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── charts/         # IncomeExpenseChart, CategoryChart (Recharts)
│   │   ├── forms/          # ExpenseForm, IncomeForm, PurchaseForm
│   │   ├── layout/         # Sidebar, TopBar
│   │   └── ui/             # Button, Card, Modal, Input, Select, Filters, CategoryBadge…
│   ├── lib/
│   │   ├── auth.ts         # JWT sign/verify, session helpers
│   │   ├── prisma.ts       # Prisma singleton
│   │   └── utils.ts        # formatCurrency, formatDate, category maps, etc.
│   ├── middleware.ts        # Route protection
│   └── types/index.ts      # Shared TypeScript types
```

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/finance_db"
JWT_SECRET="your-random-32-char-secret-here"
```

Generate a secret:
```bash
openssl rand -base64 32
```

### 3. Set up the database

```bash
# Push schema to DB
npm run db:push

# (Optional) Run migrations instead
npm run db:migrate

# Seed demo data
npm run db:seed
```

### 4. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**Demo credentials:** `demo@financeapp.com` / `password123`

## 🏗 Production Build

```bash
npm run build
npm start
```

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT via `jose` + HTTP-only cookies |
| Styling | Tailwind CSS + CSS Variables |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Toasts | Sonner |
| Icons | Lucide React |

## 🗄 Database Schema

```prisma
User       { id, name, email, password, createdAt, updatedAt }
Expense    { id, title, amount, category, date, notes, userId }
Income     { id, source, amount, date, notes, userId }
Purchase   { id, name, quantity, price, category, date, notes, userId }
```

Categories: `FOOD · BILLS · TRANSPORT · SHOPPING · RENT · HEALTH · ENTERTAINMENT · EDUCATION · SAVINGS · OTHER`

## 🔒 Security

- Passwords hashed with bcrypt (cost 12)
- JWT in HTTP-only, Secure, SameSite=Lax cookies
- All API routes verify session before any DB query
- All DB queries scoped to `userId` — users can only access their own data
- Input validated with Zod on all API routes
