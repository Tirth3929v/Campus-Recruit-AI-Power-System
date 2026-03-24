import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { BookOpen, User, Tag, Eye, Search, Loader2, GraduationCap } from 'lucide-react';

const Reveal = ({ children, delay = 0, className = "" }) => {
    const ref = React.useRef(null);
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

const CourseCard = ({ course, onViewDetails }) => {
    const categoryColors = {
        'Programming': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
        'Data Science': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
        'Web Development': 'bg-green-500/15 text-green-400 border-green-500/20',
        'Design': 'bg-pink-500/15 text-pink-400 border-pink-500/20',
        'Business': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
        'Marketing': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    };

    const levelColors = {
        'Beginner': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
        'Intermediate': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
        'Advanced': 'bg-red-500/15 text-red-400 border-red-500/20',
    };

    const category = course.category || 'General';
    const level = course.level || 'Intermediate';
    
    return (
        <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            className="glass-card rounded-2xl p-5 flex flex-col gap-4 group"
        >
            {/* Thumbnail */}
            <div className="h-36 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl overflow-hidden relative">
                {course.thumbnail ? (
                    <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <GraduationCap size={48} className="text-slate-500" />
                    </div>
                )}
                {/* Category Badge */}
                <div className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border ${categoryColors[category] || 'bg-gray-500/15 text-gray-400 border-gray-500/20'}`}>
                    <Tag size={10} />
                    {category}
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-3 flex-1">
                <h3 className="font-bold text-white text-lg line-clamp-2 group-hover:text-amber-400 transition-colors">
                    {course.title}
                </h3>

                {/* Instructor */}
                {course.instructor && (
                    <div className="flex items-center gap-2 text-white/50">
                        <User size={14} />
                        <span className="text-sm">{course.instructor}</span>
                    </div>
                )}

                {/* Level */}
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${levelColors[level] || 'bg-gray-500/15 text-gray-400 border-gray-500/20'}`}>
                        {level}
                    </span>
                </div>

                {/* Description Preview */}
                {course.description && (
                    <p className="text-sm text-white/30 line-clamp-2">{course.description}</p>
                )}
            </div>

            {/* Badge & Button */}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                <div className="flex items-center justify-center">
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                        Free for Company Preview
                    </span>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onViewDetails(course)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2"
                >
                    <Eye size={16} />
                    View Syllabus / Details
                </motion.button>
            </div>
        </motion.div>
    );
};

const CourseDetailModal = ({ course, onClose }) => {
    if (!course) return null;

    const levelColors = {
        'Beginner': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
        'Intermediate': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
        'Advanced': 'bg-red-500/15 text-red-400 border-red-500/20',
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-3xl bg-[#0f172a] rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{course.title}</h2>
                        <div className="flex items-center gap-3 mt-2">
                            {course.category && (
                                <span className="text-xs bg-blue-500/15 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">
                                    {course.category}
                                </span>
                            )}
                            {course.level && (
                                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${levelColors[course.level] || 'bg-gray-500/15 text-gray-400 border-gray-500/20'}`}>
                                    {course.level}
                                </span>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70 hover:text-white"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>

                {/* Thumbnail */}
                {course.thumbnail && (
                    <div className="mb-6 rounded-xl overflow-hidden">
                        <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-full h-48 object-cover"
                        />
                    </div>
                )}

                {/* Description */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-white/80 mb-2">Description</h3>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{course.description || 'No description available.'}</p>
                </div>

                {/* Instructor */}
                {course.instructor && (
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-white/80 mb-2">Instructor</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
                                <User size={18} className="text-amber-400" />
                            </div>
                            <span className="text-white">{course.instructor}</span>
                        </div>
                    </div>
                )}

                {/* Syllabus / Topics */}
                {course.topics && course.topics.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-white/80 mb-3">Syllabus</h3>
                        <div className="space-y-2">
                            {course.topics.map((topic, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
                                    <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
                                        {i + 1}
                                    </span>
                                    <span className="text-sm text-gray-300">{topic}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Price Badge */}
                <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                            Free for Company Preview
                        </span>
                        {course.price > 0 && (
                            <span className="text-lg font-bold text-white">
                                ${course.price}
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch('/api/courses');
            if (!response.ok) throw new Error('Failed to fetch courses');
            const data = await response.json();
            setCourses(data || []);
        } catch (err) {
            console.error('Error fetching courses:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = (course.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.instructor || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="space-y-6 w-full">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BookOpen size={22} className="text-amber-400" /> Platform Curriculum
                </h2>
                <p className="text-white/30 text-sm mt-1">Explore the courses our candidates are taking</p>
            </motion.div>

            {/* Search */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                    <input 
                        aria-label="Search courses"
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        placeholder="Search courses, categories, instructors..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} 
                    />
                </div>
            </motion.div>

            {/* Course Count */}
            <div className="text-sm text-white/40">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
            </div>

            {/* Course Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={28} className="animate-spin text-amber-400" />
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-20 text-white/20">
                    <BookOpen size={38} className="mx-auto mb-3 opacity-30" />
                    <p>No courses found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course, i) => (
                        <Reveal key={course._id || course.id || i} delay={i * 0.05}>
                            <CourseCard 
                                course={course} 
                                onViewDetails={setSelectedCourse} 
                            />
                        </Reveal>
                    ))}
                </div>
            )}

            {/* Course Detail Modal */}
            {selectedCourse && (
                <CourseDetailModal 
                    course={selectedCourse} 
                    onClose={() => setSelectedCourse(null)} 
                />
            )}
        </div>
    );
};

export default Courses;
