"""
Model Training Module for SmartSpend AI
Trains ML models for spending analysis and predictions
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import joblib
import os
from datetime import datetime


class ModelTrainer:
    """Handles training of ML models for spending predictions"""
    
    def __init__(self, model_dir="models"):
        self.model_dir = model_dir
        self.health_score_model = None
        self.weekly_trend_model = None
        self.feature_scaler = StandardScaler()
        self.is_trained = False
        
        # Create models directory if it doesn't exist
        os.makedirs(model_dir, exist_ok=True)
    
    def prepare_training_data(self, feature_df, transactions):
        """
        Prepare features and targets for training
        
        Returns:
            X (features), y_health (health score target), y_weekly (weekly spending target)
        """
        if feature_df.empty:
            return None, None, None
        
        X = feature_df.copy()
        
        # Target 1: Health Score (0-100 based on spending patterns)
        # Lower spending ratio = higher health score
        y_health = 100 - (X['spending_ratio'].fillna(0) * 20).clip(0, 100)
        
        # Adjust based on diversity (more categories = healthier)
        if not pd.Series(transactions).empty:
            categories = [t.get('category', 'Other') for t in transactions]
            category_diversity = len(set(categories)) / max(len(categories), 1)
            y_health = y_health * (0.8 + category_diversity * 0.2)
        
        y_health = y_health.clip(0, 100)
        
        # Target 2: Weekly Spending Trend
        # Use total spending as proxy
        y_weekly = X['total_spending'].fillna(0)
        
        return X, y_health, y_weekly
    
    def train_health_score_model(self, feature_df, transactions):
        """Train model for financial health score prediction"""
        X, y_health, _ = self.prepare_training_data(feature_df, transactions)
        
        if X is None or len(X) < 2:
            # Return a dummy model if not enough data
            self.health_score_model = RandomForestRegressor(
                n_estimators=10,
                max_depth=5,
                random_state=42
            )
            # Fit with minimum dummy data
            dummy_X = np.array([[1, 0, 0, 0.1, 100, 50, 0.5]])
            dummy_y = np.array([70])
            self.health_score_model.fit(dummy_X, dummy_y)
            return
        
        # Select relevant features for health score
        feature_cols = [
            'amount', 'day_of_week', 'category_encoded',
            'spending_frequency', 'avg_spending', 'spending_ratio'
        ]
        
        X_train = X[feature_cols].fillna(0)
        
        # Scale features
        X_scaled = self.feature_scaler.fit_transform(X_train)
        
        # Train model
        self.health_score_model = RandomForestRegressor(
            n_estimators=50,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.health_score_model.fit(X_scaled, y_health)
    
    def train_weekly_trend_model(self, feature_df, transactions):
        """Train model for weekly spending trend prediction"""
        X, _, y_weekly = self.prepare_training_data(feature_df, transactions)
        
        if X is None or len(X) < 2:
            # Return a dummy model
            self.weekly_trend_model = LinearRegression()
            dummy_X = np.array([[1, 0, 0, 0.1, 100, 50, 0.5]])
            dummy_y = np.array([500])
            self.weekly_trend_model.fit(dummy_X, dummy_y)
            return
        
        feature_cols = [
            'amount', 'day_of_week', 'day_of_month',
            'category_encoded', 'spending_frequency', 'total_spending'
        ]
        
        X_train = X[feature_cols].fillna(0)
        X_scaled = StandardScaler().fit_transform(X_train)
        
        # Train with LinearRegression for weekly trends
        self.weekly_trend_model = LinearRegression()
        self.weekly_trend_model.fit(X_scaled, y_weekly)
    
    def train(self, feature_df, transactions):
        """Train all models"""
        self.train_health_score_model(feature_df, transactions)
        self.train_weekly_trend_model(feature_df, transactions)
        self.is_trained = True
    
    def save_model(self, model_name="spending_model.pkl"):
        """Save trained model to disk"""
        if not self.is_trained:
            raise ValueError("Model not trained yet. Call train() first.")
        
        model_path = os.path.join(self.model_dir, model_name)
        
        model_bundle = {
            'health_score_model': self.health_score_model,
            'weekly_trend_model': self.weekly_trend_model,
            'feature_scaler': self.feature_scaler,
            'trained_at': datetime.now().isoformat()
        }
        
        joblib.dump(model_bundle, model_path)
        print(f"Model saved to {model_path}")
        return model_path
    
    def load_model(self, model_name="spending_model.pkl"):
        """Load saved model from disk"""
        model_path = os.path.join(self.model_dir, model_name)
        
        if not os.path.exists(model_path):
            print(f"Model file not found at {model_path}")
            return False
        
        model_bundle = joblib.load(model_path)
        
        self.health_score_model = model_bundle.get('health_score_model')
        self.weekly_trend_model = model_bundle.get('weekly_trend_model')
        self.feature_scaler = model_bundle.get('feature_scaler')
        self.is_trained = True
        
        print(f"Model loaded from {model_path}")
        return True
