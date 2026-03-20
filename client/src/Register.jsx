import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Register.module.css';
import Input from './Input';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
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
        '/api/auth/register',
        { name, email, password, role },
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
        <h1 className={styles.title}>Create Account</h1>
        {error && <div role="alert" className={styles.error}>{error}</div>}
        <form onSubmit={submitHandler}>
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Enter full name"
            required
          />
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
          <div className={styles.formGroupLast}>
            <label className={styles.label}>I am a...</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className={styles.select}>
              <option value="student">Student</option>
              <option value="employee">Employee/Recruiter</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <div className={styles.footer}>
          Already have an account? <Link to="/login" className={styles.link}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;