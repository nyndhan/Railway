#!/bin/bash
# Railway QR Tracker Database Setup Script
# Smart India Hackathon 2025
# Automated MySQL database setup with optimization for 100M+ components

set -e

echo "🗄️ Railway QR Tracker - Database Setup"
echo "Smart India Hackathon 2025"
echo "======================================"
echo ""

# Configuration with defaults
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-"railway_user"}
DB_PASSWORD=${DB_PASSWORD:-"railway_pass123"}
DB_NAME=${DB_NAME:-"railway_qr_tracker"}
DB_ROOT_PASSWORD=${DB_ROOT_PASSWORD:-""}
MYSQL_CONFIG_FILE=${MYSQL_CONFIG_FILE:-"my.cnf"}

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_status() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_section() { echo -e "${PURPLE}🔹 $1${NC}"; }

# Function to check if MySQL is running
check_mysql_service() {
    print_section "Checking MySQL Service Status"
    
    if systemctl is-active --quiet mysql || systemctl is-active --quiet mysqld; then
        print_status "MySQL service is running"
    else
        print_warning "MySQL service is not running. Attempting to start..."
        
        if command -v systemctl &> /dev/null; then
            sudo systemctl start mysql || sudo systemctl start mysqld || true
        else
            print_info "Systemctl not available. Please ensure MySQL is running manually."
        fi
    fi
}

# Function to check MySQL client availability
check_mysql() {
    print_section "Checking MySQL Client Availability"
    
    if ! command -v mysql &> /dev/null; then
        print_error "MySQL client not found"
        print_info "Install MySQL client:"
        print_info "  Ubuntu/Debian: sudo apt-get install mysql-client"
        print_info "  CentOS/RHEL:   sudo yum install mysql"
        print_info "  macOS:         brew install mysql-client"
        exit 1
    fi
    
    print_status "MySQL client found"
    
    # Test connection
    print_info "Testing MySQL connection to $DB_HOST:$DB_PORT..."
    
    if mysql -h"$DB_HOST" -P"$DB_PORT" -u"root" ${DB_ROOT_PASSWORD:+-p"$DB_ROOT_PASSWORD"} -e "SELECT 1;" &>/dev/null; then
        print_status "MySQL connection successful"
    else
        print_error "Cannot connect to MySQL server at $DB_HOST:$DB_PORT"
        print_info "Please ensure:"
        print_info "  1. MySQL server is running"
        print_info "  2. Host and port are correct"
        print_info "  3. Root password is correct"
        print_info "  4. Firewall allows connections"
        exit 1
    fi
}

