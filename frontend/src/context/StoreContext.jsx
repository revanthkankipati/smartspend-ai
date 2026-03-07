import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const API_URL = 'http://localhost:3000/api';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(15000);
  const [dashboardData, setDashboardData] = useState({
    totalSpending: 0,
    remainingBudget: 0,
    avgDailySpending: 0,
    healthScore: 100,
    categoryBreakdown: [],
    weeklySpending: [],
    insights: []
  });

  const loadData = useCallback(async () => {
    try {
      const txRes = await fetch(`${API_URL}/transactions`);
      const txData = await txRes.json();
      setTransactions((txData || []).map(t => ({ ...t, id: t._id })));

      const budgetRes = await fetch(`${API_URL}/budget`);
      const budgetData = await budgetRes.json();
      if (budgetData && budgetData.monthlyAmount) {
         setBudget(budgetData.monthlyAmount);
      }

      const dashRes = await fetch(`${API_URL}/dashboard`);
      const dashData = await dashRes.json();
      setDashboardData(dashData);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addTransaction = async (transaction) => {
    try {
      await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      });
      loadData();
    } catch (err) { console.error(err); }
  };

  const deleteTransaction = async (id) => {
    try {
      await fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) { console.error(err); }
  };

  const updateTransaction = async (id, updates) => {
    try {
      await fetch(`${API_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      loadData();
    } catch (err) { console.error(err); }
  };

  const updateBudget = async (newAmount) => {
    try {
      await fetch(`${API_URL}/budget`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyAmount: newAmount })
      });
      loadData();
      setBudget(newAmount);
    } catch (err) { console.error(err); }
  };

  const loadSampleData = async () => {
    try {
      await fetch(`${API_URL}/transactions/sample`, { method: 'POST' });
      loadData();
    } catch (err) { console.error(err); }
  };

  const uploadCustomData = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upload transactions.");
      }
      loadData();
      return true;
    } catch (err) {
      console.error(err);
      alert(err.message);
      return false;
    }
  };

  const clearAllData = async () => {
    try {
      await fetch(`${API_URL}/transactions`, { method: 'DELETE' });
      loadData();
    } catch (err) { console.error(err); }
  };

  // Map backend JSON back to what frontend components specifically expect
  const categoryTotals = useMemo(() => {
    const obj = {};
    (dashboardData.categoryBreakdown || []).forEach(item => {
      obj[item.category] = item.amount;
    });
    return obj;
  }, [dashboardData.categoryBreakdown]);

  const mappedInsights = useMemo(() => {
    return (dashboardData.insights || []).map(msg => {
      let type = 'info';
      const lowercaseMsg = msg.toLowerCase();
      if (lowercaseMsg.includes('warning') || lowercaseMsg.includes('high') || lowercaseMsg.includes('exceeded')) {
        type = 'warning';
      } else if (lowercaseMsg.includes('alert')) {
        type = 'danger';
      } else if (lowercaseMsg.includes('healthy') || lowercaseMsg.includes('great')) {
        type = 'success';
      } else if (lowercaseMsg.includes('tip') || lowercaseMsg.includes('consider')) {
        type = 'tip';
      }
      return { type, message: msg };
    });
  }, [dashboardData.insights]);

  const value = {
    transactions,
    budget,
    setBudget: updateBudget,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    loadSampleData,
    uploadCustomData,
    clearAllData,
    totalSpending: dashboardData.totalSpending || 0,
    remainingBudget: dashboardData.remainingBudget || 0,
    categoryTotals,
    averageDaily: dashboardData.avgDailySpending || 0,
    healthScore: dashboardData.healthScore || 0,
    budgetPercent: budget > 0 ? Math.round(((dashboardData.totalSpending || 0) / budget) * 100) : 0,
    weeklyData: dashboardData.weeklySpending || [],
    monthlyData: dashboardData.monthlySpending || [],
    insights: mappedInsights,
    prevMonthSpending: dashboardData.prevMonthSpending || 0,
    spendingChangePercent: dashboardData.spendingChangePercent || 0
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
