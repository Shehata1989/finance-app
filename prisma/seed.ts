// prisma/seed.ts
import { PrismaClient, Category } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@financeapp.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@financeapp.com",
      password: hashedPassword,
    },
  });

  console.log("Seeded user:", user.email);

  // Seed some expenses
  const expenses = [
    { title: "Grocery Shopping", amount: 120.5, category: Category.FOOD, date: new Date("2024-06-01"), notes: "Weekly groceries" },
    { title: "Electricity Bill", amount: 89.0, category: Category.BILLS, date: new Date("2024-06-05") },
    { title: "Bus Pass", amount: 45.0, category: Category.TRANSPORT, date: new Date("2024-06-07") },
    { title: "Netflix", amount: 15.99, category: Category.ENTERTAINMENT, date: new Date("2024-06-10") },
    { title: "Rent", amount: 1200.0, category: Category.RENT, date: new Date("2024-06-01") },
    { title: "Restaurant", amount: 65.0, category: Category.FOOD, date: new Date("2024-06-14") },
    { title: "Phone Bill", amount: 50.0, category: Category.BILLS, date: new Date("2024-06-15") },
    { title: "Gym Membership", amount: 40.0, category: Category.HEALTH, date: new Date("2024-06-20") },
  ];

  for (const expense of expenses) {
    await prisma.expense.create({ data: { ...expense, userId: user.id } });
  }

  // Seed some incomes
  const incomes = [
    { source: "Monthly Salary", amount: 3500.0, date: new Date("2024-06-01"), notes: "Net salary" },
    { source: "Freelance Project", amount: 800.0, date: new Date("2024-06-15") },
    { source: "Investment Returns", amount: 250.0, date: new Date("2024-06-20") },
  ];

  for (const income of incomes) {
    await prisma.income.create({ data: { ...income, userId: user.id } });
  }

  // Seed some purchases
  const purchases = [
    { name: "Rice (5kg)", quantity: 2, price: 8.5, category: Category.FOOD, date: new Date("2024-06-03") },
    { name: "Olive Oil", quantity: 1, price: 12.0, category: Category.FOOD, date: new Date("2024-06-03") },
    { name: "Notebook", quantity: 3, price: 3.5, category: Category.EDUCATION, date: new Date("2024-06-08") },
    { name: "Running Shoes", quantity: 1, price: 85.0, category: Category.SHOPPING, date: new Date("2024-06-12") },
    { name: "Vitamins", quantity: 1, price: 22.0, category: Category.HEALTH, date: new Date("2024-06-18") },
  ];

  for (const purchase of purchases) {
    await prisma.purchase.create({ data: { ...purchase, userId: user.id } });
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
