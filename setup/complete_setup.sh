#!/bin/bash
# Railway QR Tracker - Complete System Setup Script
# Smart India Hackathon 2025 - Production Ready Deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Logo and branding
print_logo() {
    echo -e "${BLUE}"
    echo "🚂 ======================================================= 🚂"
    echo "   RAILWAY QR TRACKER - COMPLETE SYSTEM SETUP"
    echo "   Smart India Hackathon 2025"
    echo "   Production Ready Deployment Suite"
    echo "======================================================="
    echo -e "${NC}"
}

print_status() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_section() { echo -e "${PURPLE}🔹 $1${NC}"; }
print_success() { echo -e "${WHITE}🎉 $1${NC}"; }

# Configuration variables with defaults
PROJECT_ROOT=${PWD}
NODE_VERSION="18"
PYTHON_VERSION="3.8"
MYSQL_VERSION="8.0"
DOCKER_COMPOSE_VERSION="2.20"

# System requirements
MIN_RAM_GB=8
MIN_DISK_GB=20
REQUIRED_PORTS=(3000 3001 4000 5000 3306)

# Environment configuration
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-"railway_user"}
DB_PASSWORD=${DB_PASSWORD:-"railway_pass123"}
DB_NAME=${DB_NAME:-"railway_qr_tracker"}
DB_ROOT_PASSWORD=${DB_ROOT_PASSWORD:-"root123"}

# Function to check system requirements
check_system_requirements() {
    print_section "Checking System Requirements"
    
    # Check operating system
    OS=$(uname -s)
    print_info "Operating System: $OS"
    
    # Check RAM
    if [[ "$OS" == "Linux" ]]; then
        RAM_GB=$(free -g | awk 'NR==2{print $2}')
    elif [[ "$OS" == "Darwin" ]]; then
        RAM_GB=$(sysctl -n hw.memsize | awk '{print int($1/1024/1024/1024)}')
    else
        RAM_GB=8  # Assume sufficient for Windows/other
    fi
    
    if [[ $RAM_GB -ge $MIN_RAM_GB ]]; then
        print_status "RAM: ${RAM_GB}GB (✓ Sufficient)"
    else
        print_warning "RAM: ${RAM_GB}GB (⚠️  Recommended: ${MIN_RAM_GB}GB)"
    fi
    
    # Check disk space
    DISK_GB=$(df -BG . | awk 'NR==2 {print int($4)}')
    if [[ $DISK_GB -ge $MIN_DISK_GB ]]; then
        print_status "Disk Space: ${DISK_GB}GB available (✓ Sufficient)"
    else
        print_error "Disk Space: ${DISK_GB}GB (❌ Need at least ${MIN_DISK_GB}GB)"
        exit 1
    fi
    
    # Check ports availability
    print_info "Checking port availability..."
    for port in "${REQUIRED_PORTS[@]}"; do
        if lsof -i :$port >/dev/null 2>&1; then
            print_warning "Port $port is in use (may cause conflicts)"
        else
            print_status "Port $port is available"
        fi
    done
}

