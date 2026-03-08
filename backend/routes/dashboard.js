const express = require('express');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { calculateDashboard } = require('../utils/analytics');

const router = express.Router();

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    const all = await Transaction.find().sort({ date: 1 });
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Calculate previous month logic safely handling January
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear--;
    }

    // Filter transactions to current month
    const currentMonthTx = all.filter(t => {
      if (!t.date) return false;
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    // Filter transactions to previous month
    const prevMonthTx = all.filter(t => {
      if (!t.date) return false;
      const d = new Date(t.date);
      return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
    });

    let budgetDoc = await Budget.findOne();
    if (!budgetDoc) {
      budgetDoc = await Budget.create({ monthlyAmount: 15000, type: 'monthly' });
    }

    // Adjust current period based on budget type
    let currentPeriodTx = currentMonthTx;
    if (budgetDoc.type === 'weekly') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0,0,0,0);
      currentPeriodTx = all.filter(t => new Date(t.date) >= startOfWeek);
    }

    // Call lightweight node-based analytics engine dynamically
    const dashboard = calculateDashboard(currentPeriodTx, prevMonthTx, budgetDoc.monthlyAmount, all, budgetDoc.type);

    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

