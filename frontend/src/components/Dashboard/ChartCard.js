import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import './ChartCard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const ChartCard = ({ 
  title, 
  type, 
  data, 
  options = {}, 
  loading = false,
  error = null 
}) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12
          },
          padding: 15
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  const mergedOptions = { ...defaultOptions, ...options };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="chart-loading">
          <div className="chart-skeleton"></div>
          <p>Loading chart data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="chart-error">
          <div className="error-icon">⚠️</div>
          <p>Failed to load chart</p>
          <small>{error}</small>
        </div>
      );
    }

    if (!data || !data.datasets || data.datasets.length === 0) {
      return (
        <div className="chart-no-data">
          <div className="no-data-icon">📊</div>
          <p>No data available</p>
          <small>Data will appear when components are added</small>
        </div>
      );
    }

    switch (type) {
      case 'bar':
        return <Bar data={data} options={mergedOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={mergedOptions} />;
      case 'line':
        return <Line data={data} options={mergedOptions} />;
      default:
        return <div className="chart-error">Unsupported chart type: {type}</div>;
    }
  };

  return (
    <motion.div 
      className="chart-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="chart-card-header">
        <h3>{title}</h3>
        <div className="chart-controls">
          {/* Future: Add chart type switcher, export buttons, etc. */}
        </div>
      </div>
      <div className="chart-card-body">
        {renderChart()}
      </div>
    </motion.div>
  );
};

export default ChartCard;
