import joblib
import pickle
from pathlib import Path
from typing import List, Dict, Any
import numpy as np
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class FraudDetectionModel:
    def __init__(self, model_path: str = "./models/fraud_detection_model.pkl"):
        self.model_path = model_path
        self.model = None
        self.feature_scaler = None
        self.model_version = "1.0.0"
        self.load_model()
    
    def load_model(self):
        """Load the trained Random Forest model"""
        try:
            if Path(self.model_path).exists():
                self.model = joblib.load(self.model_path)
                logger.info(f"Model loaded from {self.model_path}")
            else:
                logger.warning(f"Model not found at {self.model_path}. Using mock model.")
                self._load_mock_model()
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self._load_mock_model()
    
    def _load_mock_model(self):
        """Load a simple mock model for development/testing"""
        from sklearn.ensemble import RandomForestClassifier
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
    
    def extract_features(self, transaction_data: Dict[str, Any]) -> np.ndarray:
        """Extract features from transaction data for model prediction"""
        features = [
            transaction_data.get('amount', 0),
            transaction_data.get('customer_age', 0),
            transaction_data.get('customer_city_population', 0),
            transaction_data.get('transaction_hour', 0),
            self._calculate_distance(
                transaction_data.get('customer_latitude', 0),
                transaction_data.get('customer_longitude', 0),
                transaction_data.get('merchant_latitude', 0),
                transaction_data.get('merchant_longitude', 0)
            ),
            self._encode_categorical(transaction_data.get('merchant_category', '')),
            self._encode_categorical(transaction_data.get('customer_gender', '')),
            self._encode_categorical(transaction_data.get('customer_state', '')),
        ]
        return np.array(features).reshape(1, -1)
    
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two coordinates (simplified)"""
        from math import radians, cos, sin, asin, sqrt
        try:
            lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            km = 6371 * c
            return km
        except:
            return 0
    
    def _encode_categorical(self, value: str) -> int:
        """Simple categorical encoding"""
        return hash(value.lower()) % 100  # Simple hash-based encoding
    
    def analyze_transaction(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze a transaction and return fraud probability"""
        try:
            # Extract features
            features = self.extract_features(transaction_data)
            
            # Get prediction
            if hasattr(self.model, 'predict_proba'):
                probabilities = self.model.predict_proba(features)[0]
                fraud_probability = float(probabilities[1]) if len(probabilities) > 1 else 0.5
            else:
                fraud_probability = float(np.random.random())
            
            # Identify risk factors
            risk_factors = self._identify_risk_factors(transaction_data, fraud_probability)
            
            # Determine fraud status
            fraud_status = self._determine_fraud_status(fraud_probability, transaction_data)
            
            return {
                'fraud_probability': fraud_probability,
                'fraud_status': fraud_status,
                'risk_factors': risk_factors,
                'model_version': self.model_version,
                'confidence_score': 1.0 - abs(0.5 - fraud_probability) * 2  # Inverted distance from 0.5
            }
        except Exception as e:
            logger.error(f"Error analyzing transaction: {e}")
            return {
                'fraud_probability': 0.5,
                'fraud_status': 'suspicious',
                'risk_factors': [{'factor': 'Analysis Error', 'severity': 'low', 'description': str(e)}],
                'model_version': self.model_version,
                'confidence_score': 0.0
            }
    
    def _identify_risk_factors(self, transaction_data: Dict[str, Any], fraud_probability: float) -> List[Dict[str, str]]:
        """Identify specific risk factors in the transaction"""
        risk_factors = []
        
        # High amount risk
        amount = transaction_data.get('amount', 0)
        if amount > 1000:
            risk_factors.append({
                'factor': 'High Transaction Amount',
                'severity': 'high' if amount > 5000 else 'medium',
                'description': f'Transaction amount ${amount:,.2f} exceeds typical threshold'
            })
        
        # Geographic anomaly
        distance = self._calculate_distance(
            transaction_data.get('customer_latitude', 0),
            transaction_data.get('customer_longitude', 0),
            transaction_data.get('merchant_latitude', 0),
            transaction_data.get('merchant_longitude', 0)
        )
        if distance > 500:  # More than 500km
            risk_factors.append({
                'factor': 'Geographic Anomaly',
                'severity': 'high',
                'description': f'Merchant location {distance:.0f}km from customer location'
            })
        
        # Unusual time
        hour = transaction_data.get('transaction_hour', 12)
        if hour < 6 or hour > 23:
            risk_factors.append({
                'factor': 'Unusual Transaction Time',
                'severity': 'medium',
                'description': f'Transaction at {hour:02d}:00 is outside normal hours'
            })
        
        # Risky categories
        risky_categories = ['Online Gambling', 'Wire Transfer', 'Money Transfer', 'Cryptocurrency']
        if transaction_data.get('merchant_category', '') in risky_categories:
            risk_factors.append({
                'factor': 'High-Risk Category',
                'severity': 'medium',
                'description': f'Category \"{transaction_data.get("merchant_category")}\" has elevated fraud risk'
            })
        
        # High model probability
        if fraud_probability > 0.7:
            risk_factors.append({
                'factor': 'High Fraud Probability',
                'severity': 'high',
                'description': f'ML model assigned {fraud_probability:.1%} fraud probability'
            })
        
        return risk_factors if risk_factors else [{'factor': 'None', 'severity': 'low', 'description': 'No significant risk factors identified'}]
    
    def _determine_fraud_status(self, fraud_probability: float, transaction_data: Dict[str, Any]) -> str:
        """Determine fraud status based on probability and factors"""
        if fraud_probability > 0.75:
            return 'fraudulent'
        elif fraud_probability > 0.45:
            return 'suspicious'
        else:
            return 'legitimate'

# Global model instance
_model_instance: FraudDetectionModel = None

def get_fraud_model() -> FraudDetectionModel:
    """Get or create fraud detection model instance"""
    global _model_instance
    if _model_instance is None:
        _model_instance = FraudDetectionModel()
    return _model_instance
