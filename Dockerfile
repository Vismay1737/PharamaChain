# --------------------------------------------------------
# STAGE 1: Build the React Frontend
# --------------------------------------------------------
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --------------------------------------------------------
# STAGE 2: Build the Flask Backend & Serve
# --------------------------------------------------------
FROM python:3.13-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
# Add gunicorn for production serving
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from Stage 1 into backend's static folder
# Flask can be configured to serve this on the root route
COPY --from=frontend-builder /app/frontend/dist ./backend/static/

# Environment Variables for Google Cloud Run
ENV PORT=8080
ENV FLASK_APP=backend/run.py
ENV FLASK_ENV=production

# Expose the port
EXPOSE 8080

# Command to run the application using Gunicorn (production grade)
CMD gunicorn --bind 0.0.0.0:$PORT "backend.app:create_app()"
