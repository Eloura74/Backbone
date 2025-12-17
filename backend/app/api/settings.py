from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter()

@router.delete("/reset")
def reset_database(db: Session = Depends(get_db)):
    try:
        # Delete all data from tables
        db.execute(text("DELETE FROM inbox_items"))
        db.execute(text("DELETE FROM memory_traces"))
        db.commit()
        return {"message": "Database reset successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
