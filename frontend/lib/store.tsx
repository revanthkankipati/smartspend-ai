"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

const API_BASE = "/api"; // proxy in vite.config forwards to backend port

export type Category = "Food" | "Transport" | "Shopping" | "Entertainment" | "Subscriptions" | "Other"

export interface Transaction {
  id: string
  name: string
  category: Category
  amount: number
  date: string
  notes?: string
}

interface StoreContextType {
  transactions: Transaction[]
  budget: number
  setBudget: (budget: number) => void
  addTransaction: (transaction: Omit<Transaction, "id">) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  importSampleTransactions: () => void
  refreshTransactions: () => void
  categoryFilter: Category | "All"
  setCategoryFilter: (filter: Category | "All") => void
  dateFilter: string
  setDateFilter: (date: string) => void
}

const StoreContext = createContext<StoreContextType | null>(null)

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error("useStore must be used within StoreProvider")
  }
  return context
}

const sampleTransactions: Omit<Transaction, "id">[] = [
  { name: "Swiggy", category: "Food", amount: 320, date: new Date().toISOString().split("T")[0], notes: "Dinner order" },
  { name: "Uber", category: "Transport", amount: 90, date: new Date().toISOString().split("T")[0], notes: "Ride to college" },
  { name: "Netflix", category: "Subscriptions", amount: 199, date: new Date(Date.now() - 86400000).toISOString().split("T")[0], notes: "Monthly subscription" },
  { name: "Amazon", category: "Shopping", amount: 750, date: new Date(Date.now() - 172800000).toISOString().split("T")[0], notes: "Study materials" },
  { name: "BookMyShow", category: "Entertainment", amount: 250, date: new Date(Date.now() - 259200000).toISOString().split("T")[0], notes: "Movie tickets" },
]

export function StoreProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budget, setBudget] = useState(10000)
  const [categoryFilter, setCategoryFilter] = useState<Category | "All">("All")
  const [dateFilter, setDateFilter] = useState("")

  // load initial data from server
const loadTransactions = useCallback(async () => {
    try {
      const tRes = await fetch(`${API_BASE}/transactions`);
      if (tRes.ok) {
        const data: any[] = await tRes.json();
        const normalized: Transaction[] = data.map((t) => ({
          id: t._id || t.id,
          name: t.name,
          category: t.category,
          amount: t.amount,
          date: t.date,
          notes: t.notes,
        }));
        setTransactions(normalized);
      }
    } catch (err) {
      console.error("Failed to load transactions", err);
    }
  }, []);

  const loadBudget = useCallback(async () => {
    try {
      const bRes = await fetch(`${API_BASE}/budget`);
      if (bRes.ok) {
        const b = await bRes.json();
        setBudget(b.monthlyAmount);
      }
    } catch (err) {
      console.error("Failed to load budget", err);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
    loadBudget();
  }, [loadTransactions, loadBudget]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, "id">) => {
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      if (res.ok) {
        const createdRaw = await res.json();
        const created: Transaction = {
          id: createdRaw._id || createdRaw.id,
          name: createdRaw.name,
          category: createdRaw.category,
          amount: createdRaw.amount,
          date: createdRaw.date,
          notes: createdRaw.notes,
        };
        setTransactions((prev) => [created, ...prev]);
      }
    } catch (err) {
      console.error("addTransaction failed", err);
    }
  }, [])

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updatedRaw: any = await res.json();
        const updated: Transaction = {
          id: updatedRaw._id || updatedRaw.id,
          name: updatedRaw.name,
          category: updatedRaw.category,
          amount: updatedRaw.amount,
          date: updatedRaw.date,
          notes: updatedRaw.notes,
        };
        setTransactions((prev) =>
          prev.map((t) => (t.id === id ? updated : t))
        );
      }
    } catch (err) {
      console.error("updateTransaction failed", err);
    }
  }, [])

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("deleteTransaction failed", err);
    }
  }, [])

  const importSampleTransactions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/transactions/sample`, { method: "POST" });
      if (res.ok) {
        const insertedRaw: any[] = await res.json();
        const inserted: Transaction[] = insertedRaw.map((t) => ({
          id: t._id || t.id,
          name: t.name,
          category: t.category,
          amount: t.amount,
          date: t.date,
          notes: t.notes,
        }));
        setTransactions((prev) => [...inserted, ...prev]);
      }
    } catch (err) {
      console.error("importSampleTransactions failed", err);
    }
  }, [])

  const setBudgetAndPersist = useCallback(async (newBudget: number) => {
    try {
      const res = await fetch(`${API_BASE}/budget`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyAmount: newBudget }),
      });
      if (res.ok) {
        const b = await res.json();
        setBudget(b.monthlyAmount);
      }
    } catch (err) {
      console.error("setBudget failed", err);
    }
  }, []);

  return (
    <StoreContext.Provider
      value={{
        transactions,
        budget,
        setBudget: setBudgetAndPersist,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        importSampleTransactions,
        refreshTransactions: loadTransactions,
        categoryFilter,
        setCategoryFilter,
        dateFilter,
        setDateFilter,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}
