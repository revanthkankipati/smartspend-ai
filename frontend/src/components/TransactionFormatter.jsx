import { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Upload, FileText, Download, Database, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function TransactionFormatter() {
  const { formatTransactions, bulkAddTransactions } = useStore();
  const [rawData, setRawData] = useState('');
  const [formattedData, setFormattedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const fileInputRef = useRef(null);

  const handleFormat = async (overrideData) => {
    const textToProcess = typeof overrideData === 'string' ? overrideData : rawData;
    if (!textToProcess.trim()) return;
    setLoading(true);
    setSuccess(false);
    const result = await formatTransactions(textToProcess);
    if (result && result.transactions) {
      setFormattedData(result.transactions);
      setIsFallback(result.isFallback);
    }
    setLoading(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setRawData(content);
      handleFormat(content); // Trigger analysis immediately
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!formattedData) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formattedData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', 'converted-transactions.json');
    dlAnchorElem.click();
  };

  const handleUploadToAnalytics = async () => {
    if (!formattedData || formattedData.length === 0) return;
    setUploading(true);
    const ok = await bulkAddTransactions(formattedData);
    if (ok) {
      setSuccess(true);
      setFormattedData(null);
      setRawData('');
    }
    setUploading(false);
  };

  return (
    <div className="formatter-section">
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <FileText size={20} className="text-primary" />
            <h2>Transaction Dataset Formatter</h2>
          </div>
          <p className="card-subtitle">Paste raw data or upload a file to convert it into SmartSpend format using AI.</p>
        </div>

        <div className="formatter-grid">
          <div className="input-area">
            <label htmlFor="raw-data">Raw Transaction Data</label>
            <textarea
              id="raw-data"
              placeholder="Paste data here (e.g. 2026-03-01, Amazon, 499 or PhonePe CSV content...)"
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
              className="text-input"
              rows={10}
            />
            
            <div className="action-row">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv,.json,.txt"
                style={{ display: 'none' }}
              />
              <button className="btn btn-outline" onClick={() => fileInputRef.current.click()}>
                <Upload size={18} />
                Upload File
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleFormat}
                disabled={loading || !rawData.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Analyzing Data...
                  </>
                ) : (
                  <>
                    <Database size={18} />
                    Analyze & Format
                  </>
                )}
              </button>
            </div>
          </div>

          {formattedData && (
            <div className="preview-area">
              <div className="preview-header">
                <h3>Preview Converted Data ({formattedData.length} records)</h3>
                <div className="preview-actions">
                  <button className="btn btn-outline btn-sm" onClick={handleDownload}>
                    <Download size={16} />
                    Download JSON
                  </button>
                  <button 
                    className="btn btn-success btn-sm" 
                    onClick={handleUploadToAnalytics}
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Upload to Analytics
                  </button>
                </div>
              </div>

              {isFallback && (
                <div className="alert-notice">
                  <AlertCircle size={16} />
                  <span>AI quota exceeded. Used local regex fallback to parse your data.</span>
                </div>
              )}

              <div className="table-container">
                <table className="transaction-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Name</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formattedData.map((t, i) => (
                      <tr key={i}>
                        <td>{t.date}</td>
                        <td><span className={`category-badge ${t.category.toLowerCase()}`}>{t.category}</span></td>
                        <td>{t.name}</td>
                        <td className="amount">₹{t.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {success && (
            <div className="success-message">
              <CheckCircle2 size={24} />
              <span>Data successfully uploaded to analytics! Check your dashboard.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
