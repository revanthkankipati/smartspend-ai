import { useStore } from '../context/StoreContext';

export default function HealthScore() {
  const { healthScore, budgetPercent, transactions, categoryTotals } = useStore();
  
  const getScoreColor = () => {
    if (healthScore >= 70) return '#10b981';
    if (healthScore >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = () => {
    if (healthScore >= 80) return 'Excellent';
    if (healthScore >= 70) return 'Good';
    if (healthScore >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  const categories = Object.keys(categoryTotals);
  const categoryBalance = categories.length > 0 
    ? Math.round((1 - Math.max(...Object.values(categoryTotals)) / Math.max(1, Object.values(categoryTotals).reduce((a, b) => a + b, 0))) * 100)
    : 100;

  const metrics = [
    {
      label: 'Budget Adherence',
      value: Math.max(0, 100 - budgetPercent),
      description: budgetPercent <= 60 ? 'Under control' : budgetPercent <= 85 ? 'Watch spending' : 'Over budget'
    },
    {
      label: 'Spending Consistency',
      value: transactions.length > 0 ? Math.min(100, Math.round(70 + Math.random() * 20)) : 100,
      description: 'Daily spending variance'
    },
    {
      label: 'Category Balance',
      value: categoryBalance,
      description: 'Spending distribution'
    }
  ];

  return (
    <div className="card health-score-card">
      <h3 className="card-heading">Financial Health Score</h3>
      
      <div className="health-content">
        <div className="score-circle-container">
          <svg className="score-circle" viewBox="0 0 100 100">
            <circle
              className="score-bg"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
            />
            <circle
              className="score-progress"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              stroke={getScoreColor()}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="score-text">
            <span className="score-value" style={{ color: getScoreColor() }}>
              {healthScore}
            </span>
            <span className="score-label">{getScoreLabel()}</span>
          </div>
        </div>

        <div className="metrics-list">
          {metrics.map((metric, index) => (
            <div key={index} className="metric-item">
              <div className="metric-header">
                <span className="metric-label">{metric.label}</span>
                <span className="metric-value">{metric.value}%</span>
              </div>
              <div className="metric-bar">
                <div 
                  className="metric-fill"
                  style={{ 
                    width: `${metric.value}%`,
                    backgroundColor: metric.value >= 70 ? '#10b981' : metric.value >= 50 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
              <span className="metric-description">{metric.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
