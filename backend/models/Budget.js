const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  // using monthlyAmount field to make intent clear
  monthlyAmount: Number,
  type: {
    type: String,
    enum: ['weekly', 'monthly'],
    default: 'monthly'
  }
});

module.exports = mongoose.model('Budget', budgetSchema);
