import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  User, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Calendar,
  Filter
} from 'lucide-react';
import axiosInstance from './axiosInstance';

const EmployeeTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTasks = async () => {
    try {
      const res = await axiosInstance.get('/tasks');
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Fetch tasks failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleTaskStatus = async (taskId) => {
    try {
      const res = await axiosInstance.patch(`/tasks/${taskId}/toggle`);
      if (res.data.success) {
        const updatedTask = res.data.task;
        setTasks(tasks.map(t => t._id === taskId ? { ...t, isCompleted: updatedTask.isCompleted, completedAt: updatedTask.completedAt } : t));
        showToast(updatedTask.isCompleted ? 'Task marked as completed!' : 'Task set to pending');
      }
    } catch (err) {
      console.error('Toggle task failed', err);
      showToast('Action failed. Please try again.', 'error');
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.isCompleted;
    if (filter === 'completed') return t.isCompleted;
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-white/50 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        <p className="text-sm font-medium tracking-wide">Loading your assignments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-10 left-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border text-white font-semibold ${
              toast.type === 'success' 
              ? 'bg-emerald-600 border-emerald-500/50 shadow-emerald-900/40' 
              : 'bg-red-600 border-red-500/50 shadow-red-900/40'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">My Tasks</h1>
          </div>
          <p className="text-white/40 text-sm ml-1 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" />
            {tasks.filter(t => t.isCompleted).length} of {tasks.length} tasks completed
          </p>
        </motion.div>

        {/* Filter Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 shadow-inner overflow-hidden"
        >
          {['all', 'pending', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                filter === f 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105 z-10' 
                : 'text-white/40 hover:text-white/70'
              }`}
            >
              {f}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-white/20 space-y-4"
          >
            <CheckCircle2 className="w-16 h-16 opacity-5" />
            <p className="font-medium">No {filter !== 'all' ? filter : ''} tasks found</p>
          </motion.div>
        ) : (
          filteredTasks.map((task, idx) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative group h-full rounded-2xl border transition-all duration-300 ${
                task.isCompleted 
                ? 'bg-emerald-500/5 border-emerald-500/20' 
                : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-black'
              }`}
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-xl ${task.isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
                    {task.isCompleted ? <CheckCircle size={20} /> : <Clock size={20} />}
                  </div>
                  {task.isCompleted && (
                    <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-md uppercase tracking-tighter">Completed</span>
                  )}
                </div>

                <h3 className={`text-lg font-bold mb-4 line-clamp-2 leading-tight ${task.isCompleted ? 'text-white/30 line-through' : 'text-white/90'}`}>
                  {task.title}
                </h3>

                <div className="mt-auto space-y-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <User size={12} className="text-emerald-500" />
                      <span>Assigned by: <span className="text-white/70 font-semibold">{task.creator?.name || 'Admin'}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <Calendar size={12} className="text-emerald-500" />
                      <span>Received: <span className="text-white/70 font-semibold">{new Date(task.createdAt).toLocaleDateString()}</span></span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleTaskStatus(task._id)}
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 ${
                      task.isCompleted
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'bg-white/10 text-white hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20'
                    }`}
                  >
                    {task.isCompleted ? 'Update to Pending' : 'Mark as Done'}
                  </button>
                </div>
              </div>

              {/* Status Indicator Bar */}
              <div 
                className={`absolute bottom-0 left-0 h-1 rounded-b-2xl transition-all duration-500 ${
                  task.isCompleted ? 'w-full bg-emerald-500' : 'w-2 bg-white/20 group-hover:bg-emerald-500/40 group-hover:w-1/3'
                }`} 
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployeeTasks;
