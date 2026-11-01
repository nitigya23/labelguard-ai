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

# Expose port 8000
EXPOSE 8000

# Seed database and start uvicorn server
CMD ["python", "-c", "import sys; sys.path.insert(0, '/app/backend'); from app.seed_data import init_seed_data; init_seed_data(); import uvicorn; uvicorn.run('app.main:app', host='0.0.0.0', port=8000, app_dir='/app/backend')"]
