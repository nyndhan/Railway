const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

class QRCodeGenerator {
  constructor() {
    this.defaultOptions = {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    };
  }

  async generateQRCode(data, options = {}) {
    try {
      const qrOptions = { ...this.defaultOptions, ...options };
      const qrCodeImage = await QRCode.toDataURL(data, qrOptions);
      
      return {
        success: true,
        qrCode: data,
        qrCodeImage,
        options: qrOptions
      };
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  async generateQRCodeBuffer(data, options = {}) {
    try {
      const qrOptions = { ...this.defaultOptions, ...options };
      const buffer = await QRCode.toBuffer(data, qrOptions);
      
      return {
        success: true,
        qrCode: data,
        buffer,
        options: qrOptions
      };
    } catch (error) {
      throw new Error(`Failed to generate QR code buffer: ${error.message}`);
    }
  }

  generateComponentQRCode(componentData) {
    const { component_type, manufacturer, batch_number } = componentData;
    const timestamp = Date.now().toString(36).toUpperCase();
    
    // Create unique QR code string for railway components
    const qrCodeData = `QR_${component_type}_${timestamp}_${manufacturer.replace(/\s+/g, '_')}_2025_${batch_number}`;
    
    return qrCodeData;
  }

  generateComponentId(componentType) {
    const timestamp = Date.now().toString(36).toUpperCase();
    return `${componentType}-${timestamp}-2025`;
  }

  validateQRCode(qrCode) {
    // Basic validation for Railway QR codes
    const qrPattern = /^QR_[A-Z]{3}_[A-Z0-9]+_[A-Z0-9_]+_2025_[A-Z0-9_]+$/;
    
    if (!qrCode || typeof qrCode !== 'string') {
      return {
        isValid: false,
        error: 'QR code must be a non-empty string'
      };
    }

    if (qrCode.length < 10 || qrCode.length > 100) {
      return {
        isValid: false,
        error: 'QR code length must be between 10 and 100 characters'
      };
    }

    // Check if it matches railway QR pattern (optional)
    const matchesPattern = qrPattern.test(qrCode);
    
    return {
      isValid: true,
      matchesRailwayPattern: matchesPattern,
      componentType: matchesPattern ? qrCode.split('_')[1] : null
    };
  }

  extractComponentInfo(qrCode) {
    const validation = this.validateQRCode(qrCode);
    
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    if (!validation.matchesRailwayPattern) {
      return {
        qrCode,
        componentType: 'UNKNOWN',
        isRailwayComponent: false
      };
    }

    const parts = qrCode.split('_');
    
    return {
      qrCode,
      componentType: parts[1],
      timestamp: parts[2],
      manufacturer: parts[3].replace(/_/g, ' '),
      year: parts[4],
      batchNumber: parts[5],
      isRailwayComponent: true
    };
  }

  async generateBulkQRCodes(components) {
    const results = [];
    
    for (const componentData of components) {
      try {
        const qrCode = this.generateComponentQRCode(componentData);
        const qrImage = await this.generateQRCode(qrCode);
        
        results.push({
          success: true,
          componentData,
          qrCode,
          qrCodeImage: qrImage.qrCodeImage
        });
      } catch (error) {
        results.push({
          success: false,
          componentData,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Generate QR codes for different component types
  generateERCQRCode(manufacturer, batchNumber) {
    return this.generateComponentQRCode({
      component_type: 'ERC',
      manufacturer,
      batch_number: batchNumber
    });
  }

  generateRPDQRCode(manufacturer, batchNumber) {
    return this.generateComponentQRCode({
      component_type: 'RPD',
      manufacturer,
      batch_number: batchNumber
    });
  }

  generateLNRQRCode(manufacturer, batchNumber) {
    return this.generateComponentQRCode({
      component_type: 'LNR',
      manufacturer,
      batch_number: batchNumber
    });
  }
}

module.exports = new QRCodeGenerator();
