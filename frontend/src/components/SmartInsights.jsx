import { Lightbulb, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function SmartInsights() {
  const { transactions, insights } = useStore();

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
      case 'danger':
        return AlertCircle;
      case 'success': 
        return CheckCircle;
      case 'tip': 
        return Lightbulb;
      default: 
        return TrendingUp;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'warning': return '#f59e0b';
      case 'danger': return '#ef4444';
      case 'success': return '#10b981';
      case 'tip': return '#8b5cf6';
      default: return '#3b82f6';
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="card insights-card">
        <div className="insights-header">
          <Lightbulb size={20} />
          <h3 className="card-heading">Smart Insights</h3>
        </div>
        <div className="empty-state">
          <p>Add transactions to get AI-powered spending insights!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card insights-card">
      <div className="insights-header">
        <Lightbulb size={20} className="insights-icon" />
        <h3 className="card-heading">Smart Insights</h3>
      </div>
      
      <div className="insights-list">
        {insights.map((insight, index) => {
          const Icon = getIcon(insight.type);
          return (
            <div key={index} className={`insight-item ${insight.type}`}>
              <Icon size={18} style={{ color: getIconColor(insight.type), flexShrink: 0 }} />
              <p>{insight.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
