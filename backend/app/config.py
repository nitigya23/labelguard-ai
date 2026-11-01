import os
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
RULES_DIR = BASE_DIR / "rules"

# In Vercel serverless functions, only /tmp is writable
IS_VERCEL = os.getenv("VERCEL") == "1" or "VERCEL" in os.environ or os.getenv("NOW_REGION") is not None

if IS_VERCEL:
    WRITABLE_DIR = Path("/tmp/labelguard")
    STATIC_DIR = WRITABLE_DIR / "static"
    LABELS_DIR = STATIC_DIR / "labels"
    DATABASE_URL = f"sqlite:///{WRITABLE_DIR / 'labelguard.db'}"
    
    # Initialize /tmp directories and copy bundled assets
    os.makedirs(LABELS_DIR, exist_ok=True)
    bundled_static = BASE_DIR / "static" / "labels"
    if bundled_static.exists():
        for f in bundled_static.glob("*.png"):
            target = LABELS_DIR / f.name
            if not target.exists():
                shutil.copy2(f, target)
else:
    STATIC_DIR = BASE_DIR / "static"
    LABELS_DIR = STATIC_DIR / "labels"
    DATABASE_URL = f"sqlite:///{BASE_DIR / 'labelguard.db'}"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
