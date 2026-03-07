"""
Test script to verify ML Service functionality
Run this after starting the FastAPI server to test all endpoints
"""

import requests
import json
from datetime import datetime, timedelta
import time

BASE_URL = "http://localhost:8000"

# Sample transactions for testing
SAMPLE_TRANSACTIONS = [
    {
        "name": "Swiggy",
        "amount": 350,
        "category": "Food",
        "date": "2026-03-07",
        "notes": "Dinner"
    },
    {
        "name": "Starbucks",
        "amount": 250,
        "category": "Food",
        "date": "2026-03-07",
        "notes": "Coffee"
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
        "notes": "Monthly subscription"
    },
    {
        "name": "Zomato",
        "amount": 425,
        "category": "Food",
        "date": "2026-03-05",
        "notes": "Lunch"
    },
    {
        "name": "Metro",
        "amount": 50,
        "category": "Transport",
        "date": "2026-03-05",
        "notes": "Travel card"
    },
    {
        "name": "Myntra",
        "amount": 2500,
        "category": "Shopping",
        "date": "2026-03-04",
        "notes": "Clothes"
    },
    {
        "name": "Gym",
        "amount": 500,
        "category": "Health",
        "date": "2026-03-04",
        "notes": "Monthly membership"
    },
    {
        "name": "Petrol Pump",
        "amount": 800,
        "category": "Transport",
        "date": "2026-03-03",
        "notes": "Fuel"
    }
]

def print_header(title):
    """Print formatted section header"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_health_check():
    """Test health check endpoint"""
    print_header("Testing Health Check")
    
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✓ Status: {response.status_code}")
        data = response.json()
        print(f"  Service: {data.get('service')}")
        print(f"  Status: {data.get('status')}")
        print(f"  Model Trained: {data.get('model_trained')}")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_model_status():
    """Test model status endpoint"""
    print_header("Testing Model Status")
    
    try:
        response = requests.get(f"{BASE_URL}/model/status")
        print(f"✓ Status: {response.status_code}")
        data = response.json()
        print(f"  Model Trained: {data.get('model_trained')}")
        print(f"  Status: {data.get('status')}")
        print(f"  Categories: {data.get('categories')}")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_train_model():
    """Test model training endpoint"""
    print_header("Training Model")
    
    try:
        payload = {"transactions": SAMPLE_TRANSACTIONS}
        
        print(f"Sending {len(SAMPLE_TRANSACTIONS)} transactions for training...")
        response = requests.post(
            f"{BASE_URL}/train",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"✓ Status: {response.status_code}")
        data = response.json()
        print(f"  Success: {data.get('success')}")
        print(f"  Message: {data.get('message')}")
        print(f"  Model Status: {data.get('model_status')}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_analyze_spending():
    """Test spending analysis endpoint"""
    print_header("Analyzing Spending")
    
    try:
        print(f"Analyzing {len(SAMPLE_TRANSACTIONS)} transactions...")
        response = requests.post(
            f"{BASE_URL}/analyze",
            json=SAMPLE_TRANSACTIONS,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"✓ Status: {response.status_code}")
        data = response.json()
        
        # Display results
        print(f"\n📊 ANALYSIS RESULTS:")
        print(f"  Health Score: {data.get('health_score')}/100")
        print(f"  Suggested Budget: ₹{data.get('suggested_budget'):.2f}")
        
        # Category breakdown
        print(f"\n📈 CATEGORY BREAKDOWN:")
        for cat in data.get('category_breakdown', []):
            print(f"  • {cat['category']}: ₹{cat['total']:.2f} ({cat['percentage']:.1f}%)")
        
        # Weekly predictions
        print(f"\n📅 WEEKLY PREDICTIONS:")
        for week in data.get('weekly_spending_prediction', []):
            print(f"  • Week {week['week']}: ₹{week['predicted_spending']:.2f}")
        
        # Insights
        print(f"\n💡 INSIGHTS:")
        for insight in data.get('insights', []):
            print(f"  • {insight}")
        
        # Metrics
        metrics = data.get('metrics', {})
        print(f"\n📉 METRICS:")
        print(f"  Total Spending: ₹{metrics.get('total_spending', 0):.2f}")
        print(f"  Avg Transaction: ₹{metrics.get('avg_transaction', 0):.2f}")
        print(f"  Max Transaction: ₹{metrics.get('max_transaction', 0):.2f}")
        print(f"  Min Transaction: ₹{metrics.get('min_transaction', 0):.2f}")
        print(f"  Num Transactions: {metrics.get('num_transactions', 0)}")
        
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("  SmartSpend AI - ML Service Test Suite")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Wait for server to be ready
    print("\n⏳ Waiting for server to be ready...")
    for i in range(10):
        try:
            requests.get(f"{BASE_URL}/health", timeout=1)
            print("✓ Server is ready!")
            break
        except:
            if i < 9:
                print(f"  Attempt {i+1}/10... waiting")
                time.sleep(1)
            else:
                print("✗ Server is not responding. Make sure it's running:")
                print("  uvicorn app:app --reload --port 8000")
                return
    
    results = []
    
    # Run tests
    results.append(("Health Check", test_health_check()))
    results.append(("Model Status", test_model_status()))
    results.append(("Train Model", test_train_model()))
    time.sleep(1)  # Wait for model training
    results.append(("Analyze Spending", test_analyze_spending()))
    
    # Summary
    print_header("Test Summary")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"  {status}: {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! ML Service is working correctly!")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check the output above.")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    run_all_tests()
