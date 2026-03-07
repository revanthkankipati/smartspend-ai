const express = require('express');
const Budget = require('../models/Budget');

const router = express.Router();

// GET /api/budget
router.get('/', async (req, res) => {
  try {
    let data = await Budget.findOne();
    if (!data) {
      data = await Budget.create({ monthlyAmount: 15000 });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/budget
router.put('/', async (req, res) => {
  const { monthlyAmount } = req.body;
  try {
    let data = await Budget.findOne();
    if (!data) {
      data = await Budget.create({ monthlyAmount });
    } else {
      data.monthlyAmount = monthlyAmount;
      await data.save();
    }
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
