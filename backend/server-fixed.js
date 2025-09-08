const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Enable CORS for ALL origins (for development)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Sample data for demonstration
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
      scannedBy: 'railway_inspector',
      location: 'Delhi Junction',
      timestamp: new Date().toISOString()
    },
    {
      id: 'scan_002', 
      qrCode: 'QR_RPD_DEMO_002_RINL_2025',
      scannedBy: 'maintenance_crew',
      location: 'Mumbai Central',
      timestamp: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: 'scan_003',
      qrCode: 'QR_LNR_DEMO_003_SAIL_2025', 
      scannedBy: 'track_engineer',
      location: 'Chennai Express',
      timestamp: new Date(Date.now() - 600000).toISOString()
    }
  ],
  performanceMetrics: {
    uptime: '99.9%',
    responseTime: '85ms',
    scanSuccessRate: '98.5%',
    totalRequests: 75000,
    errorRate: '0.1%'
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
  console.log('✅ Health check requested from:', req.headers.origin);
  res.json({
    success: true,
    status: 'healthy',
    service: 'Railway QR Tracker Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'in-memory-demo',
    environment: 'development'
  });
});

// Dashboard analytics endpoint
app.get('/api/analytics/dashboard', (req, res) => {
  console.log('📊 Dashboard analytics requested from:', req.headers.origin);
  res.json({
    success: true,
    analytics: sampleData,
    timestamp: new Date().toISOString(),
    message: 'Smart India Hackathon 2025 - Demo Data'
  });
});

// Components list endpoint
app.get('/api/components', (req, res) => {
  console.log('📦 Components list requested from:', req.headers.origin);
  res.json({
    success: true,
    components: [
      {
        componentId: 'ERC-SIH2025-001',
        qrCode: 'QR_ERC_DEMO_001_KMRL_2025', 
        componentType: 'ERC',
        manufacturer: 'KMRL Industries',
        batchNumber: 'SIH2025_BATCH_001',
        status: 'Active',
        scanCount: 15,
        createdAt: new Date().toISOString()
      },
      {
        componentId: 'RPD-SIH2025-002',
        qrCode: 'QR_RPD_DEMO_002_RINL_2025',
        componentType: 'RPD', 
        manufacturer: 'RINL Steel',
        batchNumber: 'SIH2025_BATCH_002',
        status: 'Active',
        scanCount: 8,
        createdAt: new Date().toISOString()
      },
      {
        componentId: 'LNR-SIH2025-003',
        qrCode: 'QR_LNR_DEMO_003_SAIL_2025',
        componentType: 'LNR',
        manufacturer: 'SAIL Components', 
        batchNumber: 'SIH2025_BATCH_003',
        status: 'Active',
        scanCount: 12,
        createdAt: new Date().toISOString()
      }
    ],
    totalCount: 3,
    message: 'Demo component data for Smart India Hackathon 2025'
  });
});

// QR generation endpoint
app.post('/api/qr/generate', (req, res) => {
  console.log('🔧 QR generation requested:', req.body);
  const { component_type, manufacturer, batch_number } = req.body;
  
  if (!component_type || !manufacturer || !batch_number) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: component_type, manufacturer, batch_number'
    });
  }
  
  const componentId = `${component_type}-SIH2025-${Date.now()}`;
  const qrCode = `QR_${component_type}_${Date.now()}_${manufacturer.replace(/\s+/g, '_').toUpperCase()}`;
  
  res.json({
    success: true,
    component: {
      componentId: componentId,
      qrCode: qrCode,
      componentType: component_type,
      manufacturer: manufacturer,
      batchNumber: batch_number,
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    qrCodeImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    message: 'QR code generated successfully for Smart India Hackathon 2025'
  });
});

// QR scan recording endpoint
app.post('/api/qr/scan', (req, res) => {
  console.log('📱 QR scan recorded:', req.body);
  res.json({
    success: true,
    scanId: `scan_${Date.now()}`,
    message: 'QR scan recorded successfully',
    timestamp: new Date().toISOString()
  });
});

// Catch all other routes
app.get('*', (req, res) => {
  console.log(`❓ Unknown route requested: ${req.path}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.path} not found`,
    availableRoutes: [
      'GET /api/health',
      'GET /api/analytics/dashboard', 
      'GET /api/components',
      'POST /api/qr/generate',
      'POST /api/qr/scan'
    ]
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log('\n🚂 Railway QR Tracker Backend - FIXED VERSION');
  console.log('==============================================');
  console.log(`✅ Server running on: http://localhost:${port}`);
  console.log(`🌐 Network access: http://0.0.0.0:${port}`);
  console.log(`🔗 Health check: http://localhost:${port}/api/health`);
  console.log(`📊 Analytics: http://localhost:${port}/api/analytics/dashboard`);
  console.log(`📦 Components: http://localhost:${port}/api/components`);
  console.log('');
  console.log('🔥 CORS enabled for ALL origins');
  console.log('🎯 Perfect for Smart India Hackathon 2025!');
  console.log('🌐 Frontend should connect immediately!');
  console.log('\nWaiting for frontend connections...\n');
});
