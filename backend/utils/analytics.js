// pure helper functions for computing dashboard analytics

function totalSpending(transactions) {
  return transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
}

function categoryBreakdown(transactions) {
  const breakdown = {};
  transactions.forEach(t => {
    const cat = t.category || 'Other';
    breakdown[cat] = (breakdown[cat] || 0) + (t.amount || 0);
  });
  return breakdown;
}

function weeklySpending(transactions) {
  // week number within month (1-based)
  const weeks = {};
  transactions.forEach(t => {
    const d = new Date(t.date);
    const weekNum = Math.floor((d.getDate() - 1) / 7) + 1;
    weeks[weekNum] = (weeks[weekNum] || 0) + (t.amount || 0);
  });
  // convert to array of { week: n, amount }
  const result = Object.keys(weeks)
    .sort((a, b) => a - b)
    .map(w => ({ week: Number(w), amount: weeks[w] }));
  return result;
}

function healthScore(totalSpending, monthlyBudget) {
  if (monthlyBudget === 0) return 0;
  let score = 100 - (totalSpending / monthlyBudget) * 60;
  if (score < 0) score = 0;
  if (score > 100) score = 100;
  return Math.round(score);
}

function generateInsights(totalSpending, categoryData, weeklyData, monthlyBudget) {
  const insights = [];
  // rule 1: food spending > 40%
  const food = categoryData['Food'] || 0;
  if (totalSpending > 0 && food / totalSpending > 0.4) {
    insights.push('Food spending is unusually high');
  }
  // rule 2: weekly spending increasing two weeks in a row
  if (weeklyData.length >= 2) {
    const len = weeklyData.length;
    if (weeklyData[len - 1].amount > weeklyData[len - 2].amount) {
      insights.push('Spending trend increasing');
    }
  }
  return insights;
}

function calculateDashboard(transactions, monthlyBudget) {
  const total = totalSpending(transactions);
  const breakdown = categoryBreakdown(transactions);
  const weekly = weeklySpending(transactions);
  const score = healthScore(total, monthlyBudget);
  const remaining = monthlyBudget - total;
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).getDate();
  const avgDaily = Math.round(daysInMonth ? total / daysInMonth : 0);
  const insights = generateInsights(total, breakdown, weekly, monthlyBudget);

  return {
    totalSpending: total,
    remainingBudget: remaining,
    avgDailySpending: avgDaily,
    healthScore: score,
    categoryBreakdown: breakdown,
    weeklySpending: weekly,
    insights
  };
}

module.exports = { calculateDashboard };
