# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Install frontend dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copy frontend code
COPY frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Build backend + serve frontend
FROM node:20-alpine

WORKDIR /app

# Install backend dependencies
COPY backend/package.json backend/package-lock.json ./
RUN npm install --omit=dev

# Copy backend source
COPY backend/ ./

# Copy built frontend into backend/public
RUN mkdir -p public
COPY --from=frontend-builder /app/frontend/dist ./public

# Expose backend port
EXPOSE 5000

ENV NODE_ENV=production

# Start backend
CMD ["node", "src/app.js"]