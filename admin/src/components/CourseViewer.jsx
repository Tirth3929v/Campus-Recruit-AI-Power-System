import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, PlayCircle, FileText, ChevronLeft, 
  Menu, Award, ChevronRight 
} from 'lucide-react';

const CourseViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeModule, setActiveModule] = useState(0);
  const [activeLesson, setActiveLesson] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Mock fetch - replace with actual API call to /api/courses/:id
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${id}`);
        if (!res.ok) throw new Error('Failed to fetch course');
        const data = await res.json();
        setCourse(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Course...</div>;
  if (!course) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Course not found</div>;

  // Safety check for empty modules/lessons
  const currentModule = course.modules?.[activeModule];
  const currentLessonData = currentModule?.lessons?.[activeLesson];

  if (!currentLessonData) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Lesson content unavailable</div>;

  const handleMarkComplete = async () => {
    try {
      const lessonId = currentLessonData._id || currentLessonData.id;
      const res = await fetch(`/api/courses/${id}/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        
        setCourse(prev => {
          const newModules = [...prev.modules];
          const activeMod = { ...newModules[activeModule] };
          const activeLes = [...activeMod.lessons];
          activeLes[activeLesson] = { ...activeLes[activeLesson], completed: true };
          activeMod.lessons = activeLes;
          newModules[activeModule] = activeMod;
          return { ...prev, modules: newModules, progress: data.progress || prev.progress };
        });

        if (activeLesson < currentModule.lessons.length - 1) {
          setActiveLesson(activeLesson + 1);
        } else if (activeModule < course.modules.length - 1) {
          setActiveModule(activeModule + 1);
          setActiveLesson(0);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col overflow-hidden font-sans">
      {/* Top Navigation & Progress */}
      <header className="h-16 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between px-4 z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/student/dashboard')} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-700 rounded-lg transition-colors lg:hidden">
            <Menu size={20} />
          </button>
          <h1 className="font-bold text-lg truncate max-w-[200px] md:max-w-md">{course.title}</h1>
        </div>
        
        <div className="flex items-center gap-4 w-1/3 max-w-xs">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{course.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${course.progress || 0}%` }}
              />
            </div>
          </div>
          <Award className="text-yellow-500" size={24} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - W3Schools Style but Modern */}
        <AnimatePresence>
          {(sidebarOpen || window.innerWidth >= 1024) && (
            <motion.aside 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className={`absolute lg:relative z-10 w-72 h-full bg-gray-800/30 border-r border-gray-700 backdrop-blur-xl overflow-y-auto transition-all`}
            >
              <div className="p-4">
                {course.modules.map((module, mIdx) => (
                  <div key={mIdx} className="mb-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                      {module.title}
                    </h3>
                    <div className="space-y-1">
                      {module.lessons.map((lesson, lIdx) => (
                        <button
                          key={lesson._id || lesson.id}
                          onClick={() => {
                            setActiveModule(mIdx);
                            setActiveLesson(lIdx);
                            if (window.innerWidth < 1024) setSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                            activeModule === mIdx && activeLesson === lIdx 
                              ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' 
                              : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                          }`}
                        >
                          {lesson.completed ? (
                            <CheckCircle size={16} className="text-green-400" />
                          ) : (
                            lesson.type === 'video' ? <PlayCircle size={16} /> : <FileText size={16} />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative scroll-smooth">
          <div className="max-w-4xl mx-auto">
            <motion.div
              key={`${activeModule}-${activeLesson}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <span className="text-teal-400 text-sm font-medium mb-2 block">
                  Module {activeModule + 1}: {course.modules[activeModule].title}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  {currentLessonData.title}
                </h2>
                
                <div className="prose prose-invert max-w-none">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 min-h-[400px] flex items-center justify-center text-gray-500">
                    {currentLessonData.type === 'video' ? (
                      <div className="text-center">
                        <PlayCircle size={64} className="mx-auto mb-4 opacity-50" />
                        <p>Video Player Placeholder</p>
                      </div>
                    ) : currentLessonData.type === 'code' ? (
                      <div className="text-left w-full space-y-4">
                        <div className="bg-black/50 p-4 rounded-lg font-mono text-sm border border-gray-700 whitespace-pre-wrap">
                          {currentLessonData.content}
                        </div>
                      </div>
                    ) : (
                      <div className="text-left w-full space-y-4">
                        <div 
                          className="lesson-html-content text-gray-300 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: currentLessonData.content || 'No content available for this lesson.' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-700">
                <button 
                  disabled={activeModule === 0 && activeLesson === 0}
                  onClick={() => {
                    if (activeLesson > 0) setActiveLesson(activeLesson - 1);
                    else if (activeModule > 0) {
                      setActiveModule(activeModule - 1);
                      setActiveLesson(course.modules[activeModule - 1].lessons.length - 1);
                    }
                  }}
                  className="px-6 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <button 
                  onClick={handleMarkComplete}
                  className="px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2"
                >
                  Mark Complete & Next <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseViewer;