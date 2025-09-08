// Railway QR Tracker - Pure Node.js Server (No packages needed!)
const http = require('http');
const url = require('url');

const port = 3000;

// In-memory data
const components = new Map();
const sampleData = [
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
];

// Load sample data
sampleData.forEach(comp => components.set(comp.qrCode, comp));

function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  console.log(`${new Date().toISOString()} - ${req.method} ${path}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (path === '/' && req.method === 'GET') {
    sendJSON(res, {
      message: '🚂 Railway QR Tracker Backend',
      status: 'Working!',
      version: '1.0.0',
      components: components.size,
      timestamp: new Date().toISOString()
    });
    
  } else if (path === '/api/health') {
    sendJSON(res, {
      status: 'healthy',
      service: 'Railway QR Tracker',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      components: components.size
    });
    
  } else if (path.includes('/api/qr/') && path.endsWith('/decode')) {
    const qrCode = path.split('/')[3];
    const component = components.get(qrCode) || {
      componentId: `DEMO-${Date.now()}`,
      qrCode: qrCode,
      componentType: 'ERC', 
      manufacturer: 'Demo Manufacturer',
      status: 'Active'
    };
    
    sendJSON(res, {
      success: true,
      component: component
    });
    
  } else if (path === '/api/components') {
    sendJSON(res, {
      success: true,
      components: Array.from(components.values()),
      totalCount: components.size
    });
    
  } else if (path === '/api/analytics/dashboard') {
    sendJSON(res, {
      success: true,
      analytics: {
        totalComponents: components.size,
        dailyScans: 25,
        componentsByType: { ERC: 1, RPD: 1, LNR: 0 },
        systemHealth: 'healthy'
      }
    });
    
  } else {
    sendJSON(res, {
      error: 'Not found',
      path: path,
      availableEndpoints: ['/', '/api/health', '/api/components', '/api/analytics/dashboard']
    }, 404);
  }
});

server.listen(port, () => {
  console.log('🚂 Railway QR Tracker Backend');
  console.log('============================');
  console.log(`🚀 Server: http://localhost:${port}`);
  console.log(`🔗 Health: http://localhost:${port}/api/health`);
  console.log('✅ NO package.json needed!');
  console.log('🏆 Ready for Smart India Hackathon!');
});
