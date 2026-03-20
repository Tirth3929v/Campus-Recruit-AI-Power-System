import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './MyApplications.module.css';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        // Ensure this endpoint matches your backend route
        const { data } = await axios.get('/api/jobs/my-applications', config);
        setApplications(data);
        setLoading(false);
      } catch (err) {
        setError(
          err.response && err.response.data.message
            ? err.response.data.message
            : err.message
        );
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'interview':
        return styles.statusInterview;
      case 'rejected':
        return styles.statusRejected;
      case 'offered':
        return styles.statusOffered;
      default:
        return styles.statusApplied;
    }
  };

  if (loading) return <div className={styles.loading}>Loading applications...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Applications</h1>
      {applications.length === 0 ? (
        <div className={styles.empty}>You haven't applied to any jobs yet.</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Applied Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id}>
                  <td>{app.job ? app.job.title : 'Job Removed'}</td>
                  <td>{app.job ? app.job.company : 'N/A'}</td>
                  <td>{new Date(app.createdAt || app._id.getTimestamp()).toLocaleDateString()}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(app.status)}`}>
                      {app.status || 'Applied'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyApplications;