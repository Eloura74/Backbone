from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base

class MemoryTrace(Base):
    __tablename__ = "memory_traces"

    id = Column(Integer, primary_key=True, index=True)
    context = Column(String, nullable=False)
    decision = Column(Text, nullable=False)
    state = Column(String, nullable=True)
    responsible = Column(String, nullable=True)
    document_content = Column(Text, nullable=True) # JSON string for generated document
    date = Column(DateTime(timezone=True), server_default=func.now())
