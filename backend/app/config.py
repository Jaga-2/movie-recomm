import os

class Settings:
    PROJECT_NAME: str = "Water Quality Prediction System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkeyforwaterqualitypredictionapplication2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # SQLite fallback
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./water_quality.db")
    
    # ML model paths
    MODEL_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml", "model_store")
    MODEL_PATH: str = os.path.join(MODEL_DIR, "best_model.pkl")
    SCALER_PATH: str = os.path.join(MODEL_DIR, "scaler.pkl")
    METRICS_PATH: str = os.path.join(MODEL_DIR, "metrics.json")
    
    # Upload limits
    ALLOWED_EXTENSIONS = {"csv", "xlsx", "xls"}

settings = Settings()
