import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, Search, Loader2, Building2, ExternalLink } from 'lucide-react';
import axiosInstance from './axiosInstance';

const typeColors = {
    'Full-time': 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    'Internship': 'bg-teal-500/15 text-teal-400 border border-teal-500/20',
    'Part-time': 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
    'Contract': 'bg-rose-500/15 text-rose-400 border border-rose-500/20',
};

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const JobBoard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('All');

    useEffect(() => {
        axiosInstance.get('/jobs')
            .then(res => setJobs(res.data?.jobs || res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const types = ['All', 'Full-time', 'Internship', 'Part-time', 'Contract'];

    const filtered = jobs.filter(j => {
        const matchSearch = j.title?.toLowerCase().includes(search.toLowerCase()) ||
            j.company?.toLowerCase().includes(search.toLowerCase()) ||
            j.location?.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'All' || j.type === filterType;
        return matchSearch && matchType;
    });

    return (
        <div className="space-y-6 w-full">
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Briefcase size={22} className="text-blue-400" /> Job Board
                </h2>
                <p className="text-white/30 text-sm mt-1">{jobs.length} opportunities available</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                    <input aria-label="Input field"  value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs, companies, locations..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {types.map(t => (
                        <button key={t} onClick={() => setFilterType(t)}
                            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${filterType === t
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                                }`}
                            style={filterType !== t ? { border: '1px solid rgba(255,255,255,0.08)' } : {}}>
                            {t}
                        </button>
                    ))}
                </div>
            </motion.div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-emerald-400" /></div>
            ) : (
                <AnimatePresence mode="popLayout">
                    <motion.div key={search + filterType} variants={containerVariants} initial="hidden" animate="show"
                        className="grid gap-4 md:grid-cols-2">
                        {filtered.length === 0 ? (
                            <div className="col-span-2 text-center py-20 text-white/20">
                                <Briefcase size={38} className="mx-auto mb-3 opacity-30" />
                                <p>No jobs match your search</p>
                            </div>
                        ) : filtered.map((job, idx) => (
                            <motion.div key={job._id || idx} variants={cardVariants} whileHover={{ y: -4 }}
                                className="glass-card rounded-2xl p-6 flex flex-col gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center border border-white/10 flex-shrink-0">
                                        <Building2 size={18} className="text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white">{job.title}</h3>
                                        <p className="text-sm text-white/40">{job.company || 'Company'}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${typeColors[job.type] || 'bg-white/10 text-white/40'}`}>
                                        {job.type || 'Full-time'}
                                    </span>
                                </div>
                                {job.description && <p className="text-sm text-white/30 line-clamp-2">{job.description}</p>}
                                <div className="flex flex-wrap gap-2 text-xs">
                                    {job.location && (
                                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-white/35 border border-white/8">
                                            <MapPin size={10} />{job.location}
                                        </span>
                                    )}
                                    {job.salary && (
                                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/15">
                                            {job.salary}
                                        </span>
                                    )}
                                </div>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    className="mt-1 w-full py-2.5 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2"
                                    style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}>
                                    <ExternalLink size={13} /> Apply Now
                                </motion.button>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
};

export default JobBoard;
