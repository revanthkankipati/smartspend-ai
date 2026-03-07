# SmartSpend AI - Complete Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      SmartSpend AI Platform                      │
└─────────────────────────────────────────────────────────────────┘

        ┌──────────────────────────────────────────────────────┐
        │              Frontend (React/Next.js)                │
        │     • Dashboard                                      │
        │     • Transaction Entry                             │
        │     • Budget Management                             │
        └────────────────────┬─────────────────────────────────┘
                             │ HTTP/REST
                             │
        ┌────────────────────▼─────────────────────────────────┐
        │         Node.js Backend (Express)                    │
        │     • User Authentication                           │
        │     • Transaction Management                        │
        │     • Database Operations                           │
        │     • API Gateway                                  │
        └────────────────────┬─────────────────────────────────┘
                             │ HTTP/REST
                    ┌────────┴──────────┐
                    │                   │
        ┌───────────▼──────────┐  ┌────▼─────────────────┐
        │   MongoDB Database   │  │  Python ML Service   │
        │                      │  │   (FastAPI)          │
        │ • Users              │  │                      │
        │ • Transactions       │  │ • Model Training     │
        │ • Budgets            │  │ • Predictions        │
        │ • Categories         │  │ • Insights           │
        └──────────────────────┘  │ • Analysis           │
                                  └──────────────────────┘
```

## ML Service Architecture

### Request/Response Flow

```
Client Request (Transactions)
        │
        ▼
┌──────────────────────────┐
│   FastAPI Endpoint       │
│   POST /analyze          │
└──────────────┬───────────┘
               │
        ▼──────────────┐
        │              │
   ┌────▼──────────────▼────────┐
   │  Feature Engineering       │
   │  • Parse transactions      │
   │  • Extract features        │
   │  • Encode categories       │
   │  • Calculate metrics       │
   └────┬──────────────────────┘
        │
        ▼
   ┌─────────────────────────────┐
   │  ML Model (RandomForest)    │
   │  • Health Score Prediction  │
   │  • Category Clustering      │
   │  • Trend Analysis           │
   └────┬──────────────────────┘
        │
        ▼
   ┌──────────────────────────────┐
   │  Insight Generation          │
   │  • Pattern Detection         │
   │  • Anomaly Flags             │
   │  • Recommendations           │
   └────┬─────────────────────────┘
        │
        ▼
   Analysis Response JSON
```

### Component Breakdown

#### 1. **Feature Engineering** (`utils/feature_engineering.py`)
- **Input**: Raw transaction data
- **Processing**:
  - Date parsing and day-of-week extraction
  - Category encoding (categorical → numeric)
  - Spending frequency calculation
  - Amount normalization
  - Ratio calculations
- **Output**: Feature vectors ready for ML

#### 2. **Model Trainer** (`services/trainer.py`)
- **Models Used**:
  - RandomForestRegressor (Health Score)
  - LinearRegression (Weekly Trends)
- **Training Process**:
  - Feature scaling with StandardScaler
  - Automatic label generation
  - Model persistence with joblib
- **Performance**: <2 seconds for 100 transactions

#### 3. **Predictor** (`services/predictor.py`)
- **Prediction Tasks**:
  1. Health Score (0-100)
  2. Category Breakdown (percentages)
  3. Weekly Spending Trends
  4. Monthly Budget Suggestions
  5. Smart Insights
- **Output**: JSON with all predictions

#### 4. **FastAPI App** (`app.py`)
- **Endpoints**:
  - `/analyze` - Main analysis endpoint
  - `/train` - Model training
  - `/model/status` - Status check
  - `/health` - Health check
- **Features**:
  - CORS enabled for frontend
  - Input validation with Pydantic
  - Error handling
  - Auto-reload in dev mode

## Data Models

### Transaction Object
```python
{
    "name": str,           # Merchant/description
    "amount": float,       # Transaction amount
    "category": str,       # Category (Food, Transport, etc.)
    "date": str,          # Format: YYYY-MM-DD
    "notes": str          # Optional notes
}
```

### Analysis Response
```python
{
    "health_score": float,           # 0-100
    "category_breakdown": [
        {
            "category": str,
            "total": float,
            "average": float,
            "count": int,
            "percentage": float
        }
    ],
    "weekly_spending_prediction": [
        {
            "week": int,
            "predicted_spending": float
        }
    ],
    "suggested_budget": float,
    "insights": [str],
    "metrics": {
        "total_spending": float,
        "avg_transaction": float,
        "max_transaction": float,
        "min_transaction": float,
        "std_deviation": float,
        "num_transactions": int
    }
}
```

## Feature Engineering Process

### Input Transaction
```json
{
    "name": "Swiggy",
    "amount": 350,
    "category": "Food",
    "date": "2026-03-07",
    "notes": "Dinner"
}
```

### Engineered Features
```python
{
    "amount": 350,
    "day_of_week": 4,              # Friday (0=Monday)
    "day_of_month": 7,            # 7th
    "category_encoded": 2,         # Food category code
    "spending_frequency": 0.8,     # ~1 transaction per day
    "total_spending": 5500,        # Historical total
    "avg_spending": 275,           # Historical average
    "spending_ratio": 1.27         # 350/275
}
```

## ML Models Explained

### Health Score Model
- **Algorithm**: RandomForestRegressor
- **Input Features**: 6 features
- **Output Range**: 0-100
- **Factors**:
  - Spending ratio (higher = lower score)
  - Category diversity
  - Transaction frequency
  - Category patterns

### Weekly Trend Model
- **Algorithm**: LinearRegression
- **Input Features**: 6 features
- **Output Range**: Predicted amount (₹)
- **Basis**:
  - Historical weekly spending
  - Day-of-week patterns
  - Category distribution
  - Spending velocity

## Insights Generation Logic

```
If health_score > 80:
    → "Your financial health is excellent"
