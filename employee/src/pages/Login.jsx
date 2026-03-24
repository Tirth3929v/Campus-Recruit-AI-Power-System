import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Briefcase, BookOpen, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: Briefcase, label: 'Job Board', desc: 'Browse curated opportunities' },
  { icon: BookOpen, label: 'Courses', desc: 'Sharpen your skills daily' },
  { icon: Cpu, label: 'AI-Ready', desc: 'Practice interviews anytime' },
];

const Login = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/employee-login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form), credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem('employeeToken');
        localStorage.removeItem('role');
        if (data.token) localStorage.setItem('employeeToken', data.token);
        await checkAuth();
        navigate('/employee');
      } else if (res.status === 403) {
        setError(data.error || 'Your account is awaiting admin approval.');
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch { setError('Cannot connect to server'); }
    finally { setLoading(false); }
  };

  const inputFocus = (e) => {
    e.target.style.background = 'rgba(148,163,184,0.1)';
    e.target.style.border = '1.5px solid rgba(16,185,129,0.5)';
    e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)';
  };
  const inputBlur = (e) => {
    e.target.style.background = 'rgba(148,163,184,0.06)';
    e.target.style.border = '1.5px solid rgba(255,255,255,0.1)';
    e.target.style.boxShadow = 'none';
  };
  const inputBase = {
    background: 'rgba(148,163,184,0.06)',
    border: '1.5px solid rgba(255,255,255,0.1)',
  };

  return (
    <div className="min-h-screen bg-[#060D12] flex font-sans overflow-hidden">
      {/* Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full bg-emerald-600/10 blur-[150px] animate-float" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-cyan-600/8 blur-[150px] animate-float" style={{ animationDelay: '-4s' }} />
        <div className="absolute top-[40%] left-[45%] w-[25%] h-[25%] rounded-full bg-teal-500/5 blur-[100px] animate-morph-blob" />
      </div>

      {/* Left — Brand */}
      <div className="hidden lg:flex flex-col justify-center px-16 flex-1 relative z-10">
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Briefcase size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">Campus<span className="text-emerald-400">Recruit</span></span>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight mb-4">
            Employee<br /><span className="text-gradient">Portal</span>
          </h1>
          <p className="text-white/35 text-lg mb-12 max-w-sm leading-relaxed">
            Your one-stop platform to browse jobs, learn courses, and build your career.
          </p>
          <div className="space-y-4">
            {features.map(({ icon: Icon, label, desc }, i) => (
              <div key={label}
                className={`flex items-center gap-4 p-4 rounded-2xl glass-card animate-fade-in-up delay-${(i + 2) * 100}`}>
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                  <Icon size={18} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-white/30">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex items-center justify-center px-6 w-full lg:w-auto lg:min-w-[520px] relative z-10 lg:border-l border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 32, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="rounded-3xl p-8 md:p-10" style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)'
          }}>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Briefcase size={20} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white">Campus<span className="text-emerald-400">Recruit</span></span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-black text-white mb-1">Welcome Back</h2>
              <p className="text-white/30 text-sm">Sign in to continue your journey</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3.5 mb-5 text-red-400 text-sm">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Email</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-emerald-400 transition-colors duration-200 pointer-events-none" />
                  <input aria-label="Input field"  type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    required placeholder="you@company.com"
                    className="w-full pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/25 rounded-2xl outline-none transition-all duration-200"
                    style={inputBase} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Password</label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-emerald-400 transition-colors duration-200 pointer-events-none" />
                  <input aria-label="Input field"  type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    required placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3.5 text-sm text-white placeholder-white/25 rounded-2xl outline-none transition-all duration-200"
                    style={inputBase} onFocus={inputFocus} onBlur={inputBlur} />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div key={showPass ? 'h' : 's'} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.12 }}>
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </motion.div>
                    </AnimatePresence>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button whileHover={{ scale: 1.01, boxShadow: '0 16px 40px rgba(16,185,129,0.4)' }}
                whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><ArrowRight size={18} /> Sign In</>
                }
              </motion.button>
            </form>

            <div className="mt-6 flex flex-col gap-3">
              <Link to="/forgot-password" className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold transition-colors text-center">
                Forgot Password?
              </Link>
              <p className="text-white/25 text-sm text-center">
                No account?{' '}
                <Link to="/employee/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                  Request Access
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
