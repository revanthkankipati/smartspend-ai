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
import TransactionFormatter from './components/TransactionFormatter';
import { Download, Trash2, Database, Loader2, CheckCircle2 } from 'lucide-react';
import './App.css';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [successMsg, setSuccessMsg] = useState('');
  const { 
    loadSampleData, 
    uploadCustomData, 
    clearAllData, 
    transactions,
    isUploading,
    isProcessing
  } = useStore();

  const handleDownloadDataset = () => {
    const cleanData = transactions.map(({ date, amount, category, name }) => ({
      date, amount, category, name
    }));
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cleanData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', 'converted-transactions.json');
    dlAnchorElem.click();
  };

  const handleUploadClick = () => {
    document.getElementById('file-upload').click();
  };

  const onFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const ok = await uploadCustomData(file);
      if (ok) {
        setSuccessMsg('Transactions uploaded successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
      e.target.value = null; // reset input
    }
  };

  const onSampleDataClick = async () => {
    await loadSampleData();
    setSuccessMsg('Sample data loaded!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="app">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        {successMsg && (
          <div className="alert-banner">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

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
              onChange={onFileUpload}
            />
            <button 
              className="btn btn-primary" 
              onClick={handleUploadClick}
              disabled={isUploading || isProcessing}
            >
              {isUploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Upload Transactions
                </>
              )}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={onSampleDataClick}
              disabled={isUploading || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Load Sample Data
                </>
              )}
            </button>
            {transactions.length > 0 && (
              <>
                <button className="btn btn-outline" onClick={handleDownloadDataset} title="Download normalized transactions format">
                  <Database size={18} />
                  Export JSON
                </button>
                <button className="btn btn-outline" onClick={clearAllData} disabled={isUploading || isProcessing}>
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

        {activeTab === 'formatter' && (
          <TransactionFormatter />
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
