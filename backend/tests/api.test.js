const request = require('supertest');
const app = require('../server');

describe('Railway QR Tracker API Tests', () => {
  
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('QR Code Operations', () => {
    it('should decode a QR code', async () => {
      const qrCode = 'QR_ERC_DEMO_001_KMRL_2025';
      
      const response = await request(app)
        .get(`/api/qr/${qrCode}/decode`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.component).toHaveProperty('qrCode', qrCode);
      expect(response.body.component).toHaveProperty('componentType');
      expect(response.body.component).toHaveProperty('manufacturer');
    });

    it('should record a scan', async () => {
      const scanData = {
        qrCode: 'QR_ERC_TEST_SCAN_001',
        scannedBy: 'test_user',
        location: 'Test Location',
        deviceInfo: {
          platform: 'Android',
          version: '13'
        }
      };

      const response = await request(app)
        .post('/api/qr/scan')
        .send(scanData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('scanId');
      expect(response.body.message).toContain('recorded successfully');
    });

    it('should generate a QR code', async () => {
      const componentData = {
        component_type: 'ERC',
        manufacturer: 'Test Manufacturer',
        batch_number: 'TEST_BATCH_001',
        track_section: 'TEST-001',
        km_post: 123.456
      };

      const response = await request(app)
        .post('/api/qr/generate')
        .send(componentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.component).toHaveProperty('componentType', 'ERC');
      expect(response.body.component).toHaveProperty('manufacturer', 'Test Manufacturer');
      expect(response.body).toHaveProperty('qrCodeImage');
      expect(response.body.qrCodeImage).toMatch(/^data:image\/png;base64,/);
    });

    it('should validate QR generation input', async () => {
      const invalidData = {
        component_type: 'INVALID',
        manufacturer: ''
      };

      const response = await request(app)
        .post('/api/qr/generate')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should handle bulk QR generation', async () => {
      const bulkData = {
        count: 5,
        component_type: 'RPD',
        manufacturer: 'Test Bulk Manufacturer'
      };

      const response = await request(app)
        .post('/api/qr/bulk-generate')
        .send(bulkData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(5);
      expect(response.body.components).toHaveLength(5);
      expect(response.body.components[0]).toHaveProperty('componentType', 'RPD');
    });
  });

  describe('Components Management', () => {
    it('should fetch components list', async () => {
      const response = await request(app)
        .get('/api/components')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('components');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('totalCount');
    });

    it('should fetch components with filters', async () => {
      const response = await request(app)
        .get('/api/components?component_type=ERC&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.components).toBeDefined();
      expect(response.body.pagination.limit).toBe(10);
    });

    it('should fetch single component by ID', async () => {
      // First generate a component to get an ID
      const generateResponse = await request(app)
        .post('/api/qr/generate')
        .send({
          component_type: 'ERC',
          manufacturer: 'Test Manufacturer',
          batch_number: 'TEST_SINGLE_001'
        });

      const componentId = generateResponse.body.component.componentId;

      const response = await request(app)
        .get(`/api/components/${componentId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.component).toHaveProperty('componentId', componentId);
    });

    it('should return 404 for non-existent component', async () => {
      const response = await request(app)
        .get('/api/components/NON_EXISTENT_ID')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Component not found');
    });
  });

  describe('Analytics Dashboard', () => {
    it('should fetch dashboard analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.analytics).toHaveProperty('totalComponents');
      expect(response.body.analytics).toHaveProperty('dailyScans');
      expect(response.body.analytics).toHaveProperty('componentsByType');
      expect(response.body.analytics).toHaveProperty('statusDistribution');
      expect(response.body.analytics).toHaveProperty('performanceMetrics');
      expect(response.body.analytics.componentsByType).toHaveProperty('ERC');
      expect(response.body.analytics.componentsByType).toHaveProperty('RPD');
      expect(response.body.analytics.componentsByType).toHaveProperty('LNR');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body).toHaveProperty('path');
      expect(response.body).toHaveProperty('method');
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/qr/generate')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should implement rate limiting', async () => {
      // This test would need to make many requests quickly
      // For demo purposes, we just verify the structure
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      // Rate limiting headers should be present
      expect(response.headers).toHaveProperty('x-ratelimit-limit');
    });
  });

  describe('CORS Headers', () => {
    it('should include proper CORS headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});
