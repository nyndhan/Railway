const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = process.env.LOG_DIR || 'logs';
    this.logFile = path.join(this.logDir, process.env.LOG_FILE || 'app.log');
    this.logLevel = process.env.LOG_LEVEL || 'info';
    
    // Ensure log directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta,
      pid: process.pid,
      hostname: require('os').hostname()
    };

    return JSON.stringify(logEntry);
  }

  writeLog(level, message, meta = {}) {
    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Console output with colors
    const colors = {
      error: '\x1b[31m',
      warn: '\x1b[33m',
      info: '\x1b[36m',
      debug: '\x1b[90m',
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[level] || ''}${formattedMessage}${colors.reset}`);
    
    // File output
    try {
      fs.appendFileSync(this.logFile, formattedMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  error(message, meta = {}) {
    this.writeLog('error', message, meta);
  }

  warn(message, meta = {}) {
    this.writeLog('warn', message, meta);
  }

  info(message, meta = {}) {
    if (['info', 'debug'].includes(this.logLevel)) {
      this.writeLog('info', message, meta);
    }
  }

  debug(message, meta = {}) {
    if (this.logLevel === 'debug') {
      this.writeLog('debug', message, meta);
    }
  }

  // HTTP request logging
  logRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      contentLength: res.get('Content-Length') || 0
    };

    if (res.statusCode >= 400) {
      this.warn('HTTP Error Response', logData);
    } else {
      this.info('HTTP Request', logData);
    }
  }

  // Error logging with stack trace
  logError(error, context = {}) {
    const errorData = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...context
    };

    this.error('Application Error', errorData);
  }

  // Railway specific logging
  logQRScan(qrCode, componentId, user) {
    this.info('QR Code Scanned', {
      qrCode,
      componentId,
      scannedBy: user,
      action: 'qr_scan'
    });
  }

  logQRGeneration(componentId, componentType, manufacturer) {
    this.info('QR Code Generated', {
      componentId,
      componentType,
      manufacturer,
      action: 'qr_generate'
    });
  }
}

module.exports = new Logger();
