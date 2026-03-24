import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trash2, Shield, ChevronDown, Search, Loader2, AlertTriangle, CheckCircle, FileText, X, Trophy } from 'lucide-react';
import axiosInstance from './axiosInstance';
import ScorecardModal from '../components/ScorecardModal';

const ROLES = ['student', 'company', 'admin'];

const roleColors = {
  admin: 'bg-red-100 text-red-700',
  company: 'bg-blue-100 text-blue-700',
  student: 'bg-emerald-100 text-emerald-700',
};

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

const ConfirmModal = ({ user, onConfirm, onCancel }) => (
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
      <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User?</h3>
      <p className="text-gray-500 text-sm mb-6">
        This will permanently delete <span className="font-semibold text-gray-800">{user?.name}</span> and all their data. This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors">Delete</button>
      </div>
    </motion.div>
  </motion.div>
);

const ResumeModal = ({ resumeData, onClose }) => {
  if (!resumeData) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden relative"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText size={20} className="text-blue-500" />
            {resumeData.name}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 bg-gray-100 p-2 overflow-hidden">
          {resumeData.url ? (
            <iframe
              src={resumeData.url}
              title="Resume Viewer"
              className="w-full h-full rounded-xl border border-gray-200 shadow-inner bg-white"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <FileText size={48} className="mb-4 text-gray-300" />
              <p>Preview not available</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const rowVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmUser, setConfirmUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [roleLoading, setRoleLoading] = useState({});
  const [viewingResume, setViewingResume] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(null);
  const [scorecardUser, setScorecardUser] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmUser) return;
    try {
      await axiosInstance.delete(`/admin/users/${confirmUser._id}`);
      setUsers(prev => prev.filter(u => u._id !== confirmUser._id));
      showToast(`${confirmUser.name} has been deleted`);
    } catch {
      showToast('Failed to delete user', 'error');
    } finally {
      setConfirmUser(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setRoleLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const res = await axiosInstance.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? res.data : u));
      showToast(`Role updated to ${newRole}`);
    } catch {
      showToast('Failed to update role', 'error');
    } finally {
      setRoleLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleViewResume = async (student) => {
    setResumeLoading(student._id);
    try {
      const res = await axiosInstance.get(`/admin/students/${student._id}/resume`);
      if (res.data && res.data.resume) {
        setViewingResume({
          name: res.data.resumeName || `${student.name}'s Resume`,
          url: res.data.resume
        });
      } else {
        showToast('No resume found for this student', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Failed to fetch resume', 'error');
    } finally {
      setResumeLoading(null);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && <Toast key="toast" message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
        {confirmUser && <ConfirmModal key="modal" user={confirmUser} onConfirm={handleDelete} onCancel={() => setConfirmUser(null)} />}
        {viewingResume && <ResumeModal key="resume" resumeData={viewingResume} onClose={() => setViewingResume(null)} />}
        {scorecardUser && <ScorecardModal key="scorecard" isOpen={!!scorecardUser} userId={scorecardUser._id} onClose={() => setScorecardUser(null)} />}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={22} className="text-blue-600" /> Manage Users
          </h2>
          <p className="text-gray-400 text-sm mt-1">{users.length} total users registered</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input aria-label="Input field" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all w-64"
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-800 font-semibold border-b border-gray-100">
                <tr>
                  {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="hidden" animate="show" className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400">No users found</td></tr>
                ) : filtered.map((user, i) => (
                  <motion.tr key={user._id} variants={rowVariants} whileHover={{ backgroundColor: '#f9fafb' }} className="transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{user.email}</td>
                    <td className="px-5 py-4">
                      <div className="relative inline-flex items-center">
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user._id, e.target.value)}
                          disabled={roleLoading[user._id]}
                          className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold cursor-pointer border-0 focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 transition-all ${roleColors[user.role] || 'bg-gray-100 text-gray-700'}`}
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                        </select>
                        {roleLoading[user._id]
                          ? <Loader2 size={12} className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin" />
                          : <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        }
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {user.role === 'student' && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => setScorecardUser(user)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                            >
                              <Trophy size={13} /> Scorecard
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewResume(user)}
                              disabled={resumeLoading === user._id}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {resumeLoading === user._id ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
                              Resume
                            </motion.button>
                          </>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                          onClick={() => setConfirmUser(user)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={13} /> Delete
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ManageUsers;