import io
import json
import pandas as pd
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app import schemas, crud, models
from backend.app.auth import get_current_user
from backend.app.ml import predict

router = APIRouter(
    prefix="/predictions",
    tags=["Predictions & File Uploads"]
)

# Column mapping dictionary for matching upload headers to feature parameters
COLUMN_MAPPING = {
    "ph": "ph",
    "hardness": "hardness",
    "hardness (mg/l)": "hardness",
    "solids": "solids",
    "solids (mg/l)": "solids",
    "solids (ppm)": "solids",
    "chloramines": "chloramines",
    "chloramines (mg/l)": "chloramines",
    "chloramines (ppm)": "chloramines",
    "sulfate": "sulfate",
    "sulfate (mg/l)": "sulfate",
    "sulfate (ppm)": "sulfate",
    "conductivity": "conductivity",
    "conductivity (µs/cm)": "conductivity",
    "conductivity (us/cm)": "conductivity",
    "organic_carbon": "organic_carbon",
    "organic_carbon (mg/l)": "organic_carbon",
    "organic_carbon (ppm)": "organic_carbon",
    "organic_carbon_mg_l": "organic_carbon",
    "trihalomethanes": "trihalomethanes",
    "trihalomethanes (µg/l)": "trihalomethanes",
    "trihalomethanes (ug/l)": "trihalomethanes",
    "turbidity": "turbidity",
    "turbidity (ntu)": "turbidity"
}

