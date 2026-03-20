import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Building2, ArrowRight, ShieldCheck, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const SuccessScreen = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
    >
        <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: 'backOut' }}
            className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/30"
        >
            <Clock size={36} className="text-white" />
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-2xl font-black text-white mb-3">Request Submitted!
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-gray-400 text-sm leading-relaxed mb-6">
            Your registration request has been sent to the administrator. <br />
            You'll get access once your account is approved. This typically takes 1–2 business days.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-left space-y-2 mb-6">
            {['Account created ✓', 'Admin notified ✓', 'Awaiting approval...'].map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                    {i < 2
                        ? <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />
                        : <Clock size={15} className="text-amber-400 flex-shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
                    }
                    <span className={i < 2 ? 'text-gray-300' : 'text-amber-400'}>{s}</span>
                </div>
            ))}
        </motion.div>
        <Link to="/login" className="block w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors text-sm">
            Back to Login
        </Link>
    </motion.div>
);

const EmployeeRegister = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/employee/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Registration failed'); return; }
            setSuccess(true);
        } catch {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute top-[-15%] left-[-10%] w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[-10%] w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl"
            >
                <AnimatePresence mode="wait">
                    {success ? (
                        <SuccessScreen key="success" />
                    ) : (
                        <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
                                    <ShieldCheck size={26} className="text-white" />
                                </div>
                                <h1 className="text-2xl font-black text-white">Employee Registration</h1>
                                <p className="text-slate-400 text-sm mt-2">Submit your account request for admin approval</p>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                                        <AlertCircle size={16} /> {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {[
                                    { name: 'name', icon: User, placeholder: 'Full Name', type: 'text' },
                                    { name: 'email', icon: Mail, placeholder: 'Work Email', type: 'email' },
                                    { name: 'department', icon: Building2, placeholder: 'Department / Role (optional)', type: 'text', required: false },
                                    { name: 'password', icon: Lock, placeholder: 'Create Password', type: 'password' },
                                ].map(({ name, icon: Icon, placeholder, type, required = true }) => (
                                    <div key={name} className="relative">
                                        <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type={type} name={name} placeholder={placeholder} required={required}
                                            value={formData[name]} onChange={handleChange}
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
                                        />
                                    </div>
                                ))}

                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2 text-amber-400 text-xs">
                                    <Clock size={14} className="flex-shrink-0 mt-0.5" />
                                    Your account will be reviewed by an admin before you can log in.
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    type="submit" disabled={loading}
                                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Submit Request <ArrowRight size={17} /></>
                                    )}
                                </motion.button>
                            </form>

                            <p className="text-center text-slate-500 text-xs mt-6">
                                Already approved?{' '}
                                <Link to="/login" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">Sign In</Link>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default EmployeeRegister;
