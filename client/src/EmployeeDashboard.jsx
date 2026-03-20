import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './EmployeeDashboard.module.css';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    recentApplications: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get('/api/jobs/stats', config);
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch dashboard statistics');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className={styles.loading}>Loading dashboard...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard Overview</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Jobs Posted</span>
          <span className={styles.statValue}>{stats.totalJobs}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Applications</span>
          <span className={styles.statValue}>{stats.totalApplications}</span>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Recent Applications</h2>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Job Title</th>
              <th>Applied Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentApplications.length > 0 ? (
              stats.recentApplications.map((app) => (
                <tr key={app._id}>
                  <td>{app.applicant ? app.applicant.name : 'Unknown'}</td>
                  <td>{app.job ? app.job.title : 'Job Removed'}</td>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>{app.status || 'Applied'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{textAlign: 'center'}}>No applications yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeDashboard;