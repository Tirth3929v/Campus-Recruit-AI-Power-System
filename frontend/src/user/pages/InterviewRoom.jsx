import React from 'react';
import ScreenRecorder from '../../app/core/services/ScreenRecorder';

const InterviewRoom = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">AI Interview Room</h2>
        <p className="text-gray-600 mb-6">
          Welcome to the technical assessment. Please ensure your camera and microphone are working before starting the AI-driven interview.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Video Preview / Recorder Section */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
             <ScreenRecorder jobId="mock-interview-session" />
          </div>

          {/* AI Interaction Section */}
          <div className="flex flex-col justify-center items-start space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 w-full">
              <h3 className="font-semibold text-blue-800 mb-2">Instructions</h3>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                <li>Share your screen when prompted.</li>
                <li>Speak clearly into the microphone.</li>
                <li>Answer the technical questions displayed.</li>
              </ul>
            </div>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition transform hover:scale-105">
              Start AI Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;