import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval, subDays } from 'date-fns';

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), 'dd MMM yyyy');
  } catch (e) {
    return dateString;
  }
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const calculateTotalSpending = (transactions) => {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
};

export const calculateCategoryTotals = (transactions) => {
  const totals = {};
  transactions.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });
  return totals;
};

export const calculateAverageDaily = (transactions) => {
  if (transactions.length === 0) return 0;
  
  const dates = [...new Set(transactions.map(t => t.date))];
  const total = calculateTotalSpending(transactions);
  return Math.round(total / Math.max(dates.length, 1));
};

export const getWeeklyData = (transactions) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekData = days.map(day => ({ day, amount: 0 }));
  
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  
  transactions.forEach(t => {
    const date = parseISO(t.date);
    if (isWithinInterval(date, { start: weekStart, end: weekEnd })) {
      const dayIndex = date.getDay();
      weekData[dayIndex].amount += t.amount;
    }
  });
  
  return weekData;
};

export const calculateHealthScore = (transactions, budget) => {
  if (transactions.length === 0) return 100;
  
  const total = calculateTotalSpending(transactions);
  const categoryTotals = calculateCategoryTotals(transactions);
  const categories = Object.keys(categoryTotals);
  
  // Budget adherence (40 points)
  const budgetRatio = total / budget;
  let budgetScore = 40;
  if (budgetRatio > 1) budgetScore = 0;
  else if (budgetRatio > 0.85) budgetScore = 15;
  else if (budgetRatio > 0.6) budgetScore = 30;
  
  // Category balance (30 points)
  const avgCategory = total / Math.max(categories.length, 1);
  const variance = categories.reduce((sum, cat) => {
    return sum + Math.pow(categoryTotals[cat] - avgCategory, 2);
  }, 0) / Math.max(categories.length, 1);
  const balanceScore = Math.max(0, 30 - (Math.sqrt(variance) / 100));
  
  // Spending consistency (30 points)
  const dailySpending = {};
  transactions.forEach(t => {
    dailySpending[t.date] = (dailySpending[t.date] || 0) + t.amount;
  });
  const dailyAmounts = Object.values(dailySpending);
  const avgDaily = dailyAmounts.reduce((a, b) => a + b, 0) / Math.max(dailyAmounts.length, 1);
  const dailyVariance = dailyAmounts.reduce((sum, amt) => {
    return sum + Math.pow(amt - avgDaily, 2);
  }, 0) / Math.max(dailyAmounts.length, 1);
  const consistencyScore = Math.max(0, 30 - (Math.sqrt(dailyVariance) / 50));
  
  return Math.round(budgetScore + balanceScore + consistencyScore);
};

export const generateInsights = (transactions, budget) => {
  const insights = [];
  const total = calculateTotalSpending(transactions);
  const categoryTotals = calculateCategoryTotals(transactions);
  
  // Budget insight
  const budgetPercent = Math.round((total / budget) * 100);
  if (budgetPercent > 85) {
    insights.push({
      type: 'warning',
      message: `You've used ${budgetPercent}% of your monthly budget. Consider reducing non-essential spending.`
    });
  } else if (budgetPercent > 60) {
    insights.push({
      type: 'info',
      message: `You're at ${budgetPercent}% of your budget with ${100 - budgetPercent}% remaining for the month.`
    });
  } else {
    insights.push({
      type: 'success',
      message: `Great job! You've only used ${budgetPercent}% of your budget. Keep it up!`
    });
  }
  
  // Category insights
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1]);
  
  if (sortedCategories.length > 0) {
    const [topCategory, topAmount] = sortedCategories[0];
    const topPercent = Math.round((topAmount / total) * 100);
    insights.push({
      type: 'info',
      message: `${topCategory} is your highest spending category at ${formatCurrency(topAmount)} (${topPercent}% of total).`
    });
  }
  
  // Food delivery insight
  if (categoryTotals['Food'] > budget * 0.25) {
    const potentialSaving = Math.round(categoryTotals['Food'] * 0.3);
    insights.push({
      type: 'tip',
      message: `Reducing food delivery orders could save you approximately ${formatCurrency(potentialSaving)}/month.`
    });
  }
  
  // Entertainment insight
  if (categoryTotals['Entertainment'] > budget * 0.15) {
    insights.push({
      type: 'tip',
      message: 'Consider sharing streaming subscriptions with friends to reduce entertainment costs.'
    });
  }
  
  return insights;
};
