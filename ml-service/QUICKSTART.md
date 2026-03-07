# SmartSpend AI - ML Microservice
## Quick Reference Guide

### 🚀 Quick Start

#### Windows
```bash
cd ml-service
run.bat
```

#### Linux/macOS
```bash
cd ml-service
chmod +x run.sh
./run.sh
```

#### Manual Start
```bash
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

### 📍 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/` | Health check |
| `GET` | `/health` | Health status |
| `POST` | `/analyze` | Analyze spending |
| `POST` | `/train` | Train model |
| `GET` | `/model/status` | Model info |

### 📊 Request/Response Examples

#### POST /analyze
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '[
    {
      "name": "Swiggy",
      "amount": 350,
      "category": "Food",
      "date": "2026-03-07",
      "notes": "Dinner"
    }
  ]'
```

**Response:**
```json
{
  "health_score": 75.5,
  "category_breakdown": [...],
  "weekly_spending_prediction": [...],
  "suggested_budget": 6600,
  "insights": [...],
  "metrics": {...}
}
```

### 🧪 Testing

Run the test suite:
```bash
python test_service.py
```

Run the example client:
```bash
python example_client.py
```

### 📁 Project Structure

```
ml-service/
├── app.py                      # FastAPI application
├── requirements.txt            # Dependencies
├── test_service.py            # Test suite
├── example_client.py          # Example usage
├── run.bat                    # Windows startup
├── run.sh                     # Linux/macOS startup
├── QUICKSTART.md              # This file
├── README.md                  # Full documentation
├── models/                    # Trained models
│   └── spending_model.pkl
├── services/
│   ├── trainer.py             # Model training
│   └── predictor.py           # Predictions
└── utils/
    └── feature_engineering.py # Features
```

### 🔧 Configuration

The service runs on:
- **Host**: 0.0.0.0
- **Port**: 8000
- **Reload**: Enabled (auto-restart on code changes)

To change port, modify `run.bat` or `run.sh`:
```bash
uvicorn app:app --reload --port 9000
```

### 📚 Documentation

- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Full Guide**: See `README.md`

### 🐍 Python Integration

```python
import requests

# Analyze transactions
response = requests.post(
    'http://localhost:8000/analyze',
    json=[
        {
            'name': 'Swiggy',
            'amount': 350,
            'category': 'Food',
            'date': '2026-03-07',
            'notes': 'Dinner'
        }
    ]
)

analysis = response.json()
print(f"Health Score: {analysis['health_score']}")
print(f"Insights: {analysis['insights']}")
```

### 🔗 Node.js Integration

```javascript
// Analyze spending
const response = await fetch('http://localhost:8000/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify([
    {
      name: 'Swiggy',
      amount: 350,
      category: 'Food',
      date: '2026-03-07',
      notes: 'Dinner'
    }
  ])
});

const analysis = await response.json();
console.log(`Health Score: ${analysis.health_score}`);
```

### ⚠️ Troubleshooting

**Port 8000 already in use:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :8000
kill -9 <PID>
```

**Module not found errors:**
```bash
pip install -r requirements.txt
```

**Model not trained:**
Ensure you call `POST /train` with transactions before using `POST /analyze`

### 📈 Next Steps

1. ✅ Start the service using `run.bat` or `run.sh`
2. ✅ Test with `python test_service.py`
3. ✅ Integrate with backend using endpoints from `/docs`
4. ✅ Monitor at `http://localhost:8000/docs`

### 🎯 Hackathon Tips

- The service trains quickly on small datasets (~100 transactions)
- Responses are typically <100ms
- Models automatically adapt to new categories
- No database needed - stateless design
- Easy to reset/retrain between demos

---

For detailed information, see `README.md`
