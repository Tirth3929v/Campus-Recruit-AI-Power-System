import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Trash2, Search, Loader2, AlertTriangle, CheckCircle2, Eye, X, FileText, Video, Clock, Users, Star, TrendingUp, BarChart3, PlayCircle, Award, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
  <div className="rounded-xl p-4 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-white/40 mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
    </div>
  </div>
);

const InsightCard = ({ title, value, icon: Icon, color }) => (
  <div className="rounded-xl p-4 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-white/40">{title}</p>
        <p className="text-sm text-white font-medium truncate">{value}</p>
      </div>
    </div>
  </div>
);

const Toast = ({ message, type, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-semibold text-sm ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />} {message}
    </motion.div>
  );
};

const ConfirmModal = ({ course, onConfirm, onCancel }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85 }}
      className="rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center border border-white/10"
      style={{ background: 'rgba(15,20,35,0.95)' }}>
      <div className="w-14 h-14 bg-red-500/15 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
        <AlertTriangle size={26} className="text-red-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Delete Course?</h3>
      <p className="text-white/40 text-sm mb-6">Permanently delete <span className="font-semibold text-white/70">{course?.title}</span>?</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-white/10 rounded-xl text-white/60 font-medium hover:bg-white/5">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium">Delete</button>
      </div>
    </motion.div>
  </motion.div>
);

