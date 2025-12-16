from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.memory import MemoryTrace
from app.schemas.memory import MemoryTraceCreate, MemoryTrace as MemoryTraceSchema

router = APIRouter()

@router.post("/", response_model=MemoryTraceSchema)
def create_memory_trace(trace: MemoryTraceCreate, db: Session = Depends(get_db)):
    db_trace = MemoryTrace(**trace.model_dump())
    db.add(db_trace)
    db.commit()
    db.refresh(db_trace)
    return db_trace

@router.get("/", response_model=List[MemoryTraceSchema])
def read_memory_traces(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(MemoryTrace).order_by(MemoryTrace.date.desc()).offset(skip).limit(limit).all()
