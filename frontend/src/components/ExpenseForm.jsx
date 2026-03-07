import { useState } from 'react';
import { Plus, IndianRupee } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { categories } from '../data/sampleTransactions';

export default function ExpenseForm() {
  const { addTransaction } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;

    addTransaction({
      ...formData,
      amount: parseFloat(formData.amount)
    });

    setFormData({
      name: '',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card expense-form-card">
      <h3 className="card-heading">Add New Expense</h3>
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Expense Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Swiggy Order"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <div className="input-with-icon">
              <IndianRupee size={16} className="input-icon" />
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="notes">Notes (Optional)</label>
          <input
            type="text"
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add a note..."
          />
        </div>

        <button type="submit" className="btn btn-primary">
          <Plus size={18} />
          Add Expense
        </button>
      </form>
    </div>
  );
}
