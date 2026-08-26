import random
import time
from fastapi import APIRouter
from backend.app.ml import predict

router = APIRouter(
    prefix="/monitoring",
    tags=["Real-time Monitoring"]
)

# Keep track of simulated baseline parameters
# They will fluctuate slightly on each request to simulate real sensors
BASELINE_SENSORS = {
    "ph": 7.2,
    "hardness": 185.0,
    "solids": 16500.0,
    "chloramines": 5.2,
    "sulfate": 280.0,
    "conductivity": 410.0,
    "organic_carbon": 11.5,
    "trihalomethanes": 65.0,
    "turbidity": 3.2
}

@router.get("/current")
def get_current_sensor_stream():
    """
    Simulates real-time IoT water quality sensor streams, returning slightly fluctuating parameters,
    WQS score, WQS grade, and potability predictions.
    """
    # Introduce small fluctuations
    current_params = {}
    current_params["ph"] = round(BASELINE_SENSORS["ph"] + random.uniform(-0.15, 0.15), 2)
    current_params["hardness"] = round(BASELINE_SENSORS["hardness"] + random.uniform(-4.0, 4.0), 1)
    current_params["solids"] = round(BASELINE_SENSORS["solids"] + random.uniform(-500.0, 500.0), 1)
    current_params["chloramines"] = round(BASELINE_SENSORS["chloramines"] + random.uniform(-0.3, 0.3), 2)
    current_params["sulfate"] = round(BASELINE_SENSORS["sulfate"] + random.uniform(-5.0, 5.0), 1)
    current_params["conductivity"] = round(BASELINE_SENSORS["conductivity"] + random.uniform(-8.0, 8.0), 1)
    current_params["organic_carbon"] = round(BASELINE_SENSORS["organic_carbon"] + random.uniform(-0.4, 0.4), 2)
    current_params["trihalomethanes"] = round(BASELINE_SENSORS["trihalomethanes"] + random.uniform(-2.0, 2.0), 2)
    current_params["turbidity"] = round(BASELINE_SENSORS["turbidity"] + random.uniform(-0.15, 0.15), 2)
    
    # Clip logic
    current_params["ph"] = max(0.0, min(14.0, current_params["ph"]))
    current_params["turbidity"] = max(0.1, current_params["turbidity"])
    
    # Run prediction
    res = predict.predict_single({
        "ph": current_params["ph"],
        "hardness": current_params["hardness"],
        "solids": current_params["solids"],
        "chloramines": current_params["chloramines"],
        "sulfate": current_params["sulfate"],
        "conductivity": current_params["conductivity"],
        "organic_carbon": current_params["organic_carbon"],
        "trihalomethanes": current_params["trihalomethanes"],
        "turbidity": current_params["turbidity"]
    })
    
    return {
        "timestamp": time.time(),
        "parameters": {
            "ph": res["ph"],
            "hardness": res["hardness"],
            "solids": res["solids"],
            "chloramines": res["chloramines"],
            "sulfate": res["sulfate"],
            "conductivity": res["conductivity"],
            "organic_carbon": res["organic_carbon"],
            "trihalomethanes": res["trihalomethanes"],
            "turbidity": res["turbidity"]
        },
        "prediction": res["prediction"],
        "confidence": res["confidence"],
        "wqs_score": res["wqs_score"],
        "wqs_grade": res["wqs_grade"],
        "status": "Safe" if res["prediction"] == 1 else "Unsafe",
        "recommendations": res["insights"]["recommendations"]
    }
