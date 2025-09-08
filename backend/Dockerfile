# Railway QR Tracker Backend - Dockerfile
# Smart India Hackathon 2025

# Use official Node.js runtime as base image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine AS production

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S railway -u 1001

# Install runtime dependencies
RUN apk add --no-cache curl dumb-init

# Set working directory
WORKDIR /app

# Copy node_modules from builder stage
COPY --from=builder --chown=railway:nodejs /app/node_modules ./node_modules

# Copy application files
COPY --chown=railway:nodejs . .

# Create necessary directories with proper permissions
RUN mkdir -p uploads logs data && \
    chown -R railway:nodejs uploads logs data

# Remove unnecessary files
RUN rm -rf tests/ *.md Dockerfile .env.example

# Switch to non-root user
USER railway

# Expose application port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]

# Labels for container metadata
LABEL maintainer="Railway QR Tracker Team"
LABEL version="1.0.0"
LABEL description="Railway QR Tracker Backend API Server"
LABEL org.opencontainers.image.source="https://github.com/railway-qr-tracker/backend"
