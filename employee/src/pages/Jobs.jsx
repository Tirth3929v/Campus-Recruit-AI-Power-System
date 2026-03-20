import React from 'react';

const JobCard = ({ title, company, type, location }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-gray-600">{company}</p>
      </div>
      <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full font-medium">{type}</span>
    </div>
    <div className="mt-4 flex items-center justify-between">
      <span className="text-sm text-gray-500">{location}</span>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
        Apply Now
      </button>
    </div>
  </div>
);

const Jobs = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Available Opportunities</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <JobCard title="Frontend Developer" company="TechCorp Inc." type="Full-time" location="Remote" />
        <JobCard title="Backend Engineer" company="DataSystems" type="Internship" location="New York, NY" />
        <JobCard title="UI/UX Designer" company="Creative Studio" type="Contract" location="London, UK" />
      </div>
    </div>
  );
};

export default Jobs;