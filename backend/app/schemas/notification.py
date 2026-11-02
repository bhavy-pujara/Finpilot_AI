from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    category: str
    is_read: bool
    data_source_label: str
    action_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
