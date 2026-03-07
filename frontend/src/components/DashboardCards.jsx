import { Wallet, PiggyBank, Heart, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/helpers';

export default function DashboardCards() {
  const { totalSpending, remainingBudget, healthScore, averageDaily, budget } = useStore();

  const cards = [
    {
      title: 'Total Spending',
      value: formatCurrency(totalSpending),
      icon: Wallet,
      trend: totalSpending > budget * 0.6 ? 'up' : 'down',
      trendText: totalSpending > budget * 0.6 ? 'Above average' : 'On track',
      color: 'primary'
    },
    {
      title: 'Remaining Budget',
      value: formatCurrency(Math.max(0, remainingBudget)),
      icon: PiggyBank,
      trend: remainingBudget > budget * 0.3 ? 'up' : 'down',
      trendText: remainingBudget > budget * 0.3 ? 'Looking good' : 'Running low',
      color: remainingBudget > 0 ? 'success' : 'danger'
    },
    {
      title: 'Health Score',
      value: `${healthScore}/100`,
      icon: Heart,
      trend: healthScore >= 70 ? 'up' : 'down',
      trendText: healthScore >= 70 ? 'Excellent' : healthScore >= 50 ? 'Good' : 'Needs work',
      color: healthScore >= 70 ? 'success' : healthScore >= 50 ? 'warning' : 'danger'
    },
    {
      title: 'Daily Average',
      value: formatCurrency(averageDaily),
      icon: TrendingUp,
      trend: averageDaily < budget / 30 ? 'up' : 'down',
      trendText: averageDaily < budget / 30 ? 'Under target' : 'Over target',
      color: 'info'
    }
  ];

  return (
    <div className="dashboard-cards">
      {cards.map((card, index) => (
        <div key={index} className={`card stat-card ${card.color}`}>
          <div className="card-header">
            <span className="card-title">{card.title}</span>
            <div className={`card-icon ${card.color}`}>
              <card.icon size={20} />
            </div>
          </div>
          <div className="card-value">{card.value}</div>
          <div className={`card-trend ${card.trend === 'up' ? 'positive' : 'negative'}`}>
            {card.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{card.trendText}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
