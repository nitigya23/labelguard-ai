# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /build
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend & Unified Server
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies for OpenCV and Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend app, rules, and seed files
COPY backend/ ./backend/
ENV PYTHONPATH=/app/backend

# Copy built frontend assets from Stage 1 into frontend/dist
COPY --from=frontend-builder /build/dist ./frontend/dist

# Expose default port
EXPOSE 8000

# Seed database and dynamically bind to Render's $PORT (defaults to 8000)
CMD ["python", "-c", "import os, sys; sys.path.insert(0, '/app/backend'); from app.seed_data import init_seed_data; init_seed_data(); import uvicorn; port=int(os.environ.get('PORT', 8000)); uvicorn.run('app.main:app', host='0.0.0.0', port=port, app_dir='/app/backend')"]
