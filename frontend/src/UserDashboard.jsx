import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle, Clock, TrendingUp, ArrowRight, Activity, Calendar } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
  >
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
      <p className={`text-xs mt-2 font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {trend > 0 ? '+' : ''}{trend}% from last month
      </p>
    </div>
    <div className={`p-4 rounded-xl ${color} bg-opacity-10 text-white`}>
      <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
  </motion.div>
);

const ActivityItem = ({ title, company, time, type }) => (
  <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-100 last:border-0">
    <div className={`mt-1 h-2 w-2 rounded-full ${type === 'applied' ? 'bg-blue-500' : type === 'interview' ? 'bg-orange-500' : 'bg-green-500'}`} />
    <div className="flex-1">
      <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      <p className="text-xs text-gray-500">{company}</p>
    </div>
    <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
  </div>
);

const UserDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, Tirth! Here's your daily overview.</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-200">
          Find Jobs
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Jobs Applied" value="12" icon={Briefcase} color="bg-blue-600" trend={15} />
        <StatCard title="Interviews Pending" value="3" icon={Clock} color="bg-orange-500" trend={-5} />
        <StatCard title="Profile Score" value="85%" icon={TrendingUp} color="bg-purple-600" trend={12} />
        <StatCard title="Days Streak" value="14" icon={CheckCircle} color="bg-emerald-600" trend={100} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Placeholder */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Application Analytics</h3>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-64 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
            <Activity size={48} className="mb-2 opacity-50" />
            <span className="font-medium">Analytics Chart Placeholder</span>
            <span className="text-xs">Integrate Recharts or Chart.js here</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <button className="text-emerald-600 text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-1">
            <ActivityItem title="Applied for React Developer" company="Wipro" time="2 hours ago" type="applied" />
            <ActivityItem title="Interview Scheduled" company="TCS" time="Yesterday" type="interview" />
            <ActivityItem title="Started 'Advanced React'" company="Skill Center" time="2 days ago" type="course" />
            <ActivityItem title="Profile Updated" company="System" time="3 days ago" type="system" />
            <ActivityItem title="Applied for Data Analyst" company="Infosys" time="1 week ago" type="applied" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;