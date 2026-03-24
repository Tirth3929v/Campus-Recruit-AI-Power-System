import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Globe, Phone, MapPin, Users, Calendar, User,
  CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp,
  Mail, UserCog, FileText, Clock,
} from 'lucide-react';
import axiosInstance from './axiosInstance';

const Badge = ({ children, color = 'amber' }) => {
  const colors = {
    amber:   'bg-amber-500/15 text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    red:     'bg-red-500/15 text-red-400 border-red-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${colors[color]}`}>
      {children}
    </span>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  value ? (
    <div className="flex items-start gap-2 text-xs">
      <Icon size={12} className="text-white/30 mt-0.5 flex-shrink-0" />
      <span className="text-white/40 flex-shrink-0">{label}:</span>
      <span className="text-white/70 break-all">{value}</span>
    </div>
  ) : null
);

const CompanyCard = ({ company, onApprove, onReject }) => {
  const [expanded, setExpanded] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState('');

  const handleApprove = async () => {
    setLoading('approve');
    await onApprove(company._id);
    setLoading('');
  };

  const handleReject = async () => {
    setLoading('reject');
    await onReject(company._id, rejectReason);
    setLoading('');
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Building2 size={20} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base leading-tight">{company.companyName}</h3>
              <p className="text-white/40 text-xs mt-0.5">{company.industry || 'Industry not specified'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge color="amber"><Clock size={9} className="mr-1" />Pending</Badge>
            <button onClick={() => setExpanded(v => !v)}
              className="p-1.5 rounded-lg hover:bg-white/8 text-white/30 hover:text-white/60 transition-colors">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Quick info */}
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <InfoRow icon={User}  label="Contact" value={company.name} />
          <InfoRow icon={Mail}  label="Email"   value={company.email} />
          <InfoRow icon={MapPin} label="Location" value={company.location} />
          <InfoRow icon={Phone} label="Phone"   value={company.contactNumber} />
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5">
            <div className="p-5 space-y-2">
              <InfoRow icon={Globe}   label="Website"      value={company.website} />
              <InfoRow icon={MapPin}  label="Address"      value={company.address} />
              <InfoRow icon={User}    label="Owner"        value={company.ownerName} />
              <InfoRow icon={UserCog} label="Manager"      value={company.mainManagerName} />
              <InfoRow icon={Mail}    label="Mgr. Email"   value={company.mainManagerEmail} />
              <InfoRow icon={Users}   label="Employees"    value={company.employeeCount} />
              <InfoRow icon={Calendar} label="Founded"     value={company.foundedYear?.toString()} />
              {company.description && (
                <div className="mt-2 p-3 bg-white/3 rounded-xl">
                  <p className="text-xs text-white/30 font-semibold mb-1 flex items-center gap-1"><FileText size={10} /> Description</p>
                  <p className="text-xs text-white/50 leading-relaxed">{company.description}</p>
                </div>
              )}
              <p className="text-[10px] text-white/20 pt-1">
                Registered: {new Date(company.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject reason input */}
      <AnimatePresence>
        {showReject && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-5 pb-3">
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional, will be emailed to company)..."
              rows={2}
              className="w-full bg-white/5 border border-red-500/20 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/40 resize-none" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="px-5 pb-5 flex gap-2">
        <button onClick={handleApprove} disabled={!!loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25 transition-all text-sm font-bold disabled:opacity-50">
          {loading === 'approve' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          Approve
        </button>
        {!showReject ? (
          <button onClick={() => setShowReject(true)} disabled={!!loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm font-bold disabled:opacity-50">
            <XCircle size={14} /> Reject
          </button>
        ) : (
          <div className="flex-1 flex gap-2">
            <button onClick={handleReject} disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all text-xs font-bold disabled:opacity-50">
              {loading === 'reject' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
              Confirm
            </button>
            <button onClick={() => { setShowReject(false); setRejectReason(''); }}
              className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white/60 transition-all text-xs">
              Cancel
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ── Main Page ─────────────────────────────────────────────────
const CompanyApprovals = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    axiosInstance.get('/admin/companies/pending')
      .then(r => setCompanies(r.data || []))
      .catch(() => showToast('Failed to load pending companies', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    try {
      await axiosInstance.put(`/admin/companies/${id}/approve`);
      setCompanies(prev => prev.filter(c => c._id !== id));
      showToast('Company approved and notified via email ✅');
    } catch (err) {
      showToast(err.response?.data?.message || 'Approval failed', 'error');
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await axiosInstance.delete(`/admin/companies/${id}/reject`, { data: { reason } });
      setCompanies(prev => prev.filter(c => c._id !== id));
      showToast('Company rejected and removed');
    } catch (err) {
      showToast(err.response?.data?.message || 'Rejection failed', 'error');
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Company Approvals</h1>
            <p className="text-white/30 text-sm mt-0.5">Review and verify company registrations</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Clock size={14} className="text-amber-400" />
            <span className="text-amber-400 font-bold text-sm">{companies.length} Pending</span>
          </div>
        </div>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`p-3 rounded-xl text-sm font-medium border ${
              toast.type === 'error'
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-white/20" />
        </div>
      ) : companies.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-20 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <CheckCircle size={40} className="text-emerald-500/40 mx-auto mb-3" />
          <p className="text-white/40 font-semibold">All caught up!</p>
          <p className="text-white/20 text-sm mt-1">No pending company registrations</p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence>
            {companies.map(c => (
              <CompanyCard key={c._id} company={c} onApprove={handleApprove} onReject={handleReject} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CompanyApprovals;
