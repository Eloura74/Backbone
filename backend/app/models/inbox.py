from sqlalchemy import Column, Integer, String, DateTime, Enum, Text
from sqlalchemy.sql import func
import enum
from app.core.database import Base

class InboxSource(str, enum.Enum):
    EMAIL = "email"
    CALL = "call"
    INTERNAL = "internal"
    NOTE = "note"

class InboxType(str, enum.Enum):
    RH = "rh"
    LOGEMENT = "logement"
    FACTURATION = "facturation"
    DIRECTION = "direction"
    URGENCE = "urgence"
    INFO = "info"

class InboxStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSED = "processed"
    ARCHIVED = "archived"

class InboxItem(Base):
    __tablename__ = "inbox_items"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, default=InboxSource.NOTE) # Stocké comme string pour simplicité avec SQLite
    type = Column(String, default=InboxType.INFO)
    content = Column(Text, nullable=False)
    status = Column(String, default=InboxStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
