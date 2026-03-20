import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Flame, Building2, Users, Briefcase, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: Building2, title: "Company Dashboard", desc: "Track recruitment metrics in real-time" },
  { icon: Briefcase, title: "Job Postings", desc: "Create and manage job listings" },
  { icon: Users, title: "Applicant Tracking", desc: "Review and shortlist candidates" },
];

const Login = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/company-login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.clear();
        if (data.token) localStorage.setItem('companyToken', data.token);
        localStorage.setItem('role', 'company');
        await checkAuth();
        navigate('/company/dashboard');
      } else { setError(data.error || 'Login failed'); }
    } catch (err) { setError('Failed to connect to server'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] flex font-sans selection:bg-amber-500/30 overflow-hidden">
      {/* Ambient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/8 dark:bg-amber-900/10 blur-[150px] animate-float" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/8 dark:bg-orange-900/10 blur-[150px] animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Left Panel */}
      <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex w-1/2 relative z-10 flex-col justify-center px-16 xl:px-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
          <div className="flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Flame size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Campus<span className="text-gradient-vivid">Hire</span>
            </span>
          </div>
          <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
            Hire the Best<br /><span className="text-gradient-vivid">Campus Talent</span>
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-md">
            Post jobs, track applicants, and build your dream team from top campus recruits.
          </p>
        </motion.div>
        <div className="space-y-4">
          {features.map((feature, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.6 }}
              whileHover={{ x: 8, scale: 1.02 }}
              className="flex items-center gap-4 p-4 rounded-xl glass-card cursor-default group">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
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

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md glass-panel rounded-3xl p-8 lg:p-10">
          <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Flame size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Campus<span className="text-gradient-vivid">Hire</span></span>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Company Login</h1>
            <p className="text-gray-500 dark:text-gray-400">Sign in to manage your recruitment</p>
          </div>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm text-center font-medium">
              {error}
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                <input type="email" required autoComplete="email" placeholder="Enter your email"
                  className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                <input type="password" required autoComplete="current-password" placeholder="Enter your password"
                  className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
            </motion.div>
            <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(245, 158, 11, 0.3)" }}
              whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
              className="w-full py-4 btn-gradient rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 text-lg">
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  Signing in...
                </span>
              ) : (<><LogIn size={20} /> Sign In <ArrowRight size={18} className="ml-1" /></>)}
            </motion.button>
          </form>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-amber-600 dark:text-amber-400 hover:text-amber-500 font-bold transition-colors">Register</Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
