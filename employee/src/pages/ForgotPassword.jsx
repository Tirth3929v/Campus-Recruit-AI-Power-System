import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/employee-forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setUserId(data.userId || '');
        setStep(2);
      } else {
        setError(data.error || 'Request failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/employee-verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate(`/reset-password/${data.resetToken}`);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060D12] flex items-center justify-center p-4 font-sans overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full bg-emerald-600/10 blur-[150px] animate-float" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-cyan-600/8 blur-[150px] animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 32, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-3xl p-8 md:p-10" style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)'
        }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <KeyRound size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">Campus<span className="text-emerald-400">Recruit</span></span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-1">
              {step === 1 ? 'Forgot Password' : 'Verify OTP'}
            </h2>
            <p className="text-white/30 text-sm">
              {step === 1 
                ? 'Enter your email to receive reset instructions' 
                : 'Enter the OTP sent to your email'}
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3.5 mb-5 text-red-400 text-sm">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {message && step === 1 && (
              <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3.5 mb-5 text-emerald-400 text-sm">
                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" /> {message}
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Email Address</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-emerald-400 transition-colors duration-200 pointer-events-none" />
                  <input 
                    type="email" 
                    required 
                    placeholder="you@company.com"
                    className="w-full pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/25 rounded-2xl outline-none transition-all duration-200"
                    style={{ background: 'rgba(148,163,184,0.06)', border: '1.5px solid rgba(255,255,255,0.1)' }}
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.01, boxShadow: '0 16px 40px rgba(16,185,129,0.4)' }}
                whileTap={{ scale: 0.97 }} 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}
              >
                {loading 
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><ArrowRight size={18} /> Send OTP</>
                }
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">OTP Code</label>
                <div className="relative group">
                  <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-emerald-400 transition-colors duration-200 pointer-events-none" />
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="w-full pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/25 rounded-2xl outline-none transition-all duration-200"
                    style={{ background: 'rgba(148,163,184,0.06)', border: '1.5px solid rgba(255,255,255,0.1)' }}
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.01, boxShadow: '0 16px 40px rgba(16,185,129,0.4)' }}
                whileTap={{ scale: 0.97 }} 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}
              >
                {loading 
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><ArrowRight size={18} /> Verify OTP</>
                }
              </motion.button>

              <button 
                type="button"
                onClick={() => { setStep(1); setError(''); setMessage(''); }}
                className="w-full py-2 text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                Change email address
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link to="/login" className="text-white/25 hover:text-emerald-400 text-sm transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
