import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .config import STATIC_DIR, BASE_DIR
from .seed_data import init_seed_data
from .database import engine, Base
from .routes import change_request, impact, drafts_rules, redline, approval, audit

# Ensure DB and static directories exist
os.makedirs(STATIC_DIR / "labels", exist_ok=True)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LabelGuard AI API",
    description="Tata Elxsi Teliport S4 - End-to-End Medical Device Labeling Automation",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files for Label Images & Redline overlays
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Mount Routers
app.include_router(change_request.router)
app.include_router(impact.router)
app.include_router(drafts_rules.router)
app.include_router(redline.router)
app.include_router(approval.router)
app.include_router(audit.router)

# Mount Built Frontend if available
FRONTEND_DIST = BASE_DIR.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/")
    def serve_frontend_index():
        return FileResponse(FRONTEND_DIST / "index.html")

    @app.get("/{catchall:path}")
    def serve_spa(catchall: str):
        file_path = FRONTEND_DIST / catchall
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "app": "LabelGuard AI",
            "tagline": "AI drafts, rules verify, people approve. AI never edits an approved label.",
            "status": "online",
            "documentation": "/docs"
        }

@app.on_event("startup")
def on_startup():
    from .database import SessionLocal
    from .models import ProductMaster
    db = SessionLocal()
    has_product = db.query(ProductMaster).first()
    db.close()
    if not has_product:
        init_seed_data()
