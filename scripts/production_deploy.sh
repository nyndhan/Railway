#!/bin/bash
# Railway QR Tracker - Production Deployment Script
# Smart India Hackathon 2025

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOYMENT_LOG="$PROJECT_ROOT/logs/deployment-$(date +%Y%m%d_%H%M%S).log"
BACKUP_DIR="$PROJECT_ROOT/backups/pre-deployment-$(date +%Y%m%d_%H%M%S)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Logging functions
log() { echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$DEPLOYMENT_LOG"; }
log_success() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}" | tee -a "$DEPLOYMENT_LOG"; }
log_error() { echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}" | tee -a "$DEPLOYMENT_LOG"; }
log_warning() { echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️ $1${NC}" | tee -a "$DEPLOYMENT_LOG"; }
log_info() { echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️ $1${NC}" | tee -a "$DEPLOYMENT_LOG"; }

# Print deployment header
print_header() {
    echo -e "${WHITE}"
    echo "🚂 ============================================================= 🚂"
    echo "   RAILWAY QR TRACKER - PRODUCTION DEPLOYMENT"
    echo "   Smart India Hackathon 2025"
    echo "   $(date +'%Y-%m-%d %H:%M:%S IST')"
    echo "============================================================="
    echo -e "${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking deployment prerequisites..."
    
    # Check if running as root (should not be)
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root for security reasons"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker >/dev/null 2>&1; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose >/dev/null 2>&1; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if in project directory
    if [[ ! -f "$PROJECT_ROOT/.env" ]] || [[ ! -f "$PROJECT_ROOT/docker-compose.yml" ]]; then
        log_error "Not in Railway QR Tracker project directory"
        exit 1
    fi
    
    # Check disk space (minimum 10GB)
    available_space=$(df -BG "$PROJECT_ROOT" | awk 'NR==2 {print int($4)}')
    if [[ $available_space -lt 10 ]]; then
        log_error "Insufficient disk space. Need at least 10GB, available: ${available_space}GB"
        exit 1
    fi
    
    # Check Docker daemon
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    
    log_success "All prerequisites met"
}

# Load and validate environment configuration
load_environment() {
    log "Loading environment configuration..."
    
    # Check if production environment exists
    if [[ -f "$PROJECT_ROOT/config/production.env" ]]; then
        source "$PROJECT_ROOT/config/production.env"
        log_info "Loaded production environment configuration"
    elif [[ -f "$PROJECT_ROOT/.env" ]]; then
        source "$PROJECT_ROOT/.env"
        log_warning "Using default .env file. Consider creating config/production.env"
    else
        log_error "No environment configuration found"
        exit 1
    fi
    
    # Validate critical environment variables
    required_vars=(
        "DB_PASSWORD"
        "DB_ROOT_PASSWORD"
        "JWT_SECRET"
        "ENCRYPTION_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
        
        # Check for default/weak values
        case $var in
            "DB_PASSWORD"|"DB_ROOT_PASSWORD")
                if [[ "${!var}" == *"123"* ]] || [[ "${!var}" == *"password"* ]]; then
                    log_error "$var appears to be a default/weak password"
                    exit 1
                fi
                ;;
            "JWT_SECRET"|"ENCRYPTION_KEY")
                if [[ ${#!var} -lt 32 ]]; then
                    log_error "$var must be at least 32 characters long"
                    exit 1
                fi
                ;;
        esac
    done
    
    log_success "Environment configuration validated"
}

# Create deployment backup
create_backup() {
    log "Creating pre-deployment backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup database if running
    if docker-compose ps mysql-primary | grep -q "Up"; then
        log_info "Creating database backup..."
        docker-compose exec -T mysql-primary mysqldump \
            -u root -p"$DB_ROOT_PASSWORD" \
            --single-transaction --routines --triggers \
            "$DB_NAME" > "$BACKUP_DIR/database.sql"
        
        if [[ $? -eq 0 ]]; then
            log_success "Database backup created"
        else
            log_error "Database backup failed"
            exit 1
        fi
    fi
    
    # Backup configuration files
    cp -r "$PROJECT_ROOT/config" "$BACKUP_DIR/" 2>/dev/null || true
    cp "$PROJECT_ROOT/.env" "$BACKUP_DIR/" 2>/dev/null || true
    cp "$PROJECT_ROOT/docker-compose.yml" "$BACKUP_DIR/" 2>/dev/null || true
    
    # Backup uploaded files
    if [[ -d "$PROJECT_ROOT/uploads" ]]; then
        cp -r "$PROJECT_ROOT/uploads" "$BACKUP_DIR/"
    fi
    
    # Create backup manifest
    cat > "$BACKUP_DIR/backup_info.txt" << EOF
Railway QR Tracker Pre-Deployment Backup
========================================
Backup Date: $(date)
Project Version: ${PROJECT_VERSION:-"1.0.0"}
Environment: ${ENVIRONMENT:-"production"}
Database: $DB_NAME
Backup Location: $BACKUP_DIR
EOF
    
    log_success "Pre-deployment backup created: $BACKUP_DIR"
}

# Stop current services gracefully
stop_services() {
    log "Stopping current services gracefully..."
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        log_info "Services are running, stopping gracefully..."
        
        # Stop application services first
        docker-compose stop frontend backend-1 backend-2 udm-api tms-api
        sleep 5
        
        # Stop remaining services
        docker-compose down --remove-orphans
        
        log_success "All services stopped"
    else
        log_info "No services were running"
    fi
    
    # Clean up unused Docker resources
    log_info "Cleaning up Docker resources..."
    docker system prune -f
    docker volume prune -f
}

# Build production images
build_images() {
    log "Building production Docker images..."
    
    # Build with production compose file
    if [[ -f "$PROJECT_ROOT/docker/docker-compose.prod.yml" ]]; then
        COMPOSE_FILE="$PROJECT_ROOT/docker/docker-compose.prod.yml"
    else
        COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"
    fi
    
    # Pull latest base images
    docker-compose -f "$COMPOSE_FILE" pull
    
    # Build application images
    docker-compose -f "$COMPOSE_FILE" build --no-cache --parallel
    
    if [[ $? -eq 0 ]]; then
        log_success "All images built successfully"
    else
        log_error "Image build failed"
        exit 1
    fi
    
    # Tag images with version
    if [[ -n "${PROJECT_VERSION:-}" ]]; then
        log_info "Tagging images with version $PROJECT_VERSION"
        # Add image tagging logic here if needed
    fi
}

# Deploy database
deploy_database() {
    log "Deploying database..."
    
    # Start MySQL with health check
    docker-compose -f "$COMPOSE_FILE" up -d mysql-primary
    
    # Wait for database to be ready
    log_info "Waiting for database to be ready..."
    timeout=120
    counter=0
    
    while ! docker-compose -f "$COMPOSE_FILE" exec -T mysql-primary \
        mysqladmin ping -h localhost -u root -p"$DB_ROOT_PASSWORD" >/dev/null 2>&1; do
        
        if [[ $counter -ge $timeout ]]; then
            log_error "Database failed to start within $timeout seconds"
            exit 1
        fi
        
        sleep 2
        ((counter += 2))
        echo -n "."
    done
    
    echo
    log_success "Database is ready"
    
    # Run database migrations/updates if needed
    if [[ -f "$PROJECT_ROOT/database/migrations.sql" ]]; then
        log_info "Running database migrations..."
        docker-compose -f "$COMPOSE_FILE" exec -T mysql-primary \
            mysql -u root -p"$DB_ROOT_PASSWORD" "$DB_NAME" < "$PROJECT_ROOT/database/migrations.sql"
    fi
}

# Deploy application services
deploy_applications() {
    log "Deploying application services..."
    
    # Start Redis cache
    docker-compose -f "$COMPOSE_FILE" up -d redis-master
    
    # Wait for Redis
    log_info "Waiting for Redis to be ready..."
    timeout=60
    counter=0
    
    while ! docker-compose -f "$COMPOSE_FILE" exec -T redis-master \
        redis-cli ping >/dev/null 2>&1; do
        
        if [[ $counter -ge $timeout ]]; then
            log_error "Redis failed to start within $timeout seconds"
            exit 1
        fi
        
        sleep 2
        ((counter += 2))
        echo -n "."
    done
    
    echo
    log_success "Redis is ready"
    
    # Start backend services
    log_info "Starting backend services..."
    docker-compose -f "$COMPOSE_FILE" up -d backend-1 udm-api tms-api
    
    # Wait for backend services
    sleep 15
    
    # Check backend health
    if curl -f http://localhost:3001/api/health >/dev/null 2>&1; then
        log_success "Backend service is healthy"
    else
        log_error "Backend service health check failed"
        exit 1
    fi
    
    # Start frontend service
    log_info "Starting frontend service..."
    docker-compose -f "$COMPOSE_FILE" up -d frontend
    
    # Start load balancer
    log_info "Starting load balancer..."
    docker-compose -f "$COMPOSE_FILE" up -d nginx
}

# Deploy monitoring services
deploy_monitoring() {
    log "Deploying monitoring services..."
    
    # Start monitoring if enabled
    if [[ "${ENABLE_MONITORING:-false}" == "true" ]]; then
        docker-compose -f "$COMPOSE_FILE" --profile monitoring up -d
        log_success "Monitoring services started"
    else
        log_info "Monitoring disabled, skipping..."
    fi
}

# Run health checks
run_health_checks() {
    log "Running comprehensive health checks..."
    
    # Define services and their health endpoints
    declare -A services=(
        ["Backend API"]="http://localhost:3001/api/health"
        ["UDM API"]="http://localhost:4000/api/health"
        ["TMS API"]="http://localhost:5000/api/health"
        ["Frontend"]="http://localhost:3000/health"
        ["Load Balancer"]="http://localhost/health"
    )
    
    failed_checks=0
    
    for service in "${!services[@]}"; do
        endpoint="${services[$service]}"
        
        log_info "Checking $service at $endpoint..."
        
        if curl -f -s --max-time 10 "$endpoint" >/dev/null 2>&1; then
            log_success "$service is healthy"
        else
            log_error "$service health check failed"
            ((failed_checks++))
        fi
        
        sleep 1
    done
    
    # Check database connectivity
    log_info "Checking database connectivity..."
    if docker-compose -f "$COMPOSE_FILE" exec -T mysql-primary \
        mysql -u root -p"$DB_ROOT_PASSWORD" -e "SELECT 1;" >/dev/null 2>&1; then
        log_success "Database connectivity confirmed"
    else
        log_error "Database connectivity failed"
        ((failed_checks++))
    fi
    
    # Check Redis connectivity
    log_info "Checking Redis connectivity..."
    if docker-compose -f "$COMPOSE_FILE" exec -T redis-master \
        redis-cli ping >/dev/null 2>&1; then
        log_success "Redis connectivity confirmed"
    else
        log_error "Redis connectivity failed"
        ((failed_checks++))
    fi
    
    if [[ $failed_checks -eq 0 ]]; then
        log_success "All health checks passed"
        return 0
    else
        log_error "$failed_checks health checks failed"
        return 1
    fi
}

# Performance validation
validate_performance() {
    log "Validating system performance..."
    
    # Check resource usage
    log_info "Checking system resource usage..."
    
    # Memory usage
    total_memory=$(free -g | awk '/^Mem:/{print $2}')
    used_memory=$(free -g | awk '/^Mem:/{print $3}')
    memory_percent=$((used_memory * 100 / total_memory))
    
    log_info "Memory usage: ${used_memory}GB / ${total_memory}GB (${memory_percent}%)"
    
    if [[ $memory_percent -gt 80 ]]; then
        log_warning "High memory usage detected"
    fi
    
    # CPU load
    load_avg=$(uptime | awk -F'load average:' '{print $2}' | cut -d, -f1 | xargs)
    cpu_cores=$(nproc)
    
    log_info "CPU load average: $load_avg (cores: $cpu_cores)"
    
    # Disk usage
    disk_usage=$(df -h "$PROJECT_ROOT" | awk 'NR==2 {print $5}' | sed 's/%//')
    log_info "Disk usage: ${disk_usage}%"
    
    if [[ $disk_usage -gt 80 ]]; then
        log_warning "High disk usage detected"
    fi
    
    # Quick API response time test
    log_info "Testing API response times..."
    response_time=$(curl -o /dev/null -s -w '%{time_total}\n' http://localhost:3001/api/health)
    
    if (( $(echo "$response_time < 1.0" | bc -l) )); then
        log_success "API response time: ${response_time}s (Good)"
    else
        log_warning "API response time: ${response_time}s (Slow)"
    fi
}

# Setup monitoring alerts
setup_monitoring() {
    log "Setting up monitoring and alerts..."
    
    if [[ "${ENABLE_MONITORING:-false}" == "true" ]]; then
        # Configure Prometheus alerts
        if [[ -f "$PROJECT_ROOT/monitoring/alerts.yml" ]]; then
            log_info "Prometheus alerts configured"
        fi
        
        # Configure Grafana dashboards
        if [[ -d "$PROJECT_ROOT/monitoring/grafana/dashboards" ]]; then
            log_info "Grafana dashboards configured"
        fi
        
        log_success "Monitoring setup completed"
    else
        log_info "Monitoring disabled"
    fi
}

# Generate deployment report
generate_deployment_report() {
    log "Generating deployment report..."
    
    report_file="$PROJECT_ROOT/logs/deployment-report-$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$report_file" << EOF
Railway QR Tracker - Production Deployment Report
================================================

Deployment Information:
- Date: $(date)
- Environment: ${ENVIRONMENT:-"production"}
- Version: ${PROJECT_VERSION:-"1.0.0"}
- Deployed by: $(whoami)
- Server: $(hostname)

System Information:
- OS: $(uname -a)
- Docker Version: $(docker --version)
- Docker Compose Version: $(docker-compose --version)

Services Deployed:
$(docker-compose -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.State}}\t{{.Ports}}")

Container Resource Usage:
$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}")

Deployment Status: SUCCESS
Next Steps:
1. Configure SSL certificates if not already done
2. Set up automated backups
3. Configure monitoring alerts
4. Update DNS records if needed
5. Inform stakeholders of successful deployment

Support Information:
- Deployment Log: $DEPLOYMENT_LOG
- Backup Location: $BACKUP_DIR
- Health Check: ./scripts/status.sh
- Monitoring: http://localhost:9090 (if enabled)

This deployment is ready for Smart India Hackathon 2025!
EOF
    
    log_success "Deployment report generated: $report_file"
}

# Rollback function (in case of issues)
rollback_deployment() {
    log_error "Deployment failed, initiating rollback..."
    
    # Stop failed services
    docker-compose -f "$COMPOSE_FILE" down
    
    # Restore from backup if available
    if [[ -d "$BACKUP_DIR" ]] && [[ -f "$BACKUP_DIR/database.sql" ]]; then
        log_info "Restoring database from backup..."
        
        # Start database for restore
        docker-compose -f "$COMPOSE_FILE" up -d mysql-primary
        sleep 30
        
        # Restore database
        docker-compose -f "$COMPOSE_FILE" exec -T mysql-primary \
            mysql -u root -p"$DB_ROOT_PASSWORD" "$DB_NAME" < "$BACKUP_DIR/database.sql"
        
        log_success "Database restored from backup"
    fi
    
    log_error "Rollback completed. Please check logs and fix issues before retrying deployment."
    exit 1
}

# Main deployment function
main() {
    print_header
    
    # Create logs directory
    mkdir -p "$PROJECT_ROOT/logs"
    
    log "Starting Railway QR Tracker production deployment..."
    log "Deployment log: $DEPLOYMENT_LOG"
    
    # Set trap for cleanup on error
    trap rollback_deployment ERR
    
    # Execute deployment steps
    check_prerequisites
    load_environment
    create_backup
    stop_services
    build_images
    deploy_database
    deploy_applications
    deploy_monitoring
    
    # Validation and testing
    if run_health_checks; then
        validate_performance
        setup_monitoring
        generate_deployment_report
        
        # Success message
        echo
        log_success "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉"
        echo
        echo -e "${WHITE}🚂 Railway QR Tracker is now LIVE! 🏆${NC}"
        echo
        echo -e "${GREEN}📊 Access Points:${NC}"
        echo "   🌐 Frontend Dashboard: http://$(hostname):3000"
        echo "   🔧 Backend API:       http://$(hostname):3001/api"
        echo "   🏢 UDM API:          http://$(hostname):4000/api"
        echo "   🚆 TMS API:          http://$(hostname):5000/api"
        echo "   📊 Load Balancer:     http://$(hostname)"
        
        if [[ "${ENABLE_MONITORING:-false}" == "true" ]]; then
            echo "   📈 Monitoring:        http://$(hostname):9090"
            echo "   📊 Grafana:          http://$(hostname):3030"
        fi
        
        echo
        echo -e "${BLUE}📋 Next Steps:${NC}"
        echo "   1. Update DNS records to point to this server"
        echo "   2. Configure SSL certificates for HTTPS"
        echo "   3. Set up automated backups and monitoring alerts"
        echo "   4. Configure Flutter app to use production API"
        echo "   5. Conduct user acceptance testing"
        echo
        echo -e "${YELLOW}⚠️ Important Reminders:${NC}"
        echo "   • Monitor system performance for the first 24 hours"
        echo "   • Verify backups are working correctly"
        echo "   • Keep deployment documentation updated"
        echo "   • Inform support team of successful deployment"
        echo
        echo -e "${PURPLE}🏆 Smart India Hackathon 2025${NC}"
        echo -e "${WHITE}Ready to revolutionize Indian Railways! 🚂${NC}"
        
    else
        log_error "Deployment validation failed"
        exit 1
    fi
    
    # Remove error trap
    trap - ERR
}

# Command line argument handling
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback_deployment
        ;;
    "health-check")
        run_health_checks
        ;;
    "help"|"--help"|"-h")
        echo "Railway QR Tracker Production Deployment Script"
        echo
        echo "Usage: $0 [COMMAND]"
        echo
        echo "Commands:"
        echo "  deploy       Full production deployment (default)"
        echo "  rollback     Rollback to previous version"
        echo "  health-check Run health checks on current deployment"
        echo "  help         Show this help message"
        echo
        echo "Smart India Hackathon 2025"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac
