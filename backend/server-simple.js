const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Sample data
const sampleData = {
  totalComponents: 15000,
  dailyScans: 1250,
  systemHealth: 'healthy',
  componentsByType: {
    ERC: 8500,
    RPD: 4500,
    LNR: 2000
  },
  statusDistribution: {
    Active: 14500,
    Inactive: 300,
    Replaced: 150,
    Damaged: 50
  },
  recentScans: [
    {
      id: 'scan_001',
      qrCode: 'QR_ERC_DEMO_001_KMRL_2025',
      scannedBy: 'mobile_user',
      location: 'Delhi Section',
      timestamp: new Date().toISOString()
    }
  ],
  performanceMetrics: {
    uptime: '99.9%',
    responseTime: '85ms',
    scanSuccessRate: '98.5%',
    totalRequests: 75000
  },
  businessMetrics: {
    costSavings: '₹4,000+ Crores',
    roi: '2,400%',
    efficiency: '60%',
    assetVisibility: '100%'
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({
    success: true,
    status: 'healthy',
    service: 'Railway QR Tracker Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'in-memory-fallback'
  });
});

// Dashboard analytics
app.get('/api/analytics/dashboard', (req, res) => {
  console.log('📊 Dashboard analytics requested');
  res.json({
    success: true,
    analytics: sampleData,
    timestamp: new Date().toISOString()
  });
});

// Components endpoint
app.get('/api/components', (req, res) => {
  console.log('📦 Components list requested');
  res.json({
    success: true,
    components: [
      {
        componentId: 'ERC-DEMO-001',
        qrCode: 'QR_ERC_DEMO_001_KMRL_2025',
        componentType: 'ERC',
        manufacturer: 'KMRL Industries',
        status: 'Active',
        scanCount: 5
      },
      {
        componentId: 'RPD-DEMO-002',
        qrCode: 'QR_RPD_DEMO_002_RINL_2025',
        componentType: 'RPD',
        manufacturer: 'RINL Steel',
        status: 'Active',
        scanCount: 3
      }
    ],
    totalCount: 2
  });
});

// QR Generate endpoint
app.post('/api/qr/generate', (req, res) => {
  console.log('🔧 QR generation requested');
  const { component_type, manufacturer, batch_number } = req.body;
  
  res.json({
    success: true,
    component: {
      componentId: `${component_type}-${Date.now()}`,
      qrCode: `QR_${component_type}_${Date.now()}_${manufacturer}`,
      componentType: component_type,
      manufacturer: manufacturer,
      batchNumber: batch_number,
      status: 'Active'
    },
    qrCodeImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    message: 'QR code generated successfully'
  });
});

// QR Scan endpoint
app.post('/api/qr/scan', (req, res) => {
  console.log('📱 QR scan recorded');
  res.json({
    success: true,
    scanId: `scan_${Date.now()}`,
    message: 'Scan recorded successfully',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log('🚂 Railway QR Tracker Backend (Simple Version)');
  console.log('===========================================');
  console.log(`✅ Server running on: http://localhost:${port}`);
  console.log(`🔗 Health check: http://localhost:${port}/api/health`);
  console.log(`📊 Analytics: http://localhost:${port}/api/analytics/dashboard`);
  console.log(`📦 Components: http://localhost:${port}/api/components`);
  console.log('');
  console.log('🎯 Ready for Smart India Hackathon 2025!');
  console.log('🌐 Frontend can now connect successfully!');
});

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
