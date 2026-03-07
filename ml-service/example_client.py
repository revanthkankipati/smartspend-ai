"""
SmartSpend AI - ML Service Example Client
Demonstrates how to use the ML service API
"""

import requests
import json
from pprint import pprint

# Service configuration
ML_SERVICE_URL = "http://localhost:8000"

class SmartSpendClient:
    """Client for interacting with SmartSpend ML Service"""
    
    def __init__(self, base_url=ML_SERVICE_URL):
        self.base_url = base_url
    
    def health_check(self):
        """Check if service is running"""
        response = requests.get(f"{self.base_url}/health")
        return response.json()
    
    def analyze(self, transactions):
        """
        Analyze spending
        
        Args:
            transactions: List of transaction dicts
        
        Returns:
            Analysis results with predictions
        """
        response = requests.post(
            f"{self.base_url}/analyze",
            json=transactions
        )
        return response.json()
    
    def train(self, transactions):
        """
        Train/retrain the model
        
        Args:
            transactions: List of transaction dicts
        
        Returns:
            Training status
        """
        response = requests.post(
            f"{self.base_url}/train",
            json={"transactions": transactions}
        )
        return response.json()
    
    def get_model_status(self):
        """Get current model status"""
        response = requests.get(f"{self.base_url}/model/status")
        return response.json()


def main():
    """Example usage"""
    
    print("SmartSpend AI - ML Service Client\n")
    
    # Initialize client
    client = SmartSpendClient()
    
    # Check health
    print("1️⃣  Checking service health...")
    health = client.health_check()
    print(f"   Status: {health['status']}")
    print(f"   Model Ready: {health['model_ready']}\n")
    
    # Sample transactions
    transactions = [
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
        },
        {
            "name": "Amazon",
            "amount": 1200,
            "category": "Shopping",
            "date": "2026-03-06",
            "notes": "Keyboard"
        },
        {
            "name": "Netflix",
            "amount": 199,
            "category": "Entertainment",
            "date": "2026-03-06",
            "notes": "Subscription"
        },
        {
            "name": "Gym",
            "amount": 500,
            "category": "Health",
            "date": "2026-03-05",
            "notes": "Monthly membership"
        }
    ]
    
    # Train model
    print("2️⃣  Training model with sample data...")
    train_result = client.train(transactions)
    print(f"   Success: {train_result['success']}")
    print(f"   Message: {train_result['message']}\n")
    
    # Analyze spending
    print("3️⃣  Analyzing spending patterns...")
    analysis = client.analyze(transactions)
    
    print(f"   Health Score: {analysis['health_score']}/100")
    print(f"   Suggested Budget: ₹{analysis['suggested_budget']:.2f}")
    
    print("\n   Category Breakdown:")
    for cat in analysis['category_breakdown']:
        print(f"     • {cat['category']}: ₹{cat['total']:.2f} ({cat['percentage']:.1f}%)")
    
    print("\n   Weekly Predictions:")
    for week in analysis['weekly_spending_prediction']:
        print(f"     • Week {week['week']}: ₹{week['predicted_spending']:.2f}")
    
    print("\n   Smart Insights:")
    for insight in analysis['insights']:
        print(f"     • {insight}")
    
    # Model status
    print("\n4️⃣  Model Status:")
    status = client.get_model_status()
    print(f"   Trained: {status['model_trained']}")
    print(f"   Categories: {', '.join(status['categories']) if status['categories'] else 'None'}")
    
    print("\n✅ Example completed successfully!")


if __name__ == "__main__":
    main()
