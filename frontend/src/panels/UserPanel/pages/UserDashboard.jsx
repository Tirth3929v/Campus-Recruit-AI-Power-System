import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, Award, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const UserDashboard = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetch(`http://localhost:5000/api/interviews/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setInterviews(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching interviews:", err);
          setLoading(false);
        });
    }
  }, [user]);

  // Prepare data for chart (reverse to show chronological order)
  const chartData = [...interviews].reverse().map(interview => ({
    date: new Date(interview.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: interview.totalScore,
    fullDate: new Date(interview.date).toLocaleDateString()
  }));

  const averageScore = interviews.length > 0
    ? Math.round(interviews.reduce((acc, curr) => acc + curr.totalScore, 0) / interviews.length * 10) / 10
    : 0;

  const bestScore = interviews.length > 0
    ? Math.max(...interviews.map(i => i.totalScore))
    : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}</h1>
          <p className="text-gray-500">Here's your interview performance overview</p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
          <Calendar size={16} />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
        >
          <div className="bg-indigo-100 p-4 rounded-xl text-indigo-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Interviews</p>
            <h3 className="text-2xl font-bold text-gray-800">{interviews.length}</h3>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
        >
          <div className="bg-emerald-100 p-4 rounded-xl text-emerald-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Average Score</p>
            <h3 className="text-2xl font-bold text-gray-800">{averageScore}/10</h3>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
        >
          <div className="bg-amber-100 p-4 rounded-xl text-amber-600">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Best Score</p>
            <h3 className="text-2xl font-bold text-gray-800">{bestScore}/10</h3>
          </div>
        </motion.div>
      </div>

      {/* Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
      >
        <h2 className="text-lg font-bold text-gray-800 mb-6">Performance History</h2>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  domain={[0, 10]}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Activity size={48} className="mb-4 opacity-20" />
              <p>No interview data available yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UserDashboard;