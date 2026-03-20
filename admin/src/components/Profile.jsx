import React from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  // Mock Certificates
  const certificates = [
    { id: 1, title: "PHP Mastery", date: "Oct 12, 2023", id_code: "CERT-1234" },
    { id: 2, title: "React Fundamentals", date: "Nov 05, 2023", id_code: "CERT-5678" }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 border border-gray-700 rounded-3xl p-8 mb-8 backdrop-blur-xl"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-4xl font-bold shadow-2xl shadow-purple-500/20">
              {user?.name?.[0] || 'U'}
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold mb-2">{user?.name || 'Student Name'}</h1>
              <p className="text-gray-400 mb-4">{user?.email || 'student@example.com'}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-700/50 px-3 py-1.5 rounded-full">
                  <MapPin size={14} /> San Francisco, CA
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-700/50 px-3 py-1.5 rounded-full">
                  <Calendar size={14} /> Joined Sept 2023
                </div>
              </div>
            </div>
            
            <button className="px-6 py-2.5 border border-purple-500 text-purple-400 rounded-xl hover:bg-purple-500/10 transition-colors">
              Edit Profile
            </button>
          </div>
        </motion.div>

        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Award className="text-yellow-500" /> My Certificates
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <motion.div 
              key={cert.id}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 rounded-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Award size={100} />
              </div>
              
              <h3 className="text-xl font-bold mb-2">{cert.title}</h3>
              <p className="text-gray-400 text-sm mb-4">Completed on {cert.date}</p>
              
              <div className="flex justify-between items-end">
                <span className="text-xs font-mono text-gray-500">{cert.id_code}</span>
                <button className="text-sm text-purple-400 hover:text-purple-300 font-medium">
                  Download PDF
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;