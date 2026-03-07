const express = require('express');
const { OpenAI } = require('openai');
const Transaction = require('../models/Transaction');
require('dotenv').config();

const router = express.Router();

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// POST /api/chat
router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  if (!openai) {
    return res.json({ 
      response: "Hello! I am SmartSpend AI. To give you highly intelligent financial advice, please link your OpenAI API Key inside the .env file."
    });
  }

  try {
    // Fetch some basic dashboard context to pass to the system prompt
    const transactions = await Transaction.find().sort({ date: -1 }).limit(100);
    const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a financial advisor assistant for SmartSpend AI. Answer the user's questions about their spending habits concisely. 
Context: Total spending of recent 100 transactions is ₹${totalSpending}. 
Here are the recent transactions as context JSON: ${JSON.stringify(transactions.map(t => ({ date: t.date, amount: t.amount, category: t.category, desc: t.description }))) }`
        },
        { role: 'user', content: message }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error('Chat AI Error:', error.message);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

module.exports = router;
