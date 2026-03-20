import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { User, Mail, FileText, Save, Upload, CheckCircle, Loader2, BookOpen, Briefcase, Sparkles, Award, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileAvatar from '../components/ProfileAvatar';
import axiosInstance from './axiosInstance';

// ─── Scroll Reveal ────────────────────────────────────────────
const Reveal = ({ children, delay = 0, direction = "up", className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: direction === "up" ? 30 : 0, x: direction === "left" ? -30 : direction === "right" ? 30 : 0, filter: "blur(4px)" }}
      animate={isInView ? { opacity: 1, y: 0, x: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: '', email: '', course: '', bio: '', skills: '', resumeName: '', resume: ''
  });

  useEffect(() => {
    document.title = "Profile Settings | Campus Recruit";
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get('/user');
      const data = res.data || {};
      setFormData({
        name: data.name || '', email: data.email || '', course: data.course || '',
        bio: data.bio || '', skills: data.skills || '', resumeName: data.resumeName || '', resume: data.resume || ''
      });
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { alert("File size too large (Max 5MB)"); return; }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, resumeName: file.name, resume: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await axiosInstance.put('/user', formData);
      if (res.status === 200) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile.' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: 'Server error occurred.' });
    } finally { setSaving(false); }
  };

  const skillTags = Array.isArray(formData.skills)
    ? formData.skills
    : (formData.skills ? String(formData.skills).split(',').map(s => s.trim()).filter(Boolean) : []);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-purple-500" size={40} />
          <p className="text-gray-500 text-sm animate-pulse">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-full relative">
      <div className="ambient-bg" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        {/* ── Header ────────────────────────────────── */}
        <Reveal>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                Profile <span className="text-gradient-vivid">Settings</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your personal information and resume</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/student/dashboard')}
              className="text-sm font-semibold text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Back to Dashboard
            </motion.button>
          </div>
        </Reveal>

        {/* ── Avatar Card ──────────────────────────── */}
        <Reveal delay={0.1}>
          <div className="glass-panel rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <ProfileAvatar size="lg" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{formData.name || 'Your Name'}</h2>
              <p className="text-gray-500 dark:text-gray-400">{formData.email}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                {formData.course && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                    <BookOpen size={12} /> {formData.course}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                  <Award size={12} /> Student
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Toast Notification ───────────────────── */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className={`flex items-center justify-between gap-3 p-4 rounded-xl border ${message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
              }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
              <span className="font-semibold text-sm">{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="hover:opacity-60 transition-opacity">
              <X size={16} />
            </button>
          </motion.div>
        )}

        {/* ── Form ────────────────────────────────── */}
        <Reveal delay={0.2}>
          <motion.form onSubmit={handleSubmit}
            className="glass-panel rounded-2xl p-8 space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                  <input type="text" required value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email (Read Only)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" disabled value={formData.email}
                    className="w-full bg-gray-100 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl py-3 pl-10 pr-4 text-gray-400 cursor-not-allowed" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Course / Major</label>
                <div className="relative group">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                  <input type="text" value={formData.course}
                    onChange={e => setFormData({ ...formData, course: e.target.value })}
                    className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Skills (Comma separated)</label>
                <div className="relative group">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                  <input type="text" value={formData.skills}
                    onChange={e => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="React, Node.js, Java..."
                    className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" />
                </div>
                {/* Skill Tags Visualization */}
                {skillTags.length > 0 && (
                  <motion.div className="flex flex-wrap gap-2 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {skillTags.map((tag, i) => (
                      <motion.span key={tag}
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-100 to-blue-100 dark:from-violet-500/10 dark:to-blue-500/10 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20"
                      >
                        <Sparkles size={10} className="mr-1" /> {tag}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bio</label>
              <textarea rows="4" value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition-all"
                placeholder="Tell us about yourself..." />
            </div>

            {/* Resume Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Resume Upload</label>
              <motion.div whileHover={{ scale: 1.01, borderColor: "rgba(139, 92, 246, 0.4)" }}
                className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all relative cursor-pointer group">
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload className="mx-auto text-purple-500 group-hover:scale-110 transition-transform mb-3" size={32} />
                <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                  {formData.resumeName || "Click to upload resume (PDF/DOC)"}
                </p>
                <p className="text-xs text-gray-400 mt-1">Max file size: 5MB</p>
              </motion.div>

              {formData.resume && (formData.resume.startsWith('data:application/pdf') || formData.resume.startsWith('http')) && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-4">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Preview</label>
                  <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 glass-card">
                    <iframe src={formData.resume} className="w-full h-full" title="Resume Preview" />
                  </div>
                </motion.div>
              )}
            </div>

            <motion.button type="submit" disabled={saving}
              whileHover={{ scale: 1.02, boxShadow: "0 15px 30px rgba(139, 92, 246, 0.3)" }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 btn-gradient rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 text-lg"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Changes</>}
            </motion.button>
          </motion.form>
        </Reveal>
      </div>
    </div>
  );
};

export default ProfilePage;