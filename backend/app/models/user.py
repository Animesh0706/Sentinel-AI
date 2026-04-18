"""
Sentinel-AI — User Pydantic Models
Phase 9.5: JWT Authentication
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    email: Optional[EmailStr] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserInDB(BaseModel):
    id: str = Field(alias="_id")
    username: str
    hashed_password: str
    email: Optional[EmailStr] = None


class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    username: str
    email: Optional[EmailStr] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str | None = None