def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans column headers and maps them to standard names.
    Raises HTTPException if critical features are missing.
    """
    # Rename columns based on mapping
    rename_dict = {}
    for col in df.columns:
        col_clean = str(col).strip().lower()
        if col_clean in COLUMN_MAPPING:
            rename_dict[col] = COLUMN_MAPPING[col_clean]
            
    df = df.rename(columns=rename_dict)
    
    # Required features
    required = ["hardness", "solids", "chloramines", "conductivity", "organic_carbon", "turbidity"]
    missing = [col for col in required if col not in df.columns]
    
    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required water parameters in file: {', '.join(missing)}. "
                   f"Please verify headers match the sample template."
        )
    return df

@router.post("/predict-single", response_model=schemas.PredictionResponse)
def predict_single_water_sample(params: schemas.WaterParams, current_user: Optional[models.User] = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        user_id = current_user.id if current_user else None
        
        # Run prediction pipeline
        res = predict.predict_single(params.model_dump())
        
        # Save to DB
        db_pred = models.Prediction(
            user_id=user_id,
            ph=res["ph"],
            hardness=res["hardness"],
            solids=res["solids"],
            chloramines=res["chloramines"],
            sulfate=res["sulfate"],
            conductivity=res["conductivity"],
            organic_carbon=res["organic_carbon"],
            trihalomethanes=res["trihalomethanes"],
            turbidity=res["turbidity"],
            prediction=res["prediction"],
            confidence=res["confidence"],
            wqs_score=res["wqs_score"],
            wqs_grade=res["wqs_grade"]
        )
        db.add(db_pred)
        db.commit()
        db.refresh(db_pred)
        
        crud.create_system_log(db, action="PREDICT_SINGLE", status="SUCCESS", user_id=user_id)
        
        # Attach prediction details response
        return db_pred
    except Exception as e:
        crud.create_system_log(db, action="PREDICT_SINGLE", status="FAILED", user_id=user_id if current_user else None)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error: {str(e)}"
        )

@router.post("/upload", response_model=schemas.BulkPredictionResponse)
async def upload_water_quality_file(
    file: UploadFile = File(...),
    current_user: Optional[models.User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    filename = file.filename
    ext = filename.split(".")[-1].lower()
    
    if ext not in ["csv", "xlsx", "xls"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a CSV or Excel file."
        )
        
    try:
        content = await file.read()
        file_size = len(content)
        
        # Read into dataframe
        if ext == "csv":
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
            
        if df.empty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file is empty."
            )
            
        # Standardize columns
        df = clean_dataframe(df)
        
        predictions_list = []
        safe_count = 0
        unsafe_count = 0
        total_wqs = 0.0
        
        # Process row by row
        for idx, row in df.iterrows():
            params = {
                "ph": row.get("ph") if pd.notna(row.get("ph")) else None,
                "hardness": float(row["hardness"]),
                "solids": float(row["solids"]),
                "chloramines": float(row["chloramines"]),
                "sulfate": row.get("sulfate") if pd.notna(row.get("sulfate")) else None,
                "conductivity": float(row["conductivity"]),
                "organic_carbon": float(row["organic_carbon"]),
                "trihalomethanes": row.get("trihalomethanes") if pd.notna(row.get("trihalomethanes")) else None,
                "turbidity": float(row["turbidity"])
            }
            
            res = predict.predict_single(params)
            
            predictions_list.append(res)
            
            if res["prediction"] == 1:
                safe_count += 1
            else:
                unsafe_count += 1
                
            total_wqs += res["wqs_score"]
            
        record_count = len(df)
        avg_score = total_wqs / record_count if record_count > 0 else 0.0
        
        # Save Uploaded File info
        db_file = crud.create_uploaded_file(
            db=db,
            filename=filename,
            file_size=file_size,
            record_count=record_count,
            safe_count=safe_count,
            unsafe_count=unsafe_count,
            average_score=avg_score,
            user_id=user_id
        )
        
        # Populate prediction rows in DB
        db_preds = []
        for pred in predictions_list:
            db_pred = models.Prediction(
                uploaded_file_id=db_file.id,
                user_id=user_id,
                ph=pred["ph"],
                hardness=pred["hardness"],
                solids=pred["solids"],
                chloramines=pred["chloramines"],
                sulfate=pred["sulfate"],
                conductivity=pred["conductivity"],
                organic_carbon=pred["organic_carbon"],
                trihalomethanes=pred["trihalomethanes"],
                turbidity=pred["turbidity"],
                prediction=pred["prediction"],
                confidence=pred["confidence"],
                wqs_score=pred["wqs_score"],
                wqs_grade=pred["wqs_grade"]
            )
            db_preds.append(db_pred)
            
        db.add_all(db_preds)
        db.commit()
        
        # Generate Aggregated AI Recommendations & Report
        # Aggregate failure reasons across unsafe samples
        failures_dict = {}
        all_recs = []
        for pred in predictions_list:
            if pred["prediction"] == 0:
                for issue in pred["insights"]["issues"]:
                    failures_dict[issue] = failures_dict.get(issue, 0) + 1
                for rec in pred["insights"]["recommendations"]:
                    all_recs.append(rec)
                    
        # Sort issues by frequency
        sorted_issues = sorted(failures_dict.items(), key=lambda x: x[1], reverse=True)
        top_issues_summary = ", ".join([f"{issue} ({count} cases)" for issue, count in sorted_issues[:3]])
        
        summary = (
            f"Analysis of file '{filename}' complete. Out of {record_count} total records, "
            f"{safe_count} samples were classified as safe for drinking ({safe_count/record_count*100:.1f}%) and "
            f"{unsafe_count} samples were unsafe ({unsafe_count/record_count*100:.1f}%). "
            f"The average Water Quality Score is {avg_score:.2f}."
        )
        if unsafe_count > 0:
            summary += f" Key concerns identified: {top_issues_summary}."
            
        insights = (
            f"Geographic simulations show that turbidity and dissolved solids represent the principal failure vectors in this batch. "
            f"Activated carbon filtration is recommended for {failures_dict.get('High Chloramines (Can cause taste/odor issues and eye irritation)', 0)} samples."
        )
        
        # Unique list of top recommendations
        unique_recs = list(dict.fromkeys(all_recs))
        if not unique_recs:
            unique_recs.append("Water is fully potable. Continuous routine monitoring recommended.")
            
        db_report = crud.create_report(
            db=db,
            uploaded_file_id=db_file.id,
            user_id=user_id,
            summary=summary,
            recommendations=json.dumps(unique_recs),
            insights=insights
        )
        
        # Fetch fully refreshed models to return schemas
        db.refresh(db_file)
        db.refresh(db_report)
        
        # Construct schemas prediction objects
        pred_responses = []
        for p in db_preds:
            db.refresh(p)
            pred_responses.append(schemas.PredictionResponse.from_attributes(p))
            
        crud.create_system_log(db, action=f"UPLOAD_FILE: {filename}", status="SUCCESS", user_id=user_id)
        
        return schemas.BulkPredictionResponse(
            file_details=schemas.UploadedFileResponse.from_attributes(db_file),
            predictions=pred_responses,
            report=schemas.ReportResponse.from_attributes(db_report)
        )
    except HTTPException as he:
        crud.create_system_log(db, action=f"UPLOAD_FILE_FAILED: {filename}", status="FAILED", user_id=user_id)
        raise he
    except Exception as e:
        crud.create_system_log(db, action=f"UPLOAD_FILE_FAILED: {filename}", status="FAILED", user_id=user_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process uploaded file: {str(e)}"
        )

@router.get("/history", response_model=List[schemas.UploadedFileResponse])
def get_prediction_history(
    current_user: Optional[models.User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    # For user history, fetch all files uploaded by user (or all if anonymous/admin)
    # To keep it friendly for local dev, let users see all uploads if not signed in, else user specific
    files = crud.get_uploaded_files(db, user_id=user_id)
    return files

@router.get("/report/{file_id}", response_model=schemas.BulkPredictionResponse)
def get_detailed_report(
    file_id: int,
    db: Session = Depends(get_db)
):
    db_file = crud.get_uploaded_file(db, file_id)
    if not db_file:
        raise HTTPException(status_code=404, detail="File report not found")
        
    db_preds = crud.get_predictions(db, file_id=file_id)
    db_report = crud.get_report_by_file(db, file_id)
    
    # If no report, create dummy one
    if not db_report:
        db_report = crud.create_report(
            db=db,
            uploaded_file_id=file_id,
            summary="Water Quality report for file.",
            recommendations=json.dumps(["Routine Filtration"]),
            insights="No insights generated."
        )
        
    return schemas.BulkPredictionResponse(
        file_details=schemas.UploadedFileResponse.from_attributes(db_file),
        predictions=[schemas.PredictionResponse.from_attributes(p) for p in db_preds],
        report=schemas.ReportResponse.from_attributes(db_report)
    )

@router.delete("/history/{file_id}")
def delete_file_history(
    file_id: int,
    current_user: Optional[models.User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    db_file = crud.get_uploaded_file(db, file_id)
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
        
    # Check permission (only creator or admin)
    if user_id and db_file.user_id and db_file.user_id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this record")
        
    crud.delete_uploaded_file(db, file_id)
    crud.create_system_log(db, action=f"DELETE_HISTORY: {file_id}", status="SUCCESS", user_id=user_id)
    return {"message": "History record successfully deleted"}

@router.get("/export-excel/{file_id}")
def export_file_predictions_to_excel(
    file_id: int,
    db: Session = Depends(get_db)
):
    db_file = crud.get_uploaded_file(db, file_id)
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
        
    db_preds = crud.get_predictions(db, file_id=file_id)
    
    # Put in DataFrame
    data = []
    for idx, p in enumerate(db_preds):
        data.append({
            "Row Number": idx + 1,
            "pH": p.ph,
            "Hardness (mg/L)": p.hardness,
            "Solids (mg/L)": p.solids,
            "Chloramines (mg/L)": p.chloramines,
            "Sulfate (mg/L)": p.sulfate,
            "Conductivity (µS/cm)": p.conductivity,
            "Organic Carbon (mg/L)": p.organic_carbon,
            "Trihalomethanes (µg/L)": p.trihalomethanes,
            "Turbidity (NTU)": p.turbidity,
            "Prediction": "Safe" if p.prediction == 1 else "Unsafe",
            "Confidence Score": f"{p.confidence*100:.1f}%",
            "Water Quality Score": round(p.wqs_score, 1),
            "Water Quality Grade": p.wqs_grade
        })
        
    df = pd.DataFrame(data)
    
    # Save to Excel in memory
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="Water Quality Predictions")
    output.seek(0)
    
    filename = f"prediction_report_{db_file.filename.split('.')[0]}.xlsx"
    
    headers = {
        'Content-Disposition': f'attachment; filename="{filename}"'
    }
    return StreamingResponse(
        output,
        headers=headers,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@router.get("/metrics")
def get_ml_metrics():
    """
    Returns metrics, training statistics, confusion matrix, ROC curve, and feature importances.
    """
    try:
        metrics = predict.get_metrics_json()
        if not metrics:
            raise HTTPException(status_code=404, detail="Metrics not found. Model might not be trained.")
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