# Function to install system dependencies
install_system_dependencies() {
    print_section "Installing System Dependencies"
    
    # Detect package manager and install dependencies
    if command -v apt-get >/dev/null 2>&1; then
        # Ubuntu/Debian
        print_info "Detected Ubuntu/Debian system"
        sudo apt-get update
        sudo apt-get install -y curl wget git build-essential software-properties-common
        
        # Install Node.js
        if ! command -v node >/dev/null 2>&1; then
            curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
            sudo apt-get install -y nodejs
        fi
        
        # Install Python
        sudo apt-get install -y python3 python3-pip python3-venv python3-dev
        
        # Install MySQL
        if ! command -v mysql >/dev/null 2>&1; then
            sudo apt-get install -y mysql-server mysql-client
        fi
        
        # Install Docker
        if ! command -v docker >/dev/null 2>&1; then
            curl -fsSL https://get.docker.com | sh
            sudo usermod -aG docker $USER
        fi
        
        # Install Docker Compose
        if ! command -v docker-compose >/dev/null 2>&1; then
            sudo curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            sudo chmod +x /usr/local/bin/docker-compose
        fi
        
    elif command -v yum >/dev/null 2>&1; then
        # CentOS/RHEL
        print_info "Detected CentOS/RHEL system"
        sudo yum update -y
        sudo yum groupinstall -y "Development Tools"
        sudo yum install -y curl wget git
        
        # Install Node.js
        curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | sudo bash -
        sudo yum install -y nodejs
        
        # Install Python
        sudo yum install -y python3 python3-pip python3-devel
        
        # Install MySQL
        sudo yum install -y mysql-server mysql
        
        # Install Docker
        sudo yum install -y docker
        sudo systemctl enable docker
        sudo systemctl start docker
        sudo usermod -aG docker $USER
        
    elif command -v brew >/dev/null 2>&1; then
        # macOS
        print_info "Detected macOS system"
        
        # Install Node.js
        if ! command -v node >/dev/null 2>&1; then
            brew install node@${NODE_VERSION}
        fi
        
        # Install Python
        brew install python@3.8
        
        # Install MySQL
        if ! command -v mysql >/dev/null 2>&1; then
            brew install mysql
            brew services start mysql
        fi
        
        # Install Docker Desktop
        if ! command -v docker >/dev/null 2>&1; then
            print_info "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
            read -p "Press Enter after installing Docker Desktop..."
        fi
        
    else
        print_error "Unsupported operating system. Please install dependencies manually:"
        print_info "- Node.js ${NODE_VERSION}+"
        print_info "- Python ${PYTHON_VERSION}+"
        print_info "- MySQL ${MYSQL_VERSION}+"
        print_info "- Docker and Docker Compose"
        exit 1
    fi
    
    print_status "System dependencies installed successfully"
}

# Function to verify installations
verify_installations() {
    print_section "Verifying Installation Requirements"
    
    # Check Node.js
    if command -v node >/dev/null 2>&1; then
        NODE_VER=$(node --version)
        print_status "Node.js: $NODE_VER"
    else
        print_error "Node.js not found"
        exit 1
    fi
    
    # Check NPM
    if command -v npm >/dev/null 2>&1; then
        NPM_VER=$(npm --version)
        print_status "NPM: $NPM_VER"
    else
        print_error "NPM not found"
        exit 1
    fi
    
    # Check Python
    if command -v python3 >/dev/null 2>&1; then
        PYTHON_VER=$(python3 --version)
        print_status "Python: $PYTHON_VER"
    else
        print_error "Python 3 not found"
        exit 1
    fi
    
    # Check MySQL
    if command -v mysql >/dev/null 2>&1; then
        MYSQL_VER=$(mysql --version | cut -d' ' -f6 | cut -d',' -f1)
        print_status "MySQL: $MYSQL_VER"
    else
        print_error "MySQL not found"
        exit 1
    fi
    
    # Check Docker
    if command -v docker >/dev/null 2>&1; then
        DOCKER_VER=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        print_status "Docker: $DOCKER_VER"
    else
        print_warning "Docker not found (optional for development)"
    fi
    
    # Check Docker Compose
    if command -v docker-compose >/dev/null 2>&1; then
        COMPOSE_VER=$(docker-compose --version | cut -d' ' -f4 | cut -d',' -f1)
        print_status "Docker Compose: $COMPOSE_VER"
    else
        print_warning "Docker Compose not found (optional for development)"
    fi
}

# Function to setup project structure
setup_project_structure() {
    print_section "Setting up Project Structure"
    
    # Create main directories if they don't exist
    directories=(
        "backend"
        "frontend" 
        "database"
        "data_processing"
        "integration_apis"
        "flutter_app"
        "config"
        "docs"
        "logs"
        "backups"
        "monitoring"
        "scripts"
    )
    
    for dir in "${directories[@]}"; do
        if [[ ! -d "$dir" ]]; then
            mkdir -p "$dir"
            print_status "Created directory: $dir"
        else
            print_info "Directory exists: $dir"
        fi
    done
    
    # Create configuration files
    create_global_config_files
}

