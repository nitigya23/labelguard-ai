import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
RULES_DIR = BASE_DIR / "rules"
STATIC_DIR = BASE_DIR / "static"
LABELS_DIR = STATIC_DIR / "labels"
DATABASE_URL = f"sqlite:///{BASE_DIR / 'labelguard.db'}"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
