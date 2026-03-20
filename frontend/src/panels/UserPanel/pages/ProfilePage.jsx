import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, GraduationCap, FileText, Settings, Save, Upload, Mail, Phone, MapPin, Shield, Bell } from 'lucide-react';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-50 text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
        {activeTab === 'personal' && <PersonalDetails />}
        {activeTab === 'education' && <EducationDetails />}
        {activeTab === 'resume' && <ResumeUpload />}
        {activeTab === 'settings' && <AccountSettings />}
      </div>
    </div>
  );
};

const PersonalDetails = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <div className="flex items-center gap-6 mb-8">
      <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white">
        T
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Tirth</h2>
        <p className="text-gray-500">Student • BCA (2026)</p>
        <button className="mt-2 text-sm text-blue-600 font-medium hover:underline">Change Avatar</button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" defaultValue="Tirth" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="email" defaultValue="tirth@example.com" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="tel" defaultValue="+91 98765 43210" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Location</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" defaultValue="Ahmedabad, India" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
    </div>

    <div className="flex justify-end pt-4">
      <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
        <Save size={18} /> Save Changes
      </button>
    </div>
  </motion.div>
);

const EducationDetails = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Degree / Course</label>
      <div className="relative">
        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" defaultValue="BCA (Bachelor of Computer Applications)" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">University / College</label>
        <input type="text" defaultValue="Gujarat University" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Year of Graduation</label>
        <input type="text" defaultValue="2026" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Skills</label>
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border border-gray-200 rounded-xl">
        {['React', 'Node.js', 'JavaScript', 'Python', 'SQL'].map((skill) => (
          <span key={skill} className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium shadow-sm">
            {skill}
          </span>
        ))}
        <button className="text-sm text-blue-600 font-medium hover:underline px-2">+ Add Skill</button>
      </div>
    </div>
  </motion.div>
);

const ResumeUpload = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group">
      <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Upload size={32} />
      </div>
      <h3 className="text-lg font-bold text-gray-900">Upload your Resume</h3>
      <p className="text-gray-500 text-sm mt-2 max-w-xs">Drag and drop your PDF or DOCX file here, or click to browse.</p>
    </div>

    <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-200">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
          <FileText size={20} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Tirth_Resume_2025.pdf</p>
          <p className="text-xs text-gray-500">2.4 MB • Uploaded 2 days ago</p>
        </div>
      </div>
      <button className="text-sm text-red-600 font-medium hover:underline">Remove</button>
    </div>
  </motion.div>
);

const AccountSettings = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <Bell size={20} className="text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">Email Notifications</p>
            <p className="text-xs text-gray-500">Receive updates about job applications</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" defaultChecked />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>

    <div className="space-y-4 pt-4 border-t border-gray-100">
      <h3 className="text-lg font-bold text-gray-900">Security</h3>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <Shield size={20} className="text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">Change Password</p>
            <p className="text-xs text-gray-500">Last changed 3 months ago</p>
          </div>
        </div>
        <button className="text-sm text-blue-600 font-medium hover:underline">Update</button>
      </div>
    </div>
  </motion.div>
);

export default ProfilePage;