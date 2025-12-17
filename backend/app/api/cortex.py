from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.llm import summarize_text, suggest_reply, analyze_sentiment

router = APIRouter()

class AnalyzeRequest(BaseModel):
    text: str

class SuggestRequest(BaseModel):
    context: str

@router.post("/summarize")
def api_summarize(request: AnalyzeRequest):
    try:
        summary = summarize_text(request.text)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggest")
def api_suggest(request: SuggestRequest):
    try:
        suggestion = suggest_reply(request.context)
        return {"suggestion": suggestion}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sentiment")
def api_sentiment(request: AnalyzeRequest):
    try:
        sentiment = analyze_sentiment(request.text)
        return {"sentiment": sentiment}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
