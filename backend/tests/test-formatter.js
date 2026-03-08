const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api/format-transactions';

const testData = [
  {
    name: 'PhonePe Snippet',
    data: 'Date,Type,Amount,Description\n2026-03-01,DEBIT,250,Swiggy'
  },
  {
    name: 'Bank Statement Snippet',
    data: '01/03/2026,Amazon,499'
  },
  {
    name: 'Random JSON Snippet',
    data: JSON.stringify({
      "transactionDate":"2026-03-01",
      "value":250,
      "merchant":"Swiggy"
    })
  }
];

async function runTests() {
  for (const test of testData) {
    console.log(`Testing: ${test.name}`);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawData: test.data })
      });
      
      if (!res.ok) {
        const err = await res.json();
        console.error(`FAILED: ${res.status}`, err);
        continue;
      }
      
      const transactions = await res.json();
      console.log(`SUCCESS: Found ${transactions.length} records`);
      console.log(JSON.stringify(transactions, null, 2));
    } catch (err) {
      console.error(`ERROR: ${err.message}`);
    }
    console.log('---');
  }
}

runTests();
