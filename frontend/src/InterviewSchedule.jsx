import React from 'react';

const InterviewSchedule = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Interview Schedule</h2>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Schedule New
        </button>
      </div>
      
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex flex-col items-center justify-center text-indigo-700">
                <span className="text-xs font-bold">OCT</span>
                <span className="text-lg font-bold">2{i}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Technical Round - Candidate {i}</h3>
                <p className="text-gray-500 text-sm">10:00 AM - 11:00 AM • Google Meet</p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Reschedule</button>
              <button className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Start Meeting</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewSchedule;