import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Trash2, Search, Loader2, AlertTriangle, CheckCircle2, MapPin, Building2, CheckCircle, XCircle, X, Clock, User } from 'lucide-react';

const typeColors = {
  'Full-time': 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  'Internship': 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
  'Part-time': 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  'Contract': 'bg-rose-500/15 text-rose-400 border border-rose-500/20',
};

const Toast = ({ message, type, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-semibold text-sm ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />} {message}
    </motion.div>
  );
};

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected


  const [toast, setToast] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const showToast = (m, t = 'success') => setToast({ message: m, type: t });

  const fetchJobs = async (tab = activeTab) => {
    try {
      if (!tab || !['pending', 'approved', 'rejected'].includes(tab)) {
        console.error('Invalid tab value:', tab);
        setLoading(false);
        return;
      }
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      console.log('Fetching jobs for tab:', tab, 'Token exists:', !!token);
      let url = '';
      
      if (tab === 'pending') {
        url = '/api/jobs/admin';
      } else {
        url = `/api/jobs/admin/history?type=${tab}`;
      }
      
      const res = await fetch(url, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      console.log('Response status:', res.status, 'url:', url);
      if (res.ok) {
        const data = await res.json();
        console.log('Jobs fetched:', data.length);
        setJobs(data);
      } else {
        const errorData = await res.json();
        console.error('Error response:', errorData);
        showToast(`Failed to load ${tab} jobs: ${errorData.message || res.statusText}`, 'error');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      showToast('Failed to load jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    console.log('👤 ROLE:', role);
    
    if (role !== 'admin') {
      console.log('❌ Not admin, redirecting...');
      window.location.href = '/admin/login';
      return;
    }
    
    const token = localStorage.getItem('adminToken');
    console.log('ManageJobs mounted, token:', token ? 'exists' : 'missing', 'length:', token?.length);
    fetchJobs(activeTab);
  }, [activeTab]);




  const handleView = (job) => {
    setSelectedJob(job);
    setShowModal(true);
    setModalType('');
  };

  const handleApprove = async () => {
    if (!selectedJob) return;
    setProcessing(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/jobs/${selectedJob._id}/approve`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        showToast('Job approved successfully!');
        setShowModal(false);
        fetchJobs(activeTab);
      } else {
        showToast('Failed to approve job', 'error');
      }
    } catch (err) {
      console.error('Error approving job:', err);
      showToast('Failed to approve job', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedJob || !rejectionReason.trim()) {
      showToast('Please provide a rejection reason', 'error');
      return;
    }
    setProcessing(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/jobs/${selectedJob._id}/reject`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ rejectionReason })
      });
      if (res.ok) {
        showToast('Job rejected!');
        setShowModal(false);
        setRejectionReason('');
        fetchJobs(activeTab);
      } else {
        showToast('Failed to reject job', 'error');
      }
    } catch (err) {
      console.error('Error rejecting job:', err);
      showToast('Failed to reject job', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setRejectionReason('');
  };

  const filtered = jobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.company?.toLowerCase().includes(search.toLowerCase()) ||
    j.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full">
      <AnimatePresence>
        {toast && <Toast key="t" {...toast} onDone={() => setToast(null)} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase size={22} className="text-emerald-400" /> Manage Jobs
          </h2>
          <p className="text-white/30 text-sm mt-1">{jobs.length} {activeTab} jobs</p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
          {[
            { key: 'pending', label: 'Pending Review', badge: 'admin_review' },
            { key: 'approved', label: 'Approved', badge: 'approved' },
            { key: 'rejected', label: 'Rejected', badge: 'rejected' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all flex-1 ${
                activeTab === tab.key
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..."
            className="pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 w-64"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
      </motion.div>


      {loading ? (
        <div className="flex justify-center py-24"><Loader2 size={28} className="animate-spin text-emerald-400" /></div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2">
          {filtered.length === 0 ? (
            <div className="col-span-2 text-center py-20 text-white/20">
              <Briefcase size={38} className="mx-auto mb-3 opacity-30" />
              <p>No jobs awaiting approval</p>
            </div>
          ) : filtered.map(job => (
            <motion.div key={job._id} variants={cardVariants} whileHover={{ y: -3 }}
              className="glass-card rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-white/10 flex-shrink-0">
                    <Building2 size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{job.title}</h3>
                    <p className="text-sm text-white/40">{job.company || 'Unknown'}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                  activeTab === 'approved' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                  activeTab === 'rejected' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                  'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                }`}>
                  <Clock size={10} className="inline mr-1" />
                  {activeTab === 'approved' ? 'Approved' : activeTab === 'rejected' ? 'Rejected' : 'Pending Review'}
                </span>
              </div>

              
              {job.department && (
                <div className="text-xs text-white/40">
                  Dept: {job.department}
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 text-xs">
                {job.type && <span className={`px-2.5 py-1 rounded-full font-medium ${typeColors[job.type] || 'bg-white/10 text-white/40'}`}>{job.type}</span>}
                {job.location && <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/8 text-white/40 font-medium border border-white/8"><MapPin size={10} />{job.location}</span>}
                {job.salary && <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/15">{job.salary}</span>}
              </div>

              {job.assignedEmployeeName && (
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <User size={12} />
                  Submitted by: {job.assignedEmployeeName}
                </div>
              )}

              <div className="flex gap-2 mt-1">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => handleView(job)}
                  className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 bg-gray-800">
                  <Briefcase size={13} /> View Details
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Job Details Modal */}
      <AnimatePresence>
        {showModal && selectedJob && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={closeModal}>
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
              className="glass-panel rounded-2xl p-7 w-full max-w-2xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>

              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-white">Job Review</h3>
                <button onClick={closeModal} className="p-1.5 hover:bg-white/10 rounded-lg">
                  <X size={20} className="text-white/60" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-white">{selectedJob.title}</h4>
                  <p className="text-sm text-white/60">{selectedJob.company}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="text-xs text-white/40 flex items-center gap-1">
                    <MapPin size={12} /> {selectedJob.location}
                  </span>
                  <span className="text-xs text-white/40">
                    {selectedJob.salary}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeColors[selectedJob.type] || 'bg-white/10 text-white/40'}`}>
                    {selectedJob.type}
                  </span>
                  {selectedJob.department && (
                    <span className="text-xs text-white/40">
                      Dept: {selectedJob.department}
                    </span>
                  )}
                </div>

                {selectedJob.assignedEmployeeName && (
                  <div className="flex items-center gap-2 text-sm text-white/50 bg-white/5 p-2 rounded-lg">
                    <User size={14} />
                    Submitted by Employee: {selectedJob.assignedEmployeeName}
                  </div>
                )}

                <div>
                  <h5 className="text-sm font-bold text-white/80 mb-2">Description</h5>
                  <p className="text-sm text-white/50 whitespace-pre-wrap">{selectedJob.description}</p>
                </div>

                {selectedJob.tags?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-bold text-white/80 mb-2">Requirements</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.tags.map((tag, i) => (
                        <span key={i} className="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedJob.employeeNotes && (
                  <div>
                    <h5 className="text-sm font-bold text-white/80 mb-2">Employee Notes</h5>
                    <p className="text-sm text-white/50 bg-white/5 p-3 rounded-lg">{selectedJob.employeeNotes}</p>
                  </div>
                )}

                {selectedJob.rejectionReason && (
                  <div>
                    <h5 className="text-sm font-bold text-white/80 mb-2">Rejection Reason</h5>
                    <p className="text-sm text-red-400/80 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{selectedJob.rejectionReason}</p>
                  </div>
                )}

                {selectedJob.approvedAt && (
                  <div>
                    <h5 className="text-sm font-bold text-white/80 mb-2">Approved At</h5>
                    <p className="text-sm text-emerald-400/80 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                      {new Date(selectedJob.approvedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {modalType === 'reject' && (
                  <div className="pt-4 border-t border-white/10">
                    <h5 className="text-sm font-bold text-white/80 mb-2">Rejection Reason</h5>
                    <textarea
                      rows="3"
                      placeholder="Please provide a reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-white/30 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                    />
                  </div>
                )}

              </div>

              <div className="flex gap-3 mt-6">
                {modalType === 'approve' ? (
                  <>
                    <button
                      onClick={closeModal}
                      className="flex-1 py-3 rounded-xl font-bold text-sm border border-white/10 text-white/60 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <motion.button
                      onClick={handleApprove}
                      disabled={processing}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 bg-emerald-500 text-white hover:bg-emerald-600"
                    >
                      <CheckCircle size={16} />
                      {processing ? 'Approving...' : 'Approve Job'}
                    </motion.button>
                  </>
                ) : modalType === 'reject' ? (
                  <>
                    <button
                      onClick={() => setModalType('')}
                      className="flex-1 py-3 rounded-xl font-bold text-sm border border-white/10 text-white/60 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <motion.button
                      onClick={handleReject}
                      disabled={processing || !rejectionReason.trim()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 bg-red-500 text-white hover:bg-red-600"
                    >
                      <XCircle size={16} />
                      {processing ? 'Rejecting...' : 'Confirm Rejection'}
                    </motion.button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setModalType('reject')}
                      className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-red-200/20 text-red-400 hover:bg-red-500/10"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                    <motion.button
                      onClick={() => setModalType('approve')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600"
                    >
                      <CheckCircle size={16} /> Approve
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageJobs;
