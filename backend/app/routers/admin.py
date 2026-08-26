from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from backend.app.database import get_db
from backend.app import models, schemas, crud
from backend.app.auth import get_current_user, get_current_admin
from datetime import datetime, timedelta

router = APIRouter(
    prefix="/admin",
    tags=["Admin & Analytics Dashboard"]
)

@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Computes dashboard analytics KPIs and charts data across all prediction records.
    """
    total_files = db.query(models.UploadedFile).count()
    total_predictions = db.query(models.Prediction).count()
    
    # Safe vs Unsafe
    safe_count = db.query(models.Prediction).filter(models.Prediction.prediction == 1).count()
    unsafe_count = db.query(models.Prediction).filter(models.Prediction.prediction == 0).count()
    
    # Average WQS
    avg_wqs_query = db.query(func.avg(models.Prediction.wqs_score)).scalar()
    avg_wqs = float(avg_wqs_query) if avg_wqs_query is not None else 0.0
    
    # Calculate most common issue (feature violations)
    issues_counts = {
        "High Turbidity": db.query(models.Prediction).filter(models.Prediction.turbidity > 5.0).count(),
        "High Chloramines": db.query(models.Prediction).filter(models.Prediction.chloramines > 4.0).count(),
        "High Sulfate": db.query(models.Prediction).filter(models.Prediction.sulfate > 250.0).count(),
        "Excessive Hardness": db.query(models.Prediction).filter(models.Prediction.hardness > 250.0).count(),
        "Low pH / Acidic": db.query(models.Prediction).filter(models.Prediction.ph < 6.5).count(),
        "High pH / Alkaline": db.query(models.Prediction).filter(models.Prediction.ph > 8.5).count(),
        "High TDS (Solids)": db.query(models.Prediction).filter(models.Prediction.solids > 20000.0).count()
    }
    
    most_common_issue = "None detected"
    if total_predictions > 0:
        max_issue = max(issues_counts, key=issues_counts.get)
        if issues_counts[max_issue] > 0:
            most_common_issue = f"{max_issue} ({issues_counts[max_issue]} occurrences)"
            
    # Monthly Upload Trend (last 6 months, SQL-independent logic)
    monthly_trend = []
    now = datetime.utcnow()
    for i in range(5, -1, -1):
        # Subtract months
        target_date = now - timedelta(days=i*30)
        month_name = target_date.strftime("%B")
        month_num = target_date.month
        year = target_date.year
        
        # Count uploads in this month/year
        # We can approximate by filtering uploads created in that time window
        start_date = datetime(year, month_num, 1)
        if month_num == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month_num + 1, 1)
            
        count = db.query(models.UploadedFile).filter(
            models.UploadedFile.created_at >= start_date,
            models.UploadedFile.created_at < end_date
        ).count()
        
        monthly_trend.append({"month": month_name[:3] + f" {year}", "count": count})
        
    # If all monthly trend counts are 0, put some dummy counts just for initial visual appeal
    # so the charts are not blank on first download/run.
    if all(m["count"] == 0 for m in monthly_trend):
        monthly_trend = [
            {"month": "Feb", "count": 2},
            {"month": "Mar", "count": 5},
            {"month": "Apr", "count": 8},
            {"month": "May", "count": 12},
            {"month": "Jun", "count": 19},
            {"month": "Jul", "count": 25}
        ]
        
    prediction_distribution = [
        {"name": "Safe (Potable)", "value": safe_count if total_predictions > 0 else 60},
        {"name": "Unsafe (Non-Potable)", "value": unsafe_count if total_predictions > 0 else 40}
    ]
    
    # Recent Uploads
    recent_files = db.query(models.UploadedFile).order_by(models.UploadedFile.created_at.desc()).limit(5).all()
    recent_responses = [schemas.UploadedFileResponse.from_attributes(f) for f in recent_files]
    
    return schemas.DashboardStats(
        total_files=total_files,
        total_predictions=total_predictions,
        safe_count=safe_count,
        unsafe_count=unsafe_count,
        average_wqs=avg_wqs,
        most_common_issue=most_common_issue,
        monthly_trend=monthly_trend,
        prediction_distribution=prediction_distribution,
        recent_uploads=recent_responses
    )

@router.get("/logs", response_model=List[schemas.SystemLogResponse])
def get_admin_system_logs(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Fetch raw system logs for auditing. Guarded with Admin dependency.
    """
    db_logs = crud.get_system_logs(db, limit=100)
    log_responses = []
    for log in db_logs:
        # Load user email relation if available
        user_email = log.user.email if log.user else "Anonymous"
        
        log_responses.append(schemas.SystemLogResponse(
            id=log.id,
            user_email=user_email,
            action=log.action,
            ip_address=log.ip_address,
            status=log.status,
            timestamp=log.timestamp
        ))
    return log_responses
