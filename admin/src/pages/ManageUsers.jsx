import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trash2, ChevronDown, Search, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

const ROLES = ['student', 'company', 'admin', 'employee'];
const roleColors = {
  admin: 'bg-red-500/15 text-red-400 border border-red-500/20',
  company: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  student: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  employee: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
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

const ConfirmModal = ({ user, onConfirm, onCancel }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85 }}
      className="rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center border border-white/10"
      style={{ background: 'rgba(15,20,35,0.95)' }}>
      <div className="w-14 h-14 bg-red-500/15 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
        <AlertTriangle size={26} className="text-red-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Delete User?</h3>
      <p className="text-white/40 text-sm mb-6">Permanently delete <span className="font-semibold text-white/70">{user?.name}</span>?</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-white/10 rounded-xl text-white/60 font-medium hover:bg-white/5">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium">Delete</button>
      </div>
    </motion.div>
  </motion.div>
);

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const rowVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmUser, setConfirmUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [roleLoading, setRoleLoading] = useState({});

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      setUsers(await res.json());
    } catch { showToast('Failed to load users', 'error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirmUser) return;
    try {
      await fetch(`/api/admin/users/${confirmUser._id}`, { method: 'DELETE', credentials: 'include' });
      setUsers(prev => prev.filter(u => u._id !== confirmUser._id));
      showToast(`${confirmUser.name} deleted`);
    } catch { showToast('Failed to delete', 'error'); }
    finally { setConfirmUser(null); }
  };

  const handleRoleChange = async (userId, newRole) => {
    setRoleLoading(p => ({ ...p, [userId]: true }));
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const updated = await res.json();
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: updated.role } : u));
      showToast(`Role updated to ${newRole}`);
    } catch { showToast('Failed to update role', 'error'); }
    finally { setRoleLoading(p => { const n = { ...p }; delete n[userId]; return n; }); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full">
      <AnimatePresence>
        {toast && <Toast key="toast" {...toast} onDone={() => setToast(null)} />}
        {confirmUser && <ConfirmModal key="modal" user={confirmUser} onConfirm={handleDelete} onCancel={() => setConfirmUser(null)} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users size={22} className="text-blue-400" /> Manage Users
          </h2>
          <p className="text-white/30 text-sm mt-1">{users.length} total users</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
            className="pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-64"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden border border-white/8"
        style={{ background: 'rgba(255,255,255,0.03)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-blue-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/8">
                <tr>{['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-4 text-xs font-bold text-white/30 uppercase tracking-widest">{h}</th>
                ))}</tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="hidden" animate="show" className="divide-y divide-white/5">
                {filtered.length === 0
                  ? <tr><td colSpan={5} className="text-center py-12 text-white/20">No users found</td></tr>
                  : filtered.map(user => (
                    <motion.tr key={user._id} variants={rowVariants} className="hover:bg-white/5 transition-all">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-white/90">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-white/40 text-sm">{user.email}</td>
                      <td className="px-5 py-4">
                        <div className="relative inline-flex items-center">
                          <select value={user.role || 'student'} onChange={e => handleRoleChange(user._id, e.target.value)}
                            disabled={roleLoading[user._id]}
                            className={`appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-bold cursor-pointer ${roleColors[user.role] || 'bg-white/10 text-white/50'}`}
                            style={{ background: 'transparent' }}>
                            {ROLES.map(r => <option key={r} value={r} style={{ background: '#111827' }}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                          </select>
                          {roleLoading[user._id]
                            ? <Loader2 size={11} className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-white/40" />
                            : <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/30" />}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-white/30 text-xs">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <motion.button whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}
                          onClick={() => setConfirmUser(user)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/15">
                          <Trash2 size={12} /> Delete
                        </motion.button>
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
