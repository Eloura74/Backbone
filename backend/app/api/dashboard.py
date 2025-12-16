from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.inbox import InboxItem, InboxStatus
from app.models.memory import MemoryTrace

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Inbox Stats
    inbox_total = db.query(InboxItem).count()
    inbox_pending = db.query(InboxItem).filter(InboxItem.status == InboxStatus.PENDING).count()
    inbox_archived = db.query(InboxItem).filter(InboxItem.status == InboxStatus.ARCHIVED).count()
    
    # Memory Stats
    memory_total = db.query(MemoryTrace).count()
    
    # Recent Activity (Last 5 memory traces)
    recent_activity = db.query(MemoryTrace).order_by(MemoryTrace.date.desc()).limit(5).all()
    
    return {
        "inbox": {
            "total": inbox_total,
            "pending": inbox_pending,
            "archived": inbox_archived
        },
        "memory": {
            "total": memory_total
        },
        "recent_activity": recent_activity
    }
