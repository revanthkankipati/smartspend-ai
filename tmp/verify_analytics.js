const { calculateDashboard } = require('../backend/utils/analytics');

const mockTransactions = [
  { name: 'Uber', amount: 200, category: 'Transport', date: new Date().toISOString().split('T')[0] },
  { name: 'Swiggy', amount: 500, category: 'Food', date: new Date().toISOString().split('T')[0] },
  { name: 'Old Expense', amount: 1000, category: 'Other', date: '2020-01-01' }
];

const mockPrevTransactions = [];
const budget = 2000;

console.log('--- Testing Weekly Analytics ---');
const weeklyResult = calculateDashboard(
  mockTransactions.slice(0, 2), // mimicking current week filter
  mockPrevTransactions,
  budget,
  mockTransactions,
  'weekly'
);

if (weeklyResult.totalSpending === 700) {
  console.log('✅ PASS: Total spending calculated correctly.');
} else {
  console.log(`❌ FAIL: Expected 700, got ${weeklyResult.totalSpending}`);
}

if (weeklyResult.budgetType === 'weekly') {
  console.log('✅ PASS: Budget type correctly returned.');
} else {
  console.log(`❌ FAIL: Expected weekly, got ${weeklyResult.budgetType}`);
}

console.log('\n--- Testing Charts Data ---');
if (weeklyResult.weeklySpending.length > 0) {
  console.log('✅ PASS: Weekly spending chart data generated.');
} else {
  console.log('❌ FAIL: Weekly spending chart data empty.');
}
