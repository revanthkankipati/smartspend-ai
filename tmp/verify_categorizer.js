const { localCategorize } = require('../backend/utils/openaiCategorizer');

const testCases = [
  { name: 'Swiggy Dinner', expected: 'Food' },
  { name: 'Uber Ride', expected: 'Transport' },
  { name: 'Amazon Shopping', expected: 'Shopping' },
  { name: 'Electricity Bill', expected: 'Bills' },
  { name: 'Netflix Subscription', expected: 'Entertainment' },
  { name: 'Random Transaction', expected: 'Other' }
];

console.log('--- Testing Local Categorization ---');
let allPassed = true;

testCases.forEach(tc => {
  const result = localCategorize(tc.name);
  if (result === tc.expected) {
    console.log(`✅ PASS: "${tc.name}" -> ${result}`);
  } else {
    console.log(`❌ FAIL: "${tc.name}" -> Expected ${tc.expected}, got ${result}`);
    allPassed = false;
  }
});

if (allPassed) {
  console.log('\nAll local categorization tests passed!');
} else {
  console.log('\nSome local categorization tests failed.');
  process.exit(1);
}
