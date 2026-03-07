const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  // using monthlyAmount field to make intent clear
  monthlyAmount: Number
});

module.exports = mongoose.model('Budget', budgetSchema);
