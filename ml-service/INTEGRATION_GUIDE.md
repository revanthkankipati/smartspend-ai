# SmartSpend AI - Backend Integration Guide

This guide explains how to integrate the ML service with your Node.js backend.

## Overview

Your SmartSpend AI backend will:
1. Receive transactions from the frontend
2. Store them in MongoDB
3. Forward them to the ML service for analysis
4. Return predictions and insights to the frontend

## Integration Steps

### Step 1: Add ML Service Environment Variables

Create/update `.env` file in your backend:

```env
# ML Service Configuration
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_TIMEOUT=30000
```

In production:
```env
ML_SERVICE_URL=http://ml-service:8000  # Docker compose
ML_SERVICE_TIMEOUT=30000
```

### Step 2: Create ML Service Client

Create `backend/utils/mlService.js`:

```javascript
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const TIMEOUT = parseInt(process.env.ML_SERVICE_TIMEOUT) || 30000;

const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Analyze spending transactions using ML service
 * @param {Array} transactions - Transaction array
 * @returns {Promise} Analysis results
 */
async function analyzeSpending(transactions) {
  try {
    if (!transactions || transactions.length === 0) {
      throw new Error('No transactions provided');
    }

    const response = await mlClient.post('/analyze', transactions);
    return response.data;
  } catch (error) {
    console.error('ML Service Error (analyze):', error.message);
    throw new Error(`Analysis failed: ${error.message}`);
  }
}

/**
 * Train ML model with user transactions
 * @param {Array} transactions - Transaction array for training
 * @returns {Promise} Training results
 */
async function trainModel(transactions) {
  try {
    if (!transactions || transactions.length < 2) {
      throw new Error('Minimum 2 transactions required for training');
    }

    const response = await mlClient.post('/train', { transactions });
    return response.data;
  } catch (error) {
    console.error('ML Service Error (train):', error.message);
    throw new Error(`Training failed: ${error.message}`);
  }
}

/**
 * Check ML service health
 * @returns {Promise} Service health status
 */
async function healthCheck() {
  try {
    const response = await mlClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('ML Service Health Check Failed:', error.message);
    return { status: 'unhealthy', error: error.message };
  }
}

/**
 * Get ML model status
 * @returns {Promise} Model status and info
 */
async function getModelStatus() {
  try {
    const response = await mlClient.get('/model/status');
    return response.data;
  } catch (error) {
    console.error('ML Service Error (status):', error.message);
    throw new Error(`Status check failed: ${error.message}`);
  }
}

module.exports = {
  analyzeSpending,
  trainModel,
  healthCheck,
  getModelStatus
};
```

### Step 3: Create API Routes

Create `backend/routes/analysis.js`:

```javascript
const router = require('express').Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { analyzeSpending, trainModel } = require('../utils/mlService');

/**
 * POST /api/analysis/analyze
 * Analyze user's spending
 */
router.post('/analyze', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's transactions from MongoDB
    const transactions = await Transaction.find({ userId })
      .select('name amount category date notes')
      .sort({ date: -1 })
      .lean();
    
    if (transactions.length === 0) {
      return res.status(400).json({
        error: 'No transactions found for analysis'
      });
    }
    
    // Convert MongoDB dates to string format (YYYY-MM-DD)
    const formattedTransactions = transactions.map(t => ({
      name: t.name,
      amount: t.amount,
      category: t.category,
      date: t.date.toISOString().split('T')[0],
      notes: t.notes || ''
    }));
    
    // Call ML service
    const analysis = await analyzeSpending(formattedTransactions);
    
    // Optional: Save analysis to database
    // await Analysis.create({ userId, analysis, createdAt: new Date() });
    
    res.json({
      success: true,
      data: analysis,
      transactionCount: transactions.length
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: error.message,
      hint: 'Check if ML service is running on http://localhost:8000'
    });
  }
});

/**
 * POST /api/analysis/train
 * Train model with user's transaction history
 */
router.post('/train', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all user transactions
    const transactions = await Transaction.find({ userId })
      .select('name amount category date notes')
      .lean();
    
    if (transactions.length < 2) {
      return res.status(400).json({
        error: 'Minimum 2 transactions required for training'
      });
    }
    
    // Format transactions
    const formattedTransactions = transactions.map(t => ({
      name: t.name,
      amount: t.amount,
      category: t.category,
      date: t.date.toISOString().split('T')[0],
      notes: t.notes || ''
    }));
    
    // Call ML service training
    const result = await trainModel(formattedTransactions);
    
    // Optional: Update user metadata
    // await User.findByIdAndUpdate(userId, { 
    //   modelTrainedAt: new Date(),
    //   modelStatus: 'trained'
    // });
    
    res.json({
      success: true,
      message: result.message,
      transactionsUsed: transactions.length
    });
  } catch (error) {
    console.error('Training error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * POST /api/analysis/analyze-batch
 * Analyze multiple users (admin only)
 */
router.post('/analyze-batch', async (req, res) => {
  try {
    const { userIds } = req.body;
    
    const results = {};
    
    for (const userId of userIds) {
      const transactions = await Transaction.find({ userId })
        .select('name amount category date notes')
        .lean();
      
      if (transactions.length > 0) {
        const formatted = transactions.map(t => ({
          name: t.name,
          amount: t.amount,
          category: t.category,
          date: t.date.toISOString().split('T')[0],
          notes: t.notes || ''
        }));
        
        results[userId] = await analyzeSpending(formatted);
      }
    }
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analysis/health
 * Check ML service health
 */
router.get('/health', async (req, res) => {
  try {
    const { healthCheck } = require('../utils/mlService');
    const status = await healthCheck();
    
    res.json({
      mlService: status,
      backendHealth: 'ok'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Health check failed',
      details: error.message
    });
  }
});

module.exports = router;
```

