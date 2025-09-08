import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = '#007bff', 
  text = '', 
  className = '' 
}) => {
  const sizeClass = `spinner-${size}`;
  
  return (
    <div className={`loading-spinner-container ${className}`}>
      <div 
        className={`loading-spinner ${sizeClass}`}
        style={{ borderTopColor: color }}
      >
        <div className="spinner-inner"></div>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
    