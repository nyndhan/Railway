import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // You could send error to logging service here
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ isRetrying: true });
    
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false
      });
    }, 1000);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          margin: '2rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <FaExclamationTriangle 
            style={{ 
              fontSize: '3rem', 
              color: '#dc2626', 
              marginBottom: '1.5rem' 
            }} 
          />
          
          <h2 style={{ 
            color: '#991b1b', 
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>
            🚂 Something went wrong in Railway QR Tracker
          </h2>
          
          <p style={{ 
            color: '#7f1d1d', 
            marginBottom: '2rem',
            fontSize: '1.1rem'
          }}>
            We encountered an unexpected error. Don't worry, your data is safe.
          </p>

          <button
            onClick={this.handleRetry}
            disabled={this.state.isRetrying}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: this.state.isRetrying ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: this.state.isRetrying ? 0.7 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            <FaRedo className={this.state.isRetrying ? 'fa-spin' : ''} />
            {this.state.isRetrying ? 'Retrying...' : 'Try Again'}
          </button>

          {process.env.NODE_ENV === 'development' && (
            <details style={{ 
              marginTop: '2rem', 
              textAlign: 'left',
              background: '#ffffff',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: 'bold',
                color: '#374151',
                marginBottom: '1rem'
              }}>
                🔧 Developer Details
              </summary>
              <pre style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280',
                overflow: 'auto',
                background: '#f9fafb',
                padding: '1rem',
                borderRadius: '4px'
              }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}

          <div style={{ 
            marginTop: '2rem', 
            fontSize: '0.875rem', 
            color: '#6b7280' 
          }}>
            <p>Smart India Hackathon 2025 | Railway QR Tracker v1.0</p>
            <p>If this problem persists, please contact the development team.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
