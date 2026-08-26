import os
import pickle
import json
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
from backend.app.config import settings

# Load model, scaler, and metrics lazily
_model = None
_scaler = None
_metrics = None

def load_ml_components():
    global _model, _scaler, _metrics
    if _model is None:
        if not os.path.exists(settings.MODEL_PATH):
            raise FileNotFoundError(f"Model not found at {settings.MODEL_PATH}. Train the model first.")
        with open(settings.MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
            
    if _scaler is None:
        if not os.path.exists(settings.SCALER_PATH):
            raise FileNotFoundError(f"Scaler not found at {settings.SCALER_PATH}. Train the model first.")
        with open(settings.SCALER_PATH, "rb") as f:
            _scaler = pickle.load(f)
            
    if _metrics is None:
        if os.path.exists(settings.METRICS_PATH):
            with open(settings.METRICS_PATH, "r") as f:
                _metrics = json.load(f)
                
    return _model, _scaler, _metrics

def calculate_water_quality_score(
    ph: float, hardness: float, solids: float, chloramines: float,
    sulfate: float, conductivity: float, organic_carbon: float,
    trihalomethanes: float, turbidity: float
) -> Tuple[float, str]:
    """
    Calculates a Water Quality Score (0-100) and assigns a Grade (A, B, C, D, F)
    based on distance from EPA/WHO recommended thresholds.
    """
    # 1. pH: Recommended 6.5 to 8.5 (ideal 7.2)
    ph_score = max(0.0, 100.0 - 50.0 * abs(ph - 7.2))
    
    # 2. Hardness: Ideal 150 mg/L (moderately hard). Flag excessive hardness above 250.
    hardness_score = max(0.0, 100.0 - 0.4 * abs(hardness - 170.0))
    
    # 3. Solids (TDS): Ideal < 12000 for dataset distributions.
    solids_score = max(0.0, 100.0 - 0.003 * max(0.0, solids - 12000.0))
    
    # 4. Chloramines: WHO threshold < 4.0 ppm (allowing up to 4.5 in dataset scale).
    chloramines_score = max(0.0, 100.0 - 18.0 * max(0.0, chloramines - 4.5))
    
    # 5. Sulfate: WHO threshold < 250 mg/L.
    sulfate_score = max(0.0, 100.0 - 0.6 * max(0.0, sulfate - 250.0))
    
    # 6. Conductivity: WHO limit is 400 uS/cm.
    conductivity_score = max(0.0, 100.0 - 0.25 * max(0.0, conductivity - 400.0))
    
    # 7. Organic Carbon: Ideal < 8.0 mg/L (WHO guideline: clean drinking water).
    organic_carbon_score = max(0.0, 100.0 - 6.0 * max(0.0, organic_carbon - 8.0))
    
    # 8. Trihalomethanes: Safe threshold < 80 ug/L.
    trihalomethanes_score = max(0.0, 100.0 - 1.5 * max(0.0, trihalomethanes - 80.0))
    
    # 9. Turbidity: WHO guideline < 5.0 NTU (ideal < 1.5 NTU).
    turbidity_score = max(0.0, 100.0 - 22.0 * max(0.0, turbidity - 1.5))
    
    # Weighted average calculation
    wqs = (
        ph_score * 0.15 +
        hardness_score * 0.10 +
        solids_score * 0.10 +
        chloramines_score * 0.12 +
        sulfate_score * 0.12 +
        conductivity_score * 0.08 +
        organic_carbon_score * 0.10 +
        trihalomethanes_score * 0.10 +
        turbidity_score * 0.13
    )
    
    wqs = float(np.clip(wqs, 0.0, 100.0))
    
    # Determine grade
    if wqs >= 90.0:
        grade = "A"
    elif wqs >= 80.0:
        grade = "B"
    elif wqs >= 70.0:
        grade = "C"
    elif wqs >= 50.0:
        grade = "D"
    else:
        grade = "F"
        
    return wqs, grade

def generate_ai_insights(
    prediction: int, ph: float, hardness: float, solids: float,
    chloramines: float, sulfate: float, conductivity: float,
    organic_carbon: float, trihalomethanes: float, turbidity: float
) -> Dict[str, any]:
    """
    Generates structured AI insights, issues, and purification recommendations.
    """
    issues = []
    recommendations = []
    
    if prediction == 1:
        summary = "Water quality appears suitable for drinking."
        recommendations.append("Safe to drink. No major purification needed. Keep stored in a clean container.")
    else:
        summary = "Water quality is NOT safe for drinking. Multiple parameters exceed recommended limits."
        
        # Analyze individual parameter failures
        if ph < 6.5:
            issues.append("Low pH (Acidic water, may cause corrosion and metal leaching)")
            recommendations.append("pH Neutralizer / Calcite Filter")
        elif ph > 8.5:
            issues.append("High pH (Alkaline water, may cause scaling and bitter taste)")
            recommendations.append("Acid injection system or Carbon Dioxide Neutralizer")
            
        if hardness > 250:
            issues.append("Excessive Hardness (High calcium & magnesium, causes pipe scaling)")
            recommendations.append("Water Softener (Ion Exchange) or Reverse Osmosis (RO)")
            
        if solids > 20000:
            issues.append("High Total Dissolved Solids (TDS, indicates high mineralization)")
            recommendations.append("Reverse Osmosis (RO) System or Distillation unit")
            
        if chloramines > 4.0:
            issues.append("High Chloramines (Can cause taste/odor issues and eye irritation)")
            recommendations.append("Activated Carbon Filter (Granular or Block)")
            
        if sulfate > 250:
            issues.append("High Sulfate levels (Can cause laxative effects and salty taste)")
            recommendations.append("Reverse Osmosis (RO) or Distillation")
            
        if conductivity > 500:
            issues.append("High Electrical Conductivity (Indicates high concentration of dissolved ions)")
            recommendations.append("Reverse Osmosis (RO) or Deionization")
            
        if organic_carbon > 10:
            issues.append("High Organic Carbon (TOC, indicates potential organic pollution)")
            recommendations.append("Activated Carbon Filtering + UV Disinfection")
            
        if trihalomethanes > 80:
            issues.append("High Trihalomethanes (Carcinogenic disinfection byproducts)")
            recommendations.append("Activated Carbon Filter or Air Stripping / Aeration")
            
        if turbidity > 5.0:
            issues.append("High Turbidity (Cloudy water, protects pathogens from disinfection)")
            recommendations.append("Multimedia Sand Filtration or Coagulation and Sedimentation")
            
        # Default safety checks
        if not recommendations:
            recommendations.append("Boil water for at least 1 minute before drinking.")
            recommendations.append("Use a standard multi-stage RO + UV purification system.")
            
    # Deduplicate recommendations
    recommendations = list(dict.fromkeys(recommendations))
    
    return {
        "summary": summary,
        "issues": issues,
        "recommendations": recommendations,
        "insights": f"Analysis complete. The safety of the water was evaluated with machine learning model predictions combined with chemical guidelines. Safe limits are pH (6.5-8.5), Turbidity (<5.0 NTU), Sulfate (<250 mg/L), and Chloramines (<4.0 ppm)."
    }

def predict_single(params: Dict[str, float]) -> Dict[str, any]:
    """
    Runs prediction for a single row of features, returns predictions, scores, and recommendations.
    """
    model, scaler, _ = load_ml_components()
    
    # Feature list matching model training
    features = [
        "ph", "Hardness", "Solids", "Chloramines", "Sulfate",
        "Conductivity", "Organic_carbon", "Trihalomethanes", "Turbidity"
    ]
    
    # Impute missing values with default medians (matching typical train distribution)
    defaults = {
        "ph": 7.08, "Hardness": 196.37, "Solids": 22014.09, "Chloramines": 7.12,
        "Sulfate": 333.78, "Conductivity": 426.21, "Organic_carbon": 14.28,
        "Trihalomethanes": 66.40, "Turbidity": 3.97
    }
    
    row_values = []
    for f in features:
        val = params.get(f.lower()) # check lowercase in request
        if val is None or np.isnan(val):
            val = defaults[f]
        row_values.append(val)
        
    # Scale features
    row_arr = np.array(row_values).reshape(1, -1)
    scaled_arr = scaler.transform(row_arr)
    
    # Predict
    pred = int(model.predict(scaled_arr)[0])
    prob = float(model.predict_proba(scaled_arr)[0][pred]) # confidence in the chosen class
    
    # Calculate WQS and Grade
    wqs, grade = calculate_water_quality_score(
        row_values[0], row_values[1], row_values[2], row_values[3],
        row_values[4], row_values[5], row_values[6], row_values[7], row_values[8]
    )
    
    # Generate insights
    insights_data = generate_ai_insights(
        pred, row_values[0], row_values[1], row_values[2], row_values[3],
        row_values[4], row_values[5], row_values[6], row_values[7], row_values[8]
    )
    
    return {
        "ph": row_values[0],
        "hardness": row_values[1],
        "solids": row_values[2],
        "chloramines": row_values[3],
        "sulfate": row_values[4],
        "conductivity": row_values[5],
        "organic_carbon": row_values[6],
        "trihalomethanes": row_values[7],
        "turbidity": row_values[8],
        "prediction": pred,
        "confidence": prob,
        "wqs_score": wqs,
        "wqs_grade": grade,
        "insights": insights_data
    }

def get_metrics_json():
    _, _, metrics = load_ml_components()
    return metrics
