import React, { useState, useEffect } from 'react';
import { FaChartLine, FaChartBar, FaChartPie, FaDownload, FaCalendarAlt, FaSyncAlt } from 'react-icons/fa';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Analytics.css';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  const dateRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  useEffect(() => {
    fetchAnalytics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      setError('');
      
      const response = await fetch('/api/analytics/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        setError(data.message || 'Failed to fetch analytics data');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const exportReport = () => {
    if (!analytics) return;

    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange: dateRange,
      summary: {
        totalComponents: analytics.totalComponents,
        dailyScans: analytics.dailyScans,
        systemHealth: analytics.systemHealth,
        activeComponents: analytics.statusDistribution?.Active || 0
      },
      componentsByType: analytics.componentsByType,
      statusDistribution: analytics.statusDistribution,
      performanceMetrics: analytics.performanceMetrics,
      businessMetrics: analytics.businessMetrics
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `railway_analytics_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <LoadingSpinner message="Loading analytics data..." size="large" />;
  }

  if (error) {
    return (
      <div className="analytics-error">
        <div className="error-content">
          <h3>⚠️ Analytics Error</h3>
          <p>{error}</p>
          <button onClick={fetchAnalytics} className="btn-retry">
            <FaSyncAlt />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-no-data">
        <h3>📊 No Analytics Data</h3>
        <p>Analytics data is not available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h2>
            <FaChartLine className="header-icon" />
            Analytics Dashboard
          </h2>
          <p>Comprehensive insights into railway operations</p>
        </div>
        
        <div className="header-controls">
          <div className="date-selector">
            <FaCalendarAlt className="calendar-icon" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="date-select"
            >
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={fetchAnalytics}
            className={`btn-refresh ${refreshing ? 'refreshing' : ''}`}
            disabled={refreshing}
          >
            <FaSyncAlt className={refreshing ? 'fa-spin' : ''} />
            Refresh
          </button>
          
          <button onClick={exportReport} className="btn-export">
            <FaDownload />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <h3>{analytics.totalComponents?.toLocaleString() || '0'}</h3>
            <p>Total Components</p>
            <span className="metric-change positive">+5.2% from last period</span>
          </div>
        </div>

        <div className="metric-card secondary">
          <div className="metric-icon">📱</div>
          <div className="metric-content">
            <h3>{analytics.dailyScans?.toLocaleString() || '0'}</h3>
            <p>Daily Scans</p>
            <span className="metric-change positive">+12.8% from yesterday</span>
          </div>
        </div>

        <div className="metric-card tertiary">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <h3>{analytics.statusDistribution?.Active?.toLocaleString() || '0'}</h3>
            <p>Active Components</p>
            <span className="metric-change neutral">Same as last period</span>
          </div>
        </div>

        <div className="metric-card quaternary">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>{analytics.businessMetrics?.costSavings || '₹4,000+ Crores'}</h3>
            <p>Annual Savings</p>
            <span className="metric-change positive">Projected impact</span>
          </div>
        </div>
      </div>

      <div className="analytics-content">
        {/* Component Types Chart */}
        <div className="chart-section">
          <div className="chart-card">
            <div className="chart-header">
              <h3>
                <FaChartPie />
                Component Distribution by Type
              </h3>
            </div>
            <div className="chart-content">
              <div className="pie-chart">
                {Object.entries(analytics.componentsByType || {}).map(([type, count], index) => {
                  const total = Object.values(analytics.componentsByType || {}).reduce((sum, val) => sum + val, 0);
                  const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                  const colors = ['#667eea', '#764ba2', '#f093fb'];
                  
                  return (
                    <div key={type} className="pie-item">
                      <div
                        className="pie-segment"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      ></div>
                      <div className="pie-label">
                        <span className="pie-type">{type}</span>
                        <span className="pie-count">{count?.toLocaleString()}</span>
                        <span className="pie-percentage">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="chart-section">
          <div className="chart-card">
            <div className="chart-header">
              <h3>
                <FaChartBar />
                Component Status Distribution
              </h3>
            </div>
            <div className="chart-content">
              <div className="bar-chart">
                {Object.entries(analytics.statusDistribution || {}).map(([status, count]) => {
                  const maxCount = Math.max(...Object.values(analytics.statusDistribution || {}));
                  const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  const statusColors = {
                    Active: '#10b981',
                    Inactive: '#6b7280',
                    Replaced: '#f59e0b',
                    Damaged: '#ef4444'
                  };
                  
                  return (
                    <div key={status} className="bar-item">
                      <div className="bar-label">
                        <span>{status}</span>
                        <span className="bar-count">{count?.toLocaleString()}</span>
                      </div>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${width}%`,
                            backgroundColor: statusColors[status] || '#6b7280'
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="chart-section full-width">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Performance Metrics</h3>
            </div>
            <div className="performance-grid">
              {analytics.performanceMetrics && Object.entries(analytics.performanceMetrics).map(([key, value]) => (
                <div key={key} className="performance-item">
                  <div className="performance-label">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                  <div className="performance-value">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="chart-section full-width">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Recent Scan Activity</h3>
            </div>
            <div className="recent-scans">
              {analytics.recentScans && analytics.recentScans.length > 0 ? (
                <div className="scans-list">
                  {analytics.recentScans.map((scan, index) => (
                    <div key={scan.id || index} className="scan-item">
                      <div className="scan-icon">📱</div>
                      <div className="scan-details">
                        <div className="scan-qr">{scan.qrCode}</div>
                        <div className="scan-meta">
                          <span className="scan-user">{scan.scannedBy}</span>
                          <span className="scan-location">{scan.location}</span>
                          <span className="scan-time">
                            {new Date(scan.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="scan-status success">✅</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-scans">
                  <p>No recent scan activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Business Impact */}
        <div className="chart-section full-width">
          <div className="chart-card business-impact">
            <div className="chart-header">
              <h3>Business Impact Analysis</h3>
            </div>
            <div className="impact-grid">
              <div className="impact-item">
                <div className="impact-icon">💰</div>
                <div className="impact-content">
                  <h4>Cost Savings</h4>
                  <p className="impact-value">{analytics.businessMetrics?.costSavings || '₹4,000+ Crores'}</p>
                  <p className="impact-desc">Annual projected savings through digital tracking</p>
                </div>
              </div>
              
              <div className="impact-item">
                <div className="impact-icon">📈</div>
                <div className="impact-content">
                  <h4>ROI</h4>
                  <p className="impact-value">{analytics.businessMetrics?.roi || '2,400%'}</p>
                  <p className="impact-desc">Return on investment for QR implementation</p>
                </div>
              </div>
              
              <div className="impact-item">
                <div className="impact-icon">⚡</div>
                <div className="impact-content">
                  <h4>Efficiency Gain</h4>
                  <p className="impact-value">{analytics.businessMetrics?.efficiency || '60%'}</p>
                  <p className="impact-desc">Improvement in asset management efficiency</p>
                </div>
              </div>
              
              <div className="impact-item">
                <div className="impact-icon">👁️</div>
                <div className="impact-content">
                  <h4>Asset Visibility</h4>
                  <p className="impact-value">{analytics.businessMetrics?.assetVisibility || '100%'}</p>
                  <p className="impact-desc">Real-time visibility of tracked components</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-footer">
        <p>📊 Smart India Hackathon 2025 - Railway QR Tracker Analytics</p>
        <p>Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default Analytics;
