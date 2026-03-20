import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './JobPostings.module.css';
import Input from '../../Input';
import BrowseJobs from '../Student/BrowseJobs'; // Reusing the job list component

const JobPostings = () => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // To trigger re-fetch in BrowseJobs

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.post('/api/jobs', formData, config);

      setMessage('Job posted successfully!');
      setFormData({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        description: '',
      });
      setRefreshKey((prev) => prev + 1); // Refresh the list below
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Failed to post job'
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await axios.delete(`/api/jobs/${id}`, config);
        setMessage('Job deleted successfully');
        setRefreshKey((prev) => prev + 1);
      } catch (err) {
        setError(err.response && err.response.data.message ? err.response.data.message : 'Failed to delete job');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Job Postings</h1>
      </div>

      <div className={styles.card}>
        <h2 className={styles.formTitle}>Post a New Job</h2>
        {message && <div className={styles.success}>{message}</div>}
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={submitHandler}>
          <div className={styles.formGrid}>
            <Input
              label="Job Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Software Engineer"
              required
            />
            <Input
              label="Company Name"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Tech Corp"
              required
            />
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Remote / New York"
              required
            />
            <div style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Job Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div className={styles.fullWidth} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Job Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Enter job details, requirements, etc."
                required
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </div>

      {/* Reuse BrowseJobs to show the list, forcing refresh with key */}
      <h2 className={styles.formTitle}>Current Job Postings</h2>
      <BrowseJobs key={refreshKey} onDelete={deleteHandler} />
    </div>
  );
};

export default JobPostings;