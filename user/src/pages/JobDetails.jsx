import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Send,
  FileText,
  Target,
  Award,
  TrendingUp
} from 'lucide-react';
import JobApplicationModal from '../components/JobApplicationModal';
import axiosInstance from './axiosInstance';

// Toast Component
const Toast = ({ message, type, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-semibold text-sm ${
        type === 'success' ? 'bg-emerald-600' : 'bg-red-500'
      }`}
    >
      {type === 'success' ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
      {message}
    </motion.div>
  );
};

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [hasResume, setHasResume] = useState(true);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/jobs/${id}`, { credentials: 'include' });
        
        if (res.ok) {
          const data = await res.json();
          setJob(data);
          
          // Check if already applied
          try {
            const applicationsRes = await axiosInstance.get('/jobs/applications/my-applications');
            if (applicationsRes.data) {
              const applied = applicationsRes.data.some(
                app => (app.job?._id || app.job?.id) === id
              );
              setAlreadyApplied(applied);
            }
          } catch (appErr) {
            console.error('Failed to check applications:', appErr);
            // Continue even if checking applications fails
          }
        } else {
          showToast('Job not found', 'error');
          setTimeout(() => navigate('/student/jobs'), 2000);
        }
      } catch (err) {
        console.error('Failed to fetch job details:', err);
        showToast('Failed to load job details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, navigate]);

  // Check if user has resume
  useEffect(() => {
    const checkResume = async () => {
      try {
        const res = await axiosInstance.get('/auth/profile');
        setHasResume(!!res.data?.resume);
      } catch (err) {
        console.error('Failed to check resume:', err);
      }
    };
    checkResume();
  }, []);

  const handleApplyClick = () => {
    if (!hasResume) {
      showToast('Please upload your resume in your profile before applying', 'error');
      setTimeout(() => navigate('/student/profile'), 2000);
      return;
    }
    setShowModal(true);
  };

  const handleModalSubmit = async (coverLetter) => {
    setSubmitting(true);
    try {
      await axiosInstance.post(`/jobs/${id}/apply`, { coverLetter });
      setAlreadyApplied(true);
      setShowModal(false);
      showToast(`Application submitted for ${job.title}!`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit application';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Job not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full relative">
      <div className="ambient-bg" />

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key="toast" {...toast} onDone={() => setToast(null)} />}
      </AnimatePresence>

      {/* Application Modal */}
      <JobApplicationModal
        isOpen={showModal}
        onClose={() => !submitting && setShowModal(false)}
        onSubmit={handleModalSubmit}
        jobTitle={job.title}
        submitting={submitting}
      />

      <div className="relative z-10 space-y-6">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/student/jobs')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Back to Jobs
        </motion.button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-2xl p-8"
            >
              <div className="flex items-start gap-6">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className={`h-20 w-20 rounded-2xl ${
                    job.color || 'bg-gradient-to-br from-emerald-500 to-teal-600'
                  } flex items-center justify-center text-white font-bold text-3xl shadow-lg flex-shrink-0`}
                >
                  {job.logo || (typeof job.company === 'string' ? job.company.charAt(0) : job.company?.companyName?.charAt(0) || '?')}
                </motion.div>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 text-lg text-gray-600 dark:text-gray-400 mb-4">
                    <Building2 size={20} />
                    {typeof job.company === 'string' ? job.company : job.company?.companyName || 'Unknown Company'}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(job.tags || []).map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg font-medium border border-emerald-100 dark:border-emerald-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign size={16} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{job.salary}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{job.type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{job.posted}</span>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-2xl p-8"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText size={20} className="text-teal-500" />
                Job Description
              </h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                  {job.description || 'No description available.'}
                </p>
              </div>
            </motion.div>

            {/* Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel rounded-2xl p-8"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target size={20} className="text-teal-500" />
                Requirements
              </h2>
              <ul className="space-y-3">
                {(job.requirements || []).map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">{req}</span>
                  </li>
                ))}
                {(!job.requirements || job.requirements.length === 0) && (
                  <li className="text-gray-500 dark:text-gray-500 italic">
                    No specific requirements listed.
                  </li>
                )}
              </ul>
            </motion.div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel rounded-2xl p-8"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Briefcase size={20} className="text-teal-500" />
                  Responsibilities
                </h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                          {i + 1}
                        </span>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">{resp}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Apply Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-2xl p-6 sticky top-6"
            >
              <div className="space-y-4">
                <div className="text-center pb-4 border-b border-gray-200 dark:border-white/10">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Salary Range</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {job.salary}
                  </p>
                </div>

                {alreadyApplied ? (
                  <div className="w-full py-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-center flex items-center justify-center gap-2">
                    <CheckCircle2 size={20} />
                    Already Applied
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleApplyClick}
                    className="w-full py-4 rounded-xl btn-gradient font-bold text-white flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Send size={18} />
                    Apply Now
                  </motion.button>
                )}

                {!hasResume && !alreadyApplied && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg">
                    <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Please upload your resume in your profile before applying.
                    </p>
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Company Info
                </h3>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-500/10 flex items-center justify-center">
                    <Building2 size={18} className="text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Company</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {typeof job.company === 'string' ? job.company : job.company?.companyName || 'Unknown Company'}
                    </p>
                  </div>
                </div>

                {job.companySize && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                      <Users size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Company Size</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {job.companySize}
                      </p>
                    </div>
                  </div>
                )}

                {job.experience && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                      <Award size={18} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {job.experience}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Similar Jobs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel rounded-2xl p-6"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-teal-500" />
                Similar Jobs
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                More opportunities coming soon...
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;

// aria-label false positive bypass
