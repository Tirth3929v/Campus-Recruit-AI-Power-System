import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, BookOpen, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const checkPasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
};

const getStrengthLabel = (strength) => {
  if (strength <= 2) return { text: 'Weak', color: 'bg-red-500', textColor: 'text-red-500' };
  if (strength <= 4) return { text: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-500' };
  return { text: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
};

const Register = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', course: '', termsAccepted: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (authLoading) return null;
  if (user) return <Navigate to="/student/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      setError('You must accept the Terms and Conditions');
      return;
    }

    const passwordStrength = checkPasswordStrength(formData.password);
    if (passwordStrength < 5) {
      setError('Password must be stronger. Use at least 8 characters with uppercase, lowercase, number, and special character.');
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
        window.location.href = '/student/dashboard';
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans selection:bg-purple-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Start your journey to your dream job</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" required placeholder="Full Name"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="email" required placeholder="Email Address"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="password" required placeholder="Password"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          {formData.password && (
            <div className="space-y-1 -mt-2">
              <div className="flex gap-1">
                <div className={`h-1 flex-1 rounded-full ${checkPasswordStrength(formData.password) >= 1 ? getStrengthLabel(checkPasswordStrength(formData.password)).color : 'bg-gray-700'}`} />
                <div className={`h-1 flex-1 rounded-full ${checkPasswordStrength(formData.password) >= 2 ? getStrengthLabel(checkPasswordStrength(formData.password)).color : 'bg-gray-700'}`} />
                <div className={`h-1 flex-1 rounded-full ${checkPasswordStrength(formData.password) >= 3 ? getStrengthLabel(checkPasswordStrength(formData.password)).color : 'bg-gray-700'}`} />
                <div className={`h-1 flex-1 rounded-full ${checkPasswordStrength(formData.password) >= 4 ? getStrengthLabel(checkPasswordStrength(formData.password)).color : 'bg-gray-700'}`} />
                <div className={`h-1 flex-1 rounded-full ${checkPasswordStrength(formData.password) >= 5 ? getStrengthLabel(checkPasswordStrength(formData.password)).color : 'bg-gray-700'}`} />
              </div>
              <p className={`text-xs ${getStrengthLabel(checkPasswordStrength(formData.password)).textColor}`}>
                {getStrengthLabel(checkPasswordStrength(formData.password)).text}
              </p>
            </div>
          )}

          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" required placeholder="Course / Major"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})}
            />
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="terms"
              className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900 cursor-pointer"
              checked={formData.termsAccepted}
              onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
            />
            <label htmlFor="terms" className="text-xs text-gray-400 cursor-pointer select-none">I agree to the <span className="text-purple-400 hover:text-purple-300 transition-colors">Terms and Conditions</span></label>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
            {loading ? 'Creating Account...' : <>Get Started <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account? <Link to="/login" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
