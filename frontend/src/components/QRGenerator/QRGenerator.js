import React, { useState } from 'react';
import { FaQrcode, FaDownload, FaCopy, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import LoadingSpinner from '../Common/LoadingSpinner';
import './QRGenerator.css';

const QRGenerator = () => {
  const [formData, setFormData] = useState({
    component_type: 'ERC',
    manufacturer: '',
    batch_number: '',
    manufacturing_date: '',
    track_section: '',
    km_post: ''
  });

  const [generatedQR, setGeneratedQR] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const componentTypes = [
    { value: 'ERC', label: 'ERC - Electronic Rail Components' },
    { value: 'RPD', label: 'RPD - Rail Platform Devices' },
    { value: 'LNR', label: 'LNR - Line Network Rails' }
  ];

  const manufacturers = [
    'KMRL Industries',
    'RINL Steel',
    'SAIL Components',
    'Tata Steel',
    'JSW Steel',
    'Hindustan Copper',
    'BHEL',
    'Custom Manufacturer'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.component_type) return 'Component type is required';
    if (!formData.manufacturer) return 'Manufacturer is required';
    if (!formData.batch_number) return 'Batch number is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedQR(data);
      } else {
        setError(data.message || 'Failed to generate QR code');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGenerate = async () => {
    if (!formData.component_type || !formData.manufacturer) {
      setError('Component type and manufacturer are required for bulk generation');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/qr/bulk-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          count: 10,
          component_type: formData.component_type,
          manufacturer: formData.manufacturer
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Successfully generated ${data.count} QR codes for demonstration!`);
      } else {
        setError(data.message || 'Bulk generation failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyQRData = () => {
    if (generatedQR?.component?.qrCode) {
      navigator.clipboard.writeText(generatedQR.component.qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQR = () => {
    if (generatedQR?.qrCodeImage) {
      const link = document.createElement('a');
      link.download = `${generatedQR.component.componentId || 'railway-qr'}.png`;
      link.href = generatedQR.qrCodeImage;
      link.click();
    }
  };

  const resetForm = () => {
    setFormData({
      component_type: 'ERC',
      manufacturer: '',
      batch_number: '',
      manufacturing_date: '',
      track_section: '',
      km_post: ''
    });
    setGeneratedQR(null);
    setError('');
  };

  if (loading) {
    return <LoadingSpinner message="Generating QR code..." size="large" />;
  }

  return (
    <div className="qr-generator">
      <div className="qr-header">
        <h2>
          <FaQrcode className="header-icon" />
          Railway QR Code Generator
        </h2>
        <p>Generate unique QR codes for railway components</p>
      </div>

      <div className="qr-content">
        <div className="qr-form-section">
          <form onSubmit={handleSubmit} className="qr-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="component_type">Component Type *</label>
                <select
                  id="component_type"
                  name="component_type"
                  value={formData.component_type}
                  onChange={handleInputChange}
                  required
                >
                  {componentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="manufacturer">Manufacturer *</label>
                <select
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Manufacturer</option>
                  {manufacturers.map(mfg => (
                    <option key={mfg} value={mfg}>{mfg}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="batch_number">Batch Number *</label>
                <input
                  type="text"
                  id="batch_number"
                  name="batch_number"
                  value={formData.batch_number}
                  onChange={handleInputChange}
                  placeholder="e.g., SIH2025_001"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="manufacturing_date">Manufacturing Date</label>
                <input
                  type="date"
                  id="manufacturing_date"
                  name="manufacturing_date"
                  value={formData.manufacturing_date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="track_section">Track Section</label>
                <input
                  type="text"
                  id="track_section"
                  name="track_section"
                  value={formData.track_section}
                  onChange={handleInputChange}
                  placeholder="e.g., DLI-001"
                />
              </div>

              <div className="form-group">
                <label htmlFor="km_post">KM Post</label>
                <input
                  type="number"
                  step="0.001"
                  id="km_post"
                  name="km_post"
                  value={formData.km_post}
                  onChange={handleInputChange}
                  placeholder="e.g., 123.450"
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                <span>⚠️ {error}</span>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                <FaQrcode />
                Generate QR Code
              </button>
              <button type="button" onClick={handleBulkGenerate} className="btn-secondary">
                <FaSpinner />
                Bulk Generate (10)
              </button>
              <button type="button" onClick={resetForm} className="btn-outline">
                Reset Form
              </button>
            </div>
          </form>
        </div>

        {generatedQR && (
          <div className="qr-result-section">
            <div className="qr-result">
              <h3>Generated QR Code</h3>
              
              <div className="qr-image-container">
                <img 
                  src={generatedQR.qrCodeImage} 
                  alt="Generated QR Code"
                  className="qr-image"
                />
              </div>

              <div className="qr-details">
                <div className="detail-row">
                  <span className="detail-label">Component ID:</span>
                  <span className="detail-value">{generatedQR.component.componentId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">QR Code:</span>
                  <span className="detail-value qr-code-text">
                    {generatedQR.component.qrCode}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{generatedQR.component.componentType}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Manufacturer:</span>
                  <span className="detail-value">{generatedQR.component.manufacturer}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value status-active">Active</span>
                </div>
              </div>

              <div className="qr-actions">
                <button onClick={copyQRData} className="btn-action">
                  {copied ? <FaCheckCircle /> : <FaCopy />}
                  {copied ? 'Copied!' : 'Copy QR Data'}
                </button>
                <button onClick={downloadQR} className="btn-action">
                  <FaDownload />
                  Download PNG
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRGenerator;
