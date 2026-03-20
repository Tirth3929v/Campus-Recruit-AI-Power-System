import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Plus, Search, Edit3, Trash2, MapPin, DollarSign, Clock, Users, X, Briefcase, ArrowLeft, User, Building2, CheckCircle, XCircle, Clock as ClockIcon, Send, Eye, EyeOff } from 'lucide-react';

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

const statusConfig = {
  pending: { label: 'Waiting for Employee', color: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20', icon: ClockIcon },
  employee_review: { label: 'Under Employee Review', color: 'bg-blue-500/15 text-blue-400 border border-blue-500/20', icon: Eye },
  admin_review: { label: 'Sent to Admin', color: 'bg-purple-500/15 text-purple-400 border border-purple-500/20', icon: Send },
  approved: { label: 'Active', color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-500/15 text-red-400 border border-red-500/20', icon: XCircle }
};

const emptyJob = { 
  title: '', 
  location: '', 
  salary: '', 
  type: 'Full-time', 
  description: '', 
  tags: '',
  assignedEmployeeId: '',
  department: ''
};

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState(emptyJob);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Manage Jobs | CampusHire";
    fetchJobs();
    fetchEmployees();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/jobs/company/me', { 
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) { 
        setJobs(await res.json()); 
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/jobs/employees/list');
      if (res.ok) {
        setEmployees(await res.json());
      }
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { 
      ...formData, 
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      
      if (editingJob && editingJob.status === 'rejected') {
        const res = await fetch(`/api/jobs/${editingJob._id}`, {
          method: 'PUT', 
          headers,
          body: JSON.stringify(payload), 
          credentials: 'include'
        });
        if (res.ok) {
          fetchJobs();
          closeForm();
        }
      } else {
        const res = await fetch('/api/jobs', {
          method: 'POST', 
          headers,
          body: JSON.stringify(payload), 
          credentials: 'include'
        });
        if (res.ok) {
          fetchJobs();
          closeForm();
        }
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this job posting?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/jobs/${id}`, { 
        method: 'DELETE', 
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      fetchJobs();
    } catch (e) { console.error(e); }
  };

  const openCreate = () => { 
    setEditingJob(null); 
    setFormData(emptyJob); 
    setShowForm(true); 
  };
  
  const openEdit = (job) => {
    setEditingJob(job);
    setFormData({ 
      ...job, 
      tags: Array.isArray(job.tags) ? job.tags.join(', ') : '',
      assignedEmployeeId: job.assignedEmployeeId || '',
      department: job.department || ''
    });
    setShowForm(true);
  };
  
  const closeForm = () => { 
    setShowForm(false); 
    setEditingJob(null); 
    setFormData(emptyJob); 
  };

  const filtered = jobs.filter(j =>
    j.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canEdit = (job) => {
    return job.status === 'rejected' || job.status === 'pending';
  };

  if (showForm) {
    return (
      <div className="relative min-h-full">
        <div className="ambient-bg" />
        <div className="relative z-10">
          <Reveal>
            <div className="glass-panel rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <button 
                  onClick={closeForm}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                >
                  <ArrowLeft size={20} className="text-gray-500" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingJob ? 'Edit Job Posting' : 'Create New Job'}
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Job Title *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder='e.g. React Developer'
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder='e.g. Bangalore, India'
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Salary Range</label>
                    <input 
                      type="text" 
                      placeholder='e.g. ₹6-10 LPA'
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Job Type *</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none">
                      {['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Employee *</label>
                    <select 
                      required
                      value={formData.assignedEmployeeId}
                      onChange={(e) => {
                        const emp = employees.find(em => em._id === e.target.value);
                        setFormData({ 
                          ...formData, 
                          assignedEmployeeId: e.target.value,
                          department: emp?.department || ''
                        });
                      }}
                      className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none">
                      <option value="">Select an employee</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name} - {emp.department}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Department</label>
                    <input 
                      type="text" 
                      placeholder='e.g. Engineering, HR, Marketing'
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all" 
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description *</label>
                    <textarea 
                      rows="4" 
                      required
                      placeholder="Job description..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm resize-none text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" 
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tags (comma separated)</label>
                    <input 
                      type="text" 
                      placeholder="React, Node.js, MongoDB..."
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all" 
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button 
                    type="button"
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.97 }}
                    onClick={closeForm}
                    className="px-6 py-3 rounded-xl font-bold text-sm border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    type="submit" 
                    disabled={saving}
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 btn-gradient rounded-xl font-bold text-sm disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingJob ? 'Update Job' : 'Create Job'}
                  </motion.button>
                </div>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      <div className="ambient-bg" />
      <div className="relative z-10 space-y-5">

        {/* Header */}
        <Reveal>
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Job <span className="text-gradient-vivid">Postings</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{jobs.length} total postings</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={openCreate}
                className="btn-gradient px-5 py-3 rounded-xl font-bold flex items-center gap-2 text-sm">
                <Plus size={18} /> New Job Posting
              </motion.button>
            </div>
            <div className="relative group max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" size={18} />
              <input type="text" placeholder="Search jobs..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white text-sm" />
            </div>
          </div>
        </Reveal>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card rounded-2xl p-6 space-y-3">
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-10 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Job Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((job, i) => {
              const status = statusConfig[job.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <Reveal key={job._id || i} delay={i * 0.06}>
                  <motion.div whileHover={{ y: -4, scale: 1.01 }}
                    className="glass-card-interactive rounded-2xl p-5 gradient-border h-full flex flex-col group">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors text-sm">{job.title}</h3>
                      <div className="flex gap-1">
                        {canEdit(job) && (
                          <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                            onClick={() => openEdit(job)}
                            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                            <Edit3 size={14} className="text-blue-500" />
                          </motion.button>
                        )}
                        <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(job._id)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={14} className="text-red-500" />
                        </motion.button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${status.color}`}>
                        <StatusIcon size={10} />
                        {status.label}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-3">{job.company}</p>
                    <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 flex-1 mb-3">
                      {job.location && <div className="flex items-center gap-1.5"><MapPin size={12} /> {job.location}</div>}
                      {job.salary && <div className="flex items-center gap-1.5"><DollarSign size={12} /> {job.salary}</div>}
                      {job.type && <div className="flex items-center gap-1.5"><Clock size={12} /> {job.type}</div>}
                      {job.department && <div className="flex items-center gap-1.5"><Users size={12} /> {job.department}</div>}
                    </div>
                    
                    {job.rejectionReason && job.status === 'rejected' && (
                      <div className="mb-3 p-2 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-100 dark:border-red-500/20">
                        <p className="text-[10px] font-bold text-red-500 mb-1">Rejection Reason:</p>
                        <p className="text-[10px] text-red-400">{job.rejectionReason}</p>
                      </div>
                    )}
                    
                    {job.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.tags.slice(0, 4).map((tag, ti) => (
                          <span key={ti} className="text-[10px] bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md font-medium border border-amber-100 dark:border-amber-500/20">{tag}</span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <Reveal>
            <div className="text-center py-16 glass-panel rounded-2xl">
              <Briefcase size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 text-lg">{searchTerm ? 'No jobs match your search.' : 'No jobs posted yet.'}</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={openCreate}
                className="btn-gradient px-5 py-2.5 rounded-xl font-bold mt-4 text-sm inline-flex items-center gap-2">
                <Plus size={16} /> Create First Job
              </motion.button>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;
