"""
SmartSpend AI - ML Service
FastAPI microservice for spending analysis and predictions

Run with: uvicorn app:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(__file__))

from utils.feature_engineering import FeatureEngineer
from services.trainer import ModelTrainer
from services.predictor import SpendingPredictor


# ==================== Pydantic Models ====================

class Transaction(BaseModel):
    """Transaction data model"""
    name: str
    amount: float
    category: str
    date: str  # Format: YYYY-MM-DD
    notes: Optional[str] = None


class CategoryBreakdown(BaseModel):
    """Category spending breakdown"""
    category: str
    total: float
    average: float
    count: int
    percentage: float


class WeeklyPrediction(BaseModel):
    """Weekly spending prediction"""
    week: int
    predicted_spending: float


class SpendingMetrics(BaseModel):
    """Spending metrics"""
    total_spending: float
    avg_transaction: float
    max_transaction: float
    min_transaction: float
    std_deviation: float
    num_transactions: int


class AnalysisResponse(BaseModel):
    """Complete spending analysis response"""
    health_score: float
    category_breakdown: List[CategoryBreakdown]
    weekly_spending_prediction: List[WeeklyPrediction]
    suggested_budget: float
    insights: List[str]
    metrics: Optional[SpendingMetrics] = None


class TrainRequest(BaseModel):
    """Model training request"""
    transactions: List[Transaction]


class TrainResponse(BaseModel):
    """Model training response"""
    success: bool
    message: str
    model_status: str


# ==================== Initialize FastAPI ====================

app = FastAPI(
    title="SmartSpend AI - ML Service",
    description="ML microservice for spending analysis and predictions",
    version="1.0.0"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Global State ====================

# Initialize ML components
feature_engineer = FeatureEngineer()
model_trainer = ModelTrainer(model_dir="models")
spending_predictor = SpendingPredictor(model_trainer, feature_engineer)

# Try to load existing model
model_loaded = model_trainer.load_model("spending_model.pkl")


# ==================== Health Check ====================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "SmartSpend AI - ML Service",
        "status": "running",
        "model_trained": model_trainer.is_trained,
        "model_loaded": model_loaded,
        "endpoints": {
            "analyze": "POST /analyze",
            "train": "POST /train"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "smartspend-ml-service",
        "model_ready": model_trainer.is_trained
    }


# ==================== Main Endpoints ====================

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_spending(transactions: List[Transaction]):
    """
    Analyze spending patterns and generate predictions
    
    Args:
        transactions: List of transaction objects
        
    Returns:
        Comprehensive spending analysis with predictions and insights
        
    Example:
        POST /analyze
        [
            {
                "name": "Swiggy",
                "amount": 350,
                "category": "Food",
                "date": "2026-03-07",
                "notes": "Dinner"
            }
        ]
    """
    
    if not transactions:
        raise HTTPException(
            status_code=400,
            detail="At least one transaction is required for analysis"
        )
    
    try:
        # Convert Pydantic models to dictionaries
        transaction_dicts = [t.dict() for t in transactions]
        
        # Perform analysis
        analysis = spending_predictor.analyze_spending(transaction_dicts)
        
        return AnalysisResponse(
            health_score=analysis['health_score'],
            category_breakdown=[
                CategoryBreakdown(**item) for item in analysis['category_breakdown']
            ],
            weekly_spending_prediction=[
                WeeklyPrediction(**item) for item in analysis['weekly_spending_prediction']
            ],
            suggested_budget=analysis['suggested_budget'],
            insights=analysis['insights'],
            metrics=SpendingMetrics(**analysis['metrics'])
        )
    
    except Exception as e:
        print(f"Error in analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@app.post("/train", response_model=TrainResponse)
async def train_model(request: TrainRequest):
    """
    Train or retrain the ML model with new transaction data
    
    Args:
        request: Training request with transactions
        
    Returns:
        Training status and save location
        
    Example:
        POST /train
        {
            "transactions": [
                {
                    "name": "Swiggy",
                    "amount": 350,
                    "category": "Food",
                    "date": "2026-03-07",
                    "notes": "Dinner"
                },
                ...
            ]
        }
    """
    
    transactions = request.transactions
    
    if not transactions or len(transactions) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 transactions required for model training"
        )
    
    try:
        # Convert to dictionaries
        transaction_dicts = [t.dict() for t in transactions]
        
        # Engineer features
        feature_df = feature_engineer.engineer_features(
            transaction_dicts, fit=True
        )
        
        # Train models
        model_trainer.train(feature_df, transaction_dicts)
        
        # Save model
        model_path = model_trainer.save_model("spending_model.pkl")
        
        return TrainResponse(
            success=True,
            message=f"Model trained successfully on {len(transactions)} transactions",
            model_status=f"Saved to {model_path}"
        )
    
    except Exception as e:
        print(f"Error in training: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Training failed: {str(e)}"
        )


@app.post("/retrain")
async def retrain_model(request: TrainRequest):
    """
    Retrain the model (alias for /train endpoint)
    
    Args:
        request: Training request with transactions
    """
    return await train_model(request)


# ==================== Model Status Endpoint ====================

@app.get("/model/status")
async def model_status():
    """Get current model training status and information"""
    return {
        "model_trained": model_trainer.is_trained,
        "model_file": "models/spending_model.pkl",
        "status": "ready" if model_trainer.is_trained else "not_trained",
        "message": (
            "Model is ready for predictions" if model_trainer.is_trained
            else "Model needs to be trained with /train endpoint"
        ),
        "feature_categories_learned": len(feature_engineer.categories_list),
        "categories": feature_engineer.categories_list if feature_engineer.categories_list else None
    }


# ==================== Error Handlers ====================

@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    return HTTPException(
        status_code=400,
        detail=str(exc)
    )


# ==================== Main ====================

if __name__ == "__main__":
    print("=" * 60)
    print("SmartSpend AI - ML Service")
    print("=" * 60)
    print(f"Model Status: {'LOADED' if model_loaded else 'NOT LOADED'}")
    print(f"Model Trained: {'YES' if model_trainer.is_trained else 'NO'}")
    print("\nStarting API on http://localhost:8000")
    print("Docs available at: http://localhost:8000/docs")
    print("=" * 60)
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
