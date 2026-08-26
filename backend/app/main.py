from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import HTMLResponse
import os
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend.app.database import engine, Base, get_db
from backend.app.config import settings
from backend.app.routers import auth, predictions, monitoring, admin
from backend.app import schemas, crud

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="FastAPI Backend for predicting water quality potability and analyzing metrics.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware setup
# Allows React Vite local dev server to make API requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production-ready versatility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(predictions.router, prefix=settings.API_V1_STR)
app.include_router(monitoring.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/", response_class=HTMLResponse)
def read_root():
    static_file = os.path.join(os.path.dirname(__file__), "static", "index.html")
    if os.path.exists(static_file):
        with open(static_file, "r", encoding="utf-8") as f:
            return f.read()
    return f"""
    <html>
        <head><title>{settings.PROJECT_NAME} - Fallback</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>{settings.PROJECT_NAME}</h1>
            <p>API Server is online. Static frontend index.html was not found in 'static' folder.</p>
            <p>Go to <a href="/docs">API Swagger Docs</a></p>
        </body>
    </html>
    """

# Interactive AI Chatbot Assistant for Water Analysis
@app.post("/api/v1/chat", response_model=schemas.ChatResponse, tags=["AI Chatbot"])
def chat_assistant(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    """
    Keywords-based Natural Language Processing engine providing tailored scientific responses
    about water potability parameters and purification recommendations.
    """
    msg = request.message.lower().strip()
    
    # Matching keywords
    if "ph" in msg:
        reply = (
            "**pH (Potential of Hydrogen)** measures the acidity or alkalinity of water. "
            "The WHO recommended safe drinking water pH is between **6.5 and 8.5**.\n\n"
            "*   **Low pH (< 6.5)**: Acidic water. It can leach toxic metals from pipes, tastes metallic, and may corrode plumbing.\n"
            "*   **High pH (> 8.5)**: Alkaline water. It causes scaling in pipes, feels slippery, and can reduce disinfection efficacy.\n"
            "*   **purification**: Acidic water is corrected using a Calcite neutralizing filter, while alkaline water is balanced using a carbon dioxide injector."
        )
    elif "turbidity" in msg or "cloudy" in msg or "clear" in msg:
        reply = (
            "**Turbidity** is a measure of water cloudiness caused by suspended particles (clay, silt, organic matter). "
            "WHO suggests a limit of **< 5.0 NTU** (preferably < 1.0 NTU for effective disinfection).\n\n"
            "*   **Why it matters**: Pathogens can attach to turbidity particles, hiding from UV or chlorine treatment.\n"
            "*   **purification**: Multi-media sand filters, coagulation-flocculation, sedimentation, and micron membrane filters are highly effective."
        )
    elif "solids" in msg or "tds" in msg:
        reply = (
            "**Total Dissolved Solids (TDS)** represents the total concentration of inorganic salts and organic matter in water.\n\n"
            "*   **Limits**: Safe drinking water should preferably have TDS **< 500 mg/L** (WHO maximum limit is 1,000 mg/L).\n"
            "*   **Why it matters**: High TDS gives water a salty, mineral, or bitter taste and leaves scale deposits on fixtures.\n"
            "*   **purification**: Reverse Osmosis (RO) systems or Distillation units are required to remove dissolved mineral solids."
        )
    elif "chloramine" in msg or "chlorine" in msg:
        reply = (
            "**Chloramines** are disinfectants formed when chlorine is added to ammonia. "
            "The WHO limit for drinking water is **< 4.0 mg/L (ppm)**.\n\n"
            "*   **Why it matters**: While vital for destroying pathogens, excessive chloramines cause chemical odors, skin irritation, and corrosion.\n"
            "*   **purification**: Granular Activated Carbon (GAC) or Catalytic Carbon filters adsorb chloramine molecules efficiently."
        )
    elif "sulfate" in msg:
        reply = (
            "**Sulfates** occur naturally in minerals and soil. WHO recommended safe limit is **< 250 mg/L**.\n\n"
            "*   **Why it matters**: High sulfates give water a bitter, medicinal taste and can cause acute laxative effects (diarrhea), especially for infants.\n"
            "*   **purification**: Reverse Osmosis (RO), Distillation, or Ion-Exchange anion resins can remove sulfates."
        )
    elif "hardness" in msg or "calcium" in msg or "magnesium" in msg:
        reply = (
            "**Hardness** is primarily the concentration of Calcium and Magnesium ions in water. "
            "Water is considered moderately hard at **100-200 mg/L** and very hard above **300 mg/L**.\n\n"
            "*   **Why it matters**: High hardness is not a health risk, but it prevents soap lather, clogs pipeworks, and destroys water heaters.\n"
            "*   **purification**: Ion exchange water softeners (replacing calcium with sodium) or Reverse Osmosis (RO) systems."
        )
    elif "boil" in msg:
        reply = (
            "**Boiling water** is excellent for killing biological pathogens (bacteria, viruses, parasites) and making water microbiologically safe.\n\n"
            "⚠️ **IMPORTANT LIMITATION**: Boiling **does NOT** remove chemical contaminants like heavy metals, sulfates, TDS, nitrates, or microplastics. "
            "In fact, boiling water evaporates a fraction of clean water, which slightly *increases* the concentration of chemical contaminants. "
            "For chemical issues, use Reverse Osmosis (RO) or Activated Carbon filters."
        )
    elif "ro" in msg or "reverse osmosis" in msg:
        reply = (
            "**Reverse Osmosis (RO)** is the gold standard of water filtration. "
            "It forces water through a semi-permeable membrane, rejecting up to 99% of dissolved solids, heavy metals, sulfates, fluoride, and pathogens.\n\n"
            "*   **Pros**: Extremely thorough; removes mineral, organic, and biological hazards.\n"
            "*   **Cons**: Wastes wastewater (brine) and strips out beneficial minerals (re-mineralizers can add them back)."
        )
    elif "carbon" in msg or "charcoal" in msg or "filter" in msg:
        reply = (
            "**Activated Carbon filters** purify water through **adsorption** - chemical contaminants cling to the porous surface of the carbon.\n\n"
            "*   **Removes**: Volatile organic compounds (VOCs), trihalomethanes (THMs), chlorine, chloramines, pesticides, bad odors, and tastes.\n"
            "*   **Does NOT remove**: Dissolved minerals (TDS), sulfates, sodium, or heavy metals. "
            "They are usually combined with RO and UV filters as pre- or post-filters."
        )
    elif "trihalomethane" in msg or "thm" in msg:
        reply = (
            "**Trihalomethanes (THMs)** are chemical byproducts that form when chlorine reacts with natural organic matter in water. "
            "The safe threshold is **< 80 µg/L**.\n\n"
            "*   **Why it matters**: Long-term ingestion of high THMs is linked to liver damage and increased risk of cancer.\n"
            "*   **purification**: Activated carbon filters or aeration/air-stripping systems."
        )
    elif "conductivity" in msg:
        reply = (
            "**Conductivity** measures water's capacity to pass electrical flow, which is directly related to the concentration of dissolved mineral salts (ions).\n\n"
            "*   **Standard**: Safe drinking water conductivity is typically **< 400 µS/cm**.\n"
            "*   **purification**: Since conductivity is a direct indicator of dissolved salts, Reverse Osmosis (RO) or deionization is recommended to lower it."
        )
    else:
        reply = (
            "Hello! I am your **Water Quality AI Chatbot**. I can help you understand water parameters, WHO guidelines, and filtration technologies.\n\n"
            "Try asking me about:\n"
            "*   **pH** (acidic/alkaline effects)\n"
            "*   **Turbidity** (cloudy water solutions)\n"
            "*   **TDS / Solids** (salty mineral water)\n"
            "*   **Chloramines / Chlorine** (disinfectant limits)\n"
            "*   **Boiling** vs **Reverse Osmosis (RO)** filtering\n"
            "*   **Activated Carbon** adsorption"
        )
        
    return schemas.ChatResponse(reply=reply)
