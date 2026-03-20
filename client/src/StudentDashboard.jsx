import React from 'react';

const StudentDashboard = () => {
  const stats = [
    { name: 'Applications Sent', value: '15', color: '#3b82f6' },
    { name: 'Interviews Scheduled', value: '3', color: '#10b981' },
    { name: 'Profile Views', value: '28', color: '#f59e0b' },
    { name: 'Saved Jobs', value: '7', color: '#8b5cf6' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#111827' }}>Student Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {stats.map((stat) => (
          <div key={stat.name} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${stat.color}` }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>{stat.name}</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#111827' }}>Upcoming Interviews</h3>
        <div style={{ color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p>• Tech Corp - Frontend Dev - Tomorrow, 10:00 AM</p>
          <p>• Startup Inc - Full Stack - Friday, 2:00 PM</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;