import { createContext, useContext, useState, useMemo } from 'react';
import { sampleTransactions } from '../data/sampleTransactions';
import { 
  calculateTotalSpending, 
  calculateCategoryTotals, 
  calculateAverageDaily,
  calculateHealthScore,
  generateId 
} from '../utils/helpers';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(15000);

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: generateId()
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateTransaction = (id, updates) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  };

  const loadSampleData = () => {
    setTransactions(sampleTransactions);
  };

  const clearAllData = () => {
    setTransactions([]);
  };

  const calculations = useMemo(() => ({
    totalSpending: calculateTotalSpending(transactions),
    remainingBudget: budget - calculateTotalSpending(transactions),
    categoryTotals: calculateCategoryTotals(transactions),
    averageDaily: calculateAverageDaily(transactions),
    healthScore: calculateHealthScore(transactions, budget),
    budgetPercent: Math.round((calculateTotalSpending(transactions) / budget) * 100)
  }), [transactions, budget]);

  const value = {
    transactions,
    budget,
    setBudget,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    loadSampleData,
    clearAllData,
    ...calculations
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