### Step 4: Update Main Server File

Update `backend/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/analysis', require('./routes/analysis'));

// Existing routes...
// app.use('/api/transactions', require('./routes/transactions'));
// app.use('/api/users', require('./routes/users'));
// etc...

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`ML Service URL: ${process.env.ML_SERVICE_URL || 'http://localhost:8000'}`);
});

module.exports = app;
```

### Step 5: Update Frontend

Update frontend to call analysis endpoint:

```javascript
// frontend/hooks/useAnalysis.js
import { useCallback, useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const useAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const analyzeSpending = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${API_BASE}/api/analysis/analyze`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const trainModel = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${API_BASE}/api/analysis/train`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { analyzeSpending, trainModel, loading, error };
};

// frontend/components/Dashboard/AnalysisPanel.jsx
import { useAnalysis } from '../../hooks/useAnalysis';
import { useState, useEffect } from 'react';

export const AnalysisPanel = () => {
  const { analyzeSpending, trainModel, loading, error } = useAnalysis();
  const [analysis, setAnalysis] = useState(null);
  
  const handleAnalyze = async () => {
    try {
      const result = await analyzeSpending();
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };
  
  const handleTrain = async () => {
    try {
      await trainModel();
      alert('Model trained successfully!');
    } catch (err) {
      console.error('Training failed:', err);
    }
  };
  
  return (
    <div className="analysis-panel">
      <h2>Spending Analysis</h2>
      
      <div className="actions">
        <button 
          onClick={handleAnalyze} 
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Spending'}
        </button>
        
        <button 
          onClick={handleTrain}
          disabled={loading}
        >
          {loading ? 'Training...' : 'Train Model'}
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {analysis && (
        <div className="results">
          <div className="health-score">
            <h3>Health Score: {analysis.health_score}/100</h3>
          </div>
          
          <div className="budget">
            <h3>Suggested Budget: ₹{analysis.suggested_budget}</h3>
          </div>
          
          <div className="categories">
            <h3>Category Breakdown</h3>
            {analysis.category_breakdown.map((cat, i) => (
              <div key={i} className="category">
                <span>{cat.category}</span>
                <span>₹{cat.total} ({cat.percentage}%)</span>
              </div>
            ))}
          </div>
          
          <div className="insights">
            <h3>Smart Insights</h3>
            {analysis.insights.map((insight, i) => (
              <p key={i}>{insight}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

## Error Handling

### Common Issues and Solutions

#### ML Service Not Running
```javascript
// Safe implementation with fallback
async function analyzeSpendingWithFallback(transactions) {
  try {
    return await analyzeSpending(transactions);
  } catch (error) {
    console.warn('ML Service unavailable, using fallback:', error);
    return {
      health_score: 70,
      insights: ['ML service temporarily unavailable'],
      category_breakdown: [],
      weekly_spending_prediction: [],
      suggested_budget: 5000
    };
  }
}
```

#### Connection Timeout
```javascript
// Add retry logic
async function analyzeWithRetry(transactions, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await analyzeSpending(transactions);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

#### Invalid Data Format
```javascript
// Validate before sending
function validateTransactions(transactions) {
  return transactions.every(t => 
    t.name && 
    typeof t.amount === 'number' && 
    t.amount > 0 &&
    t.category &&
    t.date && /^\d{4}-\d{2}-\d{2}$/.test(t.date)
  );
}

if (!validateTransactions(trans)) {
  throw new Error('Invalid transaction format');
}
```

## Docker Compose Setup

If using Docker, create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/smartspend
      - ML_SERVICE_URL=http://ml-service:8000
    depends_on:
      - mongodb
      - ml-service
    networks:
      - smartspend

  ml-service:
    build: ./ml-service
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
    volumes:
      - ./ml-service/models:/app/models
    networks:
      - smartspend

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb-data:/data/db
    networks:
      - smartspend

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
    depends_on:
      - backend
    networks:
      - smartspend

volumes:
  mongodb-data:

networks:
  smartspend:
    driver: bridge
```

## Testing Integration

```bash
# Test ML service is running
curl http://localhost:8000/health

# Test backend connection
curl http://localhost:5000/health

# Test analysis endpoint
curl -X POST http://localhost:5000/api/analysis/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

## Production Deployment

### Environment Setup
```bash
# .env.production
ML_SERVICE_URL=https://ml-service.yourdomain.com
ML_SERVICE_TIMEOUT=60000
NODE_ENV=production
```

### API Gateway (Optional)
```javascript
// Add API gateway for rate limiting
const rateLimit = require('express-rate-limit');

const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // limit each IP to 10 requests per windowMs
});

app.post('/api/analysis/analyze', analysisLimiter, analyticsHandler);
```

## Monitoring

### Health Check Endpoint Monitoring
```javascript
// backend/middleware/healthMonitor.js
setInterval(async () => {
  const { healthCheck } = require('../utils/mlService');
  const status = await healthCheck();
  
  if (status.status === 'unhealthy') {
    console.error('⚠️  ML Service is unhealthy!');
    // Alert ops team
    // Send to monitoring service
  }
}, 30000); // Check every 30 seconds
```

## Summary

Your SmartSpend AI system now has:

1. ✅ ML Service running on port 8000
2. ✅ Backend integration routes
3. ✅ Frontend hooks and components
4. ✅ Error handling and fallbacks
5. ✅ Docker compose setup
6. ✅ Monitoring and health checks

The complete data flow:
```
Frontend → Backend (/api/analysis/analyze) → ML Service → Predictions → Frontend
```

For questions, check:
- ML Service docs: `ml-service/README.md`
- API docs: http://localhost:8000/docs
- Backend routes: `backend/routes/analysis.js`
