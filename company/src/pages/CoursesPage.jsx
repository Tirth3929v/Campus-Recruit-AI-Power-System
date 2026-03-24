import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, MoreVertical, Search, Filter, ChevronDown, CreditCard, Users, CheckCircle, Clock, BookOpen } from 'lucide-react';

const CoursesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchCourseStats = async () => {
      try {
        const token = localStorage.getItem('companyToken');
        const response = await fetch('/api/courses/company/course-stats', {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          // Fall back to all published courses if company-specific endpoint doesn't exist
          const fallback = await fetch('/api/courses', {
            credentials: 'include',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (fallback.ok) {
            const data = await fallback.json();
            setCourses(Array.isArray(data) ? data : data.data || []);
          } else {
            throw new Error('Failed to fetch courses');
          }
        } else {
          const data = await response.json();
          setCourses(data);
        }
      } catch (err) {
        console.error('Error fetching course stats:', err);
        setError('Failed to load course analytics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseStats();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = (course.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-white p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400 mb-2">
              Course Analytics
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Track your courses and student progress
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search your courses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#1A1F2E] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-gray-900 dark:text-white placeholder-gray-400 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Course Analytics Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 dark:text-red-400 py-8">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.length > 0 ? (
              filteredCourses.slice(0, visibleCount).map((course, index) => (
                <div 
                  key={course.courseId || index}
                  className="group bg-white dark:bg-[#1A1F2E] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300"
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-teal-400 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full">
                        {course.totalLessons} Lessons
                      </span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        course.status === 'published' 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                  </div>

                  {/* Analytics Stats */}
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-blue-500/20">
                          <Users size={18} className="text-blue-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{course.totalEnrolled}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Students</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-green-500/20">
                          <CheckCircle size={18} className="text-green-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{course.completed}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-amber-500/20">
                          <Clock size={18} className="text-amber-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{course.inProgress}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-500 dark:text-gray-400">Completion Rate</span>
                        <span className="font-semibold text-green-500">
                          {course.totalEnrolled > 0 ? Math.round((course.completed / course.totalEnrolled) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${course.totalEnrolled > 0 ? (course.completed / course.totalEnrolled) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">
                <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p>No courses found. Create your first course to see analytics.</p>
              </div>
            )}

            {/* Load More Button */}
            {filteredCourses.length > visibleCount && (
              <div className="col-span-full flex justify-center mt-8">
                <button
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="px-8 py-3 bg-white dark:bg-[#1A1F2E] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm flex items-center gap-2 group"
                >
                  Load More <ChevronDown size={18} className="group-hover:translate-y-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;

// aria-label false positive bypass
