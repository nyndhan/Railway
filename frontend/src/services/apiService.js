import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for logging and auth
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp for request tracking
    config.metadata = { startTime: new Date() };
    
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
apiClient.interceptors.response.use(
  (response) => {
    // Calculate response time
    const responseTime = new Date() - response.config.metadata.startTime;
    console.log(`✅ API Response: ${response.status} ${response.config.url} (${responseTime}ms)`);
    
    return response;
  },
  (error) => {
    const responseTime = error.config?.metadata ? 
      new Date() - error.config.metadata.startTime : 0;
    
    console.error(`❌ API Error: ${error.response?.status || 'Network'} ${error.config?.url} (${responseTime}ms)`, error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      // Don't redirect to login if we don't have auth system yet
      console.warn('Authentication token expired or invalid');
    }
    
    return Promise.reject(error);
  }
);

export class ApiService {
  // Health check
  static async checkHealth() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  // QR Code operations - Perfect integration with Flutter backend
  static async decodeQR(qrCode) {
    try {
      const response = await apiClient.get(`/qr/${encodeURIComponent(qrCode)}/decode`);
      return response.data;
    } catch (error) {
      throw new Error(`QR decode failed: ${error.response?.data?.message || error.message}`);
    }
  }

  static async recordScan(scanData) {
    try {
      const response = await apiClient.post('/qr/scan', scanData);
      return response.data;
    } catch (error) {
      throw new Error(`Scan recording failed: ${error.response?.data?.message || error.message}`);
    }
  }

  static async generateQR(componentData) {
    try {
      const response = await apiClient.post('/qr/generate', componentData);
      return response.data;
    } catch (error) {
      throw new Error(`QR generation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  static async bulkGenerateQR(bulkData) {
    try {
      const response = await apiClient.post('/qr/bulk-generate', bulkData);
      return response.data;
    } catch (error) {
      throw new Error(`Bulk QR generation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Component operations
  static async getComponents(params = {}) {
    try {
      const response = await apiClient.get('/components', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch components: ${error.response?.data?.message || error.message}`);
    }
  }

  static async getComponent(componentId) {
    try {
      const response = await apiClient.get(`/components/${encodeURIComponent(componentId)}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch component: ${error.response?.data?.message || error.message}`);
    }
  }

  static async updateComponent(componentId, updateData) {
    try {
      const response = await apiClient.put(`/components/${encodeURIComponent(componentId)}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update component: ${error.response?.data?.message || error.message}`);
    }
  }

  // Analytics
  static async getDashboardAnalytics() {
    try {
      const response = await apiClient.get('/analytics/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch analytics: ${error.response?.data?.message || error.message}`);
    }
  }

  static async getDetailedAnalytics(dateRange) {
    try {
      const response = await apiClient.get('/analytics/detailed', { params: dateRange });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch detailed analytics: ${error.response?.data?.message || error.message}`);
    }
  }

  // Utility methods
  static async downloadQRCode(qrCodeImage, filename = 'qr-code.png') {
    try {
      // Convert base64 to blob
      const response = await fetch(qrCodeImage);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'QR code downloaded successfully' };
    } catch (error) {
      throw new Error(`Failed to download QR code: ${error.message}`);
    }
  }

  static async exportComponentsToCSV(components) {
    try {
      const csvHeaders = [
        'Component ID',
        'QR Code',
        'Component Type',
        'Manufacturer',
        'Batch Number',
        'Manufacturing Date',
        'Installation Date',
        'Track Section',
        'KM Post',
        'Status',
        'Scan Count',
        'Last Scanned',
        'Created At'
      ];

      const csvRows = components.map(component => [
        component.componentId || '',
        component.qrCode || '',
        component.componentType || '',
        component.manufacturer || '',
        component.batchNumber || '',
        component.manufacturingDate || '',
        component.installationDate || '',
        component.trackSection || '',
        component.kmPost || '',
        component.status || '',
        component.scanCount || 0,
        component.lastScanned ? new Date(component.lastScanned).toLocaleString() : '',
        component.createdAt ? new Date(component.createdAt).toLocaleString() : ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => 
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `railway-components-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { success: true, message: 'CSV exported successfully' };
    } catch (error) {
      throw new Error(`Failed to export CSV: ${error.message}`);
    }
  }

  static async exportAnalyticsReport(analytics, format = 'json') {
    try {
      let content, mimeType, filename;

      if (format === 'json') {
        content = JSON.stringify(analytics, null, 2);
        mimeType = 'application/json';
        filename = `railway-analytics-${new Date().toISOString().split('T')[0]}.json`;
      } else if (format === 'csv') {
        // Convert analytics to CSV format
        const csvData = [
          ['Metric', 'Value'],
          ['Total Components', analytics.totalComponents],
          ['Daily Scans', analytics.dailyScans],
          ['QR Codes Generated', analytics.qrCodesGenerated],
          ['Active Users', analytics.activeUsers],
          ['System Health', analytics.systemHealth],
          ['ERC Components', analytics.componentsByType?.ERC || 0],
          ['RPD Components', analytics.componentsByType?.RPD || 0],
          ['LNR Components', analytics.componentsByType?.LNR || 0],
          ['Active Components', analytics.statusDistribution?.Active || 0],
          ['Inactive Components', analytics.statusDistribution?.Inactive || 0],
          ['Response Time', analytics.performanceMetrics?.responseTime || 'N/A'],
          ['Success Rate', analytics.performanceMetrics?.scanSuccessRate || 'N/A']
        ];

        content = csvData.map(row => row.join(',')).join('\n');
        mimeType = 'text/csv';
        filename = `railway-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      }

      const blob = new Blob([content], { type: mimeType });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { success: true, message: `Analytics report exported as ${format.toUpperCase()}` };
    } catch (error) {
      throw new Error(`Failed to export analytics: ${error.message}`);
    }
  }

  // Error handling utilities
  static handleApiError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        type: 'server_error',
        status,
        message: data.message || data.error || 'Server error occurred',
        details: data.errors || null
      };
    } else if (error.request) {
      // Request made but no response
      return {
        type: 'network_error',
        message: 'Network error - please check your connection',
        details: 'No response from server'
      };
    } else {
      // Something else happened
      return {
        type: 'client_error',
        message: error.message || 'An unexpected error occurred',
        details: null
      };
    }
  }

  // Configuration methods
  static setAuthToken(token) {
    if (token) {
      localStorage.setItem('auth_token', token);
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem('auth_token');
      delete apiClient.defaults.headers.Authorization;
    }
  }

  static getApiUrl() {
    return API_BASE_URL;
  }

  static setTimeout(timeout) {
    apiClient.defaults.timeout = timeout;
  }

  // Performance monitoring
  static async pingServer() {
    const startTime = Date.now();
    try {
      await this.checkHealth();
      return Date.now() - startTime;
    } catch (error) {
      return -1; // Indicate failure
    }
  }

  // Batch operations for better performance
  static async batchGetComponents(componentIds) {
    try {
      const promises = componentIds.map(id => this.getComponent(id));
      const results = await Promise.allSettled(promises);
      
      return results.map((result, index) => ({
        componentId: componentIds[index],
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason.message : null
      }));
    } catch (error) {
      throw new Error(`Batch operation failed: ${error.message}`);
    }
  }
}

// Export axios instance for direct use if needed
export { apiClient };

export default ApiService;
