import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import axiosInstance from '../axiosInstance.js';
import { 
  Play, CheckCircle2, ChevronLeft, ChevronRight, 
  FileText, Download, MessageSquare, Share2, 
  MoreHorizontal, Flag, Lock, Volume2, PictureInPicture
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CoursePlayer = () => {
  const { setCourseProgress } = useOutletContext() || { setCourseProgress: () => {} };
  const videoRef = useRef(null);
  const [playbackRate, setPlaybackRate] = useState(1);

  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleDownload = (fileName) => {
    // Create a dummy file for demonstration
    const element = document.createElement("a");
    const file = new Blob([`This is the content for ${fileName}.\n\nIn a real application, this would be the actual file content.`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${fileName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState([
    { id: 1, timestamp: '02:15', text: 'Hooks allow you to use state without writing a class.' },
    { id: 2, timestamp: '05:30', text: 'The dependency array controls when the effect runs.' }
  ]);
  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note = {
      id: Date.now(),
      timestamp: '04:20', // Mock timestamp based on the static player overlay
      text: newNote
    };
    setNotes([note, ...notes]);
    setNewNote('');
  };

  const [questions, setQuestions] = useState([
    { id: 1, user: 'Sarah M.', text: 'Does useEffect run after every render?', timestamp: '2 hours ago', replies: 2 },
    { id: 2, user: 'John D.', text: 'Can I use multiple useEffect hooks in one component?', timestamp: '1 day ago', replies: 0 }
  ]);
  const [newQuestion, setNewQuestion] = useState('');

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    const question = {
      id: Date.now(),
      user: 'You',
      text: newQuestion,
      timestamp: 'Just now',
      replies: 0
    };
    setQuestions([question, ...questions]);
    setNewQuestion('');
  };

  // Lesson State
  const [lessons, setLessons] = useState([
    { id: 1, title: 'Introduction to Hooks', duration: '12m', completed: true, active: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
    { id: 2, title: 'The useState Hook', duration: '18m', completed: true, active: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
    { id: 3, title: 'The useEffect Hook', duration: '25m', completed: false, active: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    { id: 4, title: 'Custom Hooks Pattern', duration: '45m', completed: false, active: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
    { id: 5, title: 'The useContext Hook', duration: '15m', completed: false, active: false, locked: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
    { id: 6, title: 'Performance Hooks', duration: '10m', completed: false, active: false, locked: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4' },
  ]);

  const handleMarkComplete = () => {
    // 1. Mark active lesson as complete
    const updatedLessons = lessons.map(lesson => 
      lesson.active ? { ...lesson, completed: true } : lesson
    );
    setLessons(updatedLessons);

    // 2. Calculate new progress percentage
    const completedCount = updatedLessons.filter(l => l.completed).length;
    const newProgress = Math.round((completedCount / updatedLessons.length) * 100);

    // 3. Update global context
    setCourseProgress(newProgress);

    // 4. Trigger Confetti Celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // 5. Play Success Sound
    const successSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3');
    successSound.play().catch(err => console.error("Audio playback failed:", err));
  };

  const handleLessonChange = (id) => {
    const updatedLessons = lessons.map(lesson => ({
      ...lesson,
      active: lesson.id === id
    }));
    setLessons(updatedLessons);
  };

  const handleVideoEnded = () => {
    const currentIndex = lessons.findIndex(l => l.active);
    if (currentIndex < lessons.length - 1) {
      // Mark current complete, unlock and activate next
      const updatedLessons = lessons.map((lesson, index) => {
        if (index === currentIndex) {
          return { ...lesson, completed: true, active: false };
        }
        if (index === currentIndex + 1) {
          return { ...lesson, active: true, locked: false };
        }
        return lesson;
      });
      
      setLessons(updatedLessons);
      
      // Update global progress
      const completedCount = updatedLessons.filter(l => l.completed).length;
      const newProgress = Math.round((completedCount / updatedLessons.length) * 100);
      setCourseProgress(newProgress);
    } else {
      handleMarkComplete();
    }
  };

  const activeLesson = lessons.find(l => l.active) || lessons[0];
  const allCompleted = lessons.every(l => l.completed);

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Back */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <button className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors">
          <ChevronLeft size={16} /> Back to Dashboard
        </button>
        <span>/</span>
        <span>React Hooks</span>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-medium">{activeLesson.title}</span>
      </div>

      {/* Video Player Container */}
      <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group">
        <video
          key={activeLesson.id}
          src={activeLesson.videoUrl}
          controls
            autoPlay
            onEnded={handleVideoEnded}
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop"
        >
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{activeLesson.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Lesson {activeLesson.id} of {lessons.length} • {activeLesson.duration} • By Alex Johnson</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => handleDownload('Lesson Resources')}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-sm"
            >
                <Download size={18} />
                <span className="hidden sm:inline">Resources</span>
            </button>
            <button className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-sm">
                <Share2 size={18} />
                <span className="hidden sm:inline">Share</span>
            </button>
            {allCompleted ? (
              <button 
                  onClick={() => alert('Certificate Download Started!')}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 active:scale-95"
              >
                  <Award size={18} />
                  Get Certificate
              </button>
            ) : (
              <button 
                  onClick={handleMarkComplete}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-95"
              >
                  <CheckCircle2 size={18} />
                  Mark Complete
              </button>
            )}
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-slate-800 overflow-x-auto">
                {['Overview', 'Resources', 'Q&A', 'Notes'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === tab.toLowerCase()
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 min-h-[300px]">
                {activeTab === 'overview' && (
                    <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">About this lesson</h3>
                        <p>
                            In this lesson, we explore the fundamental concepts behind React Hooks. 
                            We'll cover why they were introduced, the problems they solve compared to class components, 
                            and the rules of hooks that you need to follow.
                        </p>
                        <h4 className="font-bold text-slate-900 dark:text-white mt-4">Key Takeaways:</h4>
                        <ul className="list-disc pl-5 space-y-2 marker:text-indigo-500">
                            <li>Understanding the motivation behind Hooks (reusing stateful logic).</li>
                            <li>The Rules of Hooks (only call at top level, only call from React functions).</li>
                            <li>Converting Class components to Functional components with state.</li>
                        </ul>
                    </div>
                )}
                {activeTab === 'resources' && (
                    <div className="space-y-3">
                        {[
                            { name: 'Lesson Slides', type: 'PDF', size: '2.4 MB', color: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
                            { name: 'Starter Code', type: 'ZIP', size: '1.1 MB', color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
                            { name: 'Cheatsheet', type: 'PNG', size: '0.5 MB', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' }
                        ].map((resource, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-lg ${resource.color}`}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{resource.name}</p>
                                        <p className="text-xs text-slate-500">{resource.type} • {resource.size}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDownload(resource.name)}
                                    className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    <Download size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'q&a' && (
                    <div className="space-y-6">
                        {/* Input area */}
                        <div className="flex flex-col gap-3">
                             <textarea
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                placeholder="Ask a question about this lesson..."
                                className="w-full p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24 text-sm transition-all"
                            />
                            <div className="flex justify-end">
                                <button 
                                    onClick={handleAddQuestion}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <MessageSquare size={16} />
                                    Post Question
                                </button>
                            </div>
                        </div>

                        {/* Questions List */}
                        <div className="space-y-4">
                            {questions.map((q) => (
                                <div key={q.id} className="p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                {q.user.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{q.user}</p>
                                                <p className="text-xs text-slate-500">{q.timestamp}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-3">{q.text}</p>
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <button className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                            <MessageSquare size={14} />
                                            {q.replies} Replies
                                        </button>
                                        <button className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                            Reply
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'notes' && (
                    <div className="space-y-6">
                        <div className="flex flex-col gap-3">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Type your note here... (Timestamp will be saved automatically)"
                                className="w-full p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24 text-sm transition-all"
                            />
                            <div className="flex justify-end">
                                <button 
                                    onClick={handleAddNote}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <CheckCircle2 size={16} />
                                    Save Note at 04:20
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {notes.map((note) => (
                                <div key={note.id} className="p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors group">
                                    <div className="flex items-center gap-3 mb-2">
                                        <button className="text-indigo-600 dark:text-indigo-400 text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center gap-1">
                                            <Play size={10} className="fill-current" />
                                            {note.timestamp}
                                        </button>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{note.text}</p>
                                </div>
                            ))}
                            {notes.length === 0 && (
                                <p className="text-center text-slate-400 text-sm py-8">No notes yet. Start watching to take notes!</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Sidebar (Right 1 col) - Playlist/Next */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Course Content</h3>
                        <p className="text-xs text-slate-500">2 of 8 completed</p>
                    </div>
                </div>
                <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-700">
                    {lessons.map((lesson, i) => (
                        <div 
                            key={i} 
                            onClick={() => !lesson.locked && handleLessonChange(lesson.id)}
                            className={`p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border-b border-gray-100 dark:border-slate-800/50 last:border-0 ${
                                lesson.active ? 'bg-indigo-50 dark:bg-indigo-500/10 border-l-4 border-l-indigo-600 dark:border-l-indigo-400' : 'border-l-4 border-l-transparent'
                            }`}
                        >
                            <div className={`mt-0.5 ${lesson.completed ? 'text-green-500' : lesson.locked ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400'}`}>
                                {lesson.completed ? <CheckCircle2 size={16} /> : lesson.locked ? <Lock size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                            </div>
                            <div className={lesson.locked ? 'opacity-50' : ''}>
                                <p className={`text-sm font-medium ${lesson.active ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {lesson.title}
                                </p>
                                <p className="text-xs text-slate-500">{lesson.duration}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;