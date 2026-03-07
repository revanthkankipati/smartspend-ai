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
import ChatAssistant from './components/ChatAssistant';
import { Download, Trash2, Database } from 'lucide-react';
import './App.css';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { loadSampleData, uploadCustomData, clearAllData, transactions } = useStore();

  const handleDownloadDataset = () => {
    // Generate the JSON blob map and trigger download
    const cleanData = transactions.map(({ date, amount, category, description }) => ({
      date, amount, category, description
    }));
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cleanData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', 'converted-transactions.json');
    dlAnchorElem.click();
  };

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
            <input 
              type="file" 
              id="file-upload" 
              accept=".json,.csv"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  uploadCustomData(file);
                  e.target.value = null; // reset input
                }
              }}
            />
            <button className="btn btn-primary" onClick={() => document.getElementById('file-upload').click()}>
              <Download size={18} />
              Upload Transactions
            </button>
            <button className="btn btn-secondary" onClick={loadSampleData}>
              <Download size={18} />
              Load Sample Data
            </button>
            {transactions.length > 0 && (
              <>
                <button className="btn btn-outline" onClick={handleDownloadDataset} title="Download normalized transactions format">
                  <Database size={18} />
                  Export JSON
                </button>
                <button className="btn btn-outline" onClick={clearAllData}>
                  <Trash2 size={18} />
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            <DashboardCards />
            <div className="main-grid">
              <div className="left-column">
                <ExpenseForm />
                <BudgetProgress />
              </div>
              <div className="right-column">
                <SpendingCharts />
                <SmartInsights />
              </div>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            <DashboardCards />
            <div className="main-grid">
              <div className="left-column">
                <SpendingCharts />
              </div>
              <div className="right-column">
                <HealthScore />
                <SmartInsights />
              </div>
            </div>
          </>
        )}

        {activeTab === 'transactions' && (
          <>
            <ExpenseForm />
            <TransactionTable />
          </>
        )}
      </main>

      <footer className="footer">
        <p>SmartSpend AI - Your Personal Finance Companion</p>
      </footer>

      <ChatAssistant />
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
