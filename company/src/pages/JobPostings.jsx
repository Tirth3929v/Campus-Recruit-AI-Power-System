import React from 'react';

const JobPostings = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#111827', margin: 0 }}>Manage Jobs</h1>
        <button style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
          + Post New Job
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '15px', color: '#4b5563', fontWeight: '600' }}>Job Title</th>
              <th style={{ padding: '15px', color: '#4b5563', fontWeight: '600' }}>Department</th>
              <th style={{ padding: '15px', color: '#4b5563', fontWeight: '600' }}>Applicants</th>
              <th style={{ padding: '15px', color: '#4b5563', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '15px', color: '#4b5563', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '15px', color: '#111827' }}>Frontend Developer</td>
              <td style={{ padding: '15px', color: '#6b7280' }}>Engineering</td>
              <td style={{ padding: '15px', color: '#6b7280' }}>12</td>
              <td style={{ padding: '15px' }}><span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.8rem' }}>Active</span></td>
              <td style={{ padding: '15px', color: '#3b82f6', cursor: 'pointer' }}>Edit</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '15px', color: '#111827' }}>Product Manager</td>
              <td style={{ padding: '15px', color: '#6b7280' }}>Product</td>
              <td style={{ padding: '15px', color: '#6b7280' }}>8</td>
              <td style={{ padding: '15px' }}><span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.8rem' }}>Active</span></td>
              <td style={{ padding: '15px', color: '#3b82f6', cursor: 'pointer' }}>Edit</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobPostings;