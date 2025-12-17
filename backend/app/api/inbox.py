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

@router.delete("/{item_id}")
def delete_inbox_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(InboxItem).filter(InboxItem.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Inbox item not found")
    
    db.delete(db_item)
    db.commit()
    return {"ok": True}

from app.services.generator import generate_document
from pydantic import BaseModel

class GenerateRequest(BaseModel):
    template_type: str
    user_input: Optional[str] = None

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
    document = generate_document(request.template_type, item.content, request.user_input)
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
    import json
    doc_content_json = json.dumps(request.generated_doc) if request.generated_doc else None
    
    memory_trace = MemoryTrace(
        context=f"[{db_item.type}] {db_item.content} | {request.context}",
        decision=request.decision,
        state="processed",
        responsible=request.responsible or "Assistant",
        document_content=doc_content_json
    )
    db.add(memory_trace)
    
    # 3. Archive the Inbox Item
    db_item.status = InboxStatus.ARCHIVED
    
    db.commit()
    db.commit()
    return {"ok": True}

from fastapi import UploadFile, File
import shutil
import os
from app.services.parser import extract_text_from_file

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=InboxItemSchema)
def upload_inbox_file(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    # 1. Save file locally
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 2. Extract Text
    extracted_text = extract_text_from_file(file_path, file.filename)
    
    # 3. Auto-Categorize (Simple Logic for now)
    detected_type = "info"
    lower_text = extracted_text.lower()
    if "facture" in lower_text or "invoice" in lower_text or "montant" in lower_text:
        detected_type = "facturation"
    elif "contrat" in lower_text or "avenant" in lower_text:
        detected_type = "rh"
    elif "bail" in lower_text or "loyer" in lower_text:
        detected_type = "logement"
    
    # 4. Create Inbox Item
    db_item = InboxItem(
        content=f"📄 {file.filename}\n\n{extracted_text[:500]}...", # Preview
        source="document",
        type=detected_type
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    return db_item

from app.services.email_service import EmailService
from pydantic import BaseModel

class EmailSyncRequest(BaseModel):
    host: Optional[str] = None
    user: Optional[str] = None
    password: Optional[str] = None

@router.post("/sync/email")
def sync_emails(
    request: EmailSyncRequest,
    db: Session = Depends(get_db)
):
    """Fetch emails and add them to Inbox"""
    service = EmailService(
        host=request.host,
        user=request.user,
        password=request.password
    )
    
    emails = service.fetch_unseen_emails()
    new_items = []
    
    for email_data in emails:
        # Create Inbox Item
        # We store HTML body in content if available, but we might want a cleaner way.
        # For now, let's append HTML content as a special delimiter or just use plain text for preview
        # and store full HTML in a separate field if we had one.
        # Since we don't have an 'html_content' column yet, we will store it in the content 
        # but maybe prefixed or we rely on the frontend to detect HTML.
        # BETTER APPROACH: Use the 'metadata' field if we had one, but we don't.
        # Let's stick to storing plain text in 'content' for searchability/preview,
        # and maybe append a JSON block for attachments/HTML?
        # Actually, let's just store the plain text for now as the main content, 
        # and if we want to show HTML, we might need a schema update.
        # BUT, the user wants HTML rendering.
        # Let's try to store a JSON object in 'content' if it's an email? No, that breaks other things.
        # Let's assume we can store the HTML in the content, but we need to be careful.
        # If we store HTML, the preview in the list might look bad.
        # Compromise: Store plain text in 'content' for the list view.
        # Wait, the frontend uses 'content' for everything.
        # Let's append a special separator for the HTML part?
        # Or simpler: Just store the body (plain) and if HTML exists, we might lose it without a schema change.
        # I will check the models/inbox.py to see if I can add a column easily or if I should hack it.
        
        # Checking models... I can't see models/inbox.py right now but I assume it's standard.
        # Let's just store the HTML in the content if available, otherwise plain text.
        # The frontend will need to decide how to render it.
        # If we store HTML, we need to strip tags for the preview in the list.
        
        final_content = email_data.get('html_body') or email_data.get('body') or ""
        
        # Attachments
        attachment_links = []
        if email_data.get('attachments'):
            for att in email_data['attachments']:
                # We can create a link to the file
                # Assuming we serve 'uploads' statically or have an endpoint
                # We don't have a static mount yet in main.py? Need to check.
                # For now, let's just list them.
                attachment_links.append(f"[ATTACHMENT: {att['filename']} ({att['path']})]")
        
        if attachment_links:
            final_content += "\n\n" + "\n".join(attachment_links)

        # Create Inbox Item
        # We prefer plain text for the main content to keep it clean, 
        # but we want to view HTML. 
        # Let's store: "PLAIN TEXT \n\n ---HTML---\n HTML_CONTENT"
        # This is a bit hacky but works without schema migration.
        
        plain_body = email_data.get('body') or ""
        html_body = email_data.get('html_body') or ""
        
        # Restore Header for List View and Context
        header_info = f"📧 {email_data['subject']}\nDe: {email_data['sender']}\n\n"
        
        combined_content = header_info + plain_body
        
        if html_body:
             combined_content += f"\n\n<HTML_CONTENT>\n{html_body}\n</HTML_CONTENT>"
        
        if attachment_links:
            combined_content += "\n\n<ATTACHMENTS>\n" + "\n".join([f"{att['filename']}|{att['path']}" for att in email_data['attachments']]) + "\n</ATTACHMENTS>"

        # Simple Auto-Categorize
        detected_type = "info"
        lower_sub = email_data['subject'].lower()
        if "facture" in lower_sub or "invoice" in lower_sub:
            detected_type = "facturation"
        elif "rdv" in lower_sub or "meeting" in lower_sub:
            detected_type = "rh"
            
        db_item = InboxItem(
            content=combined_content, # Storing full rich content here
            source="email",
            type=detected_type
        )
        db.add(db_item)
        new_items.append(db_item)
    
    db.commit()
    return {"synced_count": len(new_items)}

class SendEmailRequest(BaseModel):
    to: str
    subject: str
    body: str
    host: Optional[str] = None
    user: Optional[str] = None
    password: Optional[str] = None

@router.post("/send/email")
def send_email_endpoint(
    request: SendEmailRequest
):
    """Send an email"""
    service = EmailService(
        host=request.host,
        user=request.user,
        password=request.password
    )
    
    try:
        service.send_email(request.to, request.subject, request.body)
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.services.calendar_service import CalendarService
from fastapi.responses import Response

@router.get("/{item_id}/calendar")
def generate_calendar_event(
    item_id: int,
    db: Session = Depends(get_db)
):
    """Generate an ICS file for the item"""
    item = db.query(InboxItem).filter(InboxItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    service = CalendarService()
    
    # Extract a summary from content (first line)
    summary = item.content.split('\n')[0][:50]
    if "📧" in summary:
        summary = summary.replace("📧", "").strip()
    
    # Clean description
    description = item.content
    
    ics_content = service.generate_ics(
        summary=f"[Backbone] {summary}",
        description=description
    )
    
    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={"Content-Disposition": f"attachment; filename=event_{item_id}.ics"}
    )
