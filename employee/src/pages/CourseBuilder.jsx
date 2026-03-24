import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, Trash2, Send, Image as ImageIcon,
  BookOpen, ChevronDown, ChevronUp, FileText,
  CheckCircle2, Loader2, AlertCircle, Search, Filter, History, Clock
} from 'lucide-react';
import axiosInstance from './axiosInstance';
import { useAuth } from '../context/AuthContext';
import RichTextEditor from '../components/RichTextEditor';

const Toast = ({ type, message }) => {
    const styles = {
        success: 'bg-emerald-600',
        error: 'bg-red-600',
        loading: 'bg-blue-600',
    };
    const icons = {
        success: <CheckCircle2 size={17} />,
        error: <AlertCircle size={17} />,
        loading: <Loader2 size={17} className="animate-spin" />,
    };
    return (
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold ${styles[type]}`}>
            {icons[type]} {message}
        </motion.div>
    );
};

const fieldBase = 'w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all';
const fieldStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' };
const labelCls = 'block text-xs font-bold text-white/30 uppercase tracking-widest mb-1.5';

const CourseBuilder = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [view, setView] = useState('list');
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [courseData, setCourseData] = useState({
        title: '', description: '', instructor: '', level: 'Beginner',
        category: 'Development', courseType: 'free', price: 0, duration: '', thumbnail: '', createdBy: '',
        courseNotes: '', pdfFile: ''
    });
    const [chapters, setChapters] = useState([]);
    const [createdCourses, setCreatedCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [collapsedIds, setCollapsedIds] = useState(new Set());
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const thumbnailInputRef = React.useRef(null);
    const notesInputRef = React.useRef(null);
    const pdfInputRef = React.useRef(null);
    
    // Search and Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [levelFilter, setLevelFilter] = useState('all');
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedCourseHistory, setSelectedCourseHistory] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        fetchCreatedCourses();
    }, []);

    // Auto-populate createdBy from auth user
    useEffect(() => {
        if (user) {
            const userIdentity = user.email || user.name || '';
            setCourseData(prev => ({
                ...prev,
                createdBy: prev.createdBy || userIdentity
            }));
        }
    }, [user]);

    // Filter and search courses
    const filteredCourses = useMemo(() => {
        return createdCourses.filter(course => {
            const matchesSearch = searchQuery === '' || 
                course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.instructor?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
            
            return matchesSearch && matchesLevel;
        });
    }, [createdCourses, searchQuery, levelFilter]);

    const fetchCreatedCourses = async () => {
        try {
            const res = await axiosInstance.get('/courses/employee/course-stats');
            setCreatedCourses(res.data);
        } catch (err) {
            console.error('Error fetching courses:', err);
            // Fallback to local storage
            const localHistory = JSON.parse(localStorage.getItem('employeeCourseHistory') || '[]');
            if (localHistory.length > 0) {
                setCreatedCourses(localHistory);
            }
        } finally {
            setCoursesLoading(false);
        }
    };

    const showToast = (type, message, ms = 3500) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), ms);
    };

    const handleCourseChange = (e) => {
        const { name, value } = e.target;
        setCourseData(prev => ({ ...prev, [name]: value }));
    };

    const handleThumbnailFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { showToast('error', 'Please select an image file.'); return; }
        if (file.size > 5 * 1024 * 1024) { showToast('error', 'Image must be under 5 MB.'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => setCourseData(prev => ({ ...prev, thumbnail: ev.target.result }));
        reader.readAsDataURL(file);
    };

    const clearThumbnail = () => {
        setCourseData(prev => ({ ...prev, thumbnail: '' }));
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    };

    const handleNotesFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== 'application/pdf') { showToast('error', 'Please select a PDF file.'); return; }
        if (file.size > 10 * 1024 * 1024) { showToast('error', 'PDF must be under 10 MB.'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => setCourseData(prev => ({ ...prev, courseNotes: ev.target.result }));
        reader.readAsDataURL(file);
    };

    const clearNotes = () => {
        setCourseData(prev => ({ ...prev, courseNotes: '' }));
        if (notesInputRef.current) notesInputRef.current.value = '';
    };

    const handlePdfFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== 'application/pdf') { showToast('error', 'Please select a PDF file.'); return; }
        if (file.size > 10 * 1024 * 1024) { showToast('error', 'PDF must be under 10 MB.'); return; }
        
        const formData = new FormData();
        formData.append('pdfFile', file);
        
        axiosInstance.post(`/courses/temp-upload-pdf`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => {
            if (res.data.pdfFile) {
                setCourseData(prev => ({ ...prev, pdfFile: res.data.pdfFile }));
                showToast('success', 'PDF uploaded successfully');
            }
        }).catch(err => {
            showToast('error', 'Failed to upload PDF');
            console.error(err);
        });
    };

    const clearPdfFile = () => {
        setCourseData(prev => ({ ...prev, pdfFile: '' }));
        if (pdfInputRef.current) pdfInputRef.current.value = '';
    };

    const addChapter = () => {
        const newId = `chap_${Date.now()}`;
        setChapters(prev => [...prev, { chapterId: newId, title: '', content: '', order: prev.length + 1 }]);
    };

    const removeChapter = (id) => {
        setChapters(prev => prev.filter(c => c.chapterId !== id).map((c, i) => ({ ...c, order: i + 1 })));
        setCollapsedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    };

    const updateChapter = (id, field, value) =>
        setChapters(prev => prev.map(c => c.chapterId === id ? { ...c, [field]: value } : c));

    const toggleCollapse = (id) => {
        setCollapsedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
    };

    const handleSubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        if (!courseData.title.trim() || !courseData.instructor.trim() || !courseData.description.trim()) {
            showToast('error', 'Title, Instructor, and Description are required.'); return;
        }
        if (chapters.length === 0) { showToast('error', 'Add at least one chapter.'); return; }
        for (const ch of chapters) {
            if (!ch.title.trim() || !ch.content.trim()) {
                showToast('error', `Chapter ${ch.order} needs a title and content.`); return;
            }
        }
        setSubmitting(true);
        showToast('loading', editingCourseId ? 'Updating course…' : 'Submitting course…', 30000);
        try {
            let res;
            if (editingCourseId) {
                // Update existing course
                res = await axiosInstance.put(`/courses/${editingCourseId}`, { ...courseData, chapters });
                showToast('success', `"${res.data.course.title}" updated successfully! 🎉`);
            } else {
                // Create new course
                res = await axiosInstance.post('/courses', { ...courseData, chapters });
                showToast('success', `"${res.data.course.title}" submitted! 🎉`);
            }
            
            const newCourse = res.data.course;
            
            // Save to LocalStorage as backup
            const localHistory = JSON.parse(localStorage.getItem('employeeCourseHistory') || '[]');
            const courseForHistory = {
                courseId: newCourse._id || newCourse.courseId,
                title: newCourse.title,
                description: newCourse.description,
                instructor: newCourse.instructor,
                thumbnail: newCourse.thumbnail,
                status: newCourse.status || 'pending',
                category: newCourse.category,
                level: newCourse.level,
                duration: newCourse.duration,
                courseType: newCourse.courseType,
                price: newCourse.price,
                totalLessons: chapters.length,
                totalEnrolled: 0,
                completed: 0,
                inProgress: 0,
                createdAt: new Date().toISOString()
            };
            
            if (editingCourseId) {
                // Update in local storage
                const updatedHistory = localHistory.map(c => 
                    c.courseId === editingCourseId ? courseForHistory : c
                );
                localStorage.setItem('employeeCourseHistory', JSON.stringify(updatedHistory));
            } else {
                // Add new to local storage
                localStorage.setItem('employeeCourseHistory', JSON.stringify([courseForHistory, ...localHistory]));
            }
            
            const userIdentity = user?.email || user?.name || courseData.createdBy || '';
            setCourseData({ title: '', description: '', instructor: '', level: 'Beginner', category: 'Development', courseType: 'free', price: 0, duration: '', thumbnail: '', createdBy: userIdentity, courseNotes: '', pdfFile: '' });
            setChapters([]);
            setEditingCourseId(null);
            setView('list');
            fetchCreatedCourses();
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Operation failed.');
        } finally { setSubmitting(false); }
    };

    const viewUpdateHistory = async (courseId, courseTitle) => {
        setHistoryLoading(true);
        setShowHistoryModal(true);
        try {
            const res = await axiosInstance.get(`/course-updates/history/${courseId}`);
            setSelectedCourseHistory({ title: courseTitle, history: res.data.history || [] });
        } catch (err) {
            showToast('error', 'Failed to load update history');
            console.error(err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleEditCourse = async (courseId) => {
        try {
            const res = await axiosInstance.get(`/courses/${courseId}`);
            const course = res.data;
            
            setCourseData({
                title: course.title || '',
                description: course.description || '',
                instructor: course.instructor || '',
                level: course.level || 'Beginner',
                category: course.category || 'Development',
                courseType: course.courseType || 'free',
                price: course.price || 0,
                duration: course.duration || '',
                thumbnail: course.thumbnail || '',
                createdBy: course.createdBy || '',
                courseNotes: course.courseNotes || '',
                pdfFile: course.pdfFile || ''
            });
            
            setChapters(course.chapters || []);
            setEditingCourseId(courseId);
            setView('create');
        } catch (err) {
            showToast('error', 'Failed to load course for editing');
            console.error(err);
        }
    };

    if (view === 'list') {
        return (
            <div className="w-full">
                <AnimatePresence>
                    {toast && <Toast key="toast" type={toast.type} message={toast.message} />}
                </AnimatePresence>

                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
                            <BookOpen size={12} /> My Courses
                        </div>
                        <h2 className="text-2xl font-bold text-white">Created Courses</h2>
                        <p className="text-sm text-white/30 mt-1">Manage your created courses and view analytics.</p>
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                            <span className="text-xs text-teal-400">💡</span>
                            <span className="text-xs text-teal-300">Students get 5% discount after 3 paid courses, 10% after 5!</span>
                        </div>
                    </div>
                    <motion.button onClick={() => setView('create')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 text-white px-6 py-3 rounded-xl font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 8px 24px rgba(16,185,129,0.25)' }}>
                        <PlusCircle size={17} />
                        Create New Course
                    </motion.button>
                </motion.div>

                {/* Search and Filter */}
                <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col sm:flex-row gap-4 mb-6"
                >
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="text"
                            placeholder="Search by title, category, or instructor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                    </div>
                    <div className="relative min-w-[180px]">
                        <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <option value="all" style={{ background: '#1f2937' }}>All Levels</option>
                            <option value="Beginner" style={{ background: '#1f2937' }}>Beginner</option>
                            <option value="Intermediate" style={{ background: '#1f2937' }}>Intermediate</option>
                            <option value="Advanced" style={{ background: '#1f2937' }}>Advanced</option>
                        </select>
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={16} />
                    </div>
                </motion.div>

                {coursesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="glass-card rounded-2xl overflow-hidden">
                                <div className="h-40 skeleton" />
                                <div className="p-5 space-y-3">
                                    <div className="h-6 w-3/4 skeleton" />
                                    <div className="h-4 w-1/2 skeleton" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : createdCourses.length === 0 ? (
                    <div className="text-center py-20 glass-panel rounded-2xl">
                        <BookOpen size={64} className="mx-auto text-white/20 mb-4" />
                        <p className="text-white/50 text-lg">No courses created yet</p>
                        <p className="text-white/30 text-sm mt-2">Create your first course to get started</p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-20 glass-panel rounded-2xl">
                        <Search size={64} className="mx-auto text-white/20 mb-4" />
                        <p className="text-white/50 text-lg">No courses found</p>
                        <p className="text-white/30 text-sm mt-2">Try adjusting your search or filter</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCourses.map((course, index) => (
                            <motion.div
                                key={course._id || course.courseId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card rounded-2xl overflow-hidden flex flex-col"
                            >
                                <div className="h-36 relative">
                                    {course.thumbnail ? (
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center">
                                            <BookOpen size={40} className="text-white/30" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                            course.status === 'published' 
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        }`}>
                                            {course.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-bold text-white mb-2 line-clamp-2 text-sm">{course.title}</h3>
                                    <p className="text-xs text-white/50 mb-3 line-clamp-2">{course.description || ''}</p>
                                    
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-white/50">Instructor</span>
                                            <span className="text-white/80 truncate ml-2">{course.instructor || '-'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-white/50">Category</span>
                                            <span className="text-white/80">{course.category || '-'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-white/50">Level</span>
                                            <span className="text-white/80">{course.level || '-'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-white/50">Duration</span>
                                            <span className="text-white/80">{course.duration || '-'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-white/50">Lessons</span>
                                            <span className="text-white/80">{course.totalLessons || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-white/50">Enrolled</span>
                                            <span className="text-white/80">{course.totalEnrolled || 0}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                                course.courseType === 'paid' 
                                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                    : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            }`}>
                                                {course.courseType === 'paid' ? `₹${course.price}` : 'Free'}
                                            </span>
                                            <span className="text-xs text-white/40">
                                                {course.createdAt ? new Date(course.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                            </span>
                                        </div>
                                        <motion.button
                                            onClick={() => handleEditCourse(course._id || course.courseId)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full py-2 px-3 rounded-lg text-xs font-bold text-teal-400 border border-teal-500/30 hover:bg-teal-500/10 transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <FileText size={14} />
                                            Edit Course
                                        </motion.button>
                                        {course.updateHistory && course.updateHistory.length > 0 && (
                                            <motion.button
                                                onClick={() => viewUpdateHistory(course._id || course.courseId, course.title)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full py-2 px-3 rounded-lg text-xs font-bold text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 transition-all flex items-center justify-center gap-1.5 mt-2"
                                            >
                                                <History size={14} />
                                                View History ({course.updateHistory.length})
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <AnimatePresence>
                {toast && <Toast key="toast" type={toast.type} message={toast.message} />}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <button onClick={() => { setView('list'); setEditingCourseId(null); setCourseData({ title: '', description: '', instructor: '', level: 'Beginner', category: 'Development', courseType: 'free', price: 0, duration: '', thumbnail: '', createdBy: user?.email || user?.name || '', courseNotes: '', pdfFile: '' }); setChapters([]); }} className="text-white/40 hover:text-white text-sm mb-2">
                        ← Back to Courses
                    </button>
                    <div className="inline-flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
                        <BookOpen size={12} /> {editingCourseId ? 'Edit Course' : 'Course Builder'}
                    </div>
                    <h2 className="text-2xl font-bold text-white">{editingCourseId ? 'Edit Your Course' : 'Design a New Course'}</h2>
                    <p className="text-sm text-white/30 mt-1">{editingCourseId ? 'Update course information, chapters, and content.' : 'Fill in the info, build chapters, then submit for admin approval.'}</p>
                </div>
                <motion.button onClick={handleSubmit} disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-60 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #14b8a6, #6366f1)', boxShadow: '0 8px 24px rgba(139,92,246,0.25)' }}>
                    {submitting ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                    {editingCourseId ? 'Update Course' : 'Submit for Approval'}
                </motion.button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                    className="lg:col-span-1 glass-card rounded-2xl p-6 space-y-5 sticky top-6">
                    <h3 className="text-sm font-bold text-white border-b border-white/8 pb-3 flex items-center gap-2">
                        <FileText size={15} className="text-teal-400" /> Basic Info
                    </h3>

                    {[
                        { label: 'Course Title *', name: 'title', type: 'text', placeholder: 'e.g. Master MERN Stack' },
                        { label: 'Instructor Name *', name: 'instructor', type: 'text', placeholder: 'e.g. Jane Doe' },
                        { label: 'Your Name / Email', name: 'createdBy', type: 'text', placeholder: 'employee@company.com' },
                    ].map(({ label, name, type, placeholder }) => (
                        <div key={name}>
                            <label className={labelCls}>{label}</label>
                            <input type={type} name={name} value={courseData[name]}
                                onChange={handleCourseChange} placeholder={placeholder}
                                className={fieldBase} style={fieldStyle} />
                        </div>
                    ))}

                    <div>
                        <label className={labelCls}>Description *</label>
                        <textarea name="description" rows={3} value={courseData.description}
                            onChange={handleCourseChange} placeholder="Briefly describe what students will learn…"
                            className={`${fieldBase} resize-none`} style={fieldStyle} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Level', name: 'level', options: ['Beginner', 'Intermediate', 'Advanced'] },
                            { label: 'Category', name: 'category', options: ['Development', 'Design', 'Data Science', 'Business', 'Marketing', 'Soft Skills'] },
                            { label: 'Course Type', name: 'courseType', options: ['free', 'paid'] },
                        ].map(({ label, name, options }) => (
                            <div key={name}>
                                <label className={labelCls}>{label}</label>
                                <select name={name} value={courseData[name]} onChange={handleCourseChange}
                                    className={fieldBase} style={{ ...fieldStyle, color: 'white' }}>
                                    {options.map(o => <option key={o} value={o} style={{ background: '#111827' }}>{o}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className={labelCls}>Duration</label>
                        <input type="text" name="duration" value={courseData.duration}
                            onChange={handleCourseChange} placeholder="e.g. 5h 30m"
                            className={fieldBase} style={fieldStyle} />
                    </div>

                    <div>
                        <label className={labelCls}>Price (₹, 0 for free)</label>
                        <input type="number" name="price" min="0" step="0.01" value={courseData.price}
                            onChange={handleCourseChange} placeholder="499"
                            className={fieldBase} style={fieldStyle} />
                    </div>

                    <div>
                        <label className={labelCls}>Course Thumbnail</label>
                        <input aria-label="Input field"  ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailFile} />
                        {courseData.thumbnail ? (
                            <div className="relative group">
                                <img src={courseData.thumbnail} alt="Thumbnail" className="w-full h-28 object-cover rounded-xl border border-white/10" />
                                <button type="button" onClick={clearThumbnail}
                                    className="absolute top-2 right-2 bg-red-600/80 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div onClick={() => thumbnailInputRef.current?.click()}
                                className="flex flex-col items-center justify-center gap-2 w-full h-28 rounded-xl cursor-pointer transition-all"
                                style={{ border: '2px dashed rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.05)' }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(139,92,246,0.05)'}>
                                <ImageIcon size={22} className="text-teal-400" />
                                <p className="text-xs text-teal-400 font-medium">Click to upload</p>
                                <p className="text-[10px] text-white/20">PNG, JPG, WEBP · max 5 MB</p>
                            </div>
                        )}
                        <div className="mt-2">
                            <input type="url" name="thumbnail"
                                value={courseData.thumbnail.startsWith('data:') ? '' : courseData.thumbnail}
                                onChange={handleCourseChange} placeholder="Or paste image URL…"
                                className={`${fieldBase} text-xs`} style={fieldStyle} />
                        </div>
                    </div>

                    <div>
                        <input aria-label="Input field"  ref={pdfInputRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdfFile} />
                        {courseData.pdfFile ? (
                            <div className="relative group flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
                                <FileText size={24} className="text-green-400" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{courseData.pdfFile.split('/').pop()}</p>
                                    <p className="text-xs text-white/40">Click to replace</p>
                                </div>
                                <button type="button" onClick={(e) => { e.stopPropagation(); clearPdfFile(); }}
                                    className="p-1.5 bg-red-600/80 text-white text-xs px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div onClick={() => pdfInputRef.current?.click()}
                                className="flex flex-col items-center justify-center gap-2 w-full h-20 rounded-xl cursor-pointer transition-all"
                                style={{ border: '2px dashed rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.05)' }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(34,197,94,0.1)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(34,197,94,0.05)'}>
                                <FileText size={20} className="text-green-400" />
                                <p className="text-xs text-green-400 font-medium">Upload PDF File</p>
                                <p className="text-[10px] text-white/20">Students can preview & download</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <BookOpen size={18} className="text-teal-400" /> Chapter Builder
                            {chapters.length > 0 && (
                                <span className="text-sm font-bold bg-teal-500/15 text-teal-400 border border-teal-500/20 px-2.5 py-0.5 rounded-full">
                                    {chapters.length}
                                </span>
                            )}
                        </h3>
                        <motion.button onClick={addChapter} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-teal-400 border border-teal-500/20 hover:bg-teal-500/10 transition-all">
                            <PlusCircle size={16} /> Add Chapter
                        </motion.button>
                    </div>

                    {chapters.length === 0 && (
                        <div className="text-center py-20 flex flex-col items-center gap-3"
                            style={{ border: '2px dashed rgba(255,255,255,0.08)', borderRadius: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/15 flex items-center justify-center">
                                <PlusCircle size={30} className="text-teal-400 opacity-50" />
                            </div>
                            <p className="text-white/30 font-semibold">No chapters yet</p>
                            <p className="text-sm text-white/15 max-w-xs">Click <span className="text-teal-400">Add Chapter</span> to start building your curriculum.</p>
                        </div>
                    )}

                    <AnimatePresence>
                        {chapters.map((chapter) => {
                            const isCollapsed = collapsedIds.has(chapter.chapterId);
                            return (
                                <motion.div key={chapter.chapterId} layout
                                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                                    className="glass-card rounded-2xl overflow-hidden">
                                    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                                        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-indigo-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
                                            {chapter.order}
                                        </span>
                                        <span className="flex-1 text-sm font-semibold text-white/70 truncate">
                                            {chapter.title || <span className="italic text-white/25">Untitled Chapter</span>}
                                        </span>
                                        <button onClick={() => toggleCollapse(chapter.chapterId)}
                                            className="p-1.5 text-white/25 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors">
                                            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                                        </button>
                                        <button onClick={() => removeChapter(chapter.chapterId)}
                                            className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <AnimatePresence initial={false}>
                                        {!isCollapsed && (
                                            <motion.div key="body" initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
                                                <div className="p-5 space-y-4">
                                                    <div>
                                                        <label className={labelCls}>Chapter Title *</label>
                                                        <input aria-label="Input field"  type="text" value={chapter.title}
                                                            onChange={e => updateChapter(chapter.chapterId, 'title', e.target.value)}
                                                            placeholder="e.g. Introduction to Context API"
                                                            className={`${fieldBase} font-semibold`} style={fieldStyle} />
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>Content / Learning Material *</label>
                                                        <RichTextEditor
                                                            value={chapter.content}
                                                            onChange={(content) => updateChapter(chapter.chapterId, 'content', content)}
                                                            placeholder="Enter your lesson content here. Use headings, lists, code blocks, and more to structure your content..."
                                                        />
                                                        <p className="text-xs text-white/20 mt-2 flex items-center gap-1">
                                                            <FileText size={10} /> Supports rich formatting: headings, lists, code blocks, tables, quotes
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {chapters.length > 0 && (
                        <motion.button onClick={handleSubmit} disabled={submitting}
                            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                            className="w-full py-4 text-white font-bold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #14b8a6, #6366f1)', boxShadow: '0 8px 24px rgba(139,92,246,0.2)' }}>
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            {editingCourseId ? 'Update Course' : 'Submit Course for Approval'}
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Update History Modal */}
            <AnimatePresence>
                {showHistoryModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowHistoryModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-2xl max-w-4xl w-full flex flex-col"
                            style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh' }}
                        >
                            <div className="p-6 border-b border-white/10">
                                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                    <History size={24} className="text-blue-400" />
                                    Update History
                                </h2>
                                <p className="text-white/40 text-sm">{selectedCourseHistory?.title}</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: '60vh' }}>
                                {historyLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 size={32} className="animate-spin text-blue-400" />
                                    </div>
                                ) : selectedCourseHistory?.history.length === 0 ? (
                                    <div className="text-center py-12">
                                        <History size={48} className="mx-auto text-white/20 mb-4" />
                                        <p className="text-white/40">No update history yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {selectedCourseHistory?.history.map((entry, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="p-5 rounded-xl"
                                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${
                                                            entry.status === 'approved' 
                                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                                : 'bg-red-500/10 text-red-400'
                                                        }`}>
                                                            {entry.status === 'approved' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-bold">{entry.updatedBy}</p>
                                                            <p className="text-white/40 text-xs">{entry.updatedByEmail}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                            entry.status === 'approved'
                                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        }`}>
                                                            {entry.status.toUpperCase()}
                                                        </span>
                                                        <p className="text-white/30 text-xs mt-1 flex items-center gap-1 justify-end">
                                                            <Clock size={10} />
                                                            {new Date(entry.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>

                                                {entry.employeeReason && (
                                                    <div className="mb-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                                        <p className="text-xs text-white/40 mb-1">Employee Reason:</p>
                                                        <p className="text-sm text-white/70">{entry.employeeReason}</p>
                                                    </div>
                                                )}

                                                {entry.adminResponse && (
                                                    <div className="mb-3 p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                                                        <p className="text-xs text-blue-400 mb-1">Admin Response:</p>
                                                        <p className="text-sm text-white/70">{entry.adminResponse}</p>
                                                        <p className="text-xs text-blue-300 mt-1">Reviewed by: {entry.reviewedBy}</p>
                                                    </div>
                                                )}

                                                <div className="text-xs text-white/30">
                                                    Update Type: <span className="text-white/50 font-semibold">{entry.updateType}</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-white/10 bg-black/20">
                                <button
                                    onClick={() => setShowHistoryModal(false)}
                                    className="w-full py-3 rounded-xl text-white/60 hover:text-white transition-colors font-semibold"
                                    style={{ background: 'rgba(255,255,255,0.05)' }}
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CourseBuilder;
