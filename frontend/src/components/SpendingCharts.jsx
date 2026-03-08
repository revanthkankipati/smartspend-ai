import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { subDays, parseISO, startOfWeek } from 'date-fns';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/helpers';
import { categoryColors } from '../data/sampleTransactions';

export default function SpendingCharts() {
  const { transactions, categoryTotals, weeklyData, monthlyData = [], timeFilter } = useStore();

  const getFilteredTransactions = () => {
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

  const filteredTx = getFilteredTransactions();
  const filteredCategoryTotals = {};
  filteredTx.forEach(t => {
    filteredCategoryTotals[t.category] = (filteredCategoryTotals[t.category] || 0) + t.amount;
  });

  const pieData = Object.entries(filteredCategoryTotals).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || '#6b7280'
  }));


  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p>{payload[0].name || payload[0].payload.day || payload[0].payload.month}</p>
          <p className="tooltip-value">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (transactions.length === 0) {
    return (
      <div className="charts-grid">
        <div className="card chart-card">
          <h3 className="card-heading">Spending by Category</h3>
          <div className="empty-state">
            <p>Add transactions to see category breakdown</p>
          </div>
        </div>
        <div className="card chart-card">
          <h3 className="card-heading">Weekly Spending</h3>
          <div className="empty-state">
            <p>Add transactions to see weekly trends</p>
          </div>
        </div>
        <div className="card chart-card">
          <h3 className="card-heading">Monthly Spending</h3>
          <div className="empty-state">
            <p>Add transactions to see monthly trends</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="charts-grid">
      <div className="card chart-card">
        <h3 className="card-heading">Spending by Category</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom"
                formatter={(value) => <span style={{ color: '#64748b', fontSize: '12px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card chart-card">
        <h3 className="card-heading">Weekly Spending</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="amount" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card chart-card">
        <h3 className="card-heading">Monthly Spending</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="amount" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
