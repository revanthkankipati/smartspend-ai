const express = require('express');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { calculateDashboard } = require('../utils/analytics');

let openai;
if (process.env.OPENAI_API_KEY) {
  const OpenAI = require('openai');
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const router = express.Router();

// helper to parse simple CSV/statement if OpenAI key is not provided
function simpleParse(text) {
  // very naive: split lines, look for date and amount patterns
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
  const result = [];
  lines.forEach(line => {
    // assume comma-separated or tab-separated
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
  if (openai) {
    const prompt = `Extract transactions from the following bank statement.\n` +
      `Return a JSON array of objects with keys name,amount,category,date,notes.\n` +
      `Use categories Food,Transport,Shopping,Entertainment,Subscriptions,Other.\n` +
      `Statement:\n"""${text}"""`;
    try {
      const reply = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      });
      const answer = reply.choices[0].message.content;
      transactions = JSON.parse(answer);
    } catch (err) {
      console.error('OpenAI parse error', err);
      // fallback
      transactions = simpleParse(text);
    }
  } else {
    transactions = simpleParse(text);
  }

  // insert into DB and compute analytics for current month
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

// conversational helper endpoint
router.post('/chat', async (req, res) => {
  if (!openai) {
    return res.status(400).json({ error: 'OpenAI API key not configured' });
  }
  const { prompt, transactions = [], budget = 0 } = req.body;
  if (!prompt) return res.status(400).json({ error: 'missing prompt' });

  try {
    const systemMsg = `You are a financial assistant. The user will supply a prompt and optional transactions data for context.`;
    const userMsg = `Transactions: ${JSON.stringify(transactions).slice(0,1000)}\nBudget: ${budget}\nUser question: ${prompt}`;
    const reply = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user', content: userMsg },
      ],
      max_tokens: 500,
    });
    const text = reply.choices[0].message.content;
    res.json({ text });
  } catch (err) {
    console.error('chat error', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
