import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  User, 
  Users, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Loader2,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../context/axiosInstance';

const TaskManager = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  
  // Refactored state
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('self');
  const [message, setMessage] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/tasks');
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Fetch tasks failed', err);
    }
  }, []);

  const fetchEmployees = async () => {
    try {
      // Fetching from the newly created employee-specific admin endpoint
      const response = await axiosInstance.get('/admin/employees');
      
      // Extraction: Handle both direct array and wrapped { employees: [] } response formats
      let employeeArray = [];
      if (Array.isArray(response.data)) {
        employeeArray = response.data;
      } else if (response.data && Array.isArray(response.data.employees)) {
        employeeArray = response.data.employees;
      }
      
      if (Array.isArray(employeeArray)) {
        // Strict filter: only approved/verified employees can be assigned tasks
        const approvedEmployees = employeeArray.filter(emp => emp.isVerified === true); 
        setEmployees(approvedEmployees);
      } else {
        console.error("Fetch employees failed: expected array, got", typeof response.data);
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching from employee table:", error);
      setEmployees([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchTasks(), fetchEmployees()]);
      setLoading(false);
    };
    init();
  }, [fetchTasks]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setFormLoading(true);
    try {
      // If "self" is selected, we send empty string to let backend fall back to req.user.id
      const payload = {
        title,
        assignedTo: assignedTo === 'self' ? '' : assignedTo
      };

      const res = await axiosInstance.post('/tasks', payload);
      if (res.data.success) {
        setTitle('');
        setAssignedTo('self');
        setMessage('Task created successfully!');
        setTimeout(() => setMessage(''), 3000);
        fetchTasks();
      }
    } catch (err) {
      console.error('Create task failed', err);
    } finally {
      setFormLoading(false);
    }
  };

  const toggleTaskStatus = async (taskId) => {
    try {
      const res = await axiosInstance.patch(`/tasks/${taskId}/toggle`);
      if (res.data.success) {
        setTasks(tasks.map(t => t._id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
      }
    } catch (err) {
      console.error('Toggle task failed', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const myTasks = tasks.filter(t => t.assignedTo?._id === user?._id);
  const delegatedTasks = tasks.filter(t => (t.assignedTo?._id || 'self') !== user?._id);

  return (
    <div className="h-full space-y-8 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <ClipboardList className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Task Manager</h1>
          <p className="text-white/50 text-sm">Organize and delegate responsibilities</p>
        </div>
      </motion.div>

      {/* Create Task Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl"
      >
        <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-widest ml-1">Task Title</label>
            <input 
              type="text" 
              placeholder="What needs to be done?"
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-white/20"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-widest ml-1">Assign To</label>
            <select 
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all appearance-none cursor-pointer"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="self">Assign to Self</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name || emp.email}</option>
              ))}
            </select>
          </div>
          <button 
            type="submit" 
            disabled={formLoading || !title}
            className="h-[52px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all border border-purple-400/20 active:scale-95"
          >
            {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus size={20} /> Create Task</>}
          </button>
        </form>
        {message && <p className="mt-3 text-emerald-400 text-sm animate-pulse font-medium">{message}</p>}
      </motion.div>

      {/* Task Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Column 1: My Daily Tasks */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col space-y-4"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">My Daily Tasks</h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 text-xs font-black border border-purple-500/20">
              {myTasks.length}
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-1 space-y-3 min-h-[450px] shadow-inner">
            {myTasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-3 py-20">
                <CheckCircle2 className="w-16 h-16 opacity-10" />
                <p className="text-sm font-medium">No personal tasks yet</p>
              </div>
            ) : (
              myTasks.map((task, idx) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`group flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    task.isCompleted 
                    ? 'bg-emerald-500/5 border-emerald-500/20' 
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                  }`}
                >
                  <button 
                    onClick={() => toggleTaskStatus(task._id)}
                    className={`transition-all ${task.isCompleted ? 'text-emerald-400 scale-110' : 'text-white/40 group-hover:text-purple-400 hover:scale-110'}`}
                  >
                    {task.isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium transition-all ${task.isCompleted ? 'text-white/30 line-through' : 'text-white/90'}`}>
                      {task.title}
                    </p>
                    {task.completedAt && (
                      <p className="text-[10px] text-emerald-500/60 font-mono mt-1">
                        Completed {new Date(task.completedAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Column 2: Delegated to Employees */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col space-y-4"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">Delegated Tasks</h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-black border border-blue-500/20">
              {delegatedTasks.length}
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-1 space-y-3 min-h-[450px] shadow-inner">
            {delegatedTasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-3 py-20">
                <Users className="w-16 h-16 opacity-10" />
                <p className="text-sm font-medium">No delegated tasks yet</p>
              </div>
            ) : (
              delegatedTasks.map((task, idx) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between group hover:bg-white/[0.07] transition-all"
                >
                  <div className="space-y-1.5 flex-1">
                    <p className="font-semibold text-white/90 group-hover:text-white transition-colors">{task.title}</p>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                        <User size={10} /> {task.assignedTo?.name || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  
                  {task.isCompleted ? (
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-2 rounded-full border border-emerald-500/20 ml-4 flex-shrink-0">
                      <CheckCircle size={14} />
                      <span className="text-[10px] font-black uppercase">Done</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 px-3 py-2 rounded-full border border-amber-500/20 ml-4 flex-shrink-0">
                      <Clock size={14} />
                      <span className="text-[10px] font-black uppercase tracking-wider">Pending</span>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TaskManager;
