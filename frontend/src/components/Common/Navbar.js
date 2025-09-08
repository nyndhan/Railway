import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaQrcode, FaCogs, FaChartBar, FaCog, FaBars, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard', color: '#007bff' },
    { path: '/qr-generator', icon: FaQrcode, label: 'QR Generator', color: '#28a745' },
    { path: '/components', icon: FaCogs, label: 'Components', color: '#ffc107' },
    { path: '/analytics', icon: FaChartBar, label: 'Analytics', color: '#17a2b8' },
    { path: '/settings', icon: FaCog, label: 'Settings', color: '#6c757d' }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Title */}
        <Link to="/dashboard" className="navbar-brand" onClick={closeMobileMenu}>
          <motion.div 
            className="brand-content"
            whileHover={{ scale: 1.05 }}
          >
            <span className="brand-icon">🚂</span>
            <div className="brand-text">
              <span className="brand-title">Railway QR Tracker</span>
              <span className="brand-subtitle">Smart India Hackathon 2025</span>
            </div>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-nav desktop-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
                style={{ '--nav-color': item.color }}
              >
                <motion.div
                  className="nav-content"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </motion.div>
                {isActive && (
                  <motion.div
                    className="active-indicator"
                    layoutId="activeTab"
                    style={{ backgroundColor: item.color }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Status Indicator */}
        <div className="navbar-status">
          <div className="status-dot online"></div>
          <span className="status-text">Online</span>
        </div>
      </div>

      {/* Mobile Navigation */}
      <motion.div 
        className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}
        initial={false}
        animate={isMobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mobile-nav-content">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
                style={{ '--nav-color': item.color }}
              >
                <Icon className="mobile-nav-icon" />
                <span className="mobile-nav-label">{item.label}</span>
                {isActive && <div className="mobile-active-dot" />}
              </Link>
            );
          })}
          
          {/* Mobile Footer */}
          <div className="mobile-nav-footer">
            <div className="hackathon-info">
              <span>🏆 Smart India Hackathon 2025</span>
              <small>Railway Asset Management Solution</small>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={closeMobileMenu}
        />
      )}
    </nav>
  );
};

export default Navbar;
