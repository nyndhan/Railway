import React, { useState, useEffect } from 'react';
import { FaTachometerAlt, FaSyncAlt, FaDownload, FaFilter } from 'react-icons/fa';
import StatCard from './StatCard';
import ChartCard from './ChartCard';
import RecentActivity from './RecentActivity';
import SystemHealth from './SystemHealth';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  useEffect(() => {
    fetchDashboardData();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchDashboardData, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedTimeRange, autoRefresh]);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      setError('');
      
      const response = await fetch('/api/analytics/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.analytics);
      } else {
        setError(data.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Network error: Unable to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (!refreshing) {
      fetchDashboardData();
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." size="large" />;
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-content">
          <h3>⚠️ Dashboard Error</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="btn-retry">
            <FaSyncAlt />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h2>
            <FaTachometerAlt className="header-icon" />
            Railway Operations Dashboard
          </h2>
          <p>Real-time monitoring and analytics for Smart India Hackathon 2025</p>
        </div>
        
        <div className="header-controls">
          <div className="time-range-selector">
            <FaFilter className="filter-icon" />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="time-select"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleRefresh}
            className={`btn-refresh ${refreshing ? 'refreshing' : ''}`}
            disabled={refreshing}
          >
            <FaSyncAlt className={refreshing ? 'fa-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="dashboard-kpis">
        <StatCard
          title="Total Components"
          value={dashboardData?.totalComponents?.toLocaleString() || '0'}
          change="+5.2% from last period"
          changeType="positive"
          icon="📦"
          color="primary"
          loading={refreshing}
        />
        
        <StatCard
          title="Daily QR Scans"
          value={dashboardData?.dailyScans?.toLocaleString() || '0'}
          change="+12.8% from yesterday"
          changeType="positive"
          icon="📱"
          color="secondary"
          loading={refreshing}
        />
        
        <StatCard
          title="Active Components"
          value={dashboardData?.statusDistribution?.Active?.toLocaleString() || '0'}
          change="98.7% operational"
          changeType="positive"
          icon="✅"
          color="success"
          loading={refreshing}
        />
        
        <StatCard
          title="System Health"
          value={dashboardData?.systemHealth === 'healthy' ? 'Excellent' : 'Good'}
          change="99.9% uptime"
          changeType="positive"
          icon="💚"
          color="success"
          loading={refreshing}
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        <div className="dashboard-row">
          <div className="dashboard-col-8">
            <ChartCard title="Component Distribution by Type">
              <div className="component-chart">
                {dashboardData?.componentsByType && (
                  <div className="distribution-chart">
                    {Object.entries(dashboardData.componentsByType).map(([type, count], index) => {
                      const total = Object.values(dashboardData.componentsByType).reduce((sum, val) => sum + val, 0);
                      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                      const colors = ['#667eea', '#764ba2', '#f093fb'];
                      
                      return (
                        <div key={type} className="chart-item">
                          <div className="chart-bar-container">
                            <div className="chart-label">
                              <span className="chart-type">{type}</span>
                              <span className="chart-count">{count.toLocaleString()}</span>
                            </div>
                            <div className="chart-bar">
                              <div
                                className="chart-fill"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: colors[index % colors.length]
                                }}
                              ></div>
                            </div>
                            <div className="chart-percentage">{percentage}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {!dashboardData?.componentsByType && (
                  <div className="chart-placeholder">
                    <p>Component distribution data will appear here</p>
                  </div>
                )}
              </div>
            </ChartCard>
          </div>
          
          <div className="dashboard-col-4">
            <SystemHealth />
          </div>
        </div>

        <div className="dashboard-row">
          <div className="dashboard-col-12">
            <RecentActivity limit={8} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
