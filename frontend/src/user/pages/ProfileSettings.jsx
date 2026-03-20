import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, BookOpen, Camera, Save, Upload, FileText, Download, X, Trash2, Lock, ShieldCheck, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ProfileSettings = () => {
  const { user } = useAuth();
  
  // Local state for form fields with fallback mock data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    bio: '',
    skills: '',
    resume: '',
    resumeName: '',
    twoFactorEnabled: false,
    emailNotifications: true,
    pushNotifications: true
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch('http://localhost:5000/api/user', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFormData({ 
          ...data, 
          twoFactorEnabled: !!data.twoFactorEnabled,
          emailNotifications: data.emailNotifications !== 0,
          pushNotifications: data.pushNotifications !== 0
        });
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, resume: reader.result, resumeName: file.name }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const triggerResumeInput = () => {
    resumeInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include'
    });
    if (res.ok) {
      alert("Profile updated successfully!");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword: passwordForm.currentPassword, 
          newPassword: passwordForm.newPassword 
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) { alert("Password updated successfully!"); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }
      else alert(data.error || "Failed to update password");
    } catch (e) { console.error(e); }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const res = await fetch('http://localhost:5000/api/user', { method: 'DELETE', credentials: 'include' });
        if (res.ok) {
          alert("Account deleted successfully.");
          window.location.href = '/login';
        }
      } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-sans selection:bg-purple-500/30 overflow-x-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="relative z-10 max-w-4xl mx-auto"
        >
            <header className="mb-8 border-b border-white/10 pb-4">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Profile Settings
                </h1>
                <p className="text-gray-400 text-sm mt-1">Manage your personal information and account preferences.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Basic Info */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex flex-col items-center text-center">
                        <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/30 group-hover:border-purple-500 transition-colors">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                                        <User size={48} />
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={24} />
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleAvatarChange} 
                                className="hidden" 
                                accept="image/*"
                            />
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-white">{formData.name}</h2>
                        <p className="text-sm text-gray-400">{formData.course}</p>
                        <button 
                            onClick={triggerFileInput}
                            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Upload size={14} /> Change Avatar
                        </button>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input 
                                        type="tel" 
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Course / Major</label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input 
                                        type="text" 
                                        name="course"
                                        value={formData.course}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. BCA Final Year"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Skills (Comma separated)</label>
                            <input 
                                type="text" 
                                name="skills"
                                value={formData.skills}
                                onChange={handleInputChange}
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                placeholder="e.g. React, Node.js, Python"
                            />
                        </div>

                        {/* Resume Upload Section */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Resume / CV</label>
                            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        {formData.resumeName ? (
                                            <p className="text-sm font-medium text-white">{formData.resumeName}</p>
                                        ) : (
                                            <p className="text-sm text-gray-400">No resume uploaded</p>
                                        )}
                                        <p className="text-xs text-gray-500">PDF, DOCX (Max 5MB)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="file" 
                                        ref={resumeInputRef}
                                        onChange={handleResumeChange}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx"
                                    />
                                    <button 
                                        type="button"
                                        onClick={triggerResumeInput}
                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white transition-colors flex items-center gap-2"
                                    >
                                        <Upload size={12} /> {formData.resume ? 'Update' : 'Upload'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Change Password Section */}
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Lock size={16} className="text-purple-500" /> Change Password
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                                    <input 
                                        type="password" 
                                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2 px-4 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                                    <input 
                                        type="password" 
                                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2 px-4 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm New</label>
                                    <input 
                                        type="password" 
                                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2 px-4 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button onClick={handlePasswordChange} className="text-xs font-bold text-purple-400 hover:text-purple-300">Update Password</button>
                            </div>
                        </div>

                        {/* Two-Factor Authentication Toggle */}
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-emerald-500" /> Two-Factor Authentication
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1">Add an extra layer of security to your account.</p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.twoFactorEnabled ? 'bg-emerald-500' : 'bg-gray-700'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${formData.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Notification Preferences */}
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Bell size={16} className="text-yellow-500" /> Notification Preferences
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-300">Email Notifications</p>
                                        <p className="text-xs text-gray-500">Receive updates about your interview results.</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.emailNotifications ? 'bg-emerald-500' : 'bg-gray-700'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${formData.emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-300">Push Notifications</p>
                                        <p className="text-xs text-gray-500">Get notified about new features and tips.</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }))}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.pushNotifications ? 'bg-emerald-500' : 'bg-gray-700'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${formData.pushNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bio</label>
                            <textarea 
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                                placeholder="Tell us a bit about yourself..."
                            ></textarea>
                        </div>

                        <div className="pt-4 flex items-center justify-between border-t border-white/10">
                            <button 
                                type="button"
                                onClick={handleDeleteAccount}
                                className="px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-2"
                            >
                                <Trash2 size={16} /> Delete Account
                            </button>

                            <button 
                                type="submit"
                                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2"
                            >
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    </div>
  );
};

export default ProfileSettings;