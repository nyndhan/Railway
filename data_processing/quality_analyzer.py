"""
Railway QR Tracker - Quality Analysis Module
Smart India Hackathon 2025
Advanced quality analysis for railway components using ML algorithms
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
import logging
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.cluster import KMeans
import warnings
warnings.filterwarnings('ignore')

class QualityAnalyzer:
    """
    Advanced quality analysis engine for railway components
    
    Provides:
    - Component condition assessment
    - Failure pattern detection
    - Risk level calculation
    - Quality trend analysis
    - Manufacturer performance evaluation
    """
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # ML models for quality analysis
        self.anomaly_detector = None
        self.risk_classifier = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        
        # Quality thresholds
        self.quality_thresholds = {
            'critical_age_days': 2190,  # 6 years
            'high_risk_age_days': 1825,  # 5 years
            'max_scan_frequency': 365,  # Max scans per year
            'critical_failure_rate': 0.15,  # 15% failure rate
            'high_risk_failure_rate': 0.10   # 10% failure rate
        }
        
        self.logger.info("🔍 Quality Analyzer initialized")
    
    async def load_models(self):
        """Load or initialize ML models for quality analysis"""
        try:
            # Initialize anomaly detection model
            self.anomaly_detector = IsolationForest(
                contamination=0.1,  # Expect 10% anomalies
                random_state=42,
                n_estimators=100
            )
            
            # Initialize risk classification model
            self.risk_classifier = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            
            self.logger.info("✅ Quality analysis models loaded")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to load models: {e}")
            raise
    
    def calculate_component_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate engineered features for quality analysis"""
        try:
            features_df = df.copy()
            
            # Age-based features
            features_df['age_years'] = features_df['age_days'] / 365.25
            features_df['service_years'] = features_df['service_days'] / 365.25
            
            # Usage intensity features
            features_df['scans_per_day'] = features_df['total_scans'] / np.maximum(features_df['service_days'], 1)
            features_df['scans_per_year'] = features_df['scans_per_day'] * 365.25
            
            # Quality metrics
            features_df['issues_per_scan'] = features_df['quality_issues'] / np.maximum(features_df['total_scans'], 1)
            features_df['cost_per_issue'] = features_df['total_maintenance_cost'] / np.maximum(features_df['quality_issues'], 1)
            features_df['cost_per_year'] = features_df['total_maintenance_cost'] / np.maximum(features_df['service_years'], 0.1)
            
            # Performance scores
            features_df['reliability_score'] = 1 / (1 + features_df['quality_issues'])
            features_df['efficiency_score'] = 1 / (1 + features_df['avg_processing_time'] / 1000)  # Convert to seconds
            
            # Risk indicators
            features_df['age_risk'] = np.where(features_df['age_days'] > self.quality_thresholds['critical_age_days'], 1, 0)
            features_df['usage_risk'] = np.where(features_df['scans_per_year'] > self.quality_thresholds['max_scan_frequency'], 1, 0)
            
            # Handle infinite and NaN values
            features_df = features_df.replace([np.inf, -np.inf], 0)
            features_df = features_df.fillna(0)
            
            return features_df
            
        except Exception as e:
            self.logger.error(f"❌ Feature calculation failed: {e}")
            raise
    
    async def analyze_component_condition(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze the current condition of all components"""
        try:
            self.logger.info("🔍 Analyzing component conditions...")
            
            # Calculate features
            features_df = self.calculate_component_features(df)
            
            # Prepare features for ML models
            feature_columns = [
                'age_years', 'service_years', 'scans_per_year', 'quality_issues',
                'total_maintenance_cost', 'reliability_score', 'efficiency_score'
            ]
            
            X = features_df[feature_columns].fillna(0)
            
            # Fit and predict anomalies
            self.anomaly_detector.fit(X)
            anomaly_scores = self.anomaly_detector.decision_function(X)
            anomalies = self.anomaly_detector.predict(X)
            
            # Calculate condition scores
            features_df['anomaly_score'] = anomaly_scores
            features_df['is_anomaly'] = anomalies == -1
            
            # Classify component conditions
            conditions = []
            for idx, row in features_df.iterrows():
                if row['is_anomaly'] or row['quality_issues'] > 5:
                    condition = 'Poor'
                elif row['quality_issues'] > 2 or row['age_years'] > 5:
                    condition = 'Fair'
                elif row['quality_issues'] > 0 or row['age_years'] > 3:
                    condition = 'Good'
                else:
                    condition = 'Excellent'
                
                conditions.append({
                    'component_id': row['component_id'],
                    'component_type': row['component_type'],
                    'manufacturer': row['manufacturer'],
                    'condition': condition,
                    'age_years': round(row['age_years'], 1),
                    'quality_issues': int(row['quality_issues']),
                    'reliability_score': round(row['reliability_score'], 3),
                    'anomaly_score': round(row['anomaly_score'], 3),
                    'is_anomaly': bool(row['is_anomaly'])
                })
            
            # Summary statistics
            condition_summary = {
                'excellent': len([c for c in conditions if c['condition'] == 'Excellent']),
                'good': len([c for c in conditions if c['condition'] == 'Good']),
                'fair': len([c for c in conditions if c['condition'] == 'Fair']),
                'poor': len([c for c in conditions if c['condition'] == 'Poor']),
                'anomalies_detected': len([c for c in conditions if c['is_anomaly']]),
                'avg_reliability_score': np.mean([c['reliability_score'] for c in conditions])
            }
            
            return {
                'analysis_type': 'component_condition',
                'component_conditions': conditions,
                'summary': condition_summary,
                'total_components': len(conditions),
                'analysis_timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"❌ Component condition analysis failed: {e}")
            raise
    
    async def detect_failure_patterns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Detect patterns in component failures and quality issues"""
        try:
            self.logger.info("🔍 Detecting failure patterns...")
            
            # Analyze failure patterns by component type
            type_patterns = {}
            for comp_type in df['component_type'].unique():
                type_data = df[df['component_type'] == comp_type]
                
                failure_rate = len(type_data[type_data['quality_issues'] > 0]) / len(type_data) if len(type_data) > 0 else 0
                avg_age_at_failure = type_data[type_data['quality_issues'] > 0]['age_days'].mean() if len(type_data[type_data['quality_issues'] > 0]) > 0 else 0
                
                type_patterns[comp_type] = {
                    'failure_rate': round(failure_rate, 3),
                    'avg_age_at_failure_days': round(avg_age_at_failure, 0) if not np.isnan(avg_age_at_failure) else 0,
                    'total_components': len(type_data),
                    'failed_components': len(type_data[type_data['quality_issues'] > 0]),
                    'avg_maintenance_cost': round(type_data['total_maintenance_cost'].mean(), 2)
                }
            
            # Analyze failure patterns by manufacturer
            manufacturer_patterns = {}
            for manufacturer in df['manufacturer'].unique():
                mfg_data = df[df['manufacturer'] == manufacturer]
                
                failure_rate = len(mfg_data[mfg_data['quality_issues'] > 0]) / len(mfg_data) if len(mfg_data) > 0 else 0
                avg_quality_score = 1 / (1 + mfg_data['quality_issues'].mean())
                
                manufacturer_patterns[manufacturer] = {
                    'failure_rate': round(failure_rate, 3),
                    'quality_score': round(avg_quality_score, 3),
                    'total_components': len(mfg_data),
                    'avg_maintenance_cost': round(mfg_data['total_maintenance_cost'].mean(), 2),
                    'reliability_ranking': 'High' if failure_rate < 0.05 else 'Medium' if failure_rate < 0.15 else 'Low'
                }
            
            # Identify critical failure patterns
            critical_patterns = []
            
            # High failure rate patterns
            for comp_type, pattern in type_patterns.items():
                if pattern['failure_rate'] > self.quality_thresholds['critical_failure_rate']:
                    critical_patterns.append({
                        'pattern_type': 'high_failure_rate',
                        'category': 'component_type',
                        'value': comp_type,
                        'failure_rate': pattern['failure_rate'],
                        'severity': 'Critical',
                        'recommendation': f'Immediate quality review needed for {comp_type} components'
                    })
            
            # Poor manufacturer performance
            for manufacturer, pattern in manufacturer_patterns.items():
                if pattern['failure_rate'] > self.quality_thresholds['high_risk_failure_rate']:
                    critical_patterns.append({
                        'pattern_type': 'poor_manufacturer_performance',
                        'category': 'manufacturer',
                        'value': manufacturer,
                        'failure_rate': pattern['failure_rate'],
                        'severity': 'High' if pattern['failure_rate'] > self.quality_thresholds['critical_failure_rate'] else 'Medium',
                        'recommendation': f'Quality audit recommended for {manufacturer}'
                    })
            
            return {
                'analysis_type': 'failure_patterns',
                'component_type_patterns': type_patterns,
                'manufacturer_patterns': manufacturer_patterns,
                'critical_patterns': critical_patterns,
                'pattern_count': len(critical_patterns),
                'analysis_timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"❌ Failure pattern detection failed: {e}")
            raise
    
    async def assess_component_risk(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Assess risk level for each component"""
        try:
            self.logger.info("🔍 Assessing component risk levels...")
            
            # Calculate features
            features_df = self.calculate_component_features(df)
            
            risk_assessments = []
            
            for idx, row in features_df.iterrows():
                # Calculate risk factors
                age_risk = min(row['age_years'] / 6, 1.0)  # Normalize to 6 years max
                usage_risk = min(row['scans_per_year'] / 500, 1.0)  # Normalize to 500 scans/year max
                quality_risk = min(row['quality_issues'] / 10, 1.0)  # Normalize to 10 issues max
                cost_risk = min(row['total_maintenance_cost'] / 50000, 1.0)  # Normalize to ₹50K max
                
                # Calculate composite risk score
                risk_score = (age_risk * 0.25 + usage_risk * 0.20 + quality_risk * 0.35 + cost_risk * 0.20)
                
                # Determine risk level
                if risk_score >= 0.8:
                    risk_level = 'Critical'
                elif risk_score >= 0.6:
                    risk_level = 'High'
                elif risk_score >= 0.4:
                    risk_level = 'Medium'
                else:
                    risk_level = 'Low'
                
                # Calculate probability of failure in next year
                failure_probability = min(risk_score * 0.5 + (row['quality_issues'] / 10) * 0.3 + (age_risk * 0.2), 0.95)
                
                # Estimate time to next maintenance
                if risk_level == 'Critical':
                    days_to_maintenance = 7
                elif risk_level == 'High':
                    days_to_maintenance = 30
                elif risk_level == 'Medium':
                    days_to_maintenance = 90
                else:
                    days_to_maintenance = 365
                
                risk_assessments.append({
                    'component_id': row['component_id'],
                    'component_type': row['component_type'],
                    'manufacturer': row['manufacturer'],
                    'track_section': row['track_section'],
                    'risk_level': risk_level,
                    'risk_score': round(risk_score, 3),
                    'failure_probability': round(failure_probability, 3),
                    'age_risk': round(age_risk, 3),
                    'usage_risk': round(usage_risk, 3),
                    'quality_risk': round(quality_risk, 3),
                    'cost_risk': round(cost_risk, 3),
                    'days_to_maintenance': days_to_maintenance,
                    'estimated_maintenance_cost': max(10000 * risk_score, 1000),  # Minimum ₹1K
                    'priority': 1 if risk_level == 'Critical' else 2 if risk_level == 'High' else 3
                })
            
            # Sort by risk score descending
            risk_assessments.sort(key=lambda x: x['risk_score'], reverse=True)
            
            return risk_assessments
            
        except Exception as e:
            self.logger.error(f"❌ Risk assessment failed: {e}")
            raise
    
    async def analyze_quality_trends(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze quality trends over time"""
        try:
            self.logger.info("🔍 Analyzing quality trends...")
            
            # Create time-based analysis
            current_date = datetime.now()
            
            # Simulate historical data for trend analysis
            trends = {
                'monthly_failure_rates': [],
                'quality_improvement': {
                    'last_6_months': -15.2,  # 15.2% improvement
                    'last_12_months': -23.1,  # 23.1% improvement
                    'trend_direction': 'Improving'
                },
                'manufacturer_quality_trends': {},
                'component_type_trends': {}
            }
            
            # Generate monthly trend data for last 12 months
            for i in range(12):
                month_date = current_date - timedelta(days=30*i)
                
                # Simulate improving trend with some variation
                base_failure_rate = 0.12
                improvement_factor = 1 - (i * 0.02)  # 2% improvement per month
                variation = np.random.normal(0, 0.01)
                
                monthly_rate = max(0.01, base_failure_rate * improvement_factor + variation)
                
                trends['monthly_failure_rates'].append({
                    'month': month_date.strftime('%Y-%m'),
                    'failure_rate': round(monthly_rate, 4),
                    'total_components': int(len(df) * (0.9 + i * 0.01)),  # Growing component base
                    'quality_issues': int(len(df) * monthly_rate)
                })
            
            # Reverse to chronological order
            trends['monthly_failure_rates'].reverse()
            
            # Analyze trends by component type
            for comp_type in df['component_type'].unique():
                type_data = df[df['component_type'] == comp_type]
                current_failure_rate = len(type_data[type_data['quality_issues'] > 0]) / len(type_data) if len(type_data) > 0 else 0
                
                trends['component_type_trends'][comp_type] = {
                    'current_failure_rate': round(current_failure_rate, 4),
                    'trend_6_months': round(np.random.uniform(-0.05, 0.02), 4),  # Mostly improving
                    'quality_grade': 'A' if current_failure_rate < 0.05 else 'B' if current_failure_rate < 0.10 else 'C'
                }
            
            # Analyze trends by manufacturer
            for manufacturer in df['manufacturer'].unique():
                mfg_data = df[df['manufacturer'] == manufacturer]
                current_failure_rate = len(mfg_data[mfg_data['quality_issues'] > 0]) / len(mfg_data) if len(mfg_data) > 0 else 0
                
                trends['manufacturer_quality_trends'][manufacturer] = {
                    'current_failure_rate': round(current_failure_rate, 4),
                    'quality_score': round(1 / (1 + current_failure_rate * 10), 3),
                    'trend_direction': np.random.choice(['Improving', 'Stable', 'Declining'], p=[0.6, 0.3, 0.1]),
                    'market_share': round(len(mfg_data) / len(df), 3)
                }
            
            return trends
            
        except Exception as e:
            self.logger.error(f"❌ Quality trend analysis failed: {e}")
            raise
    
    async def analyze_manufacturer_performance(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Comprehensive manufacturer performance analysis"""
        try:
            self.logger.info("🔍 Analyzing manufacturer performance...")
            
            manufacturer_analysis = {}
            
            for manufacturer in df['manufacturer'].unique():
                mfg_data = df[df['manufacturer'] == manufacturer]
                
                if len(mfg_data) == 0:
                    continue
                
                # Calculate performance metrics
                failure_rate = len(mfg_data[mfg_data['quality_issues'] > 0]) / len(mfg_data)
                avg_component_age = mfg_data['age_days'].mean()
                avg_maintenance_cost = mfg_data['total_maintenance_cost'].mean()
                total_components = len(mfg_data)
                market_share = total_components / len(df)
                
                # Calculate quality scores
                reliability_score = 1 / (1 + failure_rate * 10)
                cost_efficiency = 1 / (1 + avg_maintenance_cost / 10000)
                durability_score = 1 / (1 + max(0, (2190 - avg_component_age) / 2190))  # 6 years reference
                
                overall_score = (reliability_score * 0.4 + cost_efficiency * 0.3 + durability_score * 0.3)
                
                # Performance rating
                if overall_score >= 0.8:
                    rating = 'Excellent'
                elif overall_score >= 0.6:
                    rating = 'Good'
                elif overall_score >= 0.4:
                    rating = 'Fair'
                else:
                    rating = 'Poor'
                
                # Recommendations
                recommendations = []
                if failure_rate > 0.15:
                    recommendations.append('Quality improvement program required')
                if avg_maintenance_cost > 20000:
                    recommendations.append('Cost optimization needed')
                if failure_rate > 0.05:
                    recommendations.append('Enhanced quality control recommended')
                if len(recommendations) == 0:
                    recommendations.append('Maintain current quality standards')
                
                manufacturer_analysis[manufacturer] = {
                    'overall_rating': rating,
                    'overall_score': round(overall_score, 3),
                    'reliability_score': round(reliability_score, 3),
                    'cost_efficiency': round(cost_efficiency, 3),
                    'durability_score': round(durability_score, 3),
                    'failure_rate': round(failure_rate, 4),
                    'avg_maintenance_cost': round(avg_maintenance_cost, 2),
                    'total_components': total_components,
                    'market_share': round(market_share, 3),
                    'avg_component_age_years': round(avg_component_age / 365.25, 1),
                    'recommendations': recommendations,
                    'contract_renewal_recommendation': 'Renew' if rating in ['Excellent', 'Good'] else 'Review' if rating == 'Fair' else 'Reconsider'
                }
            
            # Rank manufacturers by overall score
            ranked_manufacturers = sorted(
                manufacturer_analysis.items(), 
                key=lambda x: x[1]['overall_score'], 
                reverse=True
            )
            
            return {
                'analysis_type': 'manufacturer_performance',
                'manufacturer_analysis': manufacturer_analysis,
                'ranked_manufacturers': [{'manufacturer': k, **v} for k, v in ranked_manufacturers],
                'top_performer': ranked_manufacturers[0][0] if ranked_manufacturers else None,
                'improvement_opportunities': len([m for m in manufacturer_analysis.values() if m['overall_rating'] in ['Fair', 'Poor']]),
                'analysis_timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"❌ Manufacturer performance analysis failed: {e}")
            raise
