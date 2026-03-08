const express = require('express');
const { generateGroqContent } = require('../utils/groqService');

const router = express.Router();

const VALID_CATEGORIES = ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Other"];

// POST /api/format-transactions
router.post('/', async (req, res) => {
  const { rawData } = req.body;
  if (!rawData) return res.status(400).json({ error: 'rawData is required' });

  try {
    const prompt = `You are a financial data formatter. Convert the provided transaction data into a JSON object with a key 'transactions' containing an array of objects.
    Each object must have fields: date, amount, category, name, notes. 
    Category must be one of: ${VALID_CATEGORIES.join(', ')}. 
    Date format: YYYY-MM-DD. 
    Return ONLY a valid JSON object.
    
    Data:
    ${rawData}`;

    const data = await generateGroqContent(prompt, true);
    const result = data.transactions || (Array.isArray(data) ? data : []);

    res.json({ transactions: result, isFallback: false });
  } catch (error) {
    console.error('Formatter AI Error:', error.message);
    
    // Check if it's a quota/API error and provide a regex-based fallback
    if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('API')) {
      console.log('Using regex-based fallback for formatter...');
      const lines = rawData.split('\n').filter(l => l.trim().length > 0 && !l.toLowerCase().includes('date,'));
      const fallbackTransactions = [];

      for (const line of lines) {
        try {
          // SIMPLE CSV: 2026-03-01, Amazon, 499
          const csvMatch = line.split(',');
          if (csvMatch.length >= 3) {
            const date = csvMatch[0].trim();
            const name = csvMatch[1].trim();
            const amt = parseFloat(csvMatch[2].replace(/[₹,]/g, ''));
            if (!isNaN(amt)) {
              fallbackTransactions.push({
                date: date.includes('/') ? date.split('/').reverse().join('-') : date,
                amount: amt,
                category: "Other", // Default for fallback
                name: name,
                notes: "Imported via fallback"
              });
              continue;
            }
          }

          // SIMPLE JSON: {"transactionDate":"2026-03-01", "value":250, "merchant":"Swiggy"}
          if (line.trim().startsWith('{')) {
            const json = JSON.parse(line);
            fallbackTransactions.push({
              date: json.date || json.transactionDate || new Date().toISOString().split('T')[0],
              amount: parseFloat(json.amount || json.value || 0),
              category: json.category || "Other",
              name: json.name || json.merchant || "Transaction",
              notes: json.notes || "Imported via fallback"
            });
          }
        } catch (e) { /* ignore line */ }
      }

      if (fallbackTransactions.length > 0) {
        return res.json({ transactions: fallbackTransactions, isFallback: true });
      }
    }

    res.status(500).json({ error: 'Failed to format transactions: ' + error.message });
  }
});

module.exports = router;
