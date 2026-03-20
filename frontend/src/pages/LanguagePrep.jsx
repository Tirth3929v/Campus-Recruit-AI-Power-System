import React from 'react';

const LanguageModule = ({ title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-purple-200 transition-colors cursor-pointer group">
    <h3 className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors">{title}</h3>
    <p className="text-gray-600 text-sm mt-2">{description}</p>
  </div>
);

const LanguagePrep = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Language & Communication</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <LanguageModule title="IELTS Speaking Prep" description="Practice common speaking topics with AI feedback." />
        <LanguageModule title="Business Email Writing" description="Learn to write professional emails and reports." />
        <LanguageModule title="Technical Vocabulary" description="Master industry-specific terms and jargon." />
      </div>
    </div>
  );
};

export default LanguagePrep;