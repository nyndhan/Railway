import React, { useState, useEffect } from 'react';
import './App.css';

// Import Components (ALL MOVED TO TOP)
import Navbar from './components/Common/Navbar';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorBoundary from './components/Common/ErrorBoundary';
import Dashboard from './components/Dashboard/Dashboard';
import QRGenerator from './components/QRGenerator/QRGenerator';
import ComponentList from './components/ComponentList/ComponentList';
import Analytics from './components/Analytics/Analytics';
import Settings from './components/Settings/Settings';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState('checking');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check API connectivity
        await checkSystemHealth();
        
        // Load user preferences
        loadUserPreferences();
        
        // Set up event listeners
        setupEventListeners();
        
        // Simulate initialization delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkSystemHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setSystemHealth(data.status || 'unknown');
    } catch (error) {
      setSystemHealth('error');
      console.warn('System health check failed:', error.message);
    }
  };

  const loadUserPreferences = () => {
    try {
      const savedTab = localStorage.getItem('railwayQrActiveTab');
      if (savedTab) {
        setActiveTab(savedTab);
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }
  };

  const setupEventListeners = () => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Save user preference
    try {
      localStorage.setItem('railwayQrActiveTab', tabId);
    } catch (error) {
      console.warn('Failed to save user preference:', error);
    }

    // Track tab change for analytics (if implemented)
    if (window.gtag) {
      window.gtag('event', 'tab_change', {
        'tab_name': tabId,
        'app_name': 'Railway QR Tracker'
      });
    }
  };

  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'qr-generator':
        return <QRGenerator />;
      case 'components':
        return <ComponentList />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard - Railway QR Tracker',
      'qr-generator': 'QR Generator - Railway QR Tracker',
      components: 'Component List - Railway QR Tracker',
      analytics: 'Analytics - Railway QR Tracker',
      settings: 'Settings - Railway QR Tracker'
    };
    return titles[activeTab] || 'Railway QR Tracker - Smart India Hackathon 2025';
  };

  // Update document title
  useEffect(() => {
    document.title = getPageTitle();
  }, [activeTab]);

  // Show loading screen during initialization
  if (loading) {
    return (
      <div className="app-loading">
        <LoadingSpinner 
          message="Initializing Railway QR Tracker..." 
          size="large" 
        />
        <div className="loading-details">
          <p>🚂 Smart India Hackathon 2025</p>
          <p>Building the future of railway asset management</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app">
        {/* Offline Indicator */}
        {!isOnline && (
          <div className="offline-banner">
            <span>⚠️ You are currently offline. Some features may be limited.</span>
          </div>
        )}

        {/* System Health Warning */}
        {systemHealth === 'error' && (
          <div className="health-warning">
            <span>🚨 System health check failed. Please check your connection to the backend server.</span>
            <button onClick={checkSystemHealth} className="retry-health">
              Retry
            </button>
          </div>
        )}

        {/* Main Navigation */}
        <Navbar 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
        />

        {/* Main Content */}
        <main className="app-main">
          <div className="app-container">
            {renderActiveComponent()}
          </div>
        </main>

        {/* App Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-left">
              <span>🏆 Smart India Hackathon 2025</span>
              <span>•</span>
              <span>Railway QR Tracker v1.0.0</span>
            </div>
            <div className="footer-center">
              <span>Revolutionizing Indian Railways Asset Management</span>
            </div>
            <div className="footer-right">
              <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
                <div className="status-dot"></div>
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
              <div className={`health-status ${systemHealth}`}>
                <div className="health-dot"></div>
                <span>{systemHealth}</span>
              </div>
            </div>
          </div>
        </footer>

        {/* Development Debug Panel (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-panel">
            <details>
              <summary>🔧 Debug Info</summary>
              <div className="debug-content">
                <p><strong>Active Tab:</strong> {activeTab}</p>
                <p><strong>Online Status:</strong> {isOnline ? 'Online' : 'Offline'}</p>
                <p><strong>System Health:</strong> {systemHealth}</p>
                <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
                <p><strong>React Version:</strong> {React.version}</p>
              </div>
            </details>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
