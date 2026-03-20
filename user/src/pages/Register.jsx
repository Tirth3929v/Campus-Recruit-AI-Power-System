import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, BookOpen, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const checkPasswordStrength = (password) => {
  let strength = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  if (checks.length) strength++;
  if (checks.uppercase) strength++;
  if (checks.lowercase) strength++;
  if (checks.number) strength++;
  if (checks.special) strength++;
  
  return { strength, checks };
};

const getStrengthColor = (strength) => {
  if (strength <= 2) return 'bg-red-500';
  if (strength <= 3) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getStrengthLabel = (strength) => {
  if (strength <= 2) return 'Weak';
  if (strength <= 3) return 'Medium';
  return 'Strong';
};

const validateEmailFormat = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const Register = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', course: '', termsAccepted: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, checks: {} });
  const [errors, setErrors] = useState({ name: '', email: '', password: '', course: '' });
  const [touched, setTouched] = useState({ name: false, email: false, password: false, course: false });
  const [emailChecking, setEmailChecking] = useState(false);

  if (authLoading) return null;
  if (user) return <Navigate to="/student/dashboard" replace />;

  const validateName = (name) => {
    if (!name) return 'Full name is required';
    if (name.length < 3) return 'Name must be at least 3 characters';
    return '';
  };

  const validateEmail = async (email) => {
    if (!email) return 'Email is required';
    if (!validateEmailFormat(email)) return 'Please enter a valid email address';
    
    setEmailChecking(true);
    try {
      const res = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.exists) {
        setEmailChecking(false);
        return 'Email already registered';
      }
    } catch (err) {
      // Ignore network errors during check
    }
    setEmailChecking(false);
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    
    const checks = checkPasswordStrength(password);
    if (!checks.checks.uppercase || !checks.checks.lowercase || !checks.checks.number || !checks.checks.special) {
      return 'Password must include uppercase, lowercase, number, and special character';
    }
    return '';
  };

  const validateCourse = (course) => {
    if (!course) return 'Please select a course/major';
    return '';
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, name: value });
    if (touched.name) {
      setErrors({ ...errors, name: validateName(value) });
    }
  };

  const handleEmailChange = async (e) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    if (touched.email) {
      const emailError = await validateEmail(value);
      setErrors({ ...errors, email: emailError });
    }
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    setPasswordStrength(checkPasswordStrength(password));
    if (touched.password) {
      setErrors({ ...errors, password: validatePassword(password) });
    }
  };

  const handleCourseChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, course: value });
    if (touched.course) {
      setErrors({ ...errors, course: validateCourse(value) });
    }
  };

  const handleBlur = async (field) => {
    setTouched({ ...touched, [field]: true });
    if (field === 'name') {
      setErrors({ ...errors, name: validateName(formData.name) });
    } else if (field === 'email') {
      const emailError = await validateEmail(formData.email);
      setErrors({ ...errors, email: emailError });
    } else if (field === 'password') {
      setErrors({ ...errors, password: validatePassword(formData.password) });
    } else if (field === 'course') {
      setErrors({ ...errors, course: validateCourse(formData.course) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const nameError = validateName(formData.name);
    const emailError = await validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const courseError = validateCourse(formData.course);

    setErrors({ name: nameError, email: emailError, password: passwordError, course: courseError });
    setTouched({ name: true, email: true, password: true, course: true });

    if (nameError || emailError || passwordError || courseError) {
      return;
    }

    if (!formData.termsAccepted) {
      setError('You must accept the Terms and Conditions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await res.json();

      if (res.ok) {
        navigate('/verify-otp', { state: { userId: data.userId } });
      } else {
        if (data.error && data.error.includes('Email already')) {
          setErrors({ ...errors, email: 'Email already registered' });
          setError('Email already registered');
        } else {
          setError(data.error || 'Registration failed');
        }
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const validationMsg = [];
  if (formData.password && formData.password.length > 0) {
    if (!passwordStrength.checks.length) validationMsg.push('at least 8 characters');
    if (!passwordStrength.checks.uppercase) validationMsg.push('uppercase');
    if (!passwordStrength.checks.lowercase) validationMsg.push('lowercase');
    if (!passwordStrength.checks.number) validationMsg.push('number');
    if (!passwordStrength.checks.special) validationMsg.push('special character');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] flex items-center justify-center p-4 font-sans selection:bg-purple-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-900/20 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400">Start your journey to your dream job</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" required placeholder="Full Name" autoComplete="name"
              className={`w-full bg-gray-100 dark:bg-gray-800/50 border ${errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:ring-2 ${errors.name ? 'focus:ring-red-500' : 'focus:ring-purple-500'} outline-none transition-all`}
              value={formData.name} 
              onChange={handleNameChange}
              onBlur={() => handleBlur('name')}
            />
          </div>
          {errors.name && touched.name && (
            <p className="text-red-500 dark:text-red-400 text-xs -mt-2">{errors.name}</p>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="email" required placeholder="Email Address" autoComplete="email"
              className={`w-full bg-gray-100 dark:bg-gray-800/50 border ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:ring-2 ${errors.email ? 'focus:ring-red-500' : 'focus:ring-purple-500'} outline-none transition-all`}
              value={formData.email} 
              onChange={handleEmailChange}
              onBlur={() => handleBlur('email')}
            />
          </div>
          {errors.email && touched.email && (
            <p className="text-red-500 dark:text-red-400 text-xs -mt-2">{errors.email}</p>
          )}

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="password" required placeholder="Password" autoComplete="new-password"
              className={`w-full bg-gray-100 dark:bg-gray-800/50 border ${errors.password ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:ring-2 ${errors.password ? 'focus:ring-red-500' : 'focus:ring-purple-500'} outline-none transition-all`}
              value={formData.password} 
              onChange={handlePasswordChange}
              onBlur={() => handleBlur('password')}
            />
          </div>
          {errors.password && touched.password && (
            <p className="text-red-500 dark:text-red-400 text-xs -mt-2">{errors.password}</p>
          )}

          {formData.password && (
            <div className="space-y-2">
              <div className="flex gap-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`${getStrengthColor(passwordStrength.strength)} transition-all duration-300`} style={{ width: `${(passwordStrength.strength / 5) * 100}%` }} />
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${getStrengthColor(passwordStrength.strength).replace('bg-', 'text-')}`}>
                  {getStrengthLabel(passwordStrength.strength)}
                </span>
              </div>
              {validationMsg.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Password must include {validationMsg.join(', ')}
                </p>
              )}
            </div>
          )}

          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select 
              required
              className={`w-full bg-gray-100 dark:bg-gray-800/50 border ${errors.course ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:ring-2 ${errors.course ? 'focus:ring-red-500' : 'focus:ring-purple-500'} outline-none transition-all appearance-none`}
              value={formData.course} 
              onChange={handleCourseChange}
              onBlur={() => handleBlur('course')}
            >
              <option value="">Select Course / Major</option>
              <option value="IT">IT</option>
              <option value="Non-IT">Non-IT</option>
              <option value="Designer">Designer</option>
            </select>
          </div>
          {errors.course && touched.course && (
            <p className="text-red-500 dark:text-red-400 text-xs -mt-2">{errors.course}</p>
          )}

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="terms"
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-white dark:focus:ring-offset-gray-900 cursor-pointer"
              checked={formData.termsAccepted}
              onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
            />
            <label htmlFor="terms" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none">I agree to the <span className="text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors">Terms and Conditions</span></label>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
            {loading ? 'Creating Account...' : <>Get Started <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Already have an account? <Link to="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 font-bold transition-colors">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
