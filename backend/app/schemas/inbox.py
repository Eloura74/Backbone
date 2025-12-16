from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.inbox import InboxSource, InboxType, InboxStatus

class InboxItemBase(BaseModel):
    source: InboxSource
    type: InboxType
    content: str
    status: InboxStatus = InboxStatus.PENDING

class InboxItemCreate(InboxItemBase):
    pass

class InboxItemUpdate(BaseModel):
    source: Optional[InboxSource] = None
    type: Optional[InboxType] = None
    content: Optional[str] = None
    status: Optional[InboxStatus] = None

class InboxItem(InboxItemBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProcessRequest(BaseModel):
    decision: str
    context: str
    responsible: Optional[str] = None
