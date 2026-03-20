import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getStrengthLabel = (strength) => {
    if (strength <= 25) return { text: 'Weak', color: 'bg-red-500' };
    if (strength <= 50) return { text: 'Fair', color: 'bg-orange-500' };
    if (strength <= 75) return { text: 'Good', color: 'bg-yellow-500' };
    return { text: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const strengthLabel = getStrengthLabel(passwordStrength);

  const validatePassword = () => {
    if (newPassword.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return 'Password must contain uppercase, lowercase, and number';
    }
    if (newPassword !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/employee-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken: token, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password');
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
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">Campus<span className="text-emerald-400">Recruit</span></span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-1">Reset Password</h2>
            <p className="text-white/30 text-sm">Create a new password for your account</p>
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
            {success && (
              <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3.5 mb-5 text-emerald-400 text-sm">
                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" /> Password updated successfully! Redirecting to login...
              </motion.div>
            )}
          </AnimatePresence>

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">New Password</label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-emerald-400 transition-colors duration-200 pointer-events-none" />
                  <input 
                    type={showNewPass ? 'text' : 'password'} 
                    required 
                    placeholder="Enter new password"
                    className="w-full pl-11 pr-12 py-3.5 text-sm text-white placeholder-white/25 rounded-2xl outline-none transition-all duration-200"
                    style={{ background: 'rgba(148,163,184,0.06)', border: '1.5px solid rgba(255,255,255,0.1)' }}
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                  >
                    {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {newPassword && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 25 ? strengthLabel.color : 'bg-white/10'}`} />
                      <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 50 ? strengthLabel.color : 'bg-white/10'}`} />
                      <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 75 ? strengthLabel.color : 'bg-white/10'}`} />
                      <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 100 ? strengthLabel.color : 'bg-white/10'}`} />
                    </div>
                    <p className={`text-xs ${strengthLabel.color.replace('bg-', 'text-')}`}>{strengthLabel.text}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Confirm Password</label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-emerald-400 transition-colors duration-200 pointer-events-none" />
                  <input 
                    type={showConfirmPass ? 'text' : 'password'} 
                    required 
                    placeholder="Confirm new password"
                    className="w-full pl-11 pr-12 py-3.5 text-sm text-white placeholder-white/25 rounded-2xl outline-none transition-all duration-200"
                    style={{ background: 'rgba(148,163,184,0.06)', border: '1.5px solid rgba(255,255,255,0.1)' }}
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                  >
                    {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle size={12} /> Passwords match
                  </p>
                )}
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle size={12} /> Passwords do not match
                  </p>
                )}
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
                  : <><ArrowRight size={18} /> Reset Password</>
                }
              </motion.button>
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

export default ResetPassword;
