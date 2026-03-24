import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Search, Users, Mail, BookOpen, X, Send, Loader2, CheckCircle, GraduationCap, FileText, Trophy } from 'lucide-react';
import axiosInstance from './axiosInstance';
import ScorecardModal from '../components/ScorecardModal';

const Reveal = ({ children, delay = 0, className = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-40px" });
    return (
        <motion.div ref={ref} className={className}
            initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}>
            {children}
        </motion.div>
    );
};

// Email Modal Component
const EmailModal = ({ student, isOpen, onClose }) => {
    const [subject, setSubject] = useState('Interview Invitation - Campus Recruitment');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    if (!isOpen || !student) return null;

    const handleSend = () => {
        // For now, we'll use mailto as a fallback
        // In production, you'd call an API endpoint
        const mailtoLink = `mailto:${student.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        window.location.href = mailtoLink;
        setSent(true);
        setTimeout(() => {
            onClose();
            setSent(false);
        }, 2000);
    };

    const handleClose = () => {
        setSubject('Interview Invitation - Campus Recruitment');
        setMessage('');
        setSent(false);
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Mail size={20} className="text-teal-500" />
                        Contact {student.name}
                    </h3>
                    <button onClick={handleClose} className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To:</label>
                        <input aria-label="Input field" 
                            type="text"
                            value={student.email}
                            disabled
                            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject:</label>
                        <input aria-label="Input field" 
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message:</label>
                        <textarea
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your message to the candidate..."
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={sending || sent}
                        className="px-4 py-2 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {sent ? (
                            <> <CheckCircle size={18} /> Sent!</>
                        ) : sending ? (
                            <> <Loader2 size={18} className="animate-spin" /> Sending...</>
                        ) : (
                            <> <Send size={18} /> Send Email</>
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Student Card Component
const StudentCard = ({ student, index, onContact, onScorecard }) => {
    const completedCount = student.completedCourses?.length || 0;

    return (
        <Reveal delay={index * 0.05}>
            <motion.div
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:border-teal-200 dark:hover:border-teal-800 hover:shadow-lg transition-all group flex flex-col h-full"
            >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {student.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {student.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{student.email}</p>
                        {student.profile?.cgpa && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">CGPA: {student.profile.cgpa}</p>
                        )}
                    </div>
                </div>

                {/* Skills */}
                {student.profile?.skills?.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2 overflow-hidden">
                            {student.profile.skills.slice(0, 5).map((skill, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg font-medium border border-teal-100 dark:border-teal-500/20">
                                    {skill}
                                </span>
                            ))}
                            {student.profile.skills.length > 5 && (
                                <span className="text-xs px-2 py-1 text-gray-400">+{student.profile.skills.length - 5} more</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Completed Courses */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-sm">
                        <GraduationCap size={16} className="text-emerald-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{completedCount}</span> course{completedCount !== 1 ? 's' : ''} completed
                        </span>
                    </div>
                    {completedCount > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {student.completedCourses.slice(0, 4).map((course, i) => (
                                <div key={i} className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center" title={course.title}>
                                    <BookOpen size={12} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                            ))}
                            {completedCount > 4 && (
                                <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs font-medium text-gray-500">
                                    +{completedCount - 4}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-4">
                    <button
                        onClick={() => onContact(student)}
                        className="flex-1 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 transition-all"
                    >
                        <Mail size={16} /> Contact
                    </button>
                    <button
                        onClick={() => onScorecard(student)}
                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-teal-500/25"
                    >
                        <Trophy size={16} /> Scorecard
                    </button>
                </div>
                <div className="mt-2 text-center">
                    {student.profile?.resume && (
                        <a
                            href={student.profile.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold text-sm flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-500/30 transition-all"
                        >
                            <FileText size={16} />
                            Resume
                        </a>
                    )}
                </div>
            </motion.div>
        </Reveal>
    );
};

// Main Page Component
const CandidateDirectory = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [skillFilter, setSkillFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [scorecardUser, setScorecardUser] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, [pagination.page, skillFilter]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', pagination.page);
            params.append('limit', 12);
            if (searchTerm) params.append('search', searchTerm);
            if (skillFilter) params.append('skill', skillFilter);

            const res = await axiosInstance.get(`/company/students?${params.toString()}`);
            setStudents(res.data.data || []);
            setPagination({
                page: res.data.page,
                pages: res.data.pages,
                total: res.data.total
            });
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchStudents();
    };

    const handleContact = (student) => {
        setSelectedStudent(student);
        setModalOpen(true);
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    return (
        <div className="min-h-full relative">
            <div className="ambient-bg" />
            <div className="relative z-10 space-y-6">
                {/* Header */}
                <Reveal>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Candidate Directory</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Browse and connect with talented students
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-500/10 rounded-xl border border-teal-100 dark:border-teal-500/20">
                            <Users size={20} className="text-teal-600 dark:text-teal-400" />
                            <span className="font-semibold text-teal-600 dark:text-teal-400">{pagination.total}</span>
                            <span className="text-gray-500 dark:text-gray-400">students available</span>
                        </div>
                    </div>
                </Reveal>

                {/* Search & Filters */}
                <Reveal delay={0.1}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                            <div className="md:w-64 relative">
                                <input
                                    type="text"
                                    placeholder="Filter by skill (e.g. React)"
                                    value={skillFilter}
                                    onChange={(e) => setSkillFilter(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-teal-500/25"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                </Reveal>

                {/* Results */}
                <Reveal delay={0.2}>
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={40} className="animate-spin text-teal-500" />
                        </div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <Users size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-gray-500 text-lg">No students found matching your criteria.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {students.map((student, index) => (
                                    <StudentCard
                                        key={student._id}
                                        student={student}
                                        index={index}
                                        onContact={handleContact}
                                        onScorecard={(user) => setScorecardUser(user)}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="flex justify-center gap-2 mt-8">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                        Page {pagination.page} of {pagination.pages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.pages}
                                        className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </Reveal>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {modalOpen && selectedStudent && (
                    <EmailModal
                        student={selectedStudent}
                        isOpen={modalOpen}
                        onClose={() => {
                            setModalOpen(false);
                            setSelectedStudent(null);
                        }}
                    />
                )}
                {scorecardUser && (
                    <ScorecardModal 
                        isOpen={!!scorecardUser} 
                        userId={scorecardUser._id || scorecardUser.user} 
                        onClose={() => setScorecardUser(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default CandidateDirectory;