# Function to create global configuration files
create_global_config_files() {
    print_info "Creating global configuration files..."
    
    # Create main environment file
    cat > .env << 'EOF'
# Railway QR Tracker - Global Environment Configuration
# Smart India Hackathon 2025

# Project Information
PROJECT_NAME=railway_qr_tracker
PROJECT_VERSION=1.0.0
ENVIRONMENT=development
DEPLOYMENT_DATE=$(date)

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=railway_user
DB_PASSWORD=railway_pass123
DB_NAME=railway_qr_tracker
DB_ROOT_PASSWORD=root123

# Application Ports
BACKEND_PORT=3000
FRONTEND_PORT=3001
UDM_API_PORT=4000
TMS_API_PORT=5000

# Security Configuration
JWT_SECRET=your_jwt_secret_key_change_in_production
ENCRYPTION_KEY=your_encryption_key_32_characters
SESSION_SECRET=your_session_secret_key

# API Configuration
API_RATE_LIMIT=1000
API_TIMEOUT=30000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined
LOG_ROTATION=daily
LOG_MAX_SIZE=100MB

# Email Configuration (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=Railway QR Tracker <noreply@railway.gov.in>

# SMS Configuration (optional)
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=RAILWAY

# Monitoring
ENABLE_MONITORING=true
METRICS_PORT=9090
HEALTH_CHECK_INTERVAL=30

# Performance
NODE_ENV=development
UV_THREADPOOL_SIZE=16
NODE_OPTIONS=--max-old-space-size=4096

# Feature Flags
ENABLE_QR_GENERATION=true
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=true
ENABLE_AUDIT_LOG=true

# Business Configuration
RAILWAY_ZONES=CR,WR,NR,SR,ER,NFR,NCR,NER,SER,SCR
DEFAULT_COMPONENT_WARRANTY_YEARS=2
CRITICAL_STOCK_PERCENTAGE=10
LOW_STOCK_PERCENTAGE=20

# Development Settings
ENABLE_DEBUG=false
ENABLE_MOCK_DATA=true
SIMULATE_DELAYS=false
EOF
    
    print_status "Created .env configuration file"
    
    # Create Docker Compose for the entire system
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    container_name: railway-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_CHARSET: utf8mb4
      MYSQL_COLLATION: utf8mb4_unicode_ci
    ports:
      - "${DB_PORT}:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro
      - ./database/my.cnf:/etc/mysql/conf.d/custom.cnf:ro
    networks:
      - railway-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${DB_ROOT_PASSWORD}"]
      timeout: 20s
      retries: 10

  # Backend API Server
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: railway-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=${DB_NAME}
    ports:
      - "${BACKEND_PORT}:3000"
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - railway-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend Dashboard
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: railway-frontend
    restart: unless-stopped
    environment:
      - REACT_APP_API_URL=http://localhost:${BACKEND_PORT}/api
    ports:
      - "${FRONTEND_PORT}:3000"
    depends_on:
      - backend
    networks:
      - railway-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  # UDM Integration API
  udm-api:
    build:
      context: ./integration_apis
      dockerfile: Dockerfile
      args:
        - SERVICE=udm
    container_name: railway-udm-api
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - UDM_PORT=4000
    ports:
      - "${UDM_API_PORT}:4000"
    networks:
      - railway-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # TMS Integration API
  tms-api:
    build:
      context: ./integration_apis
      dockerfile: Dockerfile
      args:
        - SERVICE=tms
    container_name: railway-tms-api
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - TMS_PORT=5000
    ports:
      - "${TMS_API_PORT}:5000"
    networks:
      - railway-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Data Processing Pipeline (optional)
  data-processor:
    build:
      context: ./data_processing
      dockerfile: Dockerfile
    container_name: railway-data-processor
    restart: unless-stopped
    environment:
      - DB_HOST=mysql
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=${DB_NAME}
    volumes:
      - ./logs:/app/logs
      - ./data_processing/output:/app/output
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - railway-network
    profiles:
      - analytics

  # Redis for caching
  redis:
    image: redis:7-alpine
    container_name: railway-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - railway-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: railway-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./config/ssl:/etc/nginx/ssl:ro
      - nginx_logs:/var/log/nginx
    depends_on:
      - backend
      - frontend
      - udm-api
      - tms-api
    networks:
      - railway-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Monitoring with Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: railway-prometheus
    restart: unless-stopped
    ports:
      - "${METRICS_PORT}:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    networks:
      - railway-network
    profiles:
      - monitoring

  # Grafana Dashboard
  grafana:
    image: grafana/grafana:latest
    container_name: railway-grafana
    restart: unless-stopped
    ports:
      - "3030:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    networks:
      - railway-network
    profiles:
      - monitoring

volumes:
  mysql_data:
  redis_data:
  nginx_logs:
  prometheus_data:
  grafana_data:

networks:
  railway-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
EOF
    
    print_status "Created docker-compose.yml for complete system"
}

