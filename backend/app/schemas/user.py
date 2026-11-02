from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None
    role: Optional[UserRole] = UserRole.USER
    default_market: Optional[str] = "IN"  # IN or US

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: Optional[str] = None
    role: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

class UserProfileOut(BaseModel):
    bio: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    default_market: str
    experience_level: str
    risk_tolerance: str

    class Config:
        from_attributes = True

class UserPreferenceOut(BaseModel):
    theme: str
    default_currency: str
    email_notifications: bool
    in_app_notifications: bool
    chart_style: str

    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str]
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    profile: Optional[UserProfileOut] = None
    preferences: Optional[UserPreferenceOut] = None

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    default_market: Optional[str] = None
    experience_level: Optional[str] = None
    risk_tolerance: Optional[str] = None

class PreferenceUpdate(BaseModel):
    theme: Optional[str] = None
    default_currency: Optional[str] = None
    email_notifications: Optional[bool] = None
    in_app_notifications: Optional[bool] = None
    chart_style: Optional[str] = None
