import os
import sys
import subprocess
import webbrowser
import time

def main():
    print("=" * 70)
    print("  LabelGuard AI — End-to-End Medical Device Labeling Automation")
    print("  Tata Elxsi Teliport S4 (Case Study 4 Prototype)")
    print("  'AI drafts, rules verify, people approve. AI never edits an approved label.'")
    print("=" * 70)

    # Ensure backend directory is in python path
    backend_dir = os.path.join(os.path.dirname(__file__), "backend")
    os.environ["PYTHONPATH"] = backend_dir

    # Initialize seed database and label graphics if not present
    print("\n[1/3] Checking medical device database and synthetic label assets...")
    try:
        sys.path.insert(0, backend_dir)
        from app.seed_data import init_seed_data
        from app.database import SessionLocal
        from app.models import ProductMaster
        db = SessionLocal()
        product = db.query(ProductMaster).first()
        db.close()
        if not product:
            print("      Initializing sample GlucoGuard Pro CGM dataset...")
            init_seed_data()
        else:
            print("      Dataset verified: GlucoGuard Pro CGM (v2.4 DHF baseline).")
    except Exception as e:
        print(f"      Warning during data check: {e}")

    # Launch server
    port = 8000
    host = "127.0.0.1"
    url = f"http://{host}:{port}"
    print(f"\n[2/3] Starting LabelGuard AI unified server on {url}...")
    print("      (Serving React + Tailwind UI and FastAPI regulatory backend)")

    # Open browser automatically after a short pause
    def open_browser():
        time.sleep(1.5)
        print(f"\n[3/3] Opening browser at {url}...")
        webbrowser.open(url)

    import threading
    threading.Thread(target=open_browser, daemon=True).start()

    try:
        import uvicorn
        uvicorn.run("app.main:app", host=host, port=port, app_dir=backend_dir, reload=False)
    except KeyboardInterrupt:
        print("\nLabelGuard AI server stopped cleanly.")

if __name__ == "__main__":
    main()
