import React from 'react';

const StatCard = ({ title, value, change, changeType = 'neutral', icon, color = 'primary', loading = false }) => {
  return (
    <div className='stat-card'>
      <div className='stat-content'>
        <div className='stat-header'>
          <div className='stat-title'>{title}</div>
          {icon && <div className='stat-icon'>{icon}</div>}
        </div>
        <div className='stat-value'>{loading ? <div className='stat-skeleton'></div> : <span>{value}</span>}</div>
        {change && !loading && (<div className='stat-change'><span>{change}</span></div>)}
      </div>
    </div>
  );
};

export default StatCard;
