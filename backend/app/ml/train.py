import os
import json
import pickle
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_curve, auc

PROJECT_ROOT = Path(__file__).resolve().parents[3]
BACKEND_DIR = PROJECT_ROOT / "backend"

# Classifiers
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression

# Try importing xgboost, fall back to HistGradientBoosting if not available
try:
    from xgboost import XGBClassifier
    HAS_XGB = True
except ImportError:
    from sklearn.ensemble import HistGradientBoostingClassifier as XGBClassifier
    HAS_XGB = False

def train_models():
    print("Training ML Models...")
    
    # Load training data
    train_path = BACKEND_DIR / "data" / "water_potability_train.csv"
    if not train_path.exists():
        raise FileNotFoundError(f"Training data not found at {train_path}. Run generate_data.py first.")
        
    df = pd.read_csv(train_path)
    
    # Separate features and target
    X = df.drop(columns=["Potability"])
    y = df["Potability"]
    
    feature_names = list(X.columns)
    
    # Address potential missing values (just in case)
    X = X.fillna(X.median())
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Define models
    models = {
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, random_state=42)
    }
    
    if HAS_XGB:
        models["XGBoost"] = XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42, eval_metric="logloss")
        print("XGBoost is available and will be compared.")
    else:
        models["HistGradientBoosting"] = XGBClassifier(max_iter=100, random_state=42)
        print("XGBoost library not found. Falling back to HistGradientBoosting for comparison.")
        
    # Evaluate models
    best_name = None
    best_accuracy = 0.0
    best_model = None
    metrics_report = {}
    
    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train_scaled, y_train)
        
        # Predict
        y_pred = model.predict(X_test_scaled)
        y_prob = model.predict_proba(X_test_scaled)[:, 1]
        
        # Metrics
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        
        # Confusion Matrix
        cm = confusion_matrix(y_test, y_pred).tolist() # [[TN, FP], [FN, TP]]
        
        # ROC Curve
        fpr, tpr, thresholds = roc_curve(y_test, y_prob)
        roc_auc = auc(fpr, tpr)
        
        # Select best
        if acc > best_accuracy:
            best_accuracy = acc
            best_name = name
            best_model = model
            
        metrics_report[name] = {
            "accuracy": float(acc),
            "precision": float(prec),
            "recall": float(rec),
            "f1_score": float(f1),
            "confusion_matrix": cm,
            "roc_auc": float(roc_auc),
            "roc_curve": {
                "fpr": fpr.tolist(),
                "tpr": tpr.tolist()
            }
        }
        print(f"{name} - Accuracy: {acc:.4f}, F1 Score: {f1:.4f}")
        
    print(f"\nBest Model selected: {best_name} (Accuracy: {best_accuracy:.4f})")
    
    # Feature Importance (using Random Forest for unified display, or the best model if it has feature_importances_)
    rf_model = models["Random Forest"]
    importances = rf_model.feature_importances_
    feature_importance_list = [
        {"feature": name, "importance": float(importance)}
        for name, importance in zip(feature_names, importances)
    ]
    # Sort by importance descending
    feature_importance_list.sort(key=lambda x: x["importance"], reverse=True)
    
    # Package metrics
    overall_metrics = {
        "best_model_name": best_name,
        "models": metrics_report,
        "feature_importance": feature_importance_list
    }
    
    # Ensure save directory exists
    save_dir = BACKEND_DIR / "ml" / "model_store"
    save_dir.mkdir(parents=True, exist_ok=True)
    
    # Save best model
    model_path = save_dir / "best_model.pkl"
    with open(model_path, "wb") as f:
        pickle.dump(best_model, f)
        
    # Save scaler
    scaler_path = save_dir / "scaler.pkl"
    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)
        
    # Save metrics JSON
    metrics_path = save_dir / "metrics.json"
    with open(metrics_path, "w") as f:
        json.dump(overall_metrics, f, indent=4)
        
    print(f"Best model saved to: {model_path}")
    print(f"Scaler saved to: {scaler_path}")
    print(f"Metrics report saved to: {metrics_path}")

if __name__ == "__main__":
    train_models()
