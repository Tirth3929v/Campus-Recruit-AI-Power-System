import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Sparkles, Rocket, Target, BookOpen, Users, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: Rocket, title: "AI-Powered Interviews", desc: "Practice with our intelligent AI interviewer" },
  { icon: Target, title: "Skill Tracking", desc: "Radar charts track your growth over time" },
  { icon: BookOpen, title: "Curated Courses", desc: "Learn from industry-expert content" },
  { icon: Users, title: "Leaderboards", desc: "Compete with peers globally" },
];

const Login = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, checkAuth } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 1) return '';
    return '';
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    if (touched.email) {
      setErrors({ ...errors, email: validateEmail(value) });
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    if (touched.password) {
      setErrors({ ...errors, password: validatePassword(value) });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    if (field === 'email') {
      setErrors({ ...errors, email: validateEmail(formData.email) });
    } else if (field === 'password') {
      setErrors({ ...errors, password: validatePassword(formData.password) });
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/student/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] flex flex-col items-center justify-center text-gray-900 dark:text-white">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400 animate-pulse">Verifying session...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/student/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrors({ email: '', password: '' });

    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      setTouched({ email: true, password: true });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/user-login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.clear();
        if (data.token) localStorage.setItem('userToken', data.token);
        localStorage.setItem('role', 'user');
        await checkAuth();
        navigate('/student/dashboard');
      } else {
        const errorMsg = data.error || 'Login failed';
        if (errorMsg.includes('User not found')) {
          setError('User not found. Please register first.');
          setErrors({ ...errors, email: 'User not found. Please register first.' });
        } else if (errorMsg.includes('Incorrect password')) {
          setError('Incorrect password.');
          setErrors({ ...errors, password: 'Incorrect password.' });
        } else if (errorMsg.includes('required')) {
          setError('Email and password are required.');
          setErrors({ email: 'Email is required', password: 'Password is required' });
          setTouched({ email: true, password: true });
        } else {
          setError(errorMsg);
        }
      }
    } catch (err) { setError('Failed to connect to server'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] flex font-sans selection:bg-purple-500/30 overflow-hidden">

      {/* ═══ Ambient Background ═════════════════════════════ */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 dark:bg-violet-900/15 blur-[150px] animate-float" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-900/15 blur-[150px] animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] rounded-full bg-pink-500/5 dark:bg-pink-900/10 blur-[120px] animate-morph-blob" />
      </div>

      {/* ═══ Left Panel — Feature Showcase ══════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex w-1/2 relative z-10 flex-col justify-center px-16 xl:px-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Campus<span className="text-gradient-vivid">Recruit</span>
            </span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
            Your AI-Powered<br />
            <span className="text-gradient-vivid">Placement Assistant</span>
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-md">
            Practice interviews, build skills, and land your dream campus placement.
          </p>
        </motion.div>

        <div className="space-y-4">
          {features.map((feature, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.6 }}
              whileHover={{ x: 8, scale: 1.02 }}
              className="flex items-center gap-4 p-4 rounded-xl glass-card cursor-default group"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                <feature.icon size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{feature.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ═══ Right Panel — Login Form ═══════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md glass-panel rounded-3xl p-8 lg:p-10"
        >
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Campus<span className="text-gradient-vivid">Recruit</span>
            </span>
          </div>

          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
            >
              Welcome Back
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-500 dark:text-gray-400"
            >
              Sign in to continue your interview preparation
            </motion.p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm text-center font-medium">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }} className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                <input type="email" required autoComplete="email" placeholder="Enter your email"
                  className={`w-full bg-white dark:bg-white/5 border ${errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-white/10'} rounded-xl py-3.5 pl-11 pr-4 text-gray-900 dark:text-white focus:ring-2 ${errors.email ? 'focus:ring-red-500' : 'focus:ring-purple-500'} focus:border-transparent outline-none transition-all`}
                  value={formData.email}
                  onChange={handleEmailChange}
                  onBlur={() => handleBlur('email')} />
              </div>
              {errors.email && touched.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }} className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                <input type="password" required autoComplete="current-password" placeholder="Enter your password"
                  className={`w-full bg-white dark:bg-white/5 border ${errors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-white/10'} rounded-xl py-3.5 pl-11 pr-4 text-gray-900 dark:text-white focus:ring-2 ${errors.password ? 'focus:ring-red-500' : 'focus:ring-purple-500'} focus:border-transparent outline-none transition-all`}
                  value={formData.password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur('password')} />
              </div>
              {errors.password && touched.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-500 font-medium transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)" }}
              whileTap={{ scale: 0.97 }}
              type="submit" disabled={loading}
              className="w-full py-4 btn-gradient rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 text-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  Signing in...
                </span>
              ) : (
                <>
                  <LogIn size={20} /> Sign In
                  <ArrowRight size={18} className="ml-1" />
                </>
              )}
            </motion.button>
          </form>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 font-bold transition-colors">
                Create Account
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
