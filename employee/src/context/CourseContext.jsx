import React, { createContext, useState, useContext, useEffect } from 'react';

const CourseContext = createContext();

export const useCourses = () => useContext(CourseContext);

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState(() => {
    try {
      const savedCourses = localStorage.getItem('courses');
      return savedCourses ? JSON.parse(savedCourses) : [
        { id: 1, title: 'React Developer' },
        { id: 2, title: 'Node.js Backend' },
        { id: 3, title: 'Full Stack Web Development' },
        { id: 4, title: 'Data Structures & Algorithms' },
        { id: 5, title: 'System Design' }
      ];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('courses', JSON.stringify(courses));
  }, [courses]);

  const addCourse = (course) => {
    const newCourse = { ...course, id: Date.now() };
    setCourses(prev => [...prev, newCourse]);
  };

  const deleteCourse = (id) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const updateCourse = (id, updatedFields) => {
    setCourses(prev => prev.map(c => (c.id === id ? { ...c, ...updatedFields } : c)));
  };

  return (
    <CourseContext.Provider value={{ courses, addCourse, deleteCourse, updateCourse }}>
      {children}
    </CourseContext.Provider>
  );
};