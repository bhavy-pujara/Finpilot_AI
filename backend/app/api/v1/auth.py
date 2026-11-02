from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.api.deps import get_db, get_current_user
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User, UserProfile, UserPreference, UserRole
from app.models.paper_trading import PaperAccount
from app.models.portfolio import Portfolio, RiskProfile
from app.schemas.user import UserRegister, UserLogin, Token, UserOut, ProfileUpdate, PreferenceUpdate
import uuid

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or UserRole.USER,
        is_active=True,
        is_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize Profile & Preferences
    profile = UserProfile(
        user_id=user.id,
        default_market=user_in.default_market or "IN",
        experience_level="intermediate",
        risk_tolerance="moderate"
    )
    pref = UserPreference(
        user_id=user.id,
        theme="dark",
        default_currency="INR" if user_in.default_market == "IN" else "USD"
    )
    db.add(profile)
    db.add(pref)

    # Initialize Paper Account
    currency = "INR" if user_in.default_market == "IN" else "USD"
    initial_bal = 1000000.00 if currency == "INR" else 100000.00
    paper_acc = PaperAccount(
        user_id=user.id,
        account_number=f"SIM-{uuid.uuid4().hex[:8].upper()}",
        currency=currency,
        initial_balance=initial_bal,
        cash_balance=initial_bal,
        realized_pnl=0.0
    )
    db.add(paper_acc)

    # Initialize Portfolio & Risk Profile
    portfolio = Portfolio(
        user_id=user.id,
        name="Primary Trading Portfolio",
        is_primary=1
    )
    risk_prof = RiskProfile(user_id=user.id)
    db.add(portfolio)
    db.add(risk_prof)

    db.commit()

    token = create_access_token(user.id)
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value
    )

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled.")

    token = create_access_token(user.id)
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value
    )

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserOut)
def update_profile(
    profile_in: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name

    profile = current_user.profile
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    if profile_in.bio is not None:
        profile.bio = profile_in.bio
    if profile_in.phone is not None:
        profile.phone = profile_in.phone
    if profile_in.default_market is not None:
        profile.default_market = profile_in.default_market
    if profile_in.experience_level is not None:
        profile.experience_level = profile_in.experience_level
    if profile_in.risk_tolerance is not None:
        profile.risk_tolerance = profile_in.risk_tolerance

    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/preferences", response_model=UserOut)
def update_preferences(
    pref_in: PreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pref = current_user.preferences
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)

    if pref_in.theme is not None:
        pref.theme = pref_in.theme
    if pref_in.default_currency is not None:
        pref.default_currency = pref_in.default_currency
    if pref_in.email_notifications is not None:
        pref.email_notifications = pref_in.email_notifications
    if pref_in.in_app_notifications is not None:
        pref.in_app_notifications = pref_in.in_app_notifications
    if pref_in.chart_style is not None:
        pref.chart_style = pref_in.chart_style

    db.commit()
    db.refresh(current_user)
    return current_user
