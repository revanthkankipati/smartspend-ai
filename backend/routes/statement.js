const express = require('express');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { calculateDashboard } = require('../utils/analytics');
const { generateGroqContent } = require('../utils/groqService');

const router = express.Router();

function simpleParse(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
  const result = [];
  lines.forEach(line => {
    const parts = line.split(/[\t,]+/);
    if (parts.length >= 2) {
      const date = parts[0];
      const amount = parseFloat(parts[1].replace(/[^0-9.-]/g, ''));
      const name = parts[2] || '';
      if (!isNaN(amount)) {
        result.push({ name, amount, category: 'Other', date, notes: '' });
      }
    }
  });
  return result;
}

router.post('/parse', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'missing text' });

  let transactions = [];
  try {
    const prompt = `Extract transactions from the following bank statement.\n` +
      `Return a JSON object with a key 'transactions' containing an array of objects with keys name,amount,category,date,notes.\n` +
      `Use categories Food,Transport,Shopping,Entertainment,Subscriptions,Other.\n` +
      `Statement:\n"""${text}"""`;
    
    const data = await generateGroqContent(prompt, true);
    transactions = data.transactions || (Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('Groq parse error', err);
    transactions = simpleParse(text);
  }

  try {
    const inserted = await Transaction.insertMany(transactions);
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const monthTx = inserted.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    let budgetDoc = await Budget.findOne();
    if (!budgetDoc) budgetDoc = await Budget.create({ monthlyAmount: 0 });
    const analytics = calculateDashboard(monthTx, budgetDoc.monthlyAmount);
    res.json({ inserted, analytics });
  } catch (err) {
    console.error('statement route error', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/chat', async (req, res) => {
  const { prompt: userPrompt, transactions = [], budget = 0 } = req.body;
  if (!userPrompt) return res.status(400).json({ error: 'missing prompt' });

  try {
    const prompt = `You are a financial assistant. The user will supply a prompt and optional transactions data for context.
    Transactions: ${JSON.stringify(transactions).slice(0,1000)}
    Budget: ${budget}
    User question: ${userPrompt}`;

    const text = await generateGroqContent(prompt);
    res.json({ text });
  } catch (err) {
    console.error('chat error', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
