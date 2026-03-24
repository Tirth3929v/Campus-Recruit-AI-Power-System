import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, CheckCircle, Clock, Calendar, FileText, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const CourseHistory = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    document.title = "Course History | Campus Recruit";
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('employeeToken');
        const res = await fetch('/api/courses/employee/course-stats', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        
        // Save to LocalStorage for backup
        localStorage.setItem('employeeCourseHistory', JSON.stringify(data));
        
        setCourses(data);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        // Fallback to LocalStorage
        const localData = localStorage.getItem('employeeCourseHistory');
        if (localData) {
          setCourses(JSON.parse(localData));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  const filteredCourses = courses.filter(course => 
    course.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Course History</h1>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No Courses Yet</h3>
          <p className="text-gray-500 mt-1">Create your first course to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.slice(0, 12).map((course, index) => (
            <motion.div 
              key={course.courseId || course._id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="relative mb-4">
                {course.thumbnail ? (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center group-hover:from-indigo-50 group-hover:to-teal-50 transition-all">
                    <BookOpen size={32} className="text-slate-400 group-hover:text-indigo-500" />
                  </div>
                )}
                <span className="absolute -top-2 -right-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                  {course.status || 'pending'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                {course.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <Calendar size={12} />
                <span>{course.createdAt ? formatDate(course.createdAt) : 'Recently created'}</span>
              </div>
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users size={14} />
                  <span>Enrolled: {course.totalEnrolled || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>Completed: {course.completed || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>In Progress: {course.inProgress || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={14} />
                  <span>{course.totalLessons || 0} Lessons</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;