# Function to setup database and user
setup_database() {
    print_section "Setting up database and user"
    
    print_info "Creating database: $DB_NAME"
    print_info "Creating user: $DB_USER"
    
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"root" ${DB_ROOT_PASSWORD:+-p"$DB_ROOT_PASSWORD"} <<EOF
-- Create database with proper charset
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create user for localhost and remote connections
CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'%';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';

-- Grant additional privileges for stored procedures and functions
GRANT CREATE ROUTINE ON \`$DB_NAME\`.* TO '$DB_USER'@'%';  
GRANT ALTER ROUTINE ON \`$DB_NAME\`.* TO '$DB_USER'@'%';
GRANT EXECUTE ON \`$DB_NAME\`.* TO '$DB_USER'@'%';

GRANT CREATE ROUTINE ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';  
GRANT ALTER ROUTINE ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';
GRANT EXECUTE ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';

-- Flush privileges to ensure changes take effect
FLUSH PRIVILEGES;

-- Display created database info
SELECT 
    'Database Created Successfully!' as status,
    '$DB_NAME' as database_name,
    '$DB_USER' as username,
    'utf8mb4' as charset,
    'utf8mb4_unicode_ci' as collation;
EOF
    
    print_status "Database and user created successfully"
}

# Function to apply MySQL optimizations
apply_mysql_optimizations() {
    print_section "Applying MySQL optimizations for Railway QR Tracker"
    
    if [[ -f "$MYSQL_CONFIG_FILE" ]]; then
        print_info "MySQL configuration file found: $MYSQL_CONFIG_FILE"
        print_info "Please copy this to your MySQL configuration directory:"
        print_info "  Ubuntu/Debian: /etc/mysql/mysql.conf.d/"
        print_info "  CentOS/RHEL:   /etc/my.cnf.d/"
        print_info "  macOS:         /usr/local/etc/"
        print_warning "Restart MySQL service after copying the configuration file"
    else
        print_warning "MySQL configuration file not found. Using runtime optimizations."
        
        # Apply runtime optimizations
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"root" ${DB_ROOT_PASSWORD:+-p"$DB_ROOT_PASSWORD"} <<EOF
-- Runtime optimizations for Railway QR Tracker
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB (adjust based on available RAM)
SET GLOBAL query_cache_size = 268435456; -- 256MB
SET GLOBAL query_cache_type = ON;
SET GLOBAL max_connections = 500;

-- Show applied optimizations
SELECT 
    'MySQL Optimizations Applied' as status,
    @@innodb_buffer_pool_size as buffer_pool_size,  
    @@query_cache_size as query_cache_size,
    @@max_connections as max_connections;
EOF
        print_status "Runtime MySQL optimizations applied"
    fi
}

# Function to import schema
import_schema() {
    print_section "Importing Railway QR Tracker schema"
    
    if [[ ! -f "schema.sql" ]]; then
        print_error "schema.sql file not found in current directory!"
        print_info "Please ensure you're running this script from the database directory"
        print_info "Expected file structure:"
        print_info "  database/"
        print_info "  ├── schema.sql"
        print_info "  ├── setup_database.sh"
        print_info "  └── my.cnf"
        exit 1
    fi
    
    print_info "Importing schema from schema.sql..."
    print_info "This may take a few minutes for large schemas..."
    
    # Import with progress indication
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < schema.sql
    
    if [[ $? -eq 0 ]]; then
        print_status "Schema imported successfully"
    else
        print_error "Schema import failed"
        exit 1
    fi
}

# Function to verify database setup
verify_setup() {
    print_section "Verifying database setup"
    
    # Count tables
    table_count=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '$DB_NAME';")
    print_status "Tables created: $table_count"
    
    # Count components
    component_count=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM components;" 2>/dev/null || echo "0")
    print_status "Sample components: $component_count"
    
    # Count scan history
    scan_count=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM scan_history;" 2>/dev/null || echo "0")
    print_status "Sample scans: $scan_count"
    
    # Count users
    user_count=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
    print_status "Sample users: $user_count"
    
    # Check stored procedures
    proc_count=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = '$DB_NAME';")
    print_status "Stored procedures: $proc_count"
    
    # Test a stored procedure
    print_info "Testing stored procedures..."
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "CALL GetDashboardAnalytics();" >/dev/null 2>&1
    if [[ $? -eq 0 ]]; then
        print_status "Stored procedures working correctly"
    else
        print_warning "Stored procedures may not be working correctly"
    fi
}

# Function to display connection information
display_connection_info() {
    print_section "Database Connection Information"
    
    echo ""
    echo "📋 Connection Details:"
    echo "   Host: $DB_HOST"
    echo "   Port: $DB_PORT"
    echo "   Database: $DB_NAME"
    echo "   Username: $DB_USER"
    echo "   Password: [HIDDEN]"
    echo ""
    echo "🔗 Connection String for Applications:"
    echo "   MySQL URL: mysql://$DB_USER:[PASSWORD]@$DB_HOST:$DB_PORT/$DB_NAME"
    echo "   JDBC URL:  jdbc:mysql://$DB_HOST:$DB_PORT/$DB_NAME?useUnicode=true&characterEncoding=utf8mb4"
    echo ""
    echo "🧪 Test Connection:"
    echo "   mysql -h$DB_HOST -P$DB_PORT -u$DB_USER -p$DB_PASSWORD $DB_NAME"
    echo ""
    echo "📱 Flutter App Configuration:"
    echo "   Update your environment variables:"
    echo "   DB_HOST=$DB_HOST"
    echo "   DB_PORT=$DB_PORT"
    echo "   DB_USER=$DB_USER"
    echo "   DB_PASSWORD=$DB_PASSWORD"
    echo "   DB_NAME=$DB_NAME"
    echo ""
}

# Function to show performance recommendations
show_performance_recommendations() {
    print_section "Performance Recommendations"
    
    echo ""
    echo "🚀 For Production Deployment:"
    echo ""
    echo "1. 💾 Memory Configuration:"
    echo "   - Minimum RAM: 8GB (16GB recommended)"
    echo "   - InnoDB Buffer Pool: 4-6GB"
    echo "   - Query Cache: 256MB-512MB"
    echo ""
    echo "2. 🗄️ Storage Configuration:"
    echo "   - Use SSD storage for better I/O performance"
    echo "   - Enable InnoDB file-per-table"
    echo "   - Configure proper backup strategy"
    echo ""
    echo "3. 🔧 Optimization Settings:"
    echo "   - Enable slow query log"
    echo "   - Monitor and optimize long-running queries"
    echo "   - Regular ANALYZE TABLE for statistics"
    echo ""
    echo "4. 📈 Scaling for 100M+ Components:"
    echo "   - Consider table partitioning for scan_history"
    echo "   - Implement read replicas for reporting"
    echo "   - Use connection pooling in applications"
    echo ""
    echo "5. 🛡️ Security Recommendations:"
    echo "   - Change default passwords"
    echo "   - Use SSL/TLS for connections"
    echo "   - Regular security updates"
    echo "   - Implement proper backup encryption"
    echo ""
}

# Function to create backup script
create_backup_script() {
    print_section "Creating backup script"
    
    cat > backup_database.sh << 'EOF'
#!/bin/bash
# Railway QR Tracker Database Backup Script
# Smart India Hackathon 2025

# Configuration
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-"railway_user"}
DB_PASSWORD=${DB_PASSWORD:-"railway_pass123"}
DB_NAME=${DB_NAME:-"railway_qr_tracker"}
BACKUP_DIR=${BACKUP_DIR:-"./backups"}
RETENTION_DAYS=${RETENTION_DAYS:-30}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
BACKUP_FILE="$BACKUP_DIR/railway_qr_tracker_$(date +%Y%m%d_%H%M%S).sql"

echo "🗄️ Creating database backup..."
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"

# Create backup with compression
mysqldump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --opt \
    --quick \
    --lock-tables=false \
    "$DB_NAME" | gzip > "$BACKUP_FILE.gz"

if [[ $? -eq 0 ]]; then
    echo "✅ Backup created successfully: $BACKUP_FILE.gz"
    
    # Show backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
    echo "📏 Backup size: $BACKUP_SIZE"
    
    # Clean up old backups
    find "$BACKUP_DIR" -name "railway_qr_tracker_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "🧹 Old backups cleaned up (older than $RETENTION_DAYS days)"
else
    echo "❌ Backup failed"
    exit 1
fi
EOF
    
    chmod +x backup_database.sh
    print_status "Backup script created: backup_database.sh"
    print_info "Run './backup_database.sh' to create database backups"
}

# Main execution function
main() {
    echo "🚂 Railway QR Tracker Database Setup"
    echo "Smart India Hackathon 2025"
    echo "===================================="
    echo ""
    
    # Pre-setup checks
    check_mysql_service
    check_mysql
    
    # Database setup
    setup_database
    apply_mysql_optimizations
    import_schema
    verify_setup
    
    # Post-setup tasks
    create_backup_script
    display_connection_info
    show_performance_recommendations
    
    echo ""
    print_status "🎉 Railway QR Tracker Database Setup Completed Successfully!"
    echo ""
    print_info "🏆 System ready for Smart India Hackathon 2025!"
    print_info "📱 Your Flutter app can now connect to the database"
    print_info "🖥️ Backend API server can access all data"
    print_info "📊 Dashboard analytics are ready to display"
    echo ""
    print_warning "🔐 Remember to:"
    print_warning "   1. Change default passwords in production"
    print_warning "   2. Configure SSL/TLS for secure connections"
    print_warning "   3. Set up regular automated backups"
    print_warning "   4. Monitor database performance"
    echo ""
    
    # Final verification
    echo "🧪 Final System Check:"
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
        SELECT 
            '🚂 Railway QR Tracker Database' as system_name,
            '$DB_NAME' as database_name,
            (SELECT COUNT(*) FROM components) as total_components,
            (SELECT COUNT(*) FROM scan_history) as total_scans,
            (SELECT COUNT(*) FROM quality_reports) as quality_reports,
            (SELECT COUNT(*) FROM users) as total_users,
            '✅ READY FOR SIH 2025!' as status;
    "
}

# Error handling
trap 'print_error "Script interrupted"; exit 1' INT TERM

# Execute main function with all arguments
main "$@"
