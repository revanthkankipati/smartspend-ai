const express = require('express');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { calculateDashboard } = require('../utils/analytics');

const router = express.Router();

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    const all = await Transaction.find().sort({ date: 1 });
    // filter transactions to current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthTransactions = all.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    let budgetDoc = await Budget.findOne();
    if (!budgetDoc) {
      budgetDoc = await Budget.create({ monthlyAmount: 15000 });
    }

    const dashboard = calculateDashboard(monthTransactions, budgetDoc.monthlyAmount);
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
