import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Users, Award, Target, Zap } from 'lucide-react';

const SkillAnalytics = () => {
  const topSkills = [
    { name: 'React', count: 245, trend: '+12%', color: 'blue' },
    { name: 'Node.js', count: 198, trend: '+8%', color: 'green' },
    { name: 'Python', count: 176, trend: '+15%', color: 'yellow' },
    { name: 'Java', count: 154, trend: '+5%', color: 'red' },
    { name: 'AWS', count: 132, trend: '+20%', color: 'orange' },
  ];

  const stats = [
    { label: 'Total Skills Tracked', value: '1,247', icon: Target, color: 'blue' },
    { label: 'Active Learners', value: '892', icon: Users, color: 'green' },
    { label: 'Certifications', value: '456', icon: Award, color: 'teal' },
    { label: 'Avg. Skill Level', value: '7.2/10', icon: Zap, color: 'yellow' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Skill Analytics</h1>
            <p className="text-sm text-white/50">Track and analyze skill development</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 bg-${stat.color}-500/20 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-white/50">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Top Skills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6"
      >
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          Top Skills in Demand
        </h2>
        <div className="space-y-4">
          {topSkills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{skill.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/50">{skill.count} users</span>
                    <span className="text-xs text-green-400 font-semibold">{skill.trend}</span>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(skill.count / 250) * 100}%` }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                    className={`h-full bg-gradient-to-r from-${skill.color}-600 to-${skill.color}-400 rounded-full`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex-1 bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-center"
      >
        <div className="text-center">
          <BarChart2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Interactive Charts Coming Soon</h3>
          <p className="text-sm text-white/50 max-w-md">
            Advanced analytics with skill progression graphs, comparison charts, and predictive insights.
          </p>
        </div>
      </motion.div>

      {/* Coming Soon Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center"
      >
        <p className="text-sm text-green-400">
          📊 Full analytics dashboard with real-time data visualization coming soon!
        </p>
      </motion.div>
    </div>
  );
};

export default SkillAnalytics;
