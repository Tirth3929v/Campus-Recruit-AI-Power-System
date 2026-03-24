import React from 'react';
import { motion } from 'framer-motion';
import { Kanban, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const ATSKanban = () => {
  const columns = [
    { id: 'applied', title: 'Applied', count: 12, color: 'blue', icon: Clock },
    { id: 'screening', title: 'Screening', count: 8, color: 'yellow', icon: AlertCircle },
    { id: 'interview', title: 'Interview', count: 5, color: 'teal', icon: Users },
    { id: 'offer', title: 'Offer', count: 3, color: 'green', icon: CheckCircle },
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
          <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Kanban className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">ATS Kanban Board</h1>
            <p className="text-sm text-white/50">Applicant Tracking System</p>
          </div>
        </div>
      </motion.div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {columns.map((column, index) => {
            const Icon = column.icon;
            return (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-80 flex flex-col"
              >
                {/* Column Header */}
                <div className={`bg-${column.color}-600/10 border border-${column.color}-500/20 rounded-xl p-4 mb-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 text-${column.color}-400`} />
                      <h3 className="font-semibold text-white">{column.title}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold bg-${column.color}-500/20 text-${column.color}-400`}>
                      {column.count}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 space-y-3 overflow-y-auto">
                  {/* Placeholder Cards */}
                  {[...Array(column.count)].map((_, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-white">Candidate {i + 1}</h4>
                        <span className="text-xs text-white/40">2h ago</span>
                      </div>
                      <p className="text-xs text-white/50 mb-2">Software Engineer</p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-[10px] font-bold text-white">
                          C{i + 1}
                        </div>
                        <span className="text-xs text-white/40">candidate{i + 1}@email.com</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Coming Soon Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center"
      >
        <p className="text-sm text-blue-400">
          🚧 Full Kanban functionality coming soon! Drag & drop, filters, and real-time updates.
        </p>
      </motion.div>
    </div>
  );
};

export default ATSKanban;
