import React, { useState, useEffect } from 'react';

const RecentActivity = ({ limit = 10 }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  
  return (
    <div className='recent-activity'>
      <h3>Recent Activity</h3>
      <div className='activity-list'>
        <p>Recent activities will appear here</p>
      </div>
    </div>
  );
};

export default RecentActivity;
