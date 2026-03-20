import React from 'react';

const CourseCard = ({ title, level, progress }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-400">Course Thumbnail</div>
    <h3 className="font-bold text-gray-800">{title}</h3>
    <p className="text-sm text-gray-500 mb-4">{level}</p>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
    </div>
    <p className="text-xs text-right mt-1 text-gray-500">{progress}% Complete</p>
  </div>
);

const Courses = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Technical Courses</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <CourseCard title="Full Stack MERN" level="Intermediate" progress={45} />
        <CourseCard title="Python for Data Science" level="Beginner" progress={10} />
      </div>
    </div>
  );
};

export default Courses;