import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Login.module.css';
import Input from './Input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      if (user.role === 'student') navigate('/student');
      else if (user.role === 'employee' || user.role === 'admin') navigate('/employee');
    }
  }, [navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        '/api/auth/login',
        { email, password },
        config
      );

      // Save user info and token to localStorage
      localStorage.setItem('userInfo', JSON.stringify(data));

      // Redirect based on role
      if (data.role === 'student') {
        navigate('/student');
      } else {
        navigate('/employee');
      }
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
        <h1 className={styles.title}>Sign In</h1>
        {error && <div role="alert" className={styles.error}>{error}</div>}
        <form onSubmit={submitHandler}>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Enter email"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Enter password"
            required
          />
          <div className={styles.forgotPassword}>
            <Link to="/forgot-password" className={styles.link}>Forgot Password?</Link>
          </div>
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className={styles.footer}>
          New Customer? <Link to="/register" className={styles.link}>Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;