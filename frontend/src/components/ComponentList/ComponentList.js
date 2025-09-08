import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaDownload, FaEye, FaEdit, FaTrash, FaQrcode, FaSyncAlt } from 'react-icons/fa';
import LoadingSpinner from '../Common/LoadingSpinner';
import './ComponentList.css';

const ComponentList = () => {
  const [components, setComponents] = useState([]);
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const componentTypes = ['ERC', 'RPD', 'LNR'];
  const statusTypes = ['Active', 'Inactive', 'Replaced', 'Damaged'];

  useEffect(() => {
    fetchComponents();
  }, []);

  useEffect(() => {
    filterAndSortComponents();
  }, [components, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/components');
      const data = await response.json();
      
      if (data.success) {
        setComponents(data.components || []);
      } else {
        setError(data.message || 'Failed to fetch components');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortComponents = () => {
    let filtered = [...components];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(component =>
        (component.component_id || component.componentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (component.manufacturer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (component.qr_code || component.qrCode || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType) {
      filtered = filtered.filter(component => 
        (component.component_type || component.componentType) === filterType
      );
    }

    // Apply status filter
    if (filterStatus) {
      filtered = filtered.filter(component => component.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredComponents(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Component ID', 'Type', 'Manufacturer', 'Batch Number', 'Status', 'Scan Count', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredComponents.map(component => [
        component.component_id || component.componentId,
        component.component_type || component.componentType,
        component.manufacturer,
        component.batch_number || component.batchNumber,
        component.status,
        component.scan_count || component.scanCount || 0,
        new Date(component.created_at || component.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `railway_components_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterStatus('');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredComponents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentComponents = filteredComponents.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  if (loading) {
    return <LoadingSpinner message="Loading components..." size="large" />;
  }

  return (
    <div className="component-list">
      <div className="component-header">
        <h2>
          <FaQrcode className="header-icon" />
          Component Management
        </h2>
        <p>Manage and track railway components</p>
      </div>

      <div className="component-controls">
        <div className="search-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-section">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            {componentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            {statusTypes.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <button onClick={clearFilters} className="btn-clear">
            Clear Filters
          </button>
        </div>

        <div className="action-section">
          <button onClick={fetchComponents} className="btn-refresh">
            <FaSyncAlt />
            Refresh
          </button>
          <button onClick={exportToCSV} className="btn-export">
            <FaDownload />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="component-stats">
        <div className="stat-card">
          <span className="stat-number">{filteredComponents.length}</span>
          <span className="stat-label">Components</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {filteredComponents.filter(c => c.status === 'Active').length}
          </span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {filteredComponents.reduce((sum, c) => sum + (c.scan_count || c.scanCount || 0), 0)}
          </span>
          <span className="stat-label">Total Scans</span>
        </div>
      </div>

      <div className="component-table-container">
        <table className="component-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('component_id')} className="sortable">
                Component ID {sortBy === 'component_id' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('component_type')} className="sortable">
                Type {sortBy === 'component_type' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('manufacturer')} className="sortable">
                Manufacturer {sortBy === 'manufacturer' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Batch Number</th>
              <th onClick={() => handleSort('status')} className="sortable">
                Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('scan_count')} className="sortable">
                Scans {sortBy === 'scan_count' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('created_at')} className="sortable">
                Created {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentComponents.map((component, index) => (
              <tr key={component.component_id || component.componentId || index}>
                <td className="component-id">
                  {component.component_id || component.componentId}
                </td>
                <td>
                  <span className={`type-badge ${(component.component_type || component.componentType || '').toLowerCase()}`}>
                    {component.component_type || component.componentType}
                  </span>
                </td>
                <td>{component.manufacturer}</td>
                <td>{component.batch_number || component.batchNumber}</td>
                <td>
                  <span className={`status-badge ${component.status?.toLowerCase()}`}>
                    {component.status}
                  </span>
                </td>
                <td className="scan-count">
                  {component.scan_count || component.scanCount || 0}
                </td>
                <td>
                  {new Date(component.created_at || component.createdAt || Date.now()).toLocaleDateString()}
                </td>
                <td className="actions">
                  <button className="btn-action view" title="View Details">
                    <FaEye />
                  </button>
                  <button className="btn-action edit" title="Edit Component">
                    <FaEdit />
                  </button>
                  <button className="btn-action delete" title="Delete Component">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {currentComponents.length === 0 && (
          <div className="no-data">
            <FaQrcode className="no-data-icon" />
            <p>No components found</p>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>

          {renderPaginationButtons()}

          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ComponentList;
