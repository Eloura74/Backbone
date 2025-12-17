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

@router.put("/{trace_id}", response_model=MemoryTraceSchema)
def update_memory_trace(trace_id: int, trace: MemoryTraceCreate, db: Session = Depends(get_db)):
    db_trace = db.query(MemoryTrace).filter(MemoryTrace.id == trace_id).first()
    if not db_trace:
        raise HTTPException(status_code=404, detail="Memory trace not found")
    
    update_data = trace.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_trace, key, value)
    
    db.commit()
    db.refresh(db_trace)
    return db_trace

@router.delete("/{trace_id}")
def delete_memory_trace(trace_id: int, db: Session = Depends(get_db)):
    db_trace = db.query(MemoryTrace).filter(MemoryTrace.id == trace_id).first()
    if not db_trace:
        raise HTTPException(status_code=404, detail="Memory trace not found")
    
    db.delete(db_trace)
    db.commit()
    return {"ok": True}
