import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useStore } from '../context/StoreContext';
import { getWeeklyData, formatCurrency } from '../utils/helpers';
import { categoryColors } from '../data/sampleTransactions';

export default function SpendingCharts() {
  const { transactions, categoryTotals } = useStore();

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || '#6b7280'
  }));

  const weeklyData = getWeeklyData(transactions);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p>{payload[0].name || payload[0].payload.day}</p>
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
    </div>
  );
}
