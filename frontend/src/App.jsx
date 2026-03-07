import { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Header from './components/Header';
import DashboardCards from './components/DashboardCards';
import ExpenseForm from './components/ExpenseForm';
import BudgetProgress from './components/BudgetProgress';
import SpendingCharts from './components/SpendingCharts';
import HealthScore from './components/HealthScore';
import TransactionTable from './components/TransactionTable';
import SmartInsights from './components/SmartInsights';
import { Download, Trash2 } from 'lucide-react';
import './App.css';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { loadSampleData, clearAllData, transactions } = useStore();

  return (
    <div className="app">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        <div className="welcome-section">
          <div className="welcome-text">
            <h1>Welcome to SmartSpend AI</h1>
            <p>Track your expenses, visualize spending patterns, and get AI-powered insights to improve your financial health.</p>
          </div>
          <div className="quick-actions">
            <button className="btn btn-secondary" onClick={loadSampleData}>
              <Download size={18} />
              Load Sample Data
            </button>
            {transactions.length > 0 && (
              <button className="btn btn-outline" onClick={clearAllData}>
                <Trash2 size={18} />
                Clear All
              </button>
            )}
          </div>
        </div>

        <DashboardCards />
        
        <div className="main-grid">
          <div className="left-column">
            <ExpenseForm />
            <BudgetProgress />
            <SmartInsights />
          </div>
          
          <div className="right-column">
            <SpendingCharts />
            <HealthScore />
          </div>
        </div>

        <TransactionTable />
      </main>

      <footer className="footer">
        <p>SmartSpend AI - Your Personal Finance Companion</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <Dashboard />
    </StoreProvider>
  );
}

export default App;