const CourseDetailModal = ({ course, onClose, onDelete }) => {
  if (!course) return null;

  const youtubeLinks = course.chapters?.filter(ch => ch.videoUrl)?.map(ch => ({ title: ch.title, url: ch.videoUrl })) || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85 }}
        className="rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/10"
        style={{ background: 'rgba(15,20,35,0.98)' }}>
        
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-lg font-bold text-white truncate pr-4">{course.title}</h3>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="rounded-xl overflow-hidden border border-white/10 mb-4">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <BookOpen size={48} className="text-white/20" />
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-white/40 mb-1">Course Name</p>
                  <p className="text-sm text-white/90 font-medium">{course.title}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Course ID</p>
                  <p className="text-sm text-white/60 font-mono">C{course._id?.substring(0, 6).toUpperCase() || '000'}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-white/40 mb-1">Employee Name</p>
                <p className="text-sm text-white/90 font-medium">{course.instructor || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Employee ID</p>
                <p className="text-sm text-white/60 font-mono">{course.createdBy ? course.createdBy.substring(0, 8).toUpperCase() : 'EMP000'}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Created Date</p>
                <p className="text-sm text-white/60">{course.createdDate || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Total Lessons</p>
                <p className="text-sm text-white/60">{course.totalLessons || 0}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white/70 mb-3">Course Description</h4>
            <div className="rounded-xl p-4 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-sm text-white/60 leading-relaxed">{course.description || 'No description provided.'}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white/70 mb-3">Lessons</h4>
            <div className="space-y-2">
              {course.chapters && course.chapters.length > 0 ? (
                course.chapters.map((chapter, index) => (
                  <div key={chapter.chapterId || index} className="flex items-center gap-3 p-3 rounded-xl border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <p className="text-sm text-white font-medium">Lesson {index + 1} — {chapter.title || 'Untitled'}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/30 p-3">No lessons available</p>
              )}
            </div>
          </div>

          {(course.pdfFile || youtubeLinks.length > 0) && (
            <div>
              <h4 className="text-sm font-bold text-white/70 mb-3">Resources</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.pdfFile && (
                  <a href={course.pdfFile} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white/90 font-medium">PDF Notes</p>
                      <p className="text-xs text-white/40">View / Download</p>
                    </div>
                  </a>
                )}
                {youtubeLinks.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
                      <Video size={18} className="text-red-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white/90 font-medium">YouTube Video</p>
                      <p className="text-xs text-white/40 truncate">{link.title}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            Close
          </button>
          <button onClick={() => onDelete(course)} className="px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/15 transition-colors flex items-center gap-2">
            <Trash2 size={14} /> Delete Course
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const rowVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmCourse, setConfirmCourse] = useState(null);
  const [viewingCourse, setViewingCourse] = useState(null);
  const [toast, setToast] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('published'); // published, pending_approval, draft

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => { 
    fetchCourses(); 
    fetchAnalytics();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/courses', { credentials: 'include' });
      const data = await res.json();
      setCourses(data);
    } catch { showToast('Failed to load courses', 'error'); }
    finally { setLoading(false); }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const res = await fetch('/api/admin/course-analytics', { credentials: 'include' });
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleResetAnalytics = async () => {
    if (!window.confirm('Are you sure you want to reset all analytics data? This will clear all enrollments, ratings, and purchase records.')) return;
    try {
      const res = await fetch('/api/admin/reset-analytics', { 
        method: 'POST', 
        credentials: 'include' 
      });
      const data = await res.json();
      showToast('Analytics data has been reset');
      fetchAnalytics();
    } catch { showToast('Failed to reset analytics', 'error'); }
  };

  const handleDelete = async () => {
    if (!confirmCourse) return;
    try {
      await fetch(`/api/admin/courses/${confirmCourse._id}`, { method: 'DELETE', credentials: 'include' });
      setCourses(prev => prev.filter(c => c._id !== confirmCourse._id));
      showToast(`"${confirmCourse.title}" deleted`);
      fetchAnalytics();
    } catch { showToast('Failed to delete', 'error'); }
    finally { setConfirmCourse(null); }
  };

  const handleViewDetails = async (course) => {
    try {
      const res = await fetch(`/api/admin/courses/${course._id}`, { credentials: 'include' });
      const data = await res.json();
      setViewingCourse(data);
    } catch { showToast('Failed to load course details', 'error'); }
  };

  const handleApproveCourse = async (course) => {
    try {
      const res = await fetch(`/api/courses/${course._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'published' })
      });
      if (res.ok) {
        showToast('Course approved and published!');
        fetchCourses();
        fetchAnalytics();
      } else {
        showToast('Failed to approve course', 'error');
      }
    } catch { showToast('Failed to approve course', 'error'); }
  };

  const handleRejectCourse = async (course) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    try {
      const res = await fetch(`/api/courses/${course._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'draft', rejectionReason: reason || '' })
      });
      if (res.ok) {
        showToast('Course rejected and moved to draft');
        fetchCourses();
      } else {
        showToast('Failed to reject course', 'error');
      }
    } catch { showToast('Failed to reject course', 'error'); }
  };

  const filtered = courses.filter(c => {
    const matchesSearch = c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor?.toLowerCase().includes(search.toLowerCase()) ||
      c.createdBy?.toLowerCase().includes(search.toLowerCase());
    
    if (activeTab === 'pending_approval') {
      return matchesSearch && c.status === 'pending_approval';
    } else if (activeTab === 'draft') {
      return matchesSearch && c.status === 'draft';
    }
    return matchesSearch && c.status === 'published';
  });

  const pendingCount = courses.filter(c => c.status === 'pending_approval').length;

  const ratingData = analytics?.charts?.ratingDistribution ? [
    { name: '5 ⭐', count: analytics.charts.ratingDistribution[5], fill: '#fbbf24' },
    { name: '4 ⭐', count: analytics.charts.ratingDistribution[4], fill: '#a3e635' },
    { name: '3 ⭐', count: analytics.charts.ratingDistribution[3], fill: '#60a5fa' },
    { name: '2 ⭐', count: analytics.charts.ratingDistribution[2], fill: '#fb923c' },
    { name: '1 ⭐', count: analytics.charts.ratingDistribution[1], fill: '#f87171' },
  ] : [];

  return (
    <div className="space-y-6 w-full">
      <AnimatePresence>
        {toast && <Toast key="toast" {...toast} onDone={() => setToast(null)} />}
        {confirmCourse && <ConfirmModal key="modal" course={confirmCourse} onConfirm={handleDelete} onCancel={() => setConfirmCourse(null)} />}
        {viewingCourse && <CourseDetailModal key="detail" course={viewingCourse} onClose={() => setViewingCourse(null)} onDelete={(course) => { setViewingCourse(null); setConfirmCourse(course); }} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen size={22} className="text-teal-400" /> Manage Courses
          </h2>
          <div className="flex gap-2 mt-2">
            {[
              { key: 'published', label: 'Published' },
              { key: 'pending_approval', label: 'Pending Approval', badge: pendingCount },
              { key: 'draft', label: 'Draft' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.key 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {tab.label}
                {tab.badge > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input aria-label="Input field"  value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..."
            className="pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/40 w-64"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
      </motion.div>

      {analyticsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={28} className="animate-spin text-teal-400" />
        </div>
      ) : analytics && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BarChart3 size={20} className="text-teal-400" />
              <h3 className="text-lg font-bold text-white">Course Analytics Dashboard</h3>
            </div>
            <button onClick={handleResetAnalytics} className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/15 transition-colors flex items-center gap-1.5">
              <RefreshCw size={12} /> Reset Analytics
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AnalyticsCard title="Total Courses" value={analytics.overview?.totalCourses || 0} icon={BookOpen} color="bg-teal-500/15 text-teal-400" />
            <AnalyticsCard title="Users Enrolled" value={analytics.overview?.totalEnrolledUsers || 0} icon={Users} color="bg-blue-500/15 text-blue-400" />
            <AnalyticsCard title="Paid Users" value={analytics.overview?.paidUsers || 0} icon={Award} color="bg-amber-500/15 text-amber-400" />
            <AnalyticsCard title="Free Users" value={analytics.overview?.freeUsers || 0} icon={PlayCircle} color="bg-emerald-500/15 text-emerald-400" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InsightCard title="Completed" value={analytics.progress?.completed || 0} icon={CheckCircle2} color="bg-emerald-500/15 text-emerald-400" />
            <InsightCard title="Running" value={analytics.progress?.running || 0} icon={PlayCircle} color="bg-blue-500/15 text-blue-400" />
            <InsightCard title="Incomplete" value={analytics.progress?.incomplete || 0} icon={Clock} color="bg-red-500/15 text-red-400" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <InsightCard title="Highest Rated" value={`${analytics.ratings?.highestRatedCourse?.title || 'N/A'} (${analytics.ratings?.highestRatedCourse?.rating?.toFixed(1) || '0.0'} ⭐)`} icon={Star} color="bg-yellow-500/15 text-yellow-400" />
            <InsightCard title="Avg Rating" value={`${analytics.ratings?.averageRating || '0.0'} ⭐`} icon={Award} color="bg-teal-500/15 text-teal-400" />
            <InsightCard title="Most Reviewed" value={analytics.ratings?.mostReviewedCourse?.title || 'N/A'} icon={TrendingUp} color="bg-cyan-500/15 text-cyan-400" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <InsightCard title="Most Enrolled" value={`${analytics.demand?.mostEnrolledCourse?.title || 'N/A'} (${analytics.demand?.mostEnrolledCourse?.count || 0})`} icon={Users} color="bg-green-500/15 text-green-400" />
            <InsightCard title="Most Completed" value={`${analytics.demand?.mostCompletedCourse?.title || 'N/A'} (${analytics.demand?.mostCompletedCourse?.count || 0})`} icon={CheckCircle2} color="bg-emerald-500/15 text-emerald-400" />
            <InsightCard title="Most Viewed" value={`${analytics.demand?.mostViewedCourse?.title || 'N/A'} (${analytics.demand?.mostViewedCourse?.count || 0})`} icon={Eye} color="bg-blue-500/15 text-blue-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl p-4 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <h4 className="text-sm font-bold text-white/70 mb-4">Course Enrollment Chart</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.charts?.enrollmentByCourse || []} layout="vertical">
                  <XAxis type="number" stroke="#666" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#666" fontSize={10} width={100} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="enrollments" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl p-4 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <h4 className="text-sm font-bold text-white/70 mb-4">Course Progress (Pie Chart)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analytics.charts?.progressDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {(analytics.charts?.progressDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {(analytics.charts?.progressDistribution || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs text-white/60">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl p-4 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <h4 className="text-sm font-bold text-white/70 mb-4">Course Rating Distribution</h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={ratingData}>
                <XAxis dataKey="name" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {ratingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl overflow-hidden border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10">
                  <tr>
                    {['Course Name', 'Enrollments', 'Completed', 'Running', 'Incomplete', 'Rating', 'Reviews'].map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-bold text-white/40 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(analytics.courseAnalytics || []).map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-white/80 font-medium max-w-[200px] truncate">{row.name}</td>
                      <td className="px-4 py-3 text-white/60">{row.enrollments}</td>
                      <td className="px-4 py-3 text-emerald-400">{row.completed}</td>
                      <td className="px-4 py-3 text-blue-400">{row.running}</td>
                      <td className="px-4 py-3 text-red-400">{row.incomplete}</td>
                      <td className="px-4 py-3 text-yellow-400">{row.rating} ⭐</td>
                      <td className="px-4 py-3 text-white/60">{row.reviews}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden border border-white/8"
        style={{ background: 'rgba(255,255,255,0.03)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-teal-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/8">
                <tr>{['Employee Name', 'Employee ID', 'Course Name', 'Course ID', 'Status', 'Created Date', 'Created Time', 'Total Lessons', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-4 text-xs font-bold text-white/30 uppercase tracking-widest">{h}</th>
                ))}</tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="hidden" animate="show" className="divide-y divide-white/5">
                {filtered.length === 0
                  ? <tr><td colSpan={8} className="text-center py-12 text-white/20">No courses found</td></tr>
                  : filtered.map(course => (
                    <motion.tr key={course._id} variants={rowVariants} className="hover:bg-white/5 transition-all">
                      <td className="px-5 py-4 min-w-[180px]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                            {course.instructor?.charAt(0).toUpperCase() || 'E'}
                          </div>
                          <span className="font-semibold text-white/90 whitespace-nowrap">{course.instructor || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-white/40 text-sm font-mono">{course.createdBy ? course.createdBy.substring(0, 8).toUpperCase() : 'EMP000'}</td>
                      <td className="px-5 py-4">
                        <span className="font-medium text-white/90 max-w-[200px] truncate block">{course.title}</span>
                      </td>
                      <td className="px-5 py-4 text-white/40 text-xs font-mono">C{course._id?.substring(0, 6).toUpperCase() || '000'}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                          course.status === 'published' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                          course.status === 'pending_approval' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                          'bg-gray-500/15 text-gray-400 border border-gray-500/20'
                        }`}>
                          {course.status === 'published' ? 'Published' : course.status === 'pending_approval' ? 'Pending' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white/30 text-xs">{course.createdDate || '—'}</td>
                      <td className="px-5 py-4 text-white/30 text-xs">{course.createdTime || '—'}</td>
                      <td className="px-5 py-4">
                        <span className="text-white/60 font-medium">{course.totalLessons || 0}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {course.status === 'pending_approval' && (
                            <>
                              <motion.button whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}
                                onClick={() => handleApproveCourse(course)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/15">
                                <CheckCircle2 size={12} /> Approve
                              </motion.button>
                              <motion.button whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}
                                onClick={() => handleRejectCourse(course)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/15">
                                <X size={12} /> Reject
                              </motion.button>
                            </>
                          )}
                          {course.status !== 'pending_approval' && (
                            <>
                              <motion.button whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}
                                onClick={() => handleViewDetails(course)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-blue-500/15">
                                <Eye size={12} /> View
                              </motion.button>
                              <motion.button whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}
                                onClick={() => setConfirmCourse(course)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/15">
                                <Trash2 size={12} /> Delete
                              </motion.button>
                            </>
                          )}
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

export default ManageCourses;