# Function to setup each module
setup_backend() {
    print_section "Setting up Backend Module"
    
    if [[ -f "backend/package.json" ]]; then
        cd backend
        print_info "Installing backend dependencies..."
        npm install --production
        
        # Create backend Dockerfile
        cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["npm", "start"]
EOF
        
        cd ..
        print_status "Backend module setup complete"
    else
        print_warning "Backend module not found - skipping"
    fi
}

setup_frontend() {
    print_section "Setting up Frontend Module"
    
    if [[ -f "frontend/package.json" ]]; then
        cd frontend
        print_info "Installing frontend dependencies..."
        npm install --production
        
        # Create frontend Dockerfile
        cat > Dockerfile << 'EOF'
# Build stage
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

CMD ["nginx", "-g", "daemon off;"]
EOF
        
        # Create nginx config for frontend
        cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    server {
        listen 3000;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        location /api {
            proxy_pass http://backend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
EOF
        
        cd ..
        print_status "Frontend module setup complete"
    else
        print_warning "Frontend module not found - skipping"
    fi
}

setup_database() {
    print_section "Setting up Database Module"
    
    if [[ -f "database/setup_database.sh" ]]; then
        cd database
        chmod +x setup_database.sh
        
        # Run database setup
        print_info "Setting up MySQL database..."
        if command -v mysql >/dev/null 2>&1; then
            # Check if MySQL is running
            if pgrep -x "mysqld" >/dev/null; then
                print_info "MySQL is running, setting up database..."
                ./setup_database.sh
            else
                print_warning "MySQL is not running. Starting MySQL service..."
                if command -v systemctl >/dev/null 2>&1; then
                    sudo systemctl start mysql
                elif command -v brew >/dev/null 2>&1; then
                    brew services start mysql
                fi
                sleep 5
                ./setup_database.sh
            fi
        else
            print_warning "MySQL not available. Database setup will be done via Docker."
        fi
        
        cd ..
        print_status "Database module setup complete"
    else
        print_warning "Database module not found - skipping"
    fi
}

setup_data_processing() {
    print_section "Setting up Data Processing Module"
    
    if [[ -f "data_processing/requirements.txt" ]]; then
        cd data_processing
        
        # Create Python virtual environment
        print_info "Creating Python virtual environment..."
        python3 -m venv venv
        source venv/bin/activate
        
        # Install Python dependencies
        print_info "Installing Python dependencies..."
        pip install --upgrade pip
        pip install -r requirements.txt
        
        # Create Dockerfile for data processing
        cat > Dockerfile << 'EOF'
FROM python:3.8-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create output directory
RUN mkdir -p output logs

# Health check
HEALTHCHECK --interval=60s --timeout=30s --retries=3 \
  CMD python -c "import sys; sys.exit(0)"

# Default command
CMD ["python", "main_processor.py"]
EOF
        
        deactivate
        cd ..
        print_status "Data processing module setup complete"
    else
        print_warning "Data processing module not found - skipping"
    fi
}

setup_integration_apis() {
    print_section "Setting up Integration APIs Module"
    
    if [[ -f "integration_apis/package.json" ]]; then
        cd integration_apis
        
        print_info "Installing integration APIs dependencies..."
        npm install --production
        
        # Create Dockerfile for integration APIs
        cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose ports
EXPOSE 4000 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:4000/api/health && curl -f http://localhost:5000/api/health || exit 1

# Start both services
CMD ["npm", "start"]
EOF
        
        cd ..
        print_status "Integration APIs module setup complete"
    else
        print_warning "Integration APIs module not found - skipping"
    fi
}

# Function to create monitoring configuration
setup_monitoring() {
    print_section "Setting up Monitoring Configuration"
    
    mkdir -p monitoring
    
    # Create Prometheus configuration
    cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'railway-backend'
    static_configs:
      - targets: ['backend:3000']
    scrape_interval: 30s
    metrics_path: '/api/metrics'

  - job_name: 'railway-udm-api'
    static_configs:
      - targets: ['udm-api:4000']
    scrape_interval: 30s
    metrics_path: '/api/metrics'

  - job_name: 'railway-tms-api'
    static_configs:
      - targets: ['tms-api:5000']
    scrape_interval: 30s
    metrics_path: '/api/metrics'

  - job_name: 'mysql'
    static_configs:
      - targets: ['mysql:3306']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
EOF
    
    # Create Grafana provisioning
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    
    cat > monitoring/grafana/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF
    
    print_status "Monitoring configuration created"
}

# Function to create nginx configuration
setup_nginx() {
    print_section "Setting up Nginx Configuration"
    
    mkdir -p config/ssl
    
    cat > config/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging format
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    # Upstream definitions
    upstream backend {
        server backend:3000;
    }
    
    upstream frontend {
        server frontend:3000;
    }
    
    upstream udm-api {
        server udm-api:4000;
    }
    
    upstream tms-api {
        server tms-api:5000;
    }
    
    # Main server block
    server {
        listen 80;
        server_name localhost;
        
        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
        
        # Frontend application
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Backend API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # UDM API
        location /udm/ {
            limit_req zone=api burst=20 nodelay;
            rewrite ^/udm/(.*) /api/$1 break;
            proxy_pass http://udm-api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
        
        # TMS API
        location /tms/ {
            limit_req zone=api burst=20 nodelay;
            rewrite ^/tms/(.*) /api/$1 break;
            proxy_pass http://tms-api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
EOF
    
    print_status "Nginx configuration created"
}

# Function to create helper scripts
create_helper_scripts() {
    print_section "Creating Helper Scripts"
    
    mkdir -p scripts
    
    # Start script
    cat > scripts/start.sh << 'EOF'
#!/bin/bash
# Start Railway QR Tracker System

echo "🚂 Starting Railway QR Tracker System..."

# Start with Docker Compose
docker-compose up -d

echo "✅ System started successfully!"
echo ""
echo "🌐 Access Points:"
echo "   Frontend Dashboard: http://localhost:3001"
echo "   Backend API:       http://localhost:3000/api"
echo "   UDM API:          http://localhost:4000/api"
echo "   TMS API:          http://localhost:5000/api"
echo ""
echo "📊 Monitoring:"
echo "   Prometheus:       http://localhost:9090"
echo "   Grafana:          http://localhost:3030"
echo ""
echo "🏆 Railway QR Tracker - Smart India Hackathon 2025"
EOF
    
    # Stop script
    cat > scripts/stop.sh << 'EOF'
#!/bin/bash
# Stop Railway QR Tracker System

echo "🛑 Stopping Railway QR Tracker System..."

docker-compose down

echo "✅ System stopped successfully!"
EOF
    
    # Status script
    cat > scripts/status.sh << 'EOF'
#!/bin/bash
# Check Railway QR Tracker System Status

echo "🚂 Railway QR Tracker System Status"
echo "=================================="
echo ""

# Check Docker containers
echo "📦 Container Status:"
docker-compose ps

echo ""

# Check services health
echo "🏥 Health Checks:"
services=("http://localhost:3000/api/health" "http://localhost:4000/api/health" "http://localhost:5000/api/health")

for service in "${services[@]}"; do
    if curl -s -f "$service" >/dev/null 2>&1; then
        echo "  ✅ $service"
    else
        echo "  ❌ $service"
    fi
done
EOF
    
    # Backup script
    cat > scripts/backup.sh << 'EOF'
#!/bin/bash
# Backup Railway QR Tracker Data

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Creating backup in $BACKUP_DIR..."

# Backup database
docker-compose exec mysql mysqldump -u root -p$DB_ROOT_PASSWORD $DB_NAME > "$BACKUP_DIR/database.sql"

# Backup configuration
cp -r config "$BACKUP_DIR/"
cp .env "$BACKUP_DIR/"
cp docker-compose.yml "$BACKUP_DIR/"

# Backup logs
cp -r logs "$BACKUP_DIR/" 2>/dev/null || true

# Create backup info
cat > "$BACKUP_DIR/backup_info.txt" << BACKUP_EOF
Railway QR Tracker Backup
Created: $(date)
System Version: 1.0.0
Database: $DB_NAME
BACKUP_EOF

echo "✅ Backup completed: $BACKUP_DIR"
EOF
    
    # Make scripts executable
    chmod +x scripts/*.sh
    
    print_status "Helper scripts created"
}

# Function to validate complete setup
validate_setup() {
    print_section "Validating Complete Setup"
    
    validation_errors=0
    
    # Check required files
    required_files=(
        ".env"
        "docker-compose.yml"
        "config/nginx.conf"
        "monitoring/prometheus.yml"
        "scripts/start.sh"
        "scripts/stop.sh"
        "scripts/status.sh"
        "scripts/backup.sh"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            print_status "Required file exists: $file"
        else
            print_error "Missing required file: $file"
            ((validation_errors++))
        fi
    done
    
    # Check required directories
    required_dirs=(
        "backend"
        "frontend"
        "database"
        "integration_apis"
        "config"
        "monitoring"
        "scripts"
        "logs"
    )
    
    for dir in "${required_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            print_status "Required directory exists: $dir"
        else
            print_error "Missing required directory: $dir"
            ((validation_errors++))
        fi
    done
    
    if [[ $validation_errors -eq 0 ]]; then
        print_success "✅ Setup validation passed!"
        return 0
    else
        print_error "❌ Setup validation failed with $validation_errors errors"
        return 1
    fi
}

# Function to display final instructions
show_final_instructions() {
    print_section "🎉 Setup Complete!"
    
    echo ""
    echo -e "${WHITE}🚂 Railway QR Tracker System Setup Complete! 🏆${NC}"
    echo ""
    echo -e "${GREEN}📋 Next Steps:${NC}"
    echo ""
    echo -e "${BLUE}1. Start the system:${NC}"
    echo "   ./scripts/start.sh"
    echo ""
    echo -e "${BLUE}2. Access the applications:${NC}"
    echo "   🌐 Frontend Dashboard: http://localhost:3001"
    echo "   🔧 Backend API:       http://localhost:3000/api"
    echo "   🏢 UDM API:          http://localhost:4000/api" 
    echo "   🚆 TMS API:          http://localhost:5000/api"
    echo ""
    echo -e "${BLUE}3. Monitor the system:${NC}"
    echo "   📊 Prometheus:        http://localhost:9090"
    echo "   📈 Grafana:          http://localhost:3030 (admin/admin123)"
    echo "   ❤️  Health Check:     ./scripts/status.sh"
    echo ""
    echo -e "${BLUE}4. Flutter App Development:${NC}"
    echo "   📱 Configure backend URL: http://your-ip:3000/api"
    echo "   🔗 Test QR scanning with generated components"
    echo ""
    echo -e "${BLUE}5. System Management:${NC}"
    echo "   🛑 Stop system:      ./scripts/stop.sh"
    echo "   💾 Backup data:      ./scripts/backup.sh"
    echo "   📋 View logs:        docker-compose logs -f"
    echo ""
    echo -e "${YELLOW}⚠️  Important Notes:${NC}"
    echo "   • Change default passwords in production (.env file)"
    echo "   • Configure SSL certificates for HTTPS"
    echo "   • Set up monitoring alerts for production"
    echo "   • Regular database backups recommended"
    echo ""
    echo -e "${PURPLE}🏆 Smart India Hackathon 2025${NC}"
    echo -e "${WHITE}Ready to revolutionize Indian Railways through technology!${NC}"
    echo ""
    echo -e "${CYAN}💡 For support and documentation:${NC}"
    echo "   📚 Docs: ./docs/"
    echo "   🐛 Logs: ./logs/"
    echo "   📞 Support: Check README files in each module"
    echo ""
}

# Main execution function
main() {
    print_logo
    
    echo "Starting complete system setup..."
    echo "This will set up the entire Railway QR Tracker system."
    echo ""
    
    # Confirm before proceeding
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Setup cancelled by user"
        exit 0
    fi
    
    # Execute setup steps
    check_system_requirements
    
    if [[ "${1:-}" != "--skip-deps" ]]; then
        install_system_dependencies
    fi
    
    verify_installations
    setup_project_structure
    
    # Setup individual modules
    setup_backend
    setup_frontend
    setup_database
    setup_data_processing
    setup_integration_apis
    
    # Setup infrastructure
    setup_monitoring
    setup_nginx
    create_helper_scripts
    
    # Validate and finish
    if validate_setup; then
        show_final_instructions
    else
        print_error "Setup validation failed. Please check errors above."
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    "--help"|"-h")
        echo "Railway QR Tracker Complete Setup Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h        Show this help message"
        echo "  --skip-deps      Skip system dependency installation"
        echo "  --validate-only  Only validate existing setup"
        echo ""
        echo "Smart India Hackathon 2025"
        exit 0
        ;;
    "--validate-only")
        print_logo
        validate_setup
        exit $?
        ;;
    *)
        main "$@"
        ;;
esac
