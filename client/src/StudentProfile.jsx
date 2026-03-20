import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './StudentProfile.module.css';
import Input from '../../Input';

const StudentProfile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (password) formData.append('password', password);
      if (resume) formData.append('resume', resume);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put(
        '/api/auth/profile',
        formData,
        config
      );

      setMessage('Profile updated successfully');
      setLoading(false);
      
      // Update local storage with new name/email
      const updatedUserInfo = { ...userInfo, name: data.name, email: data.email };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>User Profile</h2>
        {error && <div role="alert" className={styles.error}>{error}</div>}
        {message && <div role="alert" className={styles.success}>{message}</div>}
        <form onSubmit={submitHandler}>
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password (optional)"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
          <div className={styles.fileGroup}>
            <label className={styles.label}>Resume (PDF/Doc)</label>
            <input
              type="file"
              onChange={(e) => setResume(e.target.files[0])}
              className={styles.fileInput}
            />
          </div>
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;