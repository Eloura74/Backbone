from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MemoryTraceBase(BaseModel):
    context: str
    decision: str
    state: Optional[str] = None
    responsible: Optional[str] = None

class MemoryTraceCreate(MemoryTraceBase):
    pass

class MemoryTrace(MemoryTraceBase):
    id: int
    date: datetime

    class Config:
        from_attributes = True
