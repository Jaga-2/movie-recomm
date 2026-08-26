from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from backend.app import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Password utility
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# User Operations
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate, role: str = "user"):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# File Upload Operations
def create_uploaded_file(db: Session, filename: str, file_size: int, record_count: int, safe_count: int, unsafe_count: int, average_score: float, user_id: Optional[int] = None):
    db_file = models.UploadedFile(
        filename=filename,
        file_size=file_size,
        record_count=record_count,
        safe_count=safe_count,
        unsafe_count=unsafe_count,
        average_score=average_score,
        user_id=user_id
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file

def get_uploaded_files(db: Session, user_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.UploadedFile)
    if user_id:
        query = query.filter(models.UploadedFile.user_id == user_id)
    return query.order_by(models.UploadedFile.created_at.desc()).offset(skip).limit(limit).all()

def get_uploaded_file(db: Session, file_id: int):
    return db.query(models.UploadedFile).filter(models.UploadedFile.id == file_id).first()

def delete_uploaded_file(db: Session, file_id: int):
    db_file = db.query(models.UploadedFile).filter(models.UploadedFile.id == file_id).first()
    if db_file:
        db.delete(db_file)
        db.commit()
        return True
    return False

# Prediction Operations
def create_predictions(db: Session, predictions_list: List[dict]):
    db_predictions = [models.Prediction(**pred) for pred in predictions_list]
    db.add_all(db_predictions)
    db.commit()
    return db_predictions

def get_predictions(db: Session, file_id: Optional[int] = None, user_id: Optional[int] = None, skip: int = 0, limit: int = 1000):
    query = db.query(models.Prediction)
    if file_id:
        query = query.filter(models.Prediction.uploaded_file_id == file_id)
    elif user_id:
        query = query.filter(models.Prediction.user_id == user_id)
    return query.offset(skip).limit(limit).all()

# Report Operations
def create_report(db: Session, uploaded_file_id: int, summary: str, recommendations: str, insights: str, user_id: Optional[int] = None):
    db_report = models.Report(
        uploaded_file_id=uploaded_file_id,
        user_id=user_id,
        summary=summary,
        recommendations=recommendations,
        insights=insights
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def get_report_by_file(db: Session, file_id: int):
    return db.query(models.Report).filter(models.Report.uploaded_file_id == file_id).first()

# System Log Operations
def create_system_log(db: Session, action: str, status: str, user_id: Optional[int] = None, ip_address: Optional[str] = None):
    log = models.SystemLog(
        user_id=user_id,
        action=action,
        status=status,
        ip_address=ip_address
    )
    db.add(log)
    db.commit()
    return log

def get_system_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.SystemLog).order_by(models.SystemLog.timestamp.desc()).offset(skip).limit(limit).all()
