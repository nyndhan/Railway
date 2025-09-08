import React, { useState, useEffect } from 'react';
import { FaCog, FaSave, FaReset, FaDownload, FaUpload, FaDatabase, FaShieldAlt } from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    general: {
      systemName: 'Railway QR Tracker',
      timezone: 'Asia/Kolkata',
      language: 'en',
      autoRefresh: true,
      refreshInterval: 30
    },
    qr: {
      qrSize: 300,
      errorCorrection: 'M',
      includeTimestamp: true,
      defaultComponentType: 'ERC'
    },
    database: {
      backupFrequency: 'daily',
      retentionPeriod: 365,
      enableLogging: true,
      logLevel: 'info'
    },
    security: {
      sessionTimeout: 8,
      maxLoginAttempts: 5,
      enableTwoFactor: false,
      requireStrongPassword: true
    },
    notifications: {
      emailNotifications: true,
      smsAlerts: false,
      lowStockThreshold: 100,
      maintenanceReminders: true
    }
  });

  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: '🔧' },
    { id: 'qr', label: 'QR Settings', icon: '📱' },
    { id: 'database', label: 'Database', icon: '🗄️' },
    { id: 'security', label: 'Security', icon: '🔐' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('railwayQrSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  };

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setIsDirty(true);
    setMessage('');
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage (in production, this would be an API call)
      localStorage.setItem('railwayQrSettings', JSON.stringify(settings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsDirty(false);
      setMessage('✅ Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to save settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      localStorage.removeItem('railwayQrSettings');
      window.location.reload();
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `railway_qr_settings_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(prev => ({ ...prev, ...importedSettings }));
          setIsDirty(true);
          setMessage('✅ Settings imported successfully!');
        } catch (error) {
          setMessage('❌ Failed to import settings: Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>General Settings</h3>
      
      <div className="setting-group">
        <label>System Name</label>
        <input
          type="text"
          value={settings.general.systemName}
          onChange={(e) => handleSettingChange('general', 'systemName', e.target.value)}
        />
      </div>

      <div className="setting-group">
        <label>Timezone</label>
        <select
          value={settings.general.timezone}
          onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
        >
          <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
          <option value="UTC">UTC</option>
          <option value="America/New_York">America/New_York</option>
          <option value="Europe/London">Europe/London</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Language</label>
        <select
          value={settings.general.language}
          onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="te">తెలుగు</option>
          <option value="ta">தமிழ்</option>
        </select>
      </div>

      <div className="setting-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={settings.general.autoRefresh}
            onChange={(e) => handleSettingChange('general', 'autoRefresh', e.target.checked)}
          />
          <span>Enable Auto-refresh</span>
        </label>
      </div>

      <div className="setting-group">
        <label>Refresh Interval (seconds)</label>
        <input
          type="range"
          min="10"
          max="300"
          value={settings.general.refreshInterval}
          onChange={(e) => handleSettingChange('general', 'refreshInterval', parseInt(e.target.value))}
          disabled={!settings.general.autoRefresh}
        />
        <span className="range-value">{settings.general.refreshInterval}s</span>
      </div>
    </div>
  );

  const renderQRSettings = () => (
    <div className="settings-section">
      <h3>QR Code Settings</h3>
      
      <div className="setting-group">
        <label>QR Code Size (pixels)</label>
        <input
          type="range"
          min="100"
          max="500"
          value={settings.qr.qrSize}
          onChange={(e) => handleSettingChange('qr', 'qrSize', parseInt(e.target.value))}
        />
        <span className="range-value">{settings.qr.qrSize}px</span>
      </div>

      <div className="setting-group">
        <label>Error Correction Level</label>
        <select
          value={settings.qr.errorCorrection}
          onChange={(e) => handleSettingChange('qr', 'errorCorrection', e.target.value)}
        >
          <option value="L">Low (7%)</option>
          <option value="M">Medium (15%)</option>
          <option value="Q">Quartile (25%)</option>
          <option value="H">High (30%)</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Default Component Type</label>
        <select
          value={settings.qr.defaultComponentType}
          onChange={(e) => handleSettingChange('qr', 'defaultComponentType', e.target.value)}
        >
          <option value="ERC">ERC - Electronic Rail Components</option>
          <option value="RPD">RPD - Rail Platform Devices</option>
          <option value="LNR">LNR - Line Network Rails</option>
        </select>
      </div>

      <div className="setting-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={settings.qr.includeTimestamp}
            onChange={(e) => handleSettingChange('qr', 'includeTimestamp', e.target.checked)}
          />
          <span>Include Timestamp in QR Code</span>
        </label>
      </div>
    </div>
  );

  const renderDatabaseSettings = () => (
    <div className="settings-section">
      <h3>Database Settings</h3>
      
      <div className="setting-group">
        <label>Backup Frequency</label>
        <select
          value={settings.database.backupFrequency}
          onChange={(e) => handleSettingChange('database', 'backupFrequency', e.target.value)}
        >
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Data Retention Period (days)</label>
        <input
          type="number"
          min="30"
          max="3650"
          value={settings.database.retentionPeriod}
          onChange={(e) => handleSettingChange('database', 'retentionPeriod', parseInt(e.target.value))}
        />
      </div>

      <div className="setting-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={settings.database.enableLogging}
            onChange={(e) => handleSettingChange('database', 'enableLogging', e.target.checked)}
          />
          <span>Enable Database Logging</span>
        </label>
      </div>

      <div className="setting-group">
        <label>Log Level</label>
        <select
          value={settings.database.logLevel}
          onChange={(e) => handleSettingChange('database', 'logLevel', e.target.value)}
          disabled={!settings.database.enableLogging}
        >
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>
      </div>

      <div className="database-actions">
        <button className="btn-action backup">
          <FaDatabase />
          Create Backup
        </button>
        <button className="btn-action optimize">
          <FaCog />
          Optimize Database
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <h3>Security Settings</h3>
      
      <div className="setting-group">
        <label>Session Timeout (hours)</label>
        <input
          type="range"
          min="1"
          max="24"
          value={settings.security.sessionTimeout}
          onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
        />
        <span className="range-value">{settings.security.sessionTimeout}h</span>
      </div>

      <div className="setting-group">
        <label>Maximum Login Attempts</label>
        <input
          type="number"
          min="3"
          max="10"
          value={settings.security.maxLoginAttempts}
          onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
        />
      </div>

      <div className="setting-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={settings.security.enableTwoFactor}
            onChange={(e) => handleSettingChange('security', 'enableTwoFactor', e.target.checked)}
          />
          <span>Enable Two-Factor Authentication</span>
        </label>
      </div>

      <div className="setting-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={settings.security.requireStrongPassword}
            onChange={(e) => handleSettingChange('security', 'requireStrongPassword', e.target.checked)}
          />
          <span>Require Strong Passwords</span>
        </label>
      </div>

      <div className="security-info">
        <div className="security-item">
          <FaShieldAlt className="security-icon" />
          <div>
            <h4>Password Requirements</h4>
            <p>Minimum 8 characters, including uppercase, lowercase, numbers, and symbols</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h3>Notification Settings</h3>
      
      <div className="setting-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={settings.notifications.emailNotifications}
            onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
          />
          <span>Enable Email Notifications</span>
        </label>
      </div>

      <div className="setting-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={settings.notifications.smsAlerts}
            onChange={(e) => handleSettingChange('notifications', 'smsAlerts', e.target.checked)}
          />
          <span>Enable SMS Alerts</span>
        </label>
      </div>

      <div className="setting-group">
        <label>Low Stock Threshold</label>
        <input
          type="number"
          min="10"
          max="1000"
          value={settings.notifications.lowStockThreshold}
          onChange={(e) => handleSettingChange('notifications', 'lowStockThreshold', parseInt(e.target.value))}
        />
      </div>

      <div className="setting-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={settings.notifications.maintenanceReminders}
            onChange={(e) => handleSettingChange('notifications', 'maintenanceReminders', e.target.checked)}
          />
          <span>Enable Maintenance Reminders</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="settings">
      <div className="settings-header">
        <h2>
          <FaCog className="header-icon" />
          System Settings
        </h2>
        <p>Configure your Railway QR Tracker system</p>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          <div className="settings-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="settings-actions">
            <div className="import-export">
              <button onClick={exportSettings} className="btn-export">
                <FaDownload />
                Export Settings
              </button>
              
              <label className="btn-import">
                <FaUpload />
                Import Settings
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="settings-content">
          <div className="settings-panel">
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'qr' && renderQRSettings()}
            {activeTab === 'database' && renderDatabaseSettings()}
            {activeTab === 'security' && renderSecuritySettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
          </div>

          <div className="settings-footer">
            {message && (
              <div className={`settings-message ${message.includes('❌') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}
            
            <div className="footer-actions">
              <button onClick={resetSettings} className="btn-reset">
                <FaReset />
                Reset to Defaults
              </button>
              
              <button
                onClick={saveSettings}
                disabled={!isDirty || saving}
                className={`btn-save ${isDirty ? 'dirty' : ''}`}
              >
                <FaSave />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
