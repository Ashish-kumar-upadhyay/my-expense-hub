import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CategoryId } from "./categories";

export type TxType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  category: CategoryId;
  date: string; // ISO yyyy-mm-dd
  note: string;
  merchant: string;
  createdAt: number;
}

interface Ctx {
  transactions: Transaction[];
  add: (tx: Omit<Transaction, "id" | "createdAt">) => void;
  update: (id: string, tx: Omit<Transaction, "id" | "createdAt">) => void;
  remove: (id: string) => void;
  totals: { balance: number; income: number; expense: number };
}

const TransactionsContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "fs.transactions.v1";

const seed = (): Transaction[] => {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const d = (offset: number) => {
    const x = new Date(today);
    x.setDate(x.getDate() - offset);
    return iso(x);
  };
  return [
    { id: "s1", type: "expense", amount: 1299, category: "technology", date: d(0), note: "", merchant: "Apple Store", createdAt: Date.now() - 1000 },
    { id: "s2", type: "income", amount: 6500, category: "income", date: d(1), note: "", merchant: "Monthly Salary", createdAt: Date.now() - 2000 },
    { id: "s3", type: "expense", amount: 42.5, category: "dining", date: d(2), note: "", merchant: "The Monocle Café", createdAt: Date.now() - 3000 },
    { id: "s4", type: "expense", amount: 840, category: "travel", date: d(3), note: "", merchant: "Lufthansa Airlines", createdAt: Date.now() - 4000 },
    { id: "s5", type: "expense", amount: 84.2, category: "dining", date: d(0), note: "", merchant: "Whole Foods Market", createdAt: Date.now() - 500 },
    { id: "s6", type: "expense", amount: 12.5, category: "travel", date: d(0), note: "Uber", merchant: "Uber Central", createdAt: Date.now() - 200 },
    { id: "s7", type: "expense", amount: 95, category: "bills", date: d(1), note: "", merchant: "Verizon Wireless", createdAt: Date.now() - 5000 },
    { id: "s8", type: "expense", amount: 180, category: "health", date: d(1), note: "", merchant: "Equinox Membership", createdAt: Date.now() - 6000 },
  ];
};

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setTransactions(JSON.parse(raw));
      } else {
        const s = seed();
        setTransactions(s);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      }
    } catch {
      setTransactions(seed());
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions, hydrated]);

  const value = useMemo<Ctx>(() => {
    const totals = transactions.reduce(
      (acc, t) => {
        if (t.type === "income") acc.income += t.amount;
        else acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );
    return {
      transactions,
      totals: { ...totals, balance: totals.income - totals.expense },
      add: (tx) =>
        setTransactions((prev) => [
          { ...tx, id: crypto.randomUUID(), createdAt: Date.now() },
          ...prev,
        ]),
      update: (id, tx) =>
        setTransactions((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...tx } : t))
        ),
      remove: (id) => setTransactions((prev) => prev.filter((t) => t.id !== id)),
    };
  }, [transactions]);

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error("useTransactions must be used within TransactionsProvider");
  return ctx;
}

export function formatCurrency(n: number, opts: { sign?: boolean } = {}) {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (opts.sign) return `${n < 0 ? "-" : "+"}$${formatted}`;
  return `$${formatted}`;
}

export function groupByDate(txs: Transaction[]) {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const todayIso = iso(today);
  const y = new Date(today); y.setDate(y.getDate() - 1);
  const yIso = iso(y);

  const groups: { label: string; date: string; items: Transaction[] }[] = [];
  const sorted = [...txs].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt));
  for (const t of sorted) {
    let label: string;
    if (t.date === todayIso) label = "Today";
    else if (t.date === yIso) label = "Yesterday";
    else {
      const d = new Date(t.date);
      label = d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    }
    let g = groups.find((g) => g.date === t.date);
    if (!g) { g = { label, date: t.date, items: [] }; groups.push(g); }
    g.items.push(t);
  }
  return groups;
}