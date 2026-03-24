import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Eye, Edit3, Trash2, User } from 'lucide-react';
import axiosInstance from '../context/axiosInstance';

const CourseUpdateApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      const { data } = await axiosInstance.get(`/course-updates/all?status=${filter}`);
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setAdminResponse('');
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setLoading(true);

    try {
      await axiosInstance.put(`/course-updates/approve/${selectedRequest._id}`, {
        adminResponse
      });
      alert('Request approved successfully!');
      setShowModal(false);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !adminResponse.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setLoading(true);

    try {
      await axiosInstance.put(`/course-updates/reject/${selectedRequest._id}`, {
        adminResponse
      });
      alert('Request rejected');
      setShowModal(false);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/20'
    };
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle
    };
    const Icon = icons[status];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${styles[status]}`}>
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Course Update Approvals</h1>
          <p className="text-white/40 text-sm mt-1">Review and approve employee course update requests</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === status
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-white/5 text-white/40 hover:text-white/70 border border-white/10'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Clock size={48} className="mx-auto text-white/20 mb-4" />
            <p className="text-white/40">No {filter} requests</p>
          </div>
        ) : (
          requests.map((req) => (
            <motion.div
              key={req._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {req.updateType === 'edit' ? (
                      <Edit3 size={18} className="text-blue-400" />
                    ) : (
                      <Trash2 size={18} className="text-red-400" />
                    )}
                    <h3 className="text-white font-bold text-lg">{req.course?.title}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/40">
                    <span className="flex items-center gap-1.5">
                      <User size={14} />
                      {req.requestedByName}
                    </span>
                    <span>•</span>
                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className={req.updateType === 'edit' ? 'text-blue-400' : 'text-red-400'}>
                      {req.updateType === 'edit' ? 'Edit Request' : 'Delete Request'}
                    </span>
                  </div>
                </div>
                {getStatusBadge(req.status)}
              </div>

              {req.reason && (
                <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-xs text-white/40 mb-1">Reason:</p>
                  <p className="text-sm text-white/70">{req.reason}</p>
                </div>
              )}

              {req.adminResponse && (
                <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <p className="text-xs text-blue-400 mb-1">Admin Response:</p>
                  <p className="text-sm text-white/70">{req.adminResponse}</p>
                </div>
              )}

              <button
                onClick={() => handleViewDetails(req)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-sm font-semibold"
              >
                <Eye size={14} />
                View Details
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">Request Details</h2>

              {/* Course Info */}
              <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-xs text-white/40 mb-2">Course</p>
                <p className="text-white font-bold text-lg">{selectedRequest.course?.title}</p>
                <p className="text-white/40 text-sm mt-1">{selectedRequest.course?.instructor}</p>
              </div>

              {/* Employee Info */}
              <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-xs text-white/40 mb-2">Requested By</p>
                <p className="text-white font-semibold">{selectedRequest.requestedByName}</p>
                <p className="text-white/40 text-sm">{selectedRequest.requestedByEmail}</p>
              </div>

              {/* Update Type */}
              <div className="mb-6">
                <p className="text-xs text-white/40 mb-2">Update Type</p>
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                  selectedRequest.updateType === 'edit' 
                    ? 'bg-blue-500/10 text-blue-400' 
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {selectedRequest.updateType === 'edit' ? 'Edit Course' : 'Delete Course'}
                </span>
              </div>

              {/* Changes */}
              {selectedRequest.updateType === 'edit' && selectedRequest.updatedFields && (
                <div className="mb-6">
                  <p className="text-xs text-white/40 mb-3">Proposed Changes</p>
                  <div className="space-y-3">
                    {Object.entries(selectedRequest.updatedFields).map(([key, value]) => {
                      // Handle thumbnail/image
                      if (key === 'thumbnail' && value) {
                        return (
                          <div key={key} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <p className="text-xs text-white/40 mb-2 capitalize">Course Thumbnail</p>
                            <img src={value} alt="Thumbnail" className="w-full h-40 object-cover rounded-lg" />
                          </div>
                        );
                      }
                      // Handle modules array separately
                      if (key === 'modules' && Array.isArray(value)) {
                        return (
                          <div key={key} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <p className="text-xs text-white/40 mb-2 capitalize">Course Modules</p>
                            <div className="space-y-2">
                              {value.map((module, idx) => (
                                <div key={idx} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                  <p className="text-white text-sm font-semibold mb-1">Module {idx + 1}: {module.title}</p>
                                  <p className="text-white/60 text-xs line-clamp-3">{module.content}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      // Handle regular fields
                      return (
                        <div key={key} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <p className="text-xs text-white/40 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-white text-sm">{typeof value === 'string' ? value : JSON.stringify(value)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reason */}
              {selectedRequest.reason && (
                <div className="mb-6">
                  <p className="text-xs text-white/40 mb-2">Reason</p>
                  <p className="text-white/70 text-sm">{selectedRequest.reason}</p>
                </div>
              )}

              {/* Admin Response Input */}
              {selectedRequest.status === 'pending' && (
                <div className="mb-6">
                  <label className="text-xs text-white/40 mb-2 block">Admin Response (Optional)</label>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    rows={3}
                    placeholder="Add a note for the employee..."
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 outline-none resize-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl text-white/60 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  Close
                </button>
                {selectedRequest.status === 'pending' && (
                  <>
                    <button
                      onClick={handleReject}
                      disabled={loading}
                      className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors font-semibold disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={loading}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Approve'}
                    </button>
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

export default CourseUpdateApprovals;
