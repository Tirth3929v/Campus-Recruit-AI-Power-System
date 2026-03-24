import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Trash2, Clock, CheckCircle, XCircle, Search, Filter, Image as ImageIcon } from 'lucide-react';
import axiosInstance from './axiosInstance';

const CourseUpdateManager = () => {
  const [courses, setCourses] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateType, setUpdateType] = useState('edit');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    category: 'Development',
    level: 'Beginner',
    duration: '',
    thumbnail: '',
    modules: [{ title: '', content: '' }],
    reason: ''
  });
  const thumbnailInputRef = React.useRef(null);

  useEffect(() => {
    fetchCourses();
    fetchMyRequests();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await axiosInstance.get('/courses');
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const { data } = await axiosInstance.get('/course-updates/my-requests');
      setMyRequests(data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  const handleEditClick = (course) => {
    setSelectedCourse(course);
    setUpdateType('edit');
    setFormData({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      category: course.category,
      level: course.level,
      duration: course.duration,
      thumbnail: course.thumbnail || '',
      modules: course.chapters?.length > 0 
        ? course.chapters.map(ch => ({ title: ch.title || '', content: ch.content || '' }))
        : [{ title: '', content: '' }],
      reason: ''
    });
    setShowUpdateModal(true);
  };

  const handleDeleteClick = (course) => {
    setSelectedCourse(course);
    setUpdateType('delete');
    setFormData({ ...formData, reason: '' });
    setShowUpdateModal(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedFields = updateType === 'edit' ? {
        title: formData.title,
        description: formData.description,
        instructor: formData.instructor,
        category: formData.category,
        level: formData.level,
        duration: formData.duration,
        thumbnail: formData.thumbnail,
        modules: formData.modules
      } : {};

      await axiosInstance.post('/course-updates/request', {
        courseId: selectedCourse._id,
        updateType,
        updatedFields,
        reason: formData.reason
      });

      alert('Update request submitted successfully!');
      setShowUpdateModal(false);
      fetchMyRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleThumbnailFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setFormData({ ...formData, thumbnail: ev.target.result });
    reader.readAsDataURL(file);
  };

  const clearThumbnail = () => {
    setFormData({ ...formData, thumbnail: '' });
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  const addModule = () => {
    setFormData({
      ...formData,
      modules: [...formData.modules, { title: '', content: '' }]
    });
  };

  const removeModule = (index) => {
    if (formData.modules.length === 1) {
      alert('At least one module is required');
      return;
    }
    setFormData({
      ...formData,
      modules: formData.modules.filter((_, i) => i !== index)
    });
  };

  const updateModule = (index, field, value) => {
    const updatedModules = [...formData.modules];
    updatedModules[index][field] = value;
    setFormData({ ...formData, modules: updatedModules });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/20'
    };
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle
    };
    const Icon = icons[status];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${styles[status]}`}>
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Course Update Manager</h1>
          <p className="text-white/40 text-sm mt-1">Request updates to courses - requires admin approval</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder-white/30 outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      </div>

      {/* My Requests */}
      <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 className="text-xl font-bold text-white mb-4">My Update Requests</h2>
        {myRequests.length === 0 ? (
          <p className="text-white/30 text-sm">No requests yet</p>
        ) : (
          <div className="space-y-3">
            {myRequests.map((req) => (
              <div key={req._id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="flex-1">
                  <p className="text-white font-semibold">{req.course?.title}</p>
                  <p className="text-white/40 text-xs mt-1">
                    {req.updateType === 'edit' ? 'Edit Request' : 'Delete Request'} • {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                  {req.adminResponse && (
                    <p className="text-white/50 text-xs mt-2 italic">Admin: {req.adminResponse}</p>
                  )}
                </div>
                {getStatusBadge(req.status)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => (
          <motion.div
            key={course._id}
            whileHover={{ y: -4 }}
            className="rounded-2xl p-5 group"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover rounded-xl mb-4" />
            <h3 className="text-white font-bold mb-2">{course.title}</h3>
            <p className="text-white/40 text-sm mb-1">{course.instructor}</p>
            <p className="text-white/30 text-xs mb-4">{course.category} • {course.level}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditClick(course)}
                className="flex-1 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
              >
                <Edit3 size={14} /> Edit
              </button>
              <button
                onClick={() => handleDeleteClick(course)}
                className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Update Modal */}
      <AnimatePresence>
        {showUpdateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowUpdateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl max-w-4xl w-full flex flex-col"
              style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh' }}
            >
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {updateType === 'edit' ? 'Request Course Edit' : 'Request Course Deletion'}
                </h2>
                <p className="text-white/40 text-sm">
                  {updateType === 'edit' 
                    ? 'Submit your changes for admin approval'
                    : 'This will request admin approval to delete this course'}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: '60vh' }}>
                <form id="updateForm" onSubmit={handleSubmitRequest} className="space-y-5">
                {updateType === 'edit' && (
                  <>
                    <div>
                      <label className="text-white/60 text-sm font-semibold mb-2 block">Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl text-white outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm font-semibold mb-2 block">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl text-white outline-none resize-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/60 text-sm font-semibold mb-2 block">Instructor</label>
                        <input
                          type="text"
                          value={formData.instructor}
                          onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-white outline-none"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-sm font-semibold mb-2 block">Duration</label>
                        <input
                          type="text"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          placeholder="e.g., 10h 30m"
                          className="w-full px-4 py-3 rounded-xl text-white outline-none"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/60 text-sm font-semibold mb-2 block">Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-white outline-none"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          <option value="Development">Development</option>
                          <option value="Design">Design</option>
                          <option value="Data Science">Data Science</option>
                          <option value="Business">Business</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Soft Skills">Soft Skills</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white/60 text-sm font-semibold mb-2 block">Level</label>
                        <select
                          value={formData.level}
                          onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-white outline-none"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    {/* Thumbnail Upload */}
                    <div>
                      <label className="text-white/60 text-sm font-semibold mb-2 block">Course Thumbnail</label>
                      <input
                        ref={thumbnailInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleThumbnailFile}
                      />
                      {formData.thumbnail ? (
                        <div className="relative group">
                          <img
                            src={formData.thumbnail}
                            alt="Thumbnail"
                            className="w-full h-40 object-cover rounded-xl border border-white/10"
                          />
                          <button
                            type="button"
                            onClick={clearThumbnail}
                            className="absolute top-2 right-2 bg-red-600/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => thumbnailInputRef.current?.click()}
                          className="flex flex-col items-center justify-center gap-2 w-full h-40 rounded-xl cursor-pointer transition-all border-2 border-dashed"
                          style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.05)' }}
                          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(139,92,246,0.1)')}
                          onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(139,92,246,0.05)')}
                        >
                          <ImageIcon size={32} className="text-purple-400" />
                          <p className="text-sm text-purple-400 font-medium">Click to upload thumbnail</p>
                          <p className="text-xs text-white/30">PNG, JPG, WEBP · max 5 MB</p>
                        </div>
                      )}
                      <div className="mt-2">
                        <input
                          type="url"
                          value={formData.thumbnail.startsWith('data:') ? '' : formData.thumbnail}
                          onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                          placeholder="Or paste image URL..."
                          className="w-full px-4 py-2.5 rounded-xl text-white placeholder-white/30 outline-none text-sm"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Course Curriculum Section */}
                {updateType === 'edit' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-white font-bold text-lg block">Course Curriculum / Modules</label>
                        <p className="text-white/40 text-xs mt-1">Edit the deep content and structure of your course</p>
                      </div>
                      <button
                        type="button"
                        onClick={addModule}
                        className="px-4 py-2 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors text-sm font-semibold flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Module
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.modules.map((module, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-xl space-y-3"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white/60 text-sm font-bold">Module {index + 1}</span>
                            {formData.modules.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeModule(index)}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                title="Delete Module"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                          
                          <div>
                            <label className="text-white/50 text-xs font-semibold mb-1.5 block">Module Title</label>
                            <input
                              type="text"
                              value={module.title}
                              onChange={(e) => updateModule(index, 'title', e.target.value)}
                              placeholder="e.g., Introduction to React Hooks"
                              className="w-full px-4 py-2.5 rounded-lg text-white placeholder-white/30 outline-none text-sm"
                              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                              required
                            />
                          </div>

                          <div>
                            <label className="text-white/50 text-xs font-semibold mb-1.5 block">Module Content / Deep Description</label>
                            <textarea
                              value={module.content}
                              onChange={(e) => updateModule(index, 'content', e.target.value)}
                              rows={6}
                              placeholder="Enter detailed module content, learning objectives, topics covered, examples, etc..."
                              className="w-full px-4 py-3 rounded-lg text-white placeholder-white/30 outline-none resize-none text-sm"
                              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                              required
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-white/60 text-sm font-semibold mb-2 block">Reason for {updateType === 'edit' ? 'Update' : 'Deletion'}</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={3}
                    placeholder="Explain why this change is needed..."
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 outline-none resize-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    required
                  />
                </div>
              </form>
              </div>

              <div className="p-6 border-t border-white/10 bg-black/20">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUpdateModal(false)}
                    className="flex-1 py-3 rounded-xl text-white/60 hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="updateForm"
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseUpdateManager;
