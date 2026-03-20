import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, FileText, ChevronLeft, ChevronRight,
  Award, Lock, Download, Eye, Play, BookOpen, Clock, User, Star, MessageSquare, Brain, ArrowUp, ArrowDown
} from 'lucide-react';
import CourseTest from '../components/CourseTest';

const CourseViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [unlockedLessons, setUnlockedLessons] = useState([]);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [showReviews, setShowReviews] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showTestSection, setShowTestSection] = useState(false);
  const [showCourseTest, setShowCourseTest] = useState(false);
  const [mcqCompleted, setMcqCompleted] = useState(false);
  const [mcqScore, setMcqScore] = useState(0);
  const autoSaveTimeoutRef = useRef(null);

  useEffect(() => {
    console.log("CourseViewer loaded for course:", courseId);
    
    if (!courseId || courseId === 'undefined') {
      console.error("Invalid courseId:", courseId);
      setError("Invalid course ID");
      setLoading(false);
      return;
    }
    
    const fetchCourse = async () => {
      try {
        console.log("Fetching course data for courseId:", courseId);
        const res = await fetch(`/api/courses/${courseId}/with-progress`, { 
          credentials: 'include' 
        });
        
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Failed to fetch course');
        }
        
        const data = await res.json();
        console.log("Course data received:", data);
        console.log("PDF URL:", data.course?.pdfUrl, "pdfFile:", data.course?.pdfFile, "courseNotes:", data.course?.courseNotes);
        setCourse(data.course);
        setEnrollment(data.enrollment);
        setUnlockedLessons(data.unlockedLessons || []);
        
        // Resume from last opened lesson
        if (data.lastOpenedLesson !== undefined && data.lastOpenedLesson > 0) {
          setActiveLessonIndex(data.lastOpenedLesson);
        }
        
        if (data.enrollment?.completed) {
          try {
            const mcqRes = await fetch(`/api/courses/${courseId}/mcq-status`, { 
              credentials: 'include' 
            });
            const mcqData = await mcqRes.json();
            setMcqCompleted(mcqData.mcqCompleted || false);
            setMcqScore(mcqData.mcqScore || 0);
            
            const ratingRes = await fetch(`/api/courses/${courseId}/rating`, { 
              credentials: 'include' 
            });
            const ratingData = await ratingRes.json();
            if (ratingData.rating) {
              setHasRated(true);
              setUserRating(ratingData.rating.rating);
            }
            
            if (mcqData.mcqCompleted) {
              setShowTestSection(true);
            }
          } catch (err) {
            console.error('Error checking status:', err);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading course:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchCourse();
    
    // Track last accessed course
    const trackLastCourse = async () => {
      try {
        await fetch('/api/courses/last-course', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ courseId })
        });
      } catch (err) {
        console.error('Failed to track last course:', err);
      }
    };
    trackLastCourse();
  }, [courseId]);

  // Fetch reviews
  useEffect(() => {
    if (!courseId || !course) return;
    
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}/ratings`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.ratings || []);
          setAverageRating(data.averageRating || 0);
          setTotalRatings(data.totalRatings || 0);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };
    
    fetchReviews();
  }, [courseId, course]);

  // Auto-save progress function
  const saveProgress = useCallback(async (lessonIndex) => {
    if (!courseId) return;
    
    try {
      await fetch(`/api/courses/${courseId}/save-progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ lessonIndex })
      });
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  }, [courseId]);

  // Auto-save when lesson changes
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveProgress(activeLessonIndex);
    }, 2000);
    
    // Reset video state when lesson changes
    setShowVideo(false);
    setVideoError(false);
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [activeLessonIndex, saveProgress]);

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/60">Loading course...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <p className="text-red-400 mb-4">{error}</p>
      <button 
        onClick={() => navigate('/student/courses')}
        className="px-6 py-2 bg-purple-600 rounded-xl font-semibold"
      >
        Back to Courses
      </button>
    </div>
  );

  if (!course) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      Course not found
    </div>
  );

  const chapters = course.chapters || [];
  const totalLessons = chapters.length;
  const completedLessons = enrollment?.completedChapters?.length || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  
  const currentLesson = chapters[activeLessonIndex];
  const isLessonUnlocked = currentLesson ? unlockedLessons.includes(currentLesson.chapterId) : false;
  const isCompleted = enrollment?.completedChapters?.includes(currentLesson?.chapterId);

  const handleMarkComplete = async () => {
    if (!isLessonUnlocked || !currentLesson) return;
    
    console.log("Marking lesson complete:", currentLesson.chapterId);
    
    try {
      const res = await fetch(`/api/courses/${courseId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          chapterId: currentLesson.chapterId,
          chapterIndex: activeLessonIndex
        })
      });

      console.log("Progress response:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("Progress data:", data);
        setEnrollment(data.enrollment);
        setUnlockedLessons(data.unlockedLessons);
        
        // Re-track last course after progress update
        try {
          await fetch('/api/courses/last-course', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ courseId })
          });
        } catch (trackErr) {
          console.error('Failed to re-track last course:', trackErr);
        }
        
        if (data.enrollment?.completed && !mcqCompleted) {
          setShowTestSection(true);
        }
        
        if (data.nextLessonIndex !== null && data.nextLessonIndex !== undefined) {
          setActiveLessonIndex(data.nextLessonIndex);
        }
      } else {
        const err = await res.json();
        console.error("Progress error:", err);
      }
    } catch (err) {
      console.error('Progress update failed:', err);
    }
  };

  const handleLeaveCourse = () => {
    saveProgress(activeLessonIndex);
    navigate('/student/courses');
  };

  const handlePrevLesson = () => {
    if (activeLessonIndex > 0) {
      setActiveLessonIndex(activeLessonIndex - 1);
    }
  };

  const handleNextLesson = () => {
    if (activeLessonIndex < chapters.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1);
    }
  };

  const handleLessonClick = (index) => {
    const chapter = chapters[index];
    if (unlockedLessons.includes(chapter.chapterId)) {
      setActiveLessonIndex(index);
    }
  };

  const handleSubmitRating = async () => {
    if (userRating === 0) return;
    
    setRatingSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          rating: userRating,
          feedback: ratingFeedback
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setHasRated(true);
        setShowRatingModal(false);
        setShowTestSection(true);
        setReviews(data.ratings || reviews);
        setAverageRating(data.averageRating || averageRating);
        setTotalRatings(data.totalRatings || totalRatings);
        alert('Thank you for your rating!');
      } else {
        alert(data.message || 'Failed to submit rating');
      }
    } catch (err) {
      console.error('Rating submission error:', err);
      alert('Failed to submit rating');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleSkipRating = () => {
    setShowRatingModal(false);
    setShowTestSection(true);
  };

  const handleMcqTestComplete = (score) => {
    setMcqCompleted(true);
    setMcqScore(score);
    setShowCourseTest(false);
    setShowRatingModal(true);
  };

  const handleViewTestResult = () => {
    setShowCourseTest(true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
    return null;
  };

  const getYouTubeThumbnailUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (match) return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    return null;
  };

  const youtubeUrl = currentLesson?.videoUrl ? getYouTubeEmbedUrl(currentLesson.videoUrl) : null;
  const youtubeThumbnail = currentLesson?.videoUrl ? getYouTubeThumbnailUrl(currentLesson.videoUrl) : null;

  const getFullPdfUrl = (pdfPath) => {
    if (!pdfPath) return null;
    if (pdfPath.startsWith('http')) return pdfPath;
    return `${window.location.origin}${pdfPath}`;
  };

  const getPdfFilename = (pdfPath) => {
    if (!pdfPath) return null;
    return pdfPath.split('/').pop();
  };

  const getDownloadUrl = (pdfPath) => {
    if (!pdfPath) return null;
    const filename = getPdfFilename(pdfPath);
    if (!filename) return null;
    return `/api/courses/download/${filename}`;
  };

  const getServeUrl = (pdfPath) => {
    if (!pdfPath) return null;
    const filename = getPdfFilename(pdfPath);
    if (!filename) return null;
    return `/api/courses/serve/${filename}`;
  };

  const handleViewPDF = (pdfUrl) => {
    const serveUrl = getServeUrl(pdfUrl);
    if (serveUrl) {
      console.log("Opening PDF:", serveUrl);
      window.open(serveUrl, "_blank");
    } else {
      const fullUrl = getFullPdfUrl(pdfUrl);
      if (fullUrl) {
        console.log("Opening PDF (fallback):", fullUrl);
        window.open(fullUrl, "_blank");
      }
    }
  };

  const handleDownloadPDF = async (pdfUrl) => {
    const downloadUrl = getDownloadUrl(pdfUrl);
    if (downloadUrl) {
      try {
        const response = await fetch(downloadUrl, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Download failed');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${course.title || 'course'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Download error:', err);
        const fullUrl = getFullPdfUrl(pdfUrl);
        if (fullUrl) {
          const link = document.createElement('a');
          link.href = fullUrl;
          link.download = `${course.title || 'course'}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } else {
      const fullUrl = getFullPdfUrl(pdfUrl);
      if (fullUrl) {
        const link = document.createElement('a');
        link.href = fullUrl;
        link.download = `${course.title || 'course'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col overflow-hidden font-sans">
      {/* Progress Bar Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <span className="text-sm text-gray-300">Course Progress: {progressPercent}%</span>
          <span className="text-xs text-gray-400">{completedLessons} / {totalLessons} lessons completed</span>
        </div>
        <div className="max-w-7xl mx-auto mt-2">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Minimal Header */}
      <header className="h-14 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between px-4 z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLeaveCourse} 
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 text-white/70 hover:text-white"
          >
            <ChevronLeft size={20} />
            <span className="text-sm">Back</span>
          </button>
          <h1 className="font-bold text-lg truncate max-w-[200px] md:max-w-md">{course.title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">
            {activeLessonIndex + 1} / {chapters.length}
          </span>
          {enrollment?.completed && <Award className="text-yellow-500" size={24} />}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Lesson Navigation Panel */}
        <aside className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto hidden lg:block order-1">
          <div className="p-4">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-purple-400" />
              Course Content
            </h3>
            
            {/* Progress Summary */}
            <div className="mb-4 p-3 bg-gray-700/50 rounded-xl">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progress</span>
                <span className="text-white font-semibold">{progressPercent}%</span>
              </div>
              <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">{completedLessons} of {totalLessons} lessons</p>
            </div>

            {/* Lesson List */}
            <div className="space-y-2">
              {chapters.map((chapter, index) => {
                const isUnlocked = unlockedLessons.includes(chapter.chapterId);
                const isLessonCompleted = enrollment?.completedChapters?.includes(chapter.chapterId);
                const isActive = index === activeLessonIndex;
                
                return (
                  <button
                    key={chapter.chapterId || index}
                    onClick={() => handleLessonClick(index)}
                    disabled={!isUnlocked}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
                      isActive 
                        ? 'bg-purple-600/20 border border-purple-500/30' 
                        : isUnlocked 
                          ? 'bg-gray-700/50 hover:bg-gray-700 border border-transparent'
                          : 'bg-gray-800/50 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isLessonCompleted 
                        ? 'bg-green-500/20 text-green-400' 
                        : isUnlocked 
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-gray-600 text-gray-400'
                    }`}>
                      {isLessonCompleted ? (
                        <CheckCircle size={16} />
                      ) : isUnlocked ? (
                        <Play size={14} />
                      ) : (
                        <Lock size={14} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                        Lesson {index + 1} – {chapter.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isLessonCompleted ? 'Completed' : isUnlocked ? 'Unlocked' : 'Locked'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Side - Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative scroll-smooth order-2">
          <div className="w-full">
            <motion.div
              key={activeLessonIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="course-sections">
                {/* TOP SECTION: 40% Course Details | 60% Video */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-8">
                  {/* Left: Course Details - 40% (2/5) */}
                  <div className="xl:col-span-2">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 h-full">
                      <div className="mb-4">
                        <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">Current Lesson</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mt-1">{currentLesson?.title || 'Untitled Lesson'}</h2>
                      </div>
                      
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-4">{course.title}</h3>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span>{course.instructor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} />
                          <span>{course.level}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-4">{course.description}</p>
                      
                      {totalRatings > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                size={16} 
                                className={star <= Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-400">
                            {averageRating.toFixed(1)} ({totalRatings} {totalRatings === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>
                      )}

                      {!isLessonUnlocked && (
                        <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 border border-amber-400/20 px-4 py-2 rounded-lg mt-4">
                          <Lock size={16} />
                          <span className="text-sm">Complete previous lessons to unlock this content</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Video Section - 60% (3/5) */}
                  <div className="xl:col-span-3">
                    {youtubeUrl ? (
                      <div className="rounded-2xl overflow-hidden bg-gray-800 border border-gray-700">
                        {!showVideo ? (
                          <div 
                            className="relative aspect-video cursor-pointer group"
                            onClick={() => setShowVideo(true)}
                          >
                            <img 
                              src={youtubeThumbnail} 
                              alt="Video thumbnail"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                setShowVideo(true);
                              }}
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play size={32} className="text-white ml-1" fill="white" />
                              </div>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <p className="text-white font-semibold text-lg drop-shadow-lg">{currentLesson?.title}</p>
                              <p className="text-white/80 text-sm drop-shadow">Click to play video</p>
                            </div>
                          </div>
                        ) : (
                          <div className="relative aspect-video bg-black">
                            {!videoError ? (
                              <iframe
                                width="100%"
                                height="100%"
                                src={youtubeUrl}
                                title="Course Video"
                                frameBorder="0"
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                onError={() => setVideoError(true)}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                <div className="text-center">
                                  <p className="text-white/60 mb-2">Video unavailable</p>
                                  <a 
                                    href={currentLesson.videoUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 text-sm"
                                  >
                                    Open in YouTube
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-800 border border-gray-700 rounded-2xl flex items-center justify-center">
                        <p className="text-gray-500">No video available</p>
                      </div>
                    )}
                    {showVideo && youtubeUrl && (
                      <button 
                        onClick={() => setShowVideo(false)}
                        className="mt-3 text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <ChevronLeft size={16} /> Back to preview
                      </button>
                    )}
                  </div>
                </div>

                {/* MIDDLE SECTION: FULL WIDTH - Course Notes + Lesson Progress Merged */}
                <div className="mb-8">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                    {/* Course Notes Section */}
                    <div className="mb-8 pb-8 border-b border-gray-700">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-purple-400" />
                        Course Notes
                      </h3>
                      
                      {(course.courseNotes || course.pdfFile || course.pdfUrl) && (
                        <div className="mb-4">
                          {(course.pdfFile || course.pdfUrl) && (
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-2">
                                <button 
                                  onClick={() => handleViewPDF(course.pdfUrl || course.pdfFile)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
                                >
                                  <Eye size={14} />
                                  View PDF
                                </button>
                                <button 
                                  onClick={() => handleDownloadPDF(course.pdfUrl || course.pdfFile)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg hover:bg-blue-600/30 transition-colors text-sm"
                                >
                                  <Download size={14} />
                                  Download
                                </button>
                              </div>
                            </div>
                          )}

                          {!course.pdfFile && !course.pdfUrl && course.courseNotes && (
                            <div className="flex flex-wrap gap-2">
                              <button 
                                onClick={() => handleViewPDF(course.courseNotes)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
                              >
                                <Eye size={14} />
                                View PDF
                              </button>
                              <button 
                                onClick={() => handleDownloadPDF(course.courseNotes)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg hover:bg-blue-600/30 transition-colors text-sm"
                              >
                                <Download size={14} />
                                Download
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="prose prose-invert max-w-none">
                        <div className="course-content text-gray-300 leading-relaxed min-h-[200px]">
                          {isLessonUnlocked ? (
                            currentLesson?.content ? (
                              <div 
                                className="lesson-html-content"
                                dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                              />
                            ) : (
                              <div className="whitespace-pre-wrap">
                                No content available for this lesson.
                              </div>
                            )
                          ) : (
                            <div className="flex flex-col items-center justify-center text-gray-500 py-8">
                              <Lock size={32} className="mb-3 opacity-50" />
                              <p>This lesson is locked</p>
                              <p className="text-xs text-gray-600 mt-1">Complete the previous lesson to continue</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lesson Progress Section */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Award size={18} className="text-purple-400" />
                        Lesson Progress
                      </h3>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Course Progress</span>
                          <span className="text-white font-semibold">{progressPercent}%</span>
                        </div>
                        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{completedLessons} of {totalLessons} lessons completed</p>
                      </div>
                    </div>

                    {/* Action Buttons - Bottom of Full-Width Card */}
                    <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-gray-700">
                      <button 
                        type="button"
                        disabled={activeLessonIndex === 0}
                        onClick={handlePrevLesson}
                        className="px-6 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        <ChevronLeft size={18} />
                        Previous
                      </button>

                      <button 
                        type="button"
                        onClick={handleMarkComplete}
                        disabled={!isLessonUnlocked}
                        className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 ${
                          isLessonUnlocked 
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-500/25'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isCompleted ? (
                          <>Completed <CheckCircle size={18} /></>
                        ) : (
                          <>Mark Complete <ChevronRight size={18} /></>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

              {/* SECTION 4: REVIEWS SECTION */}
              {reviews.length > 0 && (
                <div className="pt-6 border-t border-gray-700">
                  <button 
                    onClick={() => setShowReviews(!showReviews)}
                    className="flex items-center gap-2 text-lg font-bold text-white mb-4"
                  >
                    <MessageSquare size={20} className="text-purple-400" />
                    Course Reviews ({totalRatings})
                  </button>
                  
                  <AnimatePresence>
                    {showReviews && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        {reviews.map((review, index) => (
                          <div key={index} className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold">
                                {review.userId?.name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="font-semibold text-white">{review.userId?.name || 'Anonymous'}</p>
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star} 
                                      size={14} 
                                      className={star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            {review.feedback && (
                              <p className="text-gray-400 text-sm mt-2">{review.feedback}</p>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Course Test Section - Show when lessons completed */}
              {showTestSection && enrollment?.completed && (
                <div className="mt-10 pt-6 border-t border-gray-700">
                  {!mcqCompleted ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-6 text-center"
                    >
                      <Brain size={48} className="mx-auto text-purple-400 mb-3" />
                      <h3 className="text-xl font-bold text-white mb-2">Course Knowledge Test</h3>
                      <p className="text-gray-400 mb-4 max-w-md mx-auto">
                        Test your knowledge with 10 questions. You have 1 minute to complete the test.
                      </p>
                      <button
                        onClick={() => setShowCourseTest(true)}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all flex items-center gap-2 mx-auto"
                      >
                        <Brain size={20} />
                        Start MCQ Test
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-2xl p-6 text-center"
                    >
                      <CheckCircle size={48} className="mx-auto text-green-400 mb-3" />
                      <h3 className="text-xl font-bold text-white mb-2">MCQ Completed</h3>
                      <p className="text-gray-400 mb-4">
                        Your Score: {mcqScore} / 10
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          className="px-8 py-3 bg-gray-600 text-white font-bold rounded-xl cursor-default flex items-center gap-2 opacity-75"
                          disabled
                        >
                          <CheckCircle size={20} />
                          MCQ Completed
                        </button>
                        {!hasRated && (
                          <button
                            onClick={() => setShowRatingModal(true)}
                            className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-purple-600 text-white font-bold rounded-xl hover:from-yellow-500 hover:to-purple-500 transition-all flex items-center gap-2"
                          >
                            <Star size={20} />
                            Rate Course
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Show rating prompt if MCQ completed but rating not submitted */}
              {mcqCompleted && !hasRated && !showTestSection && enrollment?.completed && (
                <div className="mt-10 pt-6 border-t border-gray-700">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-yellow-600/20 to-purple-600/20 border border-yellow-500/30 rounded-2xl p-6 text-center"
                  >
                    <Award size={48} className="mx-auto text-yellow-400 mb-3" />
                    <h3 className="text-xl font-bold text-white mb-2">Rate This Course</h3>
                    <p className="text-gray-400 mb-4 max-w-md mx-auto">
                      You've completed the MCQ test. Please rate this course.
                    </p>
                    <button
                      onClick={() => setShowRatingModal(true)}
                      className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-purple-600 text-white font-bold rounded-xl hover:from-yellow-500 hover:to-purple-500 transition-all flex items-center gap-2 mx-auto"
                    >
                      <Star size={20} />
                      Give Rating
                    </button>
                  </motion.div>
                </div>
              )}

              {/* Leave Course Button */}
              <div className="mt-8 text-center">
                <button 
                  type="button"
                  onClick={handleLeaveCourse}
                  className="text-gray-500 hover:text-white transition-colors text-sm"
                >
                  Leave Course
                </button>
              </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Scroll Navigation Buttons */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
        <button 
          onClick={scrollToTop}
          className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 text-white shadow-lg hover:bg-purple-600 hover:border-purple-500 transition-all flex items-center justify-center"
          title="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
        <button 
          onClick={scrollToBottom}
          className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 text-white shadow-lg hover:bg-purple-600 hover:border-purple-500 transition-all flex items-center justify-center"
          title="Scroll to bottom"
        >
          <ArrowDown size={20} />
        </button>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-700"
          >
            <div className="text-center mb-6">
              <Award size={48} className="mx-auto text-yellow-500 mb-3" />
              <h2 className="text-2xl font-bold text-white">Course Completed!</h2>
              <p className="text-gray-400 mt-2">Congratulations on completing the course!</p>
            </div>
            
            <div className="mb-6">
              <p className="text-center text-white mb-4">How would you rate this course?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                  >
                    {star <= (hoverRating || userRating) ? (
                      <span className="text-yellow-400">★</span>
                    ) : (
                      <span className="text-gray-600">★</span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-center text-gray-500 text-sm mt-2">
                {userRating === 1 && 'Poor'}
                {userRating === 2 && 'Fair'}
                {userRating === 3 && 'Good'}
                {userRating === 4 && 'Very Good'}
                {userRating === 5 && 'Excellent'}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Feedback (optional)</label>
              <textarea
                value={ratingFeedback}
                onChange={(e) => setRatingFeedback(e.target.value)}
                placeholder="Share your experience with this course..."
                className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSkipRating}
                className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleSubmitRating}
                disabled={userRating === 0 || ratingSubmitting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold disabled:opacity-50 hover:from-purple-500 hover:to-blue-500 transition-all"
              >
                {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Course Test Modal */}
      {showCourseTest && course && (
        <CourseTest 
          courseId={courseId}
          courseTitle={course.title}
          onClose={() => setShowCourseTest(false)}
          onComplete={handleMcqTestComplete}
        />
      )}
    </div>
  );
};

export default CourseViewer;
