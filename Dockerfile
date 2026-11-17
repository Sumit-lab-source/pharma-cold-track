# Pharma Cold Track - Multi-stage Docker Build
# Supports: Frontend (React), Backend Lambda, Terraform Infrastructure

# ============================================
# Stage 1: Frontend Build
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY frontend_vite/package*.json ./
RUN npm ci

# Copy source and build
COPY frontend_vite/ ./
RUN npm run build

# ============================================
# Stage 2: Lambda Package Builder
# ============================================
FROM python:3.12-alpine AS lambda-builder

WORKDIR /app/lambda

# Install build dependencies
RUN apk add --no-cache zip

# Copy requirements and install
COPY services/iot-processor/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt -t package/

# Copy Lambda source
COPY services/iot-processor/excursion_processor.py package/

# Create deployment package
RUN cd package && zip -r ../excursion_processor.zip .

# ============================================
# Stage 3: Production Runtime (Nginx for Frontend)
# ============================================
FROM nginx:alpine AS frontend-runtime

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx config for SPA routing
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ============================================
# Stage 4: Development Environment (All-in-one)
# ============================================
FROM node:20-alpine AS dev-environment

# Install lightweight development tools
RUN apk add --no-cache \
    python3 \
    curl \
    jq \
    bash \
    zip \
    git

WORKDIR /app

# Copy frontend source and install dependencies into image
COPY frontend_vite/package*.json ./frontend_vite/
RUN cd /app/frontend_vite && npm install

# Copy entrypoint script
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["help"]

# ============================================
# Stage 5: Production API (Lambda Runtime Interface Emulator)
# ============================================
FROM public.ecr.aws/lambda/python:3.12 AS lambda-runtime

# Install unzip for extracting Lambda package
RUN dnf install -y unzip && dnf clean all

# Copy Lambda package
COPY --from=lambda-builder /app/lambda/excursion_processor.zip /var/task/
RUN unzip -o /var/task/excursion_processor.zip -d /var/task/ && \
    rm /var/task/excursion_processor.zip

# Set handler
CMD ["excursion_processor.lambda_handler"]