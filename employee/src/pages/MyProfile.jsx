import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, BookOpen, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from './axiosInstance';

const MyProfile = () => {
    const { user } = useAuth();
    const [form, setForm] = useState({ name: '', course: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        axiosInstance.get('/user/profile')
            .then(res => setForm({ name: res.data.name || '', course: res.data.course || '' }))
            .catch(() => setForm({ name: user?.name || '', course: '' }))
            .finally(() => setLoading(false));
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axiosInstance.put('/user/profile', form);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    if (loading) return (
        <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-emerald-400" /></div>
    );

    return (
        <div className="max-w-2xl space-y-6">
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <User size={22} className="text-purple-400" /> My Profile
                </h2>
                <p className="text-white/30 text-sm mt-1">Manage your personal information</p>
            </motion.div>

            {/* Avatar card */}
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-6 flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                    {form.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">{form.name || 'Your Name'}</h3>
                    <p className="text-sm text-white/40">{user?.email}</p>
                    <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/15">
                        <CheckCircle2 size={11} /> Approved Employee
                    </span>
                </div>
            </motion.div>

            {/* Form */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="glass-card rounded-2xl p-6">
                <h3 className="font-bold text-white mb-5">Edit Information</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1.5 block">Full Name</label>
                        <div className="relative">
                            <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                                placeholder="Your full name" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1.5 block">Email</label>
                        <div className="relative">
                            <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/15" />
                            <input type="email" value={user?.email || ''} disabled
                                className="w-full pl-10 pr-4 py-3 rounded-xl text-white/25 cursor-not-allowed"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1.5 block">Department / Course</label>
                        <div className="relative">
                            <BookOpen size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                            <input type="text" value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))}
                                className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                                placeholder="Your department or course" />
                        </div>
                    </div>

                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} type="submit" disabled={saving}
                        className={`w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-sm mt-2 disabled:opacity-60`}
                        style={{ background: saved ? '#10b981' : 'linear-gradient(135deg, #10b981, #0ea5e9)', boxShadow: '0 6px 20px rgba(16,185,129,0.2)' }}>
                        {saving ? <Loader2 size={17} className="animate-spin" />
                            : saved ? <><CheckCircle2 size={17} /> Saved!</>
                                : <><Save size={17} /> Save Changes</>}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default MyProfile;
