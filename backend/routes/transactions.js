const express = require('express');
const Transaction = require('../models/Transaction');

const router = express.Router();

// GET /api/transactions
router.get('/', async (req, res) => {
  try {
    const data = await Transaction.find().sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const t = await Transaction.create(req.body);
    res.json(t);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/transactions (clear all)
router.delete('/', async (req, res) => {
  try {
    await Transaction.deleteMany();
    res.json({ message: 'All transactions cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions/sample - insert some dummy records
router.post('/sample', async (req, res) => {
  const samples = [
    { name: 'Swiggy', amount: 350, category: 'Food', date: '2026-03-05', notes: 'Dinner' },
    { name: 'Uber', amount: 220, category: 'Transport', date: '2026-03-04', notes: 'Ride' },
    { name: 'Netflix', amount: 649, category: 'Entertainment', date: '2026-03-03', notes: 'Subscription' },
    { name: 'Amazon', amount: 1299, category: 'Shopping', date: '2026-03-03', notes: 'Headphones' },
    { name: 'BookMyShow', amount: 400, category: 'Entertainment', date: '2026-03-02', notes: 'Movie' },
    { name: 'Zomato', amount: 290, category: 'Food', date: '2026-03-02', notes: 'Lunch' },
    { name: 'Metro Card', amount: 500, category: 'Transport', date: '2026-03-01', notes: 'Recharge' },
    { name: 'Electricity Bill', amount: 1200, category: 'Bills', date: '2026-03-01', notes: 'Monthly' },
    { name: 'Swiggy', amount: 280, category: 'Food', date: '2026-02-28', notes: 'Snacks' },
    { name: 'Amazon', amount: 899, category: 'Shopping', date: '2026-02-27', notes: 'Keyboard' }
  ];
  try {
    const inserted = await Transaction.insertMany(samples);
    res.json(inserted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
