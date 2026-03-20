import React from 'react';


const JobCard = ({ title, company, type, location, salary, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-gray-800 line-clamp-1 mb-1">{title}</h3>
        <p className="text-gray-600 font-medium mb-2">{company}</p>
      </div>
      <span className="bg-emerald-50 text-emerald-600 text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap">
        Live Job
      </span>
    </div>
    <div className="space-y-2 mb-4">
      {salary && <p className="text-sm font-bold text-emerald-600">{salary}</p>}
      {location && (
        <span className="flex items-center gap-1 text-sm text-gray-500">
          📍 {location}
        </span>
      )}
      {type && (
        <span className="inline-block bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-medium">
          {type}
        </span>
      )}
    </div>
    {description && (
      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{description}</p>
    )}
    <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 px-6 rounded-xl font-semibold text-sm transition-all group-hover:shadow-lg group-hover:shadow-blue-500/25">
      Apply Now
    </button>
  </div>
);


const Jobs = () => {
  const [jobs, setJobs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs/approved');
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error('Failed to fetch approved jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-20">Loading approved jobs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex-1">Live Job Opportunities ({filteredJobs.length})</h2>
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
        />
      </div>
      {filteredJobs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No approved jobs available at the moment.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard 
              key={job.id} 
              title={job.title} 
              company={job.company} 
              type={job.type} 
              location={job.location}
              salary={job.salary}
              description={job.description}
            />
          ))}
        </div>
      )}
    </div>
  );
};


export default Jobs;