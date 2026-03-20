import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Building2, Mail, MapPin, Globe, Users, Save, Upload, Loader2, CheckCircle, X } from 'lucide-react';

const Reveal = ({ children, delay = 0, className = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-40px" });
    return (
        <motion.div ref={ref} className={className}
            initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
            {children}
        </motion.div>
    );
};

const CompanyProfilePage = () => {
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [formData, setFormData] = useState({
        name: 'TechCorp Solutions',
        email: 'hr@techcorp.com',
        industry: 'Information Technology',
        location: 'Bangalore, India',
        website: 'https://techcorp.com',
        employees: '500-1000',
        description: 'Leading technology solutions provider specializing in cloud computing, AI/ML, and enterprise software development.',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        // Simulate save
        await new Promise(r => setTimeout(r, 1200));
        setMessage({ type: 'success', text: 'Company profile updated!' });
        setSaving(false);
        setTimeout(() => setMessage(null), 4000);
    };

    return (
        <div className="relative min-h-full">
            <div className="ambient-bg" />
            <div className="relative z-10 max-w-3xl mx-auto space-y-6">

                <Reveal>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Company <span className="text-gradient-vivid">Profile</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage how your company appears to candidates</p>
                </Reveal>

                {/* Company Card */}
                <Reveal delay={0.1}>
                    <div className="glass-panel rounded-2xl p-7 flex flex-col sm:flex-row items-center gap-5">
                        <motion.div whileHover={{ scale: 1.05, rotate: 5 }}
                            className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-amber-500/30 flex-shrink-0">
                            {formData.name[0]}
                        </motion.div>
                        <div className="text-center sm:text-left">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{formData.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formData.industry}</p>
                            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                    <MapPin size={10} /> {formData.location}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                                    <Users size={10} /> {formData.employees}
                                </span>
                            </div>
                        </div>
                    </div>
                </Reveal>

                {/* Toast */}
                {message && (
                    <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${message.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                            : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'}`}>
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <CheckCircle size={16} /> {message.text}
                        </div>
                        <button onClick={() => setMessage(null)}><X size={14} /></button>
                    </motion.div>
                )}

                {/* Form */}
                <Reveal delay={0.2}>
                    <motion.form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-7 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {[
                                { key: 'name', label: 'Company Name', icon: Building2 },
                                { key: 'email', label: 'HR Email', icon: Mail, type: 'email' },
                                { key: 'location', label: 'Headquarters', icon: MapPin },
                                { key: 'website', label: 'Website', icon: Globe },
                                { key: 'industry', label: 'Industry', icon: Building2 },
                                { key: 'employees', label: 'Company Size', icon: Users },
                            ].map(field => (
                                <div key={field.key} className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{field.label}</label>
                                    <div className="relative group">
                                        <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" size={16} />
                                        <input type={field.type || 'text'} value={formData[field.key]}
                                            onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                            className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Company Description</label>
                            <textarea rows="4" value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm resize-none text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                                placeholder="Describe your company..." />
                        </div>

                        {/* Logo Upload */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Company Logo</label>
                            <motion.div whileHover={{ scale: 1.01, borderColor: "rgba(245, 158, 11, 0.4)" }}
                                className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all relative cursor-pointer group">
                                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <Upload className="mx-auto text-amber-500 group-hover:scale-110 transition-transform mb-2" size={28} />
                                <p className="text-xs text-gray-500 font-medium">Click to upload logo (PNG, JPG)</p>
                            </motion.div>
                        </div>

                        <motion.button type="submit" disabled={saving}
                            whileHover={{ scale: 1.02, boxShadow: "0 15px 30px rgba(245, 158, 11, 0.3)" }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full py-3.5 btn-gradient rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 text-sm">
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Profile</>}
                        </motion.button>
                    </motion.form>
                </Reveal>
            </div>
        </div>
    );
};

export default CompanyProfilePage;
