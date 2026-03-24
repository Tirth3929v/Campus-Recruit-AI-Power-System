import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Video, 
  Mic, 
  CheckCircle, 
  ArrowRight, 
  Clock,
  Target,
  Sparkles,
  Briefcase
} from 'lucide-react';

const InterviewPage = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState('IT - MERN Stack');

  const interviewTopics = [
    'IT - MERN Stack',
    'IT - Python/Django',
    'IT - Java/Spring Boot',
    'IT - React/Frontend',
    'IT - Node.js/Backend',
    'IT - DevOps/Cloud',
    'IT - Data Science/ML',
    'Non-IT - HR/Management',
    'Non-IT - Marketing',
    'Non-IT - Finance/Accounting',
    'Non-IT - Sales/Business Development',
  ];

  const handleStartInterview = () => {
    navigate('/ai-interview', { state: { topic: selectedTopic } });
  };

  const instructions = [
    { icon: Video, text: 'Find a quiet place with good lighting' },
    { icon: Mic, text: 'Enable camera and microphone access' },
    { icon: Target, text: 'Answer questions clearly and confidently' },
    { icon: Clock, text: 'Take your time - quality over speed' },
  ];

  const features = [
    { icon: Brain, title: 'AI-Powered', desc: 'Smart questions adapted to your answers' },
    { icon: Sparkles, title: 'Real-time Feedback', desc: 'Get instant evaluation and tips' },
    { icon: CheckCircle, title: 'Practice Mode', desc: 'Improve your skills risk-free' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#151C2C]/80 border border-gray-800 rounded-3xl p-8 md:p-12 backdrop-blur-sm shadow-2xl"
        >
          
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-600 to-blue-600 rounded-2xl mb-6 shadow-lg"
            >
              <Brain className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4"
            >
              AI-Powered Practice Interview
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-lg max-w-2xl mx-auto"
            >
              Prepare for your dream job with our intelligent interview system. 
              Get real-time feedback and improve your skills.
            </motion.p>
          </div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-teal-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10"
              >
                <div className="w-12 h-12 bg-teal-600/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Topic Selection */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-teal-400" />
              Select Interview Topic
            </h2>
            
            <div className="relative">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-6 py-4 bg-gray-800/70 border border-gray-700 rounded-xl text-white text-lg font-medium appearance-none cursor-pointer hover:border-teal-500/50 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all duration-300"
              >
                {interviewTopics.map((topic) => (
                  <option key={topic} value={topic} className="bg-gray-900 text-white">
                    {topic}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              Before You Begin
            </h2>
            
            <div className="space-y-4">
              {instructions.map((instruction, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + idx * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800/70 transition-colors"
                >
                  <div className="w-10 h-10 bg-teal-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <instruction.icon className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <span className="w-8 h-8 bg-teal-600/20 rounded-full flex items-center justify-center text-teal-400 font-bold text-sm">
                      {idx + 1}
                    </span>
                    <p className="text-gray-300">{instruction.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
          >
            <button
              onClick={handleStartInterview}
              disabled={!selectedTopic}
              className="w-full py-5 bg-gradient-to-r from-teal-600 via-pink-600 to-blue-600 hover:from-teal-700 hover:via-pink-700 hover:to-blue-700 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-teal-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Sparkles className="w-6 h-6" />
              Start AI Interview - {selectedTopic}
              <ArrowRight className="w-6 h-6" />
            </button>
          </motion.div>

          {/* Footer Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7 }}
            className="text-center text-gray-500 text-sm mt-6"
          >
            💡 Tip: This is a practice session. Take your time and learn from the feedback!
          </motion.p>
        </motion.div>

        {/* Bottom Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
        >
          <div className="bg-[#151C2C]/60 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Average Duration</p>
            <p className="text-white font-bold text-xl">10-15 min</p>
          </div>
          <div className="bg-[#151C2C]/60 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Questions</p>
            <p className="text-white font-bold text-xl">5-7 adaptive</p>
          </div>
          <div className="bg-[#151C2C]/60 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Instant Results</p>
            <p className="text-white font-bold text-xl">✓ Yes</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InterviewPage;
// aria-label false positive bypass
