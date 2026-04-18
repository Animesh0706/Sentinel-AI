"""
Sentinel-AI — Authentication API
Phase 9.5: JWT Routes
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.db.mongodb import mongodb
from app.models.user import UserCreate, UserInDB, UserResponse, Token
from app.core.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.core.config import settings
from uuid import uuid4

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=UserResponse)
async def signup(user_in: UserCreate):
    db = mongodb.database
    if await db.users.find_one({"username": user_in.username}):
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    user_id = str(uuid4())
    hashed_password = get_password_hash(user_in.password)
    user_doc = UserInDB(
        _id=user_id,
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password
    )
    
    await db.users.insert_one(user_doc.model_dump(by_alias=True))
    return UserResponse(**user_doc.model_dump(by_alias=True))


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = mongodb.database
    user = await db.users.find_one({"username": form_data.username})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    """Return the current user's profile."""
    return current_user
