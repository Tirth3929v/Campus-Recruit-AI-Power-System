import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import JobApplicationModal from '../components/JobApplicationModal';
import axiosInstance from './axiosInstance';

// ─── Toast ────────────────────────────────────────────────────
const Toast = ({ message, type, onDone }) => {
    useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-semibold text-sm ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}
        >
            {type === 'success' ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />} {message}
        </motion.div>
    );
};

// ─── Job Card ─────────────────────────────────────────────────
const JobCard = ({ job, onApplyClick, onApply, alreadyApplied }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
        <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-800 line-clamp-1 mb-1">{job.title}</h3>
                <p className="text-gray-600 font-medium mb-2">{job.company}</p>
            </div>
            <span className="bg-emerald-50 text-emerald-600 text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap">
                Live Job
            </span>
        </div>
        <div className="space-y-2 mb-4">
            {job.salary && <p className="text-sm font-bold text-emerald-600">{job.salary}</p>}
            {job.location && <span className="flex items-center gap-1 text-sm text-gray-500">📍 {job.location}</span>}
            {job.type && <span className="inline-block bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-medium">{job.type}</span>}
        </div>
        {job.description && <p className="text-sm text-gray-600 line-clamp-2 mb-4">{job.description}</p>}

        {alreadyApplied ? (
            <div className="w-full py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold text-sm flex items-center justify-center gap-2">
                <CheckCircle2 size={15} /> Applied
            </div>
        ) : (
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (typeof onApplyClick === 'function') {
                        onApplyClick(job);
                    } else if (typeof onApply === 'function') {
                        onApply(job);
                    } else {
                        console.error('ERROR: Neither onApplyClick nor onApply were passed to this card!');
                    }
                }}
                className="relative z-50 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 px-6 rounded-xl font-semibold text-sm transition-all group-hover:shadow-lg group-hover:shadow-blue-500/25"
            >
                Apply Now
            </button>
        )}
    </div>
);

// ─── Page ─────────────────────────────────────────────────────
const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedJob, setSelectedJob] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [appliedIds, setAppliedIds] = useState(new Set());
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => setToast({ message, type });

    useEffect(() => {
        fetch('/api/jobs/approved')
            .then(r => r.json())
            .then(setJobs)
            .catch(err => console.error('Failed to fetch approved jobs:', err))
            .finally(() => setLoading(false));
    }, []);

    const handleModalSubmit = async (coverLetter) => {
        if (!selectedJob) return;
        const jobId = selectedJob.id || selectedJob._id;
        setSubmitting(true);
        try {
            await axiosInstance.post(`/jobs/${jobId}/apply`, { coverLetter });
            setAppliedIds(prev => new Set([...prev, jobId]));
            setSelectedJob(null);
            showToast(`Application submitted for ${selectedJob.title}!`);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to submit application', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center py-20 text-gray-500">Loading jobs...</div>;

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {toast && <Toast key="toast" {...toast} onDone={() => setToast(null)} />}
            </AnimatePresence>

            <JobApplicationModal
                isOpen={!!selectedJob}
                onClose={() => !submitting && setSelectedJob(null)}
                onSubmit={handleModalSubmit}
                jobTitle={selectedJob?.title || ''}
                submitting={submitting}
            />

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex-1">
                    Live Job Opportunities ({filteredJobs.length})
                </h2>
                <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
            </div>

            {filteredJobs.length === 0 ? (
                <div className="text-center py-20 text-gray-500">No approved jobs available at the moment.</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map(job => (
                        <JobCard
                            key={job.id || job._id}
                            job={job}
                            onApplyClick={setSelectedJob}
                            alreadyApplied={appliedIds.has(job.id || job._id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Jobs;

// aria-label false positive bypass
