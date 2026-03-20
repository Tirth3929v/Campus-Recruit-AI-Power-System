import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, FileText, Save, Upload, CheckCircle, Loader2, BookOpen, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: '',
    bio: '',
    skills: '',
    resumeName: '',
    resume: '' // Base64 string
  });

  useEffect(() => {
    document.title = "Profile Settings | Campus Recruit";
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || '',
          email: data.email || '',
          course: data.course || '',
          bio: data.bio || '',
          skills: data.skills || '',
          resumeName: data.resumeName || '',
          resume: data.resume || ''
        });
      }
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File size too large (Max 5MB)");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          resumeName: file.name,
          resume: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('http://localhost:5000/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Server error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Profile Settings
            </h1>
            <p className="text-gray-400 mt-1">Manage your personal information and resume</p>
          </div>
          <button onClick={() => navigate('/student/dashboard')} className="text-sm text-gray-400 hover:text-white transition-colors">
            Back to Dashboard
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-xl"
        >
          {message && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {message.type === 'success' ? <CheckCircle size={20} /> : <Loader2 size={20} />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email (Read Only)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="email" disabled value={formData.email} className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-gray-400 cursor-not-allowed" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Course / Major</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="text" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Skills (Comma separated)</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="text" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="React, Node.js, Java..." className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bio</label>
              <textarea rows="4" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none" placeholder="Tell us about yourself..." />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Resume Upload</label>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:bg-white/5 transition-colors relative">
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload className="mx-auto text-purple-500 mb-2" size={32} />
                <p className="text-sm text-gray-300 font-medium">{formData.resumeName || "Click to upload resume (PDF/DOC)"}</p>
                <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
              </div>

              {formData.resume && formData.resume.startsWith('data:application/pdf') && (
                <div className="mt-4">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Resume Preview</label>
                  <div className="h-[500px] w-full rounded-xl overflow-hidden border border-white/10 bg-gray-800">
                    <iframe src={formData.resume} className="w-full h-full" title="Resume Preview" />
                  </div>
                </div>
              )}
            </div>

            <button type="submit" disabled={saving} className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Changes</>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;