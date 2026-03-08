const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');

// Extract generic transaction data from normalized row
const parsePhonePeOrGenericRow = (data) => {
  const date = data.date || data.Date || data['Transaction Date'] || data['Date'] || null;
  let amountStr = data.amount || data.Amount || data['Debit'] || data['Amount (INR)'] || null;
  const description = data.name || data.Name || data.description || data.Description || data.notes || data['Narration'] || '';
  let category = data.category || data.Category || '';

  // Clean amount string
  if (typeof amountStr === 'string') {
    amountStr = amountStr.replace(/[^0-9.-]/g, '');
  }
  
  const amount = parseFloat(amountStr);

  // Normalize category to Match Enum exactly if possible
  const categoriesMap = {
    'food': 'Food',
    'transport': 'Transport',
    'shopping': 'Shopping',
    'bills': 'Bills',
    'entertainment': 'Entertainment',
    'other': 'Other'
  };
  
  const normalizedCategory = categoriesMap[category.toLowerCase()] || 'Other';

  if (date && !isNaN(amount)) {
    return {
      date: date,
      amount: amount,
      category: normalizedCategory,
      name: description || 'Unnamed Transaction',
      notes: ''
    };
  }
  return null;
};

const parseFile = async (filePath, fileType, fileExtension) => {
  const results = [];

  if (fileType === 'application/json' || fileExtension === 'json') {
    const data = fs.readFileSync(filePath, 'utf8');
    let parsedData = JSON.parse(data);
    
    // Support both single object and array
    if (!Array.isArray(parsedData)) {
      parsedData = [parsedData];
    }

    parsedData.forEach(row => {
      const parsedRow = parsePhonePeOrGenericRow(row);
      if (parsedRow) results.push(parsedRow);
      else results.push(row); // fallback to raw row if missing critical fields
    });
  } else if (fileType === 'text/csv' || fileExtension === 'csv') {
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          const parsedRow = parsePhonePeOrGenericRow(data);
          if (parsedRow) results.push(parsedRow);
        })
        .on('end', resolve)
        .on('error', reject);
    });
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || fileExtension === 'xlsx') {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(sheet);
    rawData.forEach(row => {
      const parsedRow = parsePhonePeOrGenericRow(row);
      if (parsedRow) results.push(parsedRow);
    });
  } else {
    throw new Error('Unsupported file format. Please upload a CSV, JSON, or Excel file.');
  }

  return results;
};

module.exports = { parseFile };
