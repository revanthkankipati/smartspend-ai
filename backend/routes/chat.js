const express = require('express');
const { generateGroqContent } = require('../utils/groqService');
const Transaction = require('../models/Transaction');

const router = express.Router();

// POST /api/chat
router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    // Fetch some basic dashboard context to pass to the system prompt
    const transactions = await Transaction.find().sort({ date: -1 }).limit(100);
    const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);

    const prompt = `You are SmartSpend AI – a financial assistant that helps users analyze their spending patterns.
    Total spending of recent 100 transactions is ₹${totalSpending}. 
    Recent transactions: ${JSON.stringify(transactions.map(t => ({ date: t.date, amount: t.amount, category: t.category, name: t.name || t.description }))) }
    
    User Query: ${message}`;

    const aiResponse = await generateGroqContent(prompt);

    res.json({ reply: aiResponse });
  } catch (error) {
    console.error('Chat AI Error:', error.message);
    
    // FETCH DATA for fallback analysis
    const allTransactions = await Transaction.find().sort({ date: -1 });
    const total = allTransactions.reduce((s, t) => s + t.amount, 0);
    const recent = allTransactions.slice(0, 5);
    const categoryCounts = allTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    const topCategory = Object.entries(categoryCounts).sort((a,b) => b[1] - a[1])[0];

    // Check if it's a quota error
    const isQuotaError = error.message.includes('429') || error.message.includes('quota');
    const quotaMsg = isQuotaError ? "Note: API quota exceeded. Providing local analysis." : "";

    let fallbackResponse = `[Local Analysis] ${quotaMsg}\n\n`;

    if (allTransactions.length === 0) {
      fallbackResponse += "I don't see any transactions in your account yet. Try using the 'Formatter' tab to upload some data or 'Load Sample Data' on the dashboard!";
    } else {
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('spent') || lowerMsg.includes('how much')) {
        fallbackResponse += `You've spent a total of ₹${total.toLocaleString()} across ${allTransactions.length} transactions.`;
      } else if (lowerMsg.includes('category') || lowerMsg.includes('where')) {
        fallbackResponse += topCategory 
          ? `Your highest spending is in the '${topCategory[0]}' category (₹${topCategory[1].toLocaleString()}).` 
          : "I'm still analyzing your categories.";
      } else if (lowerMsg.includes('health') || lowerMsg.includes('score')) {
        const score = total > 10000 ? 65 : 85; // Dummy logic for demo
        fallbackResponse += `Your Financial Health Score is currently ${score}/100 based on your local spending patterns.`;
      } else {
        fallbackResponse += `I'm analyzing your ${allTransactions.length} transactions. You've spent ₹${total.toLocaleString()} so far. Try asking about your 'spending' or 'categories'!`;
      }
      
      if (recent.length > 0) {
        fallbackResponse += `\n\nYour most recent expense was '${recent[0].name || recent[0].description}' for ₹${recent[0].amount}.`;
      }
    }
    
    res.json({ reply: fallbackResponse });
  }
});

module.exports = router;
