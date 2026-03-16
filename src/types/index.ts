// src/types/index.ts

export interface Category {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  accountId: string;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  date: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  accountId: string;
}

export interface IncomeSource {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyData: MonthlyData[];
  categoryBreakdown: CategoryData[];
  recentExpenses: Expense[];
  recentIncomes: Income[];
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  color: string;
}

export interface FilterParams {
  startDate?: string;
  endDate?: string;
  category?: string;
  month?: string;
  accountId?: string;
}

export interface ApiError {
  error: string;
}
