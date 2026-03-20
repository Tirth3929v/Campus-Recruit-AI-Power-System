import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './ForgotPassword.module.css';
import Input from './Input';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        '/api/auth/forgot-password',
        { email },
        config
      );

      setMessage(data.message);
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

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Forgot Password</h1>
        <p className={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        {error && <div role="alert" className={styles.error}>{error}</div>}
        {message && <div role="alert" className={styles.success}>{message}</div>}
        <form onSubmit={submitHandler}>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            required
          />
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div className={styles.footer}>
          <Link to="/login" className={styles.link}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;