import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const API_URL = 'http://localhost:3000/api';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(15000);
  const [budgetType, setBudgetType] = useState('monthly');
  const [timeFilter, setTimeFilter] = useState('Monthly'); // 'All', '7 Days', 'Weekly', 'Monthly'
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
      const budgetRes = await fetch(`${API_URL}/budget`);
      const budgetData = await budgetRes.json();
      if (budgetData) {
         setBudget(budgetData.monthlyAmount);
         setBudgetType(budgetData.type || 'monthly');
      }

      const dashRes = await fetch(`${API_URL}/dashboard`);
      const dashData = await dashRes.json();
      setDashboardData(dashData);

      const txRes = await fetch(`${API_URL}/transactions`);
      const txData = await txRes.json();
      setTransactions((txData || []).map(t => ({ ...t, id: t._id })));

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

  const updateBudget = async (newAmount, newType) => {
    try {
      const body = {};
      if (newAmount !== undefined) body.monthlyAmount = newAmount;
      if (newType !== undefined) body.type = newType;

      await fetch(`${API_URL}/budget`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      loadData();
      if (newAmount !== undefined) setBudget(newAmount);
      if (newType !== undefined) setBudgetType(newType);
    } catch (err) { console.error(err); }
  };

  const loadSampleData = async () => {
    setIsProcessing(true);
    try {
      await fetch(`${API_URL}/transactions/sample`, { method: 'POST' });
      await loadData();
    } catch (err) { 
      console.error(err); 
    } finally {
      setIsProcessing(false);
    }
  };

  const uploadCustomData = async (file) => {
    setIsUploading(true);
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
      await loadData();
      return true;
    } catch (err) {
      console.error(err);
      alert(err.message);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const clearAllData = async () => {
    try {
      await fetch(`${API_URL}/transactions`, { method: 'DELETE' });
      loadData();
    } catch (err) { console.error(err); }
  };

  const formatTransactions = async (rawData) => {
    try {
      const res = await fetch(`${API_URL}/format-transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawData })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to format transactions.");
      }
      return await res.json();
    } catch (err) {
      console.error(err);
      alert(err.message);
      return null;
    }
  };

  const bulkAddTransactions = async (transactions) => {
    try {
      const res = await fetch(`${API_URL}/transactions/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactions)
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
    budgetType,
    timeFilter,
    setBudget: updateBudget,
    setTimeFilter,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    loadSampleData,
    uploadCustomData,
    clearAllData,
    formatTransactions,
    bulkAddTransactions,
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
    spendingChangePercent: dashboardData.spendingChangePercent || 0,
    isUploading,
    isProcessing
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
