import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './BrowseJobs.module.css';
import { useNavigate } from 'react-router-dom';

const BrowseJobs = ({ onDelete }) => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await axios.get('/api/jobs');
        setJobs(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch jobs');
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleApply = async (jobId) => {
    // Placeholder for apply logic. 
    // Note: The backend requires a resumeURL to apply.
    alert(`Application feature for job ${jobId} coming soon!`);
  };

  const filteredJobs = jobs.filter((job) => {
    const term = searchTerm.toLowerCase();
    return (
      job.title.toLowerCase().includes(term) ||
      job.company.toLowerCase().includes(term) ||
      job.location.toLowerCase().includes(term)
    );
  });

  if (loading) return <div className={styles.loading}>Loading jobs...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Available Opportunities</h1>
      
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by title, company, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.grid}>
        {filteredJobs.map((job) => (
          <div key={job._id} className={styles.card}>
            <h2 className={styles.jobTitle}>{job.title}</h2>
            <p className={styles.company}>{job.company}</p>
            <div className={styles.details}>
              <span className={styles.location}>📍 {job.location}</span>
              <span className={styles.type}>💼 {job.type}</span>
            </div>
            <p className={styles.description}>
              {job.description ? job.description.substring(0, 100) + '...' : 'No description available.'}
            </p>
            {onDelete ? (
              <div className={styles.buttonGroup}>
                <button
                  className={styles.viewCandidatesButton}
                  onClick={() => navigate(`/employee/jobs/${job._id}/candidates`)}
                >
                  View Candidates
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => onDelete(job._id)}
                >
                  Delete Job
                </button>
              </div>
            ) : (
              <button 
                className={styles.applyButton}
                onClick={() => handleApply(job._id)}
              >
                Apply Now
              </button>
            )}
          </div>
        ))}
      </div>
      {filteredJobs.length === 0 && !loading && (
        <div className={styles.empty}>
          {searchTerm ? 'No jobs found matching your search.' : 'No job postings available at the moment.'}
        </div>
      )}
    </div>
  );
};

export default BrowseJobs;