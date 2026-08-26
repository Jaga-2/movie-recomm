from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app import schemas, crud, auth
from backend.app.auth import get_current_user
from datetime import timedelta
from backend.app.config import settings

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    # Check if this is the first user, if so make them admin
    users = crud.get_users(db, limit=2)
    role = "admin" if len(users) == 0 else "user"
    
    new_user = crud.create_user(db, user=user, role=role)
    crud.create_system_log(db, action=f"REGISTER_USER: {new_user.email}", status="SUCCESS", user_id=new_user.id)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user_credentials.email)
    if not db_user or not auth.verify_password(user_credentials.password, db_user.hashed_password):
        crud.create_system_log(db, action=f"LOGIN_FAILED: {user_credentials.email}", status="FAILED")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": db_user.email, "role": db_user.role},
        expires_delta=access_token_expires
    )
    crud.create_system_log(db, action="LOGIN", status="SUCCESS", user_id=db_user.id)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/profile", response_model=schemas.UserResponse)
def get_profile(current_user: schemas.UserResponse = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=schemas.UserResponse)
def update_profile(updated_data: schemas.UserBase, current_user: schemas.UserResponse = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.full_name = updated_data.full_name
    db.commit()
    db.refresh(current_user)
    crud.create_system_log(db, action="UPDATE_PROFILE", status="SUCCESS", user_id=current_user.id)
    return current_user
