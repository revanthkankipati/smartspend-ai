import { useState } from 'react';
import { Pencil, Trash2, Check, X, Filter } from 'lucide-react';
import { subDays, parseISO, startOfWeek } from 'date-fns';
import { useStore } from '../context/StoreContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import { categories, categoryColors } from '../data/sampleTransactions';

export default function TransactionTable() {
  const { transactions, deleteTransaction, updateTransaction, timeFilter, setTimeFilter } = useStore();
  const [filterCategory, setFilterCategory] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const getFilteredByTime = () => {
    const now = new Date();
    if (timeFilter === '7 Days') {
      const sevenDaysAgo = subDays(now, 7);
      return transactions.filter(t => parseISO(t.date) >= sevenDaysAgo);
    }
    if (timeFilter === 'Weekly') {
      const weekStart = startOfWeek(now);
      return transactions.filter(t => parseISO(t.date) >= weekStart);
    }
    if (timeFilter === 'Monthly') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return transactions.filter(t => parseISO(t.date) >= monthStart);
    }
    return transactions;
  };

  const timeFiltered = getFilteredByTime();
  const filteredTransactions = filterCategory === 'All'
    ? timeFiltered
    : timeFiltered.filter(t => t.category === filterCategory);

  const totalFilteredAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  const startEdit = (transaction) => {
    setEditingId(transaction.id);
    setEditData({ ...transaction });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = () => {
    updateTransaction(editingId, {
      ...editData,
      amount: parseFloat(editData.amount)
    });
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  if (transactions.length === 0) {
    return (
      <div className="card transaction-table-card">
        <h3 className="card-heading">Recent Transactions</h3>
        <div className="empty-state">
          <p>No transactions yet. Add your first expense or load sample data!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card transaction-table-card">
      <div className="table-header">
        <div className="table-title-group">
          <h3 className="card-heading">Historical Transactions</h3>
          <div className="time-filter-toggle">
            {['All', '7 Days', 'Weekly', 'Monthly'].map(period => (
              <button 
                key={period}
                className={`filter-btn ${timeFilter === period ? 'active' : ''}`}
                onClick={() => setTimeFilter(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        
        <div className="table-actions-group">
          <div className="summary-stats">
            <span className="summary-label">Total for period:</span>
            <span className="summary-value">{formatCurrency(totalFilteredAmount)}</span>
          </div>
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(transaction => (
              <tr key={transaction.id}>
                <td>
                  {editingId === transaction.id ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => handleEditChange('name', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <div className="transaction-name">
                      <span>{transaction.name}</span>
                      {transaction.notes && (
                        <span className="transaction-notes">{transaction.notes}</span>
                      )}
                    </div>
                  )}
                </td>
                <td>
                  {editingId === transaction.id ? (
                    <input
                      type="number"
                      value={editData.amount}
                      onChange={(e) => handleEditChange('amount', e.target.value)}
                      className="edit-input amount"
                    />
                  ) : (
                    <span className="amount">{formatCurrency(transaction.amount)}</span>
                  )}
                </td>
                <td>
                  {editingId === transaction.id ? (
                    <select
                      value={editData.category}
                      onChange={(e) => handleEditChange('category', e.target.value)}
                      className="edit-select"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  ) : (
                    <span 
                      className="category-badge"
                      style={{ backgroundColor: categoryColors[transaction.category] + '20', color: categoryColors[transaction.category] }}
                    >
                      {transaction.category}
                    </span>
                  )}
                </td>
                <td>
                  {editingId === transaction.id ? (
                    <input
                      type="date"
                      value={editData.date}
                      onChange={(e) => handleEditChange('date', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    formatDate(transaction.date)
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    {editingId === transaction.id ? (
                      <>
                        <button className="btn-icon success" onClick={saveEdit}>
                          <Check size={16} />
                        </button>
                        <button className="btn-icon danger" onClick={cancelEdit}>
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn-icon" onClick={() => startEdit(transaction)}>
                          <Pencil size={16} />
                        </button>
                        <button className="btn-icon danger" onClick={() => deleteTransaction(transaction.id)}>
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
