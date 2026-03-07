# SmartSpend AI - ML Microservice

A FastAPI-based machine learning microservice for spending analysis, predictions, and financial insights.

## Features

✨ **Financial Health Score** - Predict financial health (0-100) based on spending patterns  
📊 **Category Analysis** - Break down spending by category with percentages  
📈 **Weekly Predictions** - Forecast weekly spending trends  
💰 **Budget Suggestions** - Recommend monthly budget based on history  
💡 **Smart Insights** - AI-generated spending insights and recommendations  
🔄 **Model Training** - Train/retrain models with new transaction data  

## Architecture

```
ml-service/
├── app.py                 # FastAPI application with endpoints
├── requirements.txt       # Python dependencies
├── models/               # Trained models storage
│   └── spending_model.pkl
├── services/
│   ├── trainer.py       # Model training logic
│   └── predictor.py     # Prediction and analysis logic
└── utils/
    └── feature_engineering.py  # Feature extraction & engineering
```

## Installation & Setup

### 1. Install Dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

### 2. Run the Service

```bash
# With auto-reload (development)
uvicorn app:app --reload --port 8000

# Production mode
uvicorn app:app --host 0.0.0.0 --port 8000
```

The service will start on **http://localhost:8000**

### 3. Access API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Health Check
```http
GET /
GET /health
```

**Response:**
```json
{
  "service": "SmartSpend AI - ML Service",
  "status": "running",
  "model_trained": true,
  "model_loaded": true
}
```

---

### Analyze Spending
```http
POST /analyze
```

**Request Body:**
```json
[
  {
    "name": "Swiggy",
    "amount": 350,
    "category": "Food",
    "date": "2026-03-07",
    "notes": "Dinner"
  },
  {
    "name": "Uber",
    "amount": 150,
    "category": "Transport",
    "date": "2026-03-07",
    "notes": "Office commute"
  }
]
```

**Response:**
```json
{
  "health_score": 75.5,
  "category_breakdown": [
    {
      "category": "Food",
      "total": 2500,
      "average": 350,
      "count": 7,
      "percentage": 45.5
    }
  ],
  "weekly_spending_prediction": [
    {
      "week": 1,
      "predicted_spending": 2200.50
    }
  ],
  "suggested_budget": 6600,
  "insights": [
    "→ Your financial health is moderate.",
    "! Food dominates your spending at 45.5%.",
    "→ You made 20 transactions. High frequency can add up quickly!"
  ],
  "metrics": {
    "total_spending": 5500,
    "avg_transaction": 275,
    "max_transaction": 1200,
    "min_transaction": 50,
    "std_deviation": 312.4,
    "num_transactions": 20
  }
}
```

---

### Train Model
```http
POST /train
```

**Request Body:**
```json
{
  "transactions": [
    {
      "name": "Swiggy",
      "amount": 350,
      "category": "Food",
      "date": "2026-03-07",
      "notes": "Dinner"
    },
    {
      "name": "Amazon",
      "amount": 1200,
      "category": "Shopping",
      "date": "2026-03-06",
      "notes": "Monthly groceries"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Model trained successfully on 2 transactions",
  "model_status": "Saved to models/spending_model.pkl"
}
```

---

### Model Status
```http
GET /model/status
```

**Response:**
```json
{
  "model_trained": true,
  "model_file": "models/spending_model.pkl",
  "status": "ready",
  "message": "Model is ready for predictions",
  "feature_categories_learned": 5,
  "categories": ["Food", "Transport", "Shopping", "Entertainment", "Utilities"]
}
```

---

## ML Model Details

### Feature Engineering

**Input Features:**
- `amount` - Transaction amount
- `day_of_week` - Day of week (0-6)
- `day_of_month` - Day of month (1-31)
- `category_encoded` - Category as numeric value
- `spending_frequency` - Transactions per day
- `average_spending` - Average transaction amount
- `spending_ratio` - Current transaction / average

### Models Used

1. **Health Score Prediction**
   - Model: RandomForestRegressor (50 trees, max_depth=10)
   - Output: 0-100 score
   - Features: amount, day_of_week, category_encoded, spending_frequency, avg_spending, spending_ratio

