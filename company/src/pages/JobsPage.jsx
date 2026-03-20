import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Filter, Briefcase, DollarSign, Clock } from 'lucide-react';
import { jobsData } from '../data/jobsData';

const JobCard = ({ job, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`h-12 w-12 rounded-xl ${job.color} flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-100`}>
        {job.logo}
      </div>
      <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
        {job.posted}
      </span>
    </div>
    
    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
    <p className="text-sm text-gray-500 font-medium mb-4">{job.company}</p>
    
    <div className="space-y-2 mb-6">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MapPin size={16} className="text-gray-400" />
        {job.location}
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <DollarSign size={16} className="text-gray-400" />
        {job.salary}
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock size={16} className="text-gray-400" />
        {job.type}
      </div>
    </div>

    <div className="flex flex-wrap gap-2 mb-6">
      {job.tags.map((tag, i) => (
        <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-medium">
          {tag}
        </span>
      ))}
    </div>

    <button className="w-full py-2.5 rounded-xl bg-gray-900 text-white font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-gray-200">
      Apply Now
    </button>
  </motion.div>
);

const JobsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = jobsData.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Find Your Dream Job</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by job title or company..." 
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Location" 
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-blue-200">
            <Filter size={20} />
            Filter
          </button>
        </div>
      </div>

      {/* Job Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job, index) => (
          <JobCard key={job.id} job={job} index={index} />
        ))}
      </div>
      
      {filteredJobs.length === 0 && (
        <div className="text-center py-20 text-gray-500">No jobs found matching your criteria.</div>
      )}
    </div>
  );
};

export default JobsPage;