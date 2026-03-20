import React from 'react';
import { motion } from 'framer-motion';
import { Play, Star, Clock, BookOpen, Users } from 'lucide-react';
import { coursesData } from '../data/coursesData';

const CourseCard = ({ course, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5 }}
    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-all"
  >
    <div className={`h-32 ${course.color} relative flex items-center justify-center`}>
      <BookOpen size={48} className="text-white opacity-20" />
      <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-medium border border-white/30">
        {course.category}
      </div>
    </div>
    
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{course.title}</h3>
        <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
          <Star size={14} fill="currentColor" />
          {course.rating}
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mb-4">by {course.instructor}</p>
      
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          {course.duration}
        </div>
        <div className="flex items-center gap-1">
          <Users size={14} />
          {course.students}
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
          <span>Progress</span>
          <span>{course.progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${course.progress}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className={`h-full rounded-full ${course.color}`} 
          />
        </div>
        
        <button className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
          <Play size={18} />
          {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
        </button>
      </div>
    </div>
  </motion.div>
);

const CoursesPage = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Skill Center</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesData.map((course, index) => (
          <CourseCard key={course.id} course={course} index={index} />
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;