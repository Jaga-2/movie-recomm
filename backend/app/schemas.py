from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Water Parameters (For single-row prediction request)
class WaterParams(BaseModel):
    ph: Optional[float] = Field(None, description="pH level (0-14), null is allowed and will be imputed")
    hardness: float = Field(..., description="Hardness in mg/L")
    solids: float = Field(..., description="Total dissolved solids in mg/L")
    chloramines: float = Field(..., description="Chloramines in mg/L")
    sulfate: Optional[float] = Field(None, description="Sulfate in mg/L, null allowed and will be imputed")
    conductivity: float = Field(..., description="Electrical conductivity in uS/cm")
    organic_carbon: float = Field(..., description="Organic carbon in mg/L")
    trihalomethanes: Optional[float] = Field(None, description="Trihalomethanes in ug/L, null allowed and will be imputed")
    turbidity: float = Field(..., description="Turbidity in NTU")

# Prediction Response
class PredictionResponse(BaseModel):
    id: Optional[int] = None
    ph: Optional[float] = None
    hardness: float
    solids: float
    chloramines: float
    sulfate: Optional[float] = None
    conductivity: float
    organic_carbon: float
    trihalomethanes: Optional[float] = None
    turbidity: float
    prediction: int
    confidence: float
    wqs_score: float
    wqs_grade: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Uploaded File Response
class UploadedFileResponse(BaseModel):
    id: int
    filename: str
    file_size: int
    record_count: int
    safe_count: int
    unsafe_count: int
    average_score: float
    created_at: datetime

    class Config:
        from_attributes = True

# Report Response
class ReportResponse(BaseModel):
    id: int
    uploaded_file_id: int
    summary: str
    recommendations: str # JSON string of list
    insights: str
    created_at: datetime

    class Config:
        from_attributes = True

# Combined Bulk Prediction Response
class BulkPredictionResponse(BaseModel):
    file_details: UploadedFileResponse
    predictions: List[PredictionResponse]
    report: ReportResponse

# Admin System Log
class SystemLogResponse(BaseModel):
    id: int
    user_email: Optional[str] = None
    action: str
    ip_address: Optional[str] = None
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True

# Dashboard Stats Response
class DashboardStats(BaseModel):
    total_files: int
    total_predictions: int
    safe_count: int
    unsafe_count: int
    average_wqs: float
    most_common_issue: str
    monthly_trend: List[dict] # list of {"month": str, "count": int}
    prediction_distribution: List[dict] # list of {"name": str, "value": int}
    recent_uploads: List[UploadedFileResponse]

# Chat Bot Schemas
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
