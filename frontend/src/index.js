import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Service Worker Registration (optional)
// import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA capabilities (optional)
// serviceWorkerRegistration.register();

// Performance monitoring (optional)
if (process.env.NODE_ENV === 'development') {
  console.log('🚂 Railway QR Tracker - Smart India Hackathon 2025');
  console.log('🎯 Development mode active');
  console.log('📱 Frontend initialized successfully');
}
