// pure helper functions for computing dashboard analytics

function totalSpending(transactions) {
  return transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
}

function categoryBreakdownArray(transactions) {
  const breakdown = {};
  transactions.forEach(t => {
    const cat = t.category || 'Other';
    breakdown[cat] = (breakdown[cat] || 0) + (t.amount || 0);
  });
  return Object.keys(breakdown).map(cat => ({ category: cat, amount: breakdown[cat] }));
}

function weeklySpendingArray(transactions) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekData = days.map(day => ({ day, amount: 0 }));
  
  transactions.forEach(t => {
    if (!t.date) return;
    const date = new Date(t.date);
    if (isNaN(date.getTime())) return;
    const dayIndex = date.getDay();
    weekData[dayIndex].amount += (t.amount || 0);
  });
  
  return weekData;
}

function monthlySpendingArray(transactions) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthData = months.map(month => ({ month, amount: 0 }));
  
  transactions.forEach(t => {
    if (!t.date) return;
    const date = new Date(t.date);
    if (isNaN(date.getTime())) return;
    const monthIndex = date.getMonth();
    monthData[monthIndex].amount += (t.amount || 0);
  });
  
  // Only return months that have some spending to keep the chart clean
  return monthData.filter(m => m.amount > 0);
}

function healthScoreCalc(total, budget) {
  if (!budget || budget <= 0) return 0;
  let score = 100 - (total / budget) * 60;
  if (score < 0) score = 0;
  if (score > 100) score = 100;
  return Math.round(score);
}

function generateInsights(total, prevTotal, catBreakdown, budget, budgetType = 'monthly') {
  const insights = [];
  
  // Find Food spending
  const foodCat = catBreakdown.find(c => c.category === 'Food');
  const foodSpending = foodCat ? foodCat.amount : 0;
  
  // Rule 1: If food spending > 40% of total -> alert user.
  if (total > 0 && (foodSpending / total) > 0.40) {
    insights.push(`Food spending is unusually high! It accounts for over 40% of your ${budgetType} expenditures.`);
  }
  
  // Rule 2: Budget constraints
  if (budget > 0 && total >= budget) {
    insights.push(`Warning: You have exceeded your ${budgetType} budget.`);
  } else if (budget > 0 && total > budget * 0.8) {
    insights.push(`Alert: You have used over 80% of your budget for this ${budgetType === 'weekly' ? 'week' : 'month'}.`);
  }

  // Rule 3: Period over period comparison
  if (prevTotal > 0) {
    const diff = total - prevTotal;
    const percentChange = (diff / prevTotal) * 100;
    if (percentChange > 20) {
      insights.push(`Your spending has increased by ${Math.round(percentChange)}% compared to the previous ${budgetType === 'weekly' ? 'week' : 'month'}!`);
    } else if (percentChange < -10) {
      insights.push(`Great job! Your spending has decreased by ${Math.abs(Math.round(percentChange))}% compared to the previous ${budgetType === 'weekly' ? 'week' : 'month'}.`);
    }
  }
  
  // Default insight
  if (insights.length === 0) {
    insights.push(`Your ${budgetType} spending patterns look stable and healthy.`);
  }
  
  return insights;
}

function calculateDashboard(currentMonthTransactions, prevMonthTransactions, monthlyBudget, allTransactions = [], budgetType = 'monthly') {
  const total = totalSpending(currentMonthTransactions);
  const prevTotal = totalSpending(prevMonthTransactions);
  const catBreakdown = categoryBreakdownArray(currentMonthTransactions);
  const weekly = weeklySpendingArray(allTransactions.filter(t => {
    // Show last 7 days in weekly chart for better context
    const d = new Date(t.date);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return d >= sevenDaysAgo;
  }));
  const monthly = monthlySpendingArray(allTransactions);
  const score = healthScoreCalc(total, monthlyBudget);
  const remaining = monthlyBudget - total;
  
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const avgDaily = Math.round(daysInMonth ? total / daysInMonth : 0);
  
  const insights = generateInsights(total, prevTotal, catBreakdown, monthlyBudget, budgetType);

  const spendingChangePercent = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : 0;

  return {
    totalSpending: total,
    remainingBudget: remaining,
    avgDailySpending: avgDaily,
    healthScore: score,
    categoryBreakdown: catBreakdown,
    weeklySpending: weekly,
    monthlySpending: monthly,
    insights: insights,
    prevMonthSpending: prevTotal,
    spendingChangePercent: spendingChangePercent,
    budgetType: budgetType
  };
}

module.exports = { calculateDashboard };