2. **Weekly Trend Prediction**
   - Model: LinearRegression
   - Output: Predicted weekly spending for next 4 weeks
   - Features: amount, day_of_week, day_of_month, category_encoded, spending_frequency, total_spending

### Insights Generation

Automatic insights based on:
- Health score thresholds
- Category dominance (>40% spending)
- Large vs. average transactions
- Transaction frequency
- Spending variance
- Average transaction size

## Example Usage with cURL

### Analyze Spending
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "name": "Swiggy",
      "amount": 350,
      "category": "Food",
      "date": "2026-03-07",
      "notes": "Dinner"
    },
    {
      "name": "Metro",
      "amount": 50,
      "category": "Transport",
      "date": "2026-03-07",
      "notes": "Commute"
    }
  ]'
```

### Train Model
```bash
curl -X POST "http://localhost:8000/train" \
  -H "Content-Type: application/json" \
  -d '{
    "transactions": [
      {
        "name": "Swiggy",
        "amount": 350,
        "category": "Food",
        "date": "2026-03-07",
        "notes": "Dinner"
      },
      {
        "name": "Amazon",
        "amount": 1200,
        "category": "Shopping",
        "date": "2026-03-06",
        "notes": "Groceries"
      }
    ]
  }'
```

## Python Integration Example

```python
import requests
import json

# Analyze spending
transactions = [
    {
        "name": "Swiggy",
        "amount": 350,
        "category": "Food",
        "date": "2026-03-07",
        "notes": "Dinner"
    }
]

response = requests.post(
    "http://localhost:8000/analyze",
    json=transactions
)

analysis = response.json()
print(f"Health Score: {analysis['health_score']}")
print(f"Suggested Budget: ₹{analysis['suggested_budget']}")
for insight in analysis['insights']:
    print(f"  • {insight}")
```

## Integration with SmartSpend Backend

The frontend/backend should call this service with transaction data:

```javascript
// Example: Node.js backend
const analyzeSpending = async (transactions) => {
  const response = await fetch('http://localhost:8000/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transactions)
  });
  return response.json();
};

// Training endpoint
const trainModel = async (transactions) => {
  const response = await fetch('http://localhost:8000/train', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions })
  });
  return response.json();
};
```

## System Architecture

```
Frontend (React/Next.js)
        ↓
Backend (Node.js/Express)
        ↓
ML Service (Python/FastAPI) ← MongoDB for persistence
        ↓
Predictions & Insights
```

## Performance Notes

- **Startup Time**: ~2-3 seconds
- **Analysis Time**: ~50-100ms per transaction
- **Model Training**: ~1-2 seconds for typical datasets
- **Model Size**: ~2-5 MB

## Error Handling

### Common Errors

| Status | Error | Fix |
|--------|-------|-----|
| 400 | No transactions provided | Send at least 1 transaction |
| 400 | Invalid date format | Use format: YYYY-MM-DD |
| 422 | Invalid request body | Check JSON structure |
| 500 | Model not trained | Call POST /train first |

## Development & Debugging

### Enable Debug Logging
Modify `app.py` to add logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Test Individual Components
```python
from services.trainer import ModelTrainer
from utils.feature_engineering import FeatureEngineer

fe = FeatureEngineer()
trainer = ModelTrainer()

# Test feature engineering
features = fe.engineer_features(transactions)
print(features)

# Test training
trainer.train(features, transactions)
trainer.save_model()
```

## Future Enhancements

- [ ] Advanced models (LSTM, XGBoost)
- [ ] Anomaly detection for unusual spending
- [ ] Budget vs. actual comparison
- [ ] Spending forecasting with confidence intervals
- [ ] Category recommendations
- [ ] Multi-user support with personalization
- [ ] Time series analysis
- [ ] Database persistence

## Requirements

- Python 3.8+
- FastAPI 0.104+
- scikit-learn 1.3+
- pandas 2.1+
- numpy 1.26+
- uvicorn 0.24+

## License

MIT License - Open for hackathons and educational use

## Support

For issues or improvements, check the logs and ensure:
1. Transactions have valid dates (YYYY-MM-DD)
2. Amounts are positive numbers
3. Categories are non-empty strings
4. At least 1 transaction for analysis, 2+ for training

---

**SmartSpend AI ML Service v1.0.0** | Ready for hackathon deployment! 🚀
