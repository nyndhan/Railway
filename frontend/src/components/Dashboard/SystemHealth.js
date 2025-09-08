import React, { useState, useEffect } from 'react';

const SystemHealth = () => {
  const [health, setHealth] = useState({ overall: 'healthy' });
  
  return (
    <div className='system-health'>
      <h3>System Health</h3>
      <p>Status: {health.overall}</p>
    </div>
  );
};

export default SystemHealth;
