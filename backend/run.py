import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = PROJECT_ROOT / "backend"

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


def check_and_setup():
    print("====================================================")
    print("        AquaFlow AI - Startup & Diagnostics         ")
    print("====================================================")
    
    # 1. Ensure data directory and training data exists
    train_path = BACKEND_DIR / "data" / "water_potability_train.csv"
    if not train_path.exists():
        print("[*] Training dataset not found. Generating realistic 3,000-row synthetic dataset...")
        try:
            # We import it inline so we run it inside the same Python process
            from backend.scripts.generate_data import main as generate_data_main
            generate_data_main()
            print("[+] Dataset generated successfully.")
        except Exception as e:
            print(f"[-] Failed to auto-generate dataset: {e}")
            sys.exit(1)
    else:
        print("[+] Training dataset found.")

    # 2. Ensure trained ML model exists
    model_path = BACKEND_DIR / "ml" / "model_store" / "best_model.pkl"
    if not model_path.exists():
        print("[*] Machine Learning models are not trained. Starting training pipeline...")
        try:
            from backend.app.ml.train import train_models
            train_models()
            print("[+] Machine Learning models trained and best model saved successfully.")
        except Exception as e:
            print(f"[-] Failed to train ML models: {e}")
            sys.exit(1)
    else:
        print("[+] Pre-trained Machine Learning model pipeline found.")

    # 3. Start FastAPI server using Uvicorn
    print("[*] Starting Uvicorn API server on http://localhost:8000 ...")
    try:
        import uvicorn
        uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
    except Exception as e:
        print(f"[-] Failed to start API server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    check_and_setup()
