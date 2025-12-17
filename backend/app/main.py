from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api import inbox, memory, dashboard
from app.models import inbox as inbox_model, memory as memory_model

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BACKBONE",
    description="Système nerveux administratif intelligent",
    version="0.1.0"
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(inbox.router, prefix="/inbox", tags=["inbox"])
app.include_router(memory.router, prefix="/memory", tags=["memory"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
from app.api import settings, cortex
app.include_router(settings.router, prefix="/settings", tags=["settings"])
app.include_router(cortex.router, prefix="/cortex", tags=["cortex"])

@app.get("/")
def read_root():
    return {"message": "BACKBONE is online"}
