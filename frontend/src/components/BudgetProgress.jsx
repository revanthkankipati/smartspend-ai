import { useState, useEffect } from 'react';
import { Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/helpers';

export default function BudgetProgress() {
  const { totalSpending, budget, budgetType, budgetPercent, setBudget } = useStore();
  const [localBudget, setLocalBudget] = useState(budget);

  useEffect(() => {
    setLocalBudget(budget);
  }, [budget]);

  const handleBudgetChange = (e) => {
    setLocalBudget(Math.max(0, parseInt(e.target.value) || 0));
  };

  const handleBudgetSubmit = () => {
    if (localBudget !== budget) {
      setBudget(localBudget, budgetType);
    }
  };

  const handleTypeToggle = (type) => {
    setBudget(budget, type);
  };

  const getStatusColor = () => {
    if (budgetPercent >= 85) return 'danger';
    if (budgetPercent >= 60) return 'warning';
    return 'success';
  };

  const getStatusIcon = () => {
    if (budgetPercent >= 85) return AlertTriangle;
    if (budgetPercent >= 60) return Target;
    return CheckCircle;
  };

  const getStatusMessage = () => {
    if (budgetPercent >= 100) return `Budget exceeded! Consider reducing ${budgetType} expenses.`;
    if (budgetPercent >= 85) return `Warning: Approaching ${budgetType} budget limit!`;
    if (budgetPercent >= 60) return 'You\'re doing okay, but watch your spending.';
    return `Great job! You're well within your ${budgetType} budget.`;
  };

  const StatusIcon = getStatusIcon();
  const statusColor = getStatusColor();

  return (
    <div className="card budget-card">
      <div className="budget-header">
        <div className="budget-title-area">
          <h3 className="card-heading">{budgetType.charAt(0).toUpperCase() + budgetType.slice(1)} Budget</h3>
          <div className="budget-toggle">
            <button 
              className={`toggle-btn ${budgetType === 'weekly' ? 'active' : ''}`}
              onClick={() => handleTypeToggle('weekly')}
            >
              Weekly
            </button>
            <button 
              className={`toggle-btn ${budgetType === 'monthly' ? 'active' : ''}`}
              onClick={() => handleTypeToggle('monthly')}
            >
              Monthly
            </button>
          </div>
        </div>
        <div className="budget-input-group">
          <label htmlFor="budget">Set Limit:</label>
          <div className="budget-input-wrapper">
            <span>₹</span>
            <input
              type="number"
              id="budget"
              value={localBudget}
              onChange={handleBudgetChange}
              onBlur={handleBudgetSubmit}
              min="0"
              step="100"
            />
          </div>
        </div>
      </div>

      <div className="budget-stats">
        <div className="budget-stat">
          <span className="stat-label">Spent</span>
          <span className="stat-value">{formatCurrency(totalSpending)}</span>
        </div>
        <div className="budget-stat">
          <span className="stat-label">Budget</span>
          <span className="stat-value">{formatCurrency(budget)}</span>
        </div>
        <div className="budget-stat">
          <span className="stat-label">Remaining</span>
          <span className={`stat-value ${statusColor}`}>
            {formatCurrency(Math.max(0, budget - totalSpending))}
          </span>
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className={`progress-fill ${statusColor}`}
            style={{ width: `${Math.min(100, budgetPercent)}%` }}
          />
        </div>
        <span className="progress-text">{budgetPercent}%</span>
      </div>

      <div className={`budget-status ${statusColor}`}>
        <StatusIcon size={18} />
        <span>{getStatusMessage()}</span>
      </div>
    </div>
  );
}
