# AquaFlow AI - Water Quality Prediction System

AquaFlow AI is a modern, professional, responsive Water Quality Prediction Web Application built using **FastAPI (Python)**, **Scikit-Learn (ML)**, and **React.js**.

The system allows users to evaluate individual water samples or upload CSV/Excel files containing water quality parameters, predicts potability (safety for drinking), generates AI-driven filtration recommendations, and hosts an interactive statistics dashboard.

---

## 🌟 Key Features

1.  **Ensemble Machine Learning Predictions**: Auto-trains and compares Random Forest, XGBoost, and Gradient Boosting. Integrates the best-performing model for production predictions.
2.  **Self-Healing Setup**: The backend dynamically generates a 3,000-row training dataset (modeled on Kaggle's Water Potability distributions) and trains the ML pipeline automatically on startup if models are missing.
3.  **Water Quality Score (0-100) & Grade (A-F)**: Calculates a continuous Water Quality Score (WQS) based on safe limit deviations.
4.  **AI Purification Assistant**: Analyzes index violations (e.g., pH, Turbidity, Sulfate) and generates custom filtration suggestions (e.g. RO membranes, Activated Carbon, boiling limits).
5.  **Interactive IoT Telemetry Stream**: Simulates real-time sensor fluctuation monitoring on live rolling graphs.
6.  **Interactive AI Chatbot**: Natural Language Processing (NLP) chatbot answering parameter queries and WHO standards.
7.  **Database Integration**: Stores upload histories, logs audit trials, manages reports, and tracks bulk indexes using SQLAlchemy.
8.  **Professional Reports**: Generates print-ready executive reports, supporting Excel exports and client-side PDF downloads.
9.  **Dark Mode & Responsive UI**: Stunning light-blue glassmorphic theme with a native dark mode toggle.

---

## 📂 Project Architecture

```
movie-recomm/ (Workspace root)
├── backend/
│   ├── app/
│   │   ├── ml/
│   │   │   ├── train.py          # Machine learning model training
│   │   │   ├── predict.py        # Potability classification & WQS scores
│   │   │   └── model_store/      # Saved .pkl pipelines & metrics.json
│   │   ├── routers/
│   │   │   ├── auth.py           # User profiles & sign-in
│   │   │   ├── predictions.py    # Bulk uploads, downloads, history
│   │   │   ├── monitoring.py     # Live sensor sensor streams
│   │   │   └── admin.py          # Dashboard statistics & audit logs
│   │   ├── static/
│   │   │   └── index.html        # Unified out-of-the-box UI
│   │   ├── config.py             # Settings & JWT keys
│   │   ├── database.py           # SQLAlchemy SQLite / Postgres connector
│   │   ├── models.py             # DB Tables (Users, UploadedFiles, etc.)
│   │   ├── schemas.py            # Pydantic schemas
│   │   ├── crud.py               # Database query operations
│   │   └── main.py               # FastAPI router mount & Chat Assistant
│   ├── scripts/
│   │   └── generate_data.py      # 3,000-row synthetic generator
│   ├── requirements.txt          # Python dependencies list
│   └── run.py                    # Unified backend & ML entrypoint
├── frontend/                     # Modular React + Vite + Tailwind source
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, Protected routes
│   │   ├── context/              # Auth & Theme controllers
│   │   ├── pages/                # 9+ SPA React views
│   │   ├── services/             # Axios API client integrations
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 🚀 Local Run Instructions

### 1. Backend Server & Live Portal (Out-of-the-box Run)

The backend features a unified entrypoint script `backend/run.py` that automatically configures everything:
*   Checks if the training dataset is present (generates `water_potability_train.csv` if missing).
*   Trains the ensemble models (Random Forest, Gradient Boosting, XGBoost) and exports validation statistics to `metrics.json`.
*   Spins up the FastAPI API server at `http://localhost:8000`.
*   Serves the live interactive frontend directly at `http://localhost:8000/`.

**Steps to run:**
1.  Activate your Python virtual environment (if using one):
    ```powershell
    # On Windows PowerShell
    .\.venv\Scripts\activate
    ```
2.  Install dependencies:
    ```bash
    pip install -r backend/requirements.txt
    ```
3.  Run the self-healing server:
    ```bash
    python backend/run.py
    ```
4.  Open **`http://localhost:8000/`** in your browser to view the fully functional live system!

---

## 🛠️ Machine Learning Module Details

The model training pipeline evaluates three algorithms:
1.  **Random Forest Classifier**: Robust ensemble bagging, provides feature importances.
2.  **Gradient Boosting Classifier**: Boosted decision trees, focuses on reducing residuals.
3.  **XGBoost Classifier**: Advanced gradient boosting framework for maximum accuracy.

The training script outputs `metrics.json` containing:
*   Model Accuracies, Precision, Recall, and F1-Scores.
*   Confusion Matrix arrays (`[[TN, FP], [FN, TP]]`).
*   ROC Curve points (False Positive Rate vs. True Positive Rate) and AUC values.
*   Feature Importance rankings.

---

## 🚀 Deployment Instructions

### 1. Production Database (PostgreSQL)
Set the `DATABASE_URL` environment variable:
```bash
DATABASE_URL=postgresql://user:password@host:port/dbname
```
FastAPI will automatically bind to PostgreSQL instead of SQLite on startup.

### 2. Backend Deployment (Render or Railway)
1.  Connect your repository.
2.  Set the start command to:
    ```bash
    python backend/run.py
    ```
3.  Define environment variables:
    *   `DATABASE_URL` (your live PostgreSQL string)
    *   `SECRET_KEY` (secure JWT generation salt)

### 3. Frontend Deployment (Vercel)
If you deploy the modular React app separately:
1.  Update `API_BASE_URL` in `frontend/src/services/api.js` to point to your live backend endpoint.
2.  Set the Vercel Build Command to: `npm run build` and Output Directory to `dist`.
