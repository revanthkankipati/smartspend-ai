"""
Prediction Module for SmartSpend AI
Makes predictions using trained ML models
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from collections import defaultdict


class SpendingPredictor:
    """Makes spending predictions and generates insights"""
    
    def __init__(self, trainer, feature_engineer):
        """
        Initialize predictor with trained models
        
        Args:
            trainer: ModelTrainer instance with trained models
            feature_engineer: FeatureEngineer instance
        """
        self.trainer = trainer
        self.feature_engineer = feature_engineer
    
    def predict_health_score(self, transactions):
        """
        Predict financial health score (0-100)
        
        Args:
            transactions: List of transaction dictionaries
            
        Returns:
            Health score (0-100)
        """
        if not transactions or len(transactions) == 0:
            return 50.0  # Default neutral score
        
        features_df = self.feature_engineer.engineer_features(transactions)
        
        if features_df.empty:
            return 50.0
        
        feature_cols = [
            'amount', 'day_of_week', 'category_encoded',
            'spending_frequency', 'avg_spending', 'spending_ratio'
        ]
        
        X = features_df[feature_cols].fillna(0).values
        X_scaled = self.trainer.feature_scaler.transform(X)
        
        if self.trainer.health_score_model is not None:
            predictions = self.trainer.health_score_model.predict(X_scaled)
            health_score = float(np.mean(predictions).clip(0, 100))
        else:
            health_score = 50.0
        
        return round(health_score, 2)
    
    def predict_category_breakdown(self, transactions):
        """
        Analyze spending by category
        
        Args:
            transactions: List of transaction dictionaries
            
        Returns:
            Dictionary with category breakdown
        """
        category_data = self.feature_engineer.aggregate_by_category(transactions)
        
        result = []
        total_spending = sum(cat['total'] for cat in category_data.values())
        
        for category, data in category_data.items():
            percentage = (data['total'] / total_spending * 100) if total_spending > 0 else 0
            
            result.append({
                'category': category,
                'total': data['total'],
                'average': data['average'],
                'count': int(data['count']),
                'percentage': round(percentage, 2)
            })
        
        return sorted(result, key=lambda x: x['total'], reverse=True)
    
    def predict_weekly_spending(self, transactions):
        """
        Predict weekly spending trends
        
        Args:
            transactions: List of transaction dictionaries
            
        Returns:
            Weekly spending predictions
        """
        if not transactions:
            return []
        
        metrics = self.feature_engineer.calculate_spending_metrics(transactions)
        
        # Calculate average weekly spending based on history
        weekly_breakdown = self.feature_engineer.get_weekly_breakdown(transactions)
        
        if not weekly_breakdown:
            avg_weekly = metrics['total_spending']
        else:
            avg_weekly = np.mean(list(weekly_breakdown.values()))
        
        # Generate next 4 weeks predictions with slight variance
        predictions = []
        base_prediction = round(avg_weekly, 2)
        
        for week_offset in range(1, 5):
            # Add slight variation (±10%)
            variance = base_prediction * 0.1 * (np.sin(week_offset) / 2)
            predicted_amount = round(base_prediction + variance, 2)
            
            predictions.append({
                'week': week_offset,
                'predicted_spending': max(0, predicted_amount)
            })
        
        return predictions
    
    def suggest_monthly_budget(self, transactions):
        """
        Suggest monthly budget based on spending patterns
        
        Args:
            transactions: List of transaction dictionaries
            
        Returns:
            Suggested monthly budget
        """
        metrics = self.feature_engineer.calculate_spending_metrics(transactions)
        
        # Calculate average daily spending
        if not transactions:
            return 5000.0
        
        df = self.feature_engineer.parse_transactions(transactions)
        date_range = (df['date'].max() - df['date'].min()).days + 1
        
        avg_daily_spending = metrics['total_spending'] / max(date_range, 1)
        
        # Suggest budget as average * 1.2 (20% buffer)
        suggested_budget = round(avg_daily_spending * 30 * 1.2, 2)
        
        return max(1000, suggested_budget)  # Minimum 1000
    
    def generate_insights(self, transactions):
        """
        Generate smart insights from spending data
        
        Args:
            transactions: List of transaction dictionaries
            
        Returns:
            List of insight strings
        """
        insights = []
        
        if not transactions:
            return ["No transactions to analyze."]
        
        metrics = self.feature_engineer.calculate_spending_metrics(transactions)
        category_breakdown = self.predict_category_breakdown(transactions)
        health_score = self.predict_health_score(transactions)
        
        # Insight 1: Health score
        if health_score > 80:
            insights.append("✓ Your financial health is excellent. Keep up the good spending habits!")
        elif health_score > 60:
            insights.append("→ Your financial health is moderate. Consider reviewing your discretionary spending.")
        else:
            insights.append("⚠ Your financial health needs attention. You may be overspending.")
        
        # Insight 2: Category analysis
        if category_breakdown:
            top_category = category_breakdown[0]
            if top_category['percentage'] > 40:
                insights.append(
                    f"! {top_category['category']} dominates your spending at "
                    f"{top_category['percentage']}%. Consider budgeting this category."
                )
            
            # Insight 3: High transaction amount
            if metrics['max_transaction'] > metrics['avg_transaction'] * 2.5:
                insights.append(
                    f"! You have a large transaction of ₹{metrics['max_transaction']:.2f}. "
                    f"This is {metrics['max_transaction']/metrics['avg_transaction']:.1f}x your average."
                )
        
        # Insight 4: Spending frequency
        if metrics['num_transactions'] > 20:
            insights.append(
                f"→ You made {metrics['num_transactions']} transactions. "
                f"High frequency transactions can add up quickly!"
            )
        
        # Insight 5: Standard deviation
        if metrics['std_deviation'] > metrics['avg_transaction']:
            insights.append(
                "→ Your spending varies significantly. Try to maintain more consistent spending patterns."
            )
        
        # Insight 6: Average transaction size
        if metrics['avg_transaction'] < 200:
            insights.append(
                "✓ Your average transaction size is healthy. "
                f"Stick to smaller, more controlled purchases."
            )
        
        return insights
    
    def analyze_spending(self, transactions):
        """
        Complete spending analysis - main prediction method
        
        Args:
            transactions: List of transaction dictionaries
            
        Returns:
            Dictionary with all predictions and insights
        """
        # Ensure training data
        if not self.trainer.is_trained:
            # Train with provided data if not trained
            features_df = self.feature_engineer.engineer_features(
                transactions, fit=True
            )
            self.trainer.train(features_df, transactions)
        
        return {
            'health_score': self.predict_health_score(transactions),
            'category_breakdown': self.predict_category_breakdown(transactions),
            'weekly_spending_prediction': self.predict_weekly_spending(transactions),
            'suggested_budget': self.suggest_monthly_budget(transactions),
            'insights': self.generate_insights(transactions),
            'metrics': self.feature_engineer.calculate_spending_metrics(transactions)
        }
