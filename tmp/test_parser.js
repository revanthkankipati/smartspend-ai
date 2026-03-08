const { parseFile } = require('../backend/utils/fileParser');
const path = require('path');

async function test() {
  const filePath = path.resolve(__dirname, '../sample-transactions-1.json');
  console.log('Testing with file:', filePath);
  try {
    const results = await parseFile(filePath, 'application/json', 'json');
    console.log('First result:', JSON.stringify(results[0], null, 2));
    console.log('Total results:', results.length);
  } catch (err) {
    console.error('Test Failed:', err.message);
  }
}

test();
