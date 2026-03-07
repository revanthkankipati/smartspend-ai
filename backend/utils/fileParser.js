const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');

// Extract generic transaction data from normalized row
const parsePhonePeOrGenericRow = (data) => {
  const date = data.date || data.Date || data['Transaction Date'] || data['Date'] || null;
  const amountStr = data.amount || data.Amount || data['Debit'] || null;
  const description = data.description || data.Description || data.notes || data['Narration'] || '';
  let category = data.category || data.Category || '';

  // Auto-categorize based on PhonePe description if category is missing
  if (!category && description) {
    const desc = description.toLowerCase();
    if (desc.includes('swiggy') || desc.includes('zomato') || desc.includes('restaurant') || desc.includes('lunch')) category = 'Food';
    else if (desc.includes('uber') || desc.includes('ola') || desc.includes('metro') || desc.includes('cab')) category = 'Transport';
    else if (desc.includes('amazon') || desc.includes('flipkart') || desc.includes('shoes') || desc.includes('clothes')) category = 'Shopping';
    else if (desc.includes('electricity') || desc.includes('recharge')) category = 'Bills';
    else if (desc.includes('movie') || desc.includes('concert') || desc.includes('game')) category = 'Entertainment';
  }

  if (date && amountStr) {
    return {
      date: date,
      amount: parseFloat(amountStr),
      category: category,
      description: description
    };
  }
  return null;
};

const parseFile = async (filePath, fileType, fileExtension) => {
  const results = [];

  if (fileType === 'application/json' || fileExtension === 'json') {
    const data = fs.readFileSync(filePath, 'utf8');
    const parsedData = JSON.parse(data);
    if (!Array.isArray(parsedData)) {
      throw new Error('JSON format invalid. Expected array of objects.');
    }
    // Allow JSON to use the categorizer logic if categories are missing
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