Else if health_score > 60:
    → "Your financial health is moderate"
Else:
    → "Your financial health needs attention"

If top_category > 40% of total:
    → "⚠ [Category] dominates your spending"

If max_transaction > 2.5 * avg:
    → "! You have an unusually large transaction"

If transaction_count > 20:
    → "→ High frequency transactions"

If std_deviation > avg:
    → "→ Spending varies significantly"
```

## Integration with Backend

### Sample Backend Integration (Node.js)

```javascript
// routes/analysis.js
const router = require('express').Router();
const axios = require('axios');

const ML_SERVICE = 'http://localhost:8000';

// Analyze user spending
router.post('/analyze', async (req, res) => {
    try {
        const { userId } = req.body;
        
        // Get user transactions from database
        const transactions = await Transaction.find({ userId });
        
        // Call ML service
        const response = await axios.post(
            `${ML_SERVICE}/analyze`,
            transactions
        );
        
        // Save results to database
        const analysis = await Analysis.create({
            userId,
            data: response.data,
            createdAt: new Date()
        });
        
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Train model with new data
router.post('/train', async (req, res) => {
    try {
        const { userId } = req.body;
        
        // Get all user transactions
        const transactions = await Transaction.find({ userId });
        
        // Train model
        const response = await axios.post(
            `${ML_SERVICE}/train`,
            { transactions }
        );
        
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
```

### Frontend Usage (React)

```javascript
// hooks/useMLService.js
import axios from 'axios';

const ML_SERVICE = process.env.REACT_APP_ML_SERVICE || 'http://localhost:8000';

export const useMLService = () => {
    const analyze = async (transactions) => {
        const response = await axios.post(
            `${ML_SERVICE}/analyze`,
            transactions
        );
        return response.data;
    };
    
    const train = async (transactions) => {
        const response = await axios.post(
            `${ML_SERVICE}/train`,
            { transactions }
        );
        return response.data;
    };
    
    return { analyze, train };
};

// components/Dashboard.jsx
import { useMLService } from '../hooks/useMLService';

export const Dashboard = ({ transactions }) => {
    const { analyze } = useMLService();
    const [analysis, setAnalysis] = useState(null);
    
    const handleAnalyze = async () => {
        const result = await analyze(transactions);
        setAnalysis(result);
    };
    
    return (
        <div>
            <button onClick={handleAnalyze}>Analyze Spending</button>
            {analysis && (
                <div>
                    <h3>Health Score: {analysis.health_score}</h3>
                    <p>Budget: ₹{analysis.suggested_budget}</p>
                    {analysis.insights.map((insight) => (
                        <p key={insight}>{insight}</p>
                    ))}
                </div>
            )}
        </div>
    );
};
```

## Performance Characteristics

| Operation | Time | Data Size |
|-----------|------|-----------|
| Model Training | 1-2s | 100 transactions |
| Single Prediction | 50ms | 1 transaction |
| Batch Analysis | 100ms | 100 transactions |
| Model Save | 500ms | ~3 MB |
| Model Load | 1s | ~3 MB |

## Deployment Considerations

### Development
```python
uvicorn app:app --reload --port 8000
```

### Production
```bash
# Using Gunicorn with multiple workers
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app --bind 0.0.0.0:8000
```

### Docker
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  ml-service:
    build: ./ml-service
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
    volumes:
      - ./ml-service/models:/app/models
```

## Monitoring & Logging

### Health Checks
```bash
# Continuous monitoring
while true; do
    curl -s http://localhost:8000/health | jq .
    sleep 10
done
```

### Log Analysis
```bash
# Check model training logs
tail -f logs/training.log

# Monitor predictions
tail -f logs/predictions.log
```

## Future Enhancements

1. **Advanced Models**
   - LSTM for time series
   - XGBoost for better accuracy
   - Isolation Forest for anomaly detection

2. **Features**
   - Seasonal adjustments
   - Budget vs. actual comparison
   - Goal tracking
   - Recurring transaction detection

3. **Scalability**
   - Redis caching for predictions
   - Async job processing
   - Model versioning
   - A/B testing framework

4. **Integration**
   - Webhook support
   - Batch processing APIs
   - Multi-user personalization
   - Real-time dashboards

---

## Quick Links

- **API Docs**: http://localhost:8000/docs
- **README**: See README.md
- **Quick Start**: See QUICKSTART.md
- **Test Suite**: `python test_service.py`
- **Example Client**: `python example_client.py`
