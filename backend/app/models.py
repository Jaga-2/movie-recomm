from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="user") # 'user', 'admin'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    uploaded_files = relationship("UploadedFile", back_populates="user", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")
    system_logs = relationship("SystemLog", back_populates="user", cascade="all, delete-orphan")

class UploadedFile(Base):
    __tablename__ = "uploaded_files"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False) # in bytes
    record_count = Column(Integer, default=0)
    safe_count = Column(Integer, default=0)
    unsafe_count = Column(Integer, default=0)
    average_score = Column(Float, default=0.0) # WQS average
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="uploaded_files")
    predictions = relationship("Prediction", back_populates="uploaded_file", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="uploaded_file", cascade="all, delete-orphan")

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    uploaded_file_id = Column(Integer, ForeignKey("uploaded_files.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    
    # Water quality features
    ph = Column(Float, nullable=True) # ph can be null in the original dataset, let's allow it but we will impute
    hardness = Column(Float, nullable=False)
    solids = Column(Float, nullable=False)
    chloramines = Column(Float, nullable=False)
    sulfate = Column(Float, nullable=True)
    conductivity = Column(Float, nullable=False)
    organic_carbon = Column(Float, nullable=False)
    trihalomethanes = Column(Float, nullable=True)
    turbidity = Column(Float, nullable=False)
    
    # Outputs
    prediction = Column(Integer, nullable=False) # 0 = unsafe, 1 = safe
    confidence = Column(Float, nullable=False) # probability (0.0 to 1.0)
    wqs_score = Column(Float, nullable=False) # Water Quality Score (0 to 100)
    wqs_grade = Column(String(5), nullable=False) # A, B, C, D, F
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="predictions")
    uploaded_file = relationship("UploadedFile", back_populates="predictions")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    uploaded_file_id = Column(Integer, ForeignKey("uploaded_files.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    summary = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True) # JSON or text string of recs
    insights = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    uploaded_file = relationship("UploadedFile", back_populates="reports")

class SystemLog(Base):
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    action = Column(String, nullable=False) # 'LOGIN', 'UPLOAD_FILE', 'PREDICT', 'DELETE_HISTORY', etc.
    ip_address = Column(String, nullable=True)
    status = Column(String, default="SUCCESS") # 'SUCCESS', 'FAILED'
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="system_logs")
