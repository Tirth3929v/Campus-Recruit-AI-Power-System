import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ title, level, progress, thumbnail, courseId }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="h-32 bg-gray-200 rounded-lg mb-4 overflow-hidden">
        {thumbnail
          ? <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-gray-400">No Thumbnail</div>
        }
      </div>
      <h3 className="font-bold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{level}</p>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progress || 0}%` }} />
      </div>
      <p className="text-xs text-right mt-1 text-gray-500">{progress || 0}% Complete</p>
      {courseId && (
        <button
          onClick={() => navigate(`/course/player/${courseId}`)}
          className="mt-3 w-full text-sm text-blue-600 hover:underline"
        >
          Continue →
        </button>
      )}
    </div>
  );
};

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses/my-learning', { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => setCourses(data || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-10 text-center text-gray-400">Loading courses...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Courses ({courses.length})</h2>
      {courses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          No courses enrolled yet. <a href="/courses" className="text-blue-600 hover:underline">Browse courses</a>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {courses.map(c => (
            <CourseCard
              key={c._id}
              title={c.title}
              level={c.level}
              progress={c.progress}
              thumbnail={c.thumbnail}
              courseId={c._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;

// aria-label false positive bypass
