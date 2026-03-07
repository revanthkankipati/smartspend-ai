"""
Feature Engineering Module for SmartSpend AI
Converts raw transaction data into ML-ready features
"""

import pandas as pd
import numpy as np
from datetime import datetime
from collections import Counter


class FeatureEngineer:
    """Handles feature extraction and engineering from transaction data"""
    
    def __init__(self):
        self.category_encoder = {}
        self.categories_list = []
    
    def fit_categories(self, transactions):
        """Learn unique categories from transactions"""
        categories = set()
        for transaction in transactions:
            categories.add(transaction.get("category", "Uncategorized"))
        
        self.categories_list = sorted(list(categories))
        self.category_encoder = {cat: idx for idx, cat in enumerate(self.categories_list)}
    
    def parse_transactions(self, transactions):
        """Convert transaction list to DataFrame with parsed dates"""
        df = pd.DataFrame(transactions)
        df['date'] = pd.to_datetime(df['date'])
        return df
    
    def engineer_features(self, transactions, fit=False):
        """
        Convert raw transactions into feature vector
        
        Returns:
            DataFrame with engineered features
        """
        if not transactions:
            return pd.DataFrame()
        
        if fit:
            self.fit_categories(transactions)
        
        df = self.parse_transactions(transactions)
        
        features = pd.DataFrame()
        
        # Basic features
        features['amount'] = df['amount']
        features['day_of_week'] = df['date'].dt.dayofweek
        features['day_of_month'] = df['date'].dt.day
        
        # Category encoding
        if not self.category_encoder:
            self.fit_categories(transactions)
        
        features['category_encoded'] = df['category'].map(
            lambda x: self.category_encoder.get(x, -1)
        )
        
        # Spending frequency (transactions per day)
        date_range = (df['date'].max() - df['date'].min()).days + 1
        spending_frequency = len(df) / max(date_range, 1)
        features['spending_frequency'] = spending_frequency
        
        # Total spending
        total_spending = df['amount'].sum()
        features['total_spending'] = total_spending
        
        # Average spending
        features['avg_spending'] = df['amount'].mean()
        
        # Spending ratio (current transaction / average)
        avg_trans = df['amount'].mean()
        features['spending_ratio'] = df['amount'] / max(avg_trans, 1)
        
        return features
    
    def aggregate_by_category(self, transactions):
        """Aggregate spending by category"""
        df = self.parse_transactions(transactions)
        
        category_spending = df.groupby('category').agg({
            'amount': ['sum', 'mean', 'count']
        }).round(2)
        
        category_spending.columns = ['total', 'average', 'count']
        category_spending = category_spending.sort_values('total', ascending=False)
        
        return category_spending.to_dict('index')
    
    def get_weekly_breakdown(self, transactions):
        """Get spending by week"""
        if not transactions:
            return {}
        
        df = self.parse_transactions(transactions)
        df['week'] = df['date'].dt.isocalendar().week
        
        weekly_spending = df.groupby('week')['amount'].sum().round(2).to_dict()
        return dict(sorted(weekly_spending.items()))
    
    def get_daily_breakdown(self, transactions):
        """Get spending by day of week (0=Monday, 6=Sunday)"""
        if not transactions:
            return {}
        
        df = self.parse_transactions(transactions)
        df['day_name'] = df['date'].dt.day_name()
        
        daily_spending = df.groupby('day_name')['amount'].agg(['sum', 'mean', 'count']).round(2)
        return daily_spending.to_dict('index')
    
    def calculate_spending_metrics(self, transactions):
        """Calculate key spending metrics"""
        if not transactions:
            return {
                'total_spending': 0,
                'avg_transaction': 0,
                'max_transaction': 0,
                'min_transaction': 0,
                'std_deviation': 0,
                'num_transactions': 0
            }
        
        df = self.parse_transactions(transactions)
        amounts = df['amount']
        
        return {
            'total_spending': float(amounts.sum()),
            'avg_transaction': float(amounts.mean()),
            'max_transaction': float(amounts.max()),
            'min_transaction': float(amounts.min()),
            'std_deviation': float(amounts.std()),
            'num_transactions': len(df)
        }
