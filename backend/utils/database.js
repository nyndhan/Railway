const mysql = require('mysql2/promise');

class DatabaseManager {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  async initialize() {
    try {
      const config = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'railway_user',
        password: process.env.DB_PASSWORD || 'railway_pass123',
        database: process.env.DB_NAME || 'railway_qr_tracker',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        timezone: '+05:30',
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        charset: 'utf8mb4'
      };

      this.pool = mysql.createPool(config);
      
      // Test connection
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      
      this.isConnected = true;
      console.log('✅ Database connection established');
      
      return this.pool;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  async query(sql, params = []) {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    try {
      const [results] = await this.pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Database query error:', error.message);
      throw error;
    }
  }

  async transaction(callback) {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      console.log('🔌 Database connection closed');
    }
  }

  isHealthy() {
    return this.isConnected;
  }

  // Helper methods for common operations
  async insertComponent(componentData) {
    const sql = `
      INSERT INTO components (
        component_id, qr_code, component_type, manufacturer, batch_number,
        manufacturing_date, track_section, km_post, warranty_months, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return await this.query(sql, [
      componentData.componentId,
      componentData.qrCode,
      componentData.componentType,
      componentData.manufacturer,
      componentData.batchNumber,
      componentData.manufacturingDate,
      componentData.trackSection,
      componentData.kmPost,
      componentData.warrantyMonths || 24,
      componentData.status || 'Active'
    ]);
  }

  async getComponentByQR(qrCode) {
    const sql = 'SELECT * FROM components WHERE qr_code = ? LIMIT 1';
    const results = await this.query(sql, [qrCode]);
    return results[0] || null;
  }

  async updateScanCount(componentId) {
    const sql = `
      UPDATE components 
      SET scan_count = scan_count + 1, last_scanned = CURRENT_TIMESTAMP 
      WHERE component_id = ?
    `;
    return await this.query(sql, [componentId]);
  }

  async insertScanHistory(scanData) {
    const sql = `
      INSERT INTO scan_history (
        id, component_id, qr_code, scanned_by, scan_location, device_info,
        latitude, longitude, processing_time_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return await this.query(sql, [
      scanData.id,
      scanData.componentId,
      scanData.qrCode,
      scanData.scannedBy,
      scanData.location,
      JSON.stringify(scanData.deviceInfo || {}),
      scanData.latitude,
      scanData.longitude,
      scanData.processingTime
    ]);
  }
}

module.exports = new DatabaseManager();
