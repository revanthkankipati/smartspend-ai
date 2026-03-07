const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  category: {
    type: String,
    enum: ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Other"]
  },
  date: String, // ISO-style date string (YYYY-MM-DD)
  notes: String
});

module.exports = mongoose.model('Transaction', transactionSchema);
