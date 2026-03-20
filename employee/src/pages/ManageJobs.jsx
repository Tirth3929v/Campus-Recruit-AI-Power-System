import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Trash2, Search, Loader2, AlertTriangle, CheckCircle, MapPin, Clock, Building2 } from 'lucide-react';
import axiosInstance from './axiosInstance';

const Toast = ({ message, type, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white font-semibold text-sm ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}
    >
      {type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
      {message}
    </motion.div>
  );
};

const ConfirmModal = ({ job, onConfirm, onCancel }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
  >
    <motion.div
      initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 20 }}
      className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center"
    >
      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={28} className="text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Remove Job Posting?</h3>
      <p className="text-gray-500 text-sm mb-6">
        This will permanently remove <span className="font-semibold text-gray-800">{job?.title}</span>. All related applications will also be affected.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors">Remove</button>
      </div>
    </motion.div>
  </motion.div>
);

const statusColors = {
  Open: 'bg-emerald-100 text-emerald-700',
  Closed: 'bg-gray-100 text-gray-600',
  Paused: 'bg-yellow-100 text-yellow-700',
};

const typeColors = {
  'Full-time': 'bg-blue-100 text-blue-700',
  'Internship': 'bg-purple-100 text-purple-700',
  'Part-time': 'bg-orange-100 text-orange-700',
  'Contract': 'bg-rose-100 text-rose-700',
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmJob, setConfirmJob] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/admin/jobs');
      setJobs(res.data);
    } catch {
      showToast('Failed to load jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmJob) return;
    try {
      await axiosInstance.delete(`/admin/jobs/${confirmJob._id}`);
      setJobs(prev => prev.filter(j => j._id !== confirmJob._id));
      showToast(`"${confirmJob.title}" removed successfully`);
    } catch {
      showToast('Failed to remove job', 'error');
    } finally {
      setConfirmJob(null);
    }
  };

  const filtered = jobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.company?.toLowerCase().includes(search.toLowerCase()) ||
    j.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && <Toast key="toast" message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
        {confirmJob && <ConfirmModal key="modal" job={confirmJob} onConfirm={handleDelete} onCancel={() => setConfirmJob(null)} />}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase size={22} className="text-emerald-600" /> Manage Jobs
          </h2>
          <p className="text-gray-400 text-sm mt-1">{jobs.length} total job postings</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs..."
            className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all w-64"
          />
        </div>
      </motion.div>

      {/* Job Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-emerald-500" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-gray-400">
          <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
          <p>No job postings found</p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2">
          {filtered.map(job => (
            <motion.div
              key={job._id}
              variants={cardVariants}
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.10)' }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 cursor-default transition-shadow"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <Building2 size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 leading-tight">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.company || 'Unknown Company'}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${statusColors[job.status] || 'bg-gray-100 text-gray-600'}`}>
                  {job.status || 'Unknown'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {job.type && (
                  <span className={`px-2.5 py-1 rounded-full font-medium ${typeColors[job.type] || 'bg-gray-100 text-gray-600'}`}>{job.type}</span>
                )}
                {job.location && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                    <MapPin size={11} />{job.location}
                  </span>
                )}
                {job.createdAt && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
                    <Clock size={11} />{new Date(job.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-50">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setConfirmJob(job)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                >
                  <Trash2 size={13} /> Remove Job
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ManageJobs;