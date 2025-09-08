"""
Railway QR Tracker - Processing Configuration
Smart India Hackathon 2025
Configuration management for data processing pipeline
"""

import os
import json
import yaml
from pathlib import Path
from typing import Dict, Any, Optional
import logging

class ProcessingConfig:
    """
    Configuration manager for Railway QR Tracker data processing pipeline
    
    Handles configuration from multiple sources:
    - Environment variables
    - JSON/YAML config files
    - Default values
    """
    
    def __init__(self, config_path: Optional[str] = None):
        self.config_path = config_path or "config/processing_config.json"
        self.config = self._load_configuration()
        
    def _load_configuration(self) -> Dict[str, Any]:
        """Load configuration from file and environment variables"""
        
        # Default configuration
        default_config = {
            "version": "1.0.0",
            "environment": "development",
            "log_level": "INFO",
            "output_directory": "output",
            
            # Database configuration
            "database": {
                "host": os.getenv("DB_HOST", "localhost"),
                "port": int(os.getenv("DB_PORT", 3306)),
                "user": os.getenv("DB_USER", "railway_user"),
                "password": os.getenv("DB_PASSWORD", "railway_pass123"),
                "database": os.getenv("DB_NAME", "railway_qr_tracker"),
                "charset": "utf8mb4",
                "autocommit": True,
                "pool_size": 10,
                "max_overflow": 20,
                "pool_timeout": 30,
                "pool_recycle": 3600
            },
            
            # Quality analysis configuration
            "quality_analysis": {
                "anomaly_detection": {
                    "contamination": 0.1,
                    "n_estimators": 100,
                    "random_state": 42
                },
                "risk_assessment": {
                    "critical_threshold": 0.8,
                    "high_threshold": 0.6,
                    "medium_threshold": 0.4
                },
                "thresholds": {
                    "critical_age_days": 2190,
                    "high_risk_age_days": 1825,
                    "max_scan_frequency": 365,
                    "critical_failure_rate": 0.15,
                    "high_risk_failure_rate": 0.10
                }
            },
            
            # Predictive maintenance configuration
            "predictive_maintenance": {
                "models": {
                    "failure_prediction": {
                        "algorithm": "random_forest",
                        "n_estimators": 200,
                        "max_depth": 15,
                        "min_samples_split": 5,
                        "random_state": 42
                    },
                    "lifecycle_prediction": {
                        "algorithm": "gradient_boosting",
                        "n_estimators": 150,
                        "learning_rate": 0.1,
                        "max_depth": 8,
                        "random_state": 42
                    }
                },
                "maintenance_intervals": {
                    "ERC": 1825,  # 5 years
                    "RPD": 1460,  # 4 years
                    "LNR": 2190   # 6 years
                },
                "urgency_thresholds": {
                    "emergency_days": 7,
                    "urgent_days": 30,
                    "planned_days": 90
                }
            },
            
            # Cost optimization configuration
            "cost_optimization": {
                "currency": "INR",
                "base_costs": {
                    "ERC": 15000,
                    "RPD": 12000,
                    "LNR": 18000
                },
                "cost_multipliers": {
                    "emergency": 2.5,
                    "urgent": 1.8,
                    "planned": 1.2,
                    "routine": 1.0
                },
                "optimization_targets": {
                    "cost_reduction_percentage": 25,
                    "efficiency_improvement": 60,
                    "roi_target": 240  # 240% ROI target
                }
            },
            
            # Reporting configuration
            "reporting": {
                "output_formats": ["json", "csv", "excel"],
                "report_types": [
                    "executive_summary",
                    "technical_analysis", 
                    "financial_report",
                    "operational_recommendations"
                ],
                "auto_generate": True,
                "include_charts": True,
                "email_reports": False
            },
            
            # Performance settings
            "performance": {
                "batch_size": 1000,
                "parallel_processing": True,
                "max_workers": 4,
                "memory_limit_gb": 8,
                "cache_enabled": True,
                "cache_ttl_seconds": 3600
            },
            
            # Business impact calculation
            "business_impact": {
                "annual_railway_maintenance_budget": 400000000000,  # ₹4000 crores
                "cost_per_failure": 50000,  # ₹50K per failure
                "downtime_cost_per_hour": 100000,  # ₹1 lakh per hour
                "efficiency_baseline": 40,  # 40% baseline efficiency
                "target_efficiency": 100,  # 100% target efficiency
                "roi_calculation_years": 5
            }
        }
        
        # Try to load from file if it exists
        config_file = Path(self.config_path)
        if config_file.exists():
            try:
                with open(config_file, 'r', encoding='utf-8') as f:
                    if config_file.suffix.lower() == '.yaml' or config_file.suffix.lower() == '.yml':
                        file_config = yaml.safe_load(f)
                    else:
                        file_config = json.load(f)
                
                # Merge file config with defaults
                default_config.update(file_config)
                
            except Exception as e:
                logging.warning(f"Failed to load config file {config_file}: {e}")
        
        return default_config
    
    @property
    def version(self) -> str:
        return self.config.get("version", "1.0.0")
    
    @property
    def environment(self) -> str:
        return self.config.get("environment", "development")
    
    @property
    def log_level(self) -> str:
        return self.config.get("log_level", "INFO")
    
    @property
    def output_directory(self) -> str:
        return self.config.get("output_directory", "output")
    
    @property
    def database(self) -> Dict[str, Any]:
        return self.config.get("database", {})
    
    @property
    def quality_analysis(self) -> Dict[str, Any]:
        return self.config.get("quality_analysis", {})
    
    @property
    def predictive_maintenance(self) -> Dict[str, Any]:
        return self.config.get("predictive_maintenance", {})
    
    @property
    def cost_optimization(self) -> Dict[str, Any]:
        return self.config.get("cost_optimization", {})
    
    @property
    def reporting(self) -> Dict[str, Any]:
        return self.config.get("reporting", {})
    
    @property
    def performance(self) -> Dict[str, Any]:
        return self.config.get("performance", {})
    
    @property
    def business_impact(self) -> Dict[str, Any]:
        return self.config.get("business_impact", {})
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value by key with dot notation support"""
        keys = key.split('.')
        value = self.config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value
    
    def save_config(self, output_path: Optional[str] = None) -> None:
        """Save current configuration to file"""
        output_file = Path(output_path or self.config_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=2, ensure_ascii=False)
    
    def to_dict(self) -> Dict[str, Any]:
        """Return configuration as dictionary"""
        return self.config.copy()
    
    def __str__(self) -> str:
        return f"ProcessingConfig(version={self.version}, environment={self.environment})"
    
    def __repr__(self) -> str:
        return self.__str__()
