import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState('');

  const userId = location.state?.userId;

  useEffect(() => {
    if (!userId) {
      navigate('/register');
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/student/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
        credentials: 'include'
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        if (data.token) localStorage.setItem('studentToken', data.token);
        setTimeout(() => {
          navigate('/student/dashboard');
        }, 1500);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/student/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
        credentials: 'include'
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setCountdown(60);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] flex items-center justify-center p-4 font-sans selection:bg-teal-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/10 dark:bg-teal-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-900/20 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-teal-600 to-blue-600 flex items-center justify-center">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Verify Your Account</h1>
          <p className="text-gray-500 dark:text-gray-400">Enter the 6-digit code sent to your email</p>
        </div>

        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 text-sm text-center flex flex-col items-center gap-2">
            <CheckCircle size={24} />
            Account verified! Redirecting...
          </motion.div>
        )}

        {error && !success && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {message && !error && (
          <div className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 text-sm text-center">
            {message}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Verification Code</label>
              <input 
                type="text" 
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-4 px-4 text-gray-900 dark:text-white text-center text-2xl tracking-[12px] font-mono focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  Verifying...
                </span>
              ) : (
                <>Verify <ArrowRight size={18} /></>
              )}
            </button>

            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                Didn't receive the code?
              </p>
              <button 
                type="button"
                onClick={handleResend}
                disabled={resendLoading || countdown > 0}
                className="text-teal-600 dark:text-teal-400 hover:text-teal-500 font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
              >
                <RefreshCw size={14} className={resendLoading ? 'animate-spin' : ''} />
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/register" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">
            Back to Registration
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
