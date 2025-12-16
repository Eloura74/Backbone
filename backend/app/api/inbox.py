from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.inbox import InboxItem, InboxStatus
from app.models.memory import MemoryTrace
from app.schemas.inbox import InboxItemCreate, InboxItemUpdate, InboxItem as InboxItemSchema, ProcessRequest

router = APIRouter()

@router.post("/", response_model=InboxItemSchema)
def create_inbox_item(item: InboxItemCreate, db: Session = Depends(get_db)):
    db_item = InboxItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/", response_model=List[InboxItemSchema])
def read_inbox_items(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[InboxStatus] = None,
    db: Session = Depends(get_db)
):
    query = db.query(InboxItem)
    if status:
        query = query.filter(InboxItem.status == status)
    return query.offset(skip).limit(limit).all()

@router.get("/{item_id}", response_model=InboxItemSchema)
def read_inbox_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(InboxItem).filter(InboxItem.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Inbox item not found")
    return db_item

@router.put("/{item_id}", response_model=InboxItemSchema)
def update_inbox_item(item_id: int, item: InboxItemUpdate, db: Session = Depends(get_db)):
    db_item = db.query(InboxItem).filter(InboxItem.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Inbox item not found")
    
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

    db.delete(db_item)
    db.commit()
    return {"ok": True}

from app.services.generator import generate_document
from pydantic import BaseModel

class GenerateRequest(BaseModel):
    template_type: str

@router.post("/{item_id}/generate")
def generate_inbox_document(
    item_id: int, 
    request: GenerateRequest, 
    db: Session = Depends(get_db)
):
    item = db.query(InboxItem).filter(InboxItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Use item content as context
    document = generate_document(request.template_type, item.content)
    return document

@router.post("/{item_id}/process")
def process_inbox_item(
    item_id: int, 
    request: ProcessRequest,
    db: Session = Depends(get_db)
):
    # 1. Get the inbox item
    db_item = db.query(InboxItem).filter(InboxItem.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Inbox item not found")
    
    # 2. Create a Memory Trace
    memory_trace = MemoryTrace(
        context=f"[{db_item.type}] {db_item.content} | {request.context}",
        decision=request.decision,
        state="processed",
        responsible=request.responsible or "Assistant"
    )
    db.add(memory_trace)
    
    # 3. Archive the Inbox Item
    db_item.status = InboxStatus.ARCHIVED
    
    db.commit()
    return {"ok": True}
