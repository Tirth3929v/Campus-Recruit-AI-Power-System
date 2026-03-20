import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Calendar, FileText, CheckCircle, AlertCircle, Clock, BarChart2, Download, Linkedin } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';

// Fallback data in case API is not yet populated
const mockHistory = [
    { id: 1, date: "Feb 18, 2024", subject: "React JS", score: 85, status: "Excellent" },
    { id: 2, date: "Feb 15, 2024", subject: "Node.js Backend", score: 72, status: "Good" },
    { id: 3, date: "Feb 10, 2024", subject: "HR Round", score: 90, status: "Outstanding" },
    { id: 4, date: "Feb 05, 2024", subject: "System Design", score: 65, status: "Average" },
    { id: 5, date: "Jan 28, 2024", subject: "Java Core", score: 88, status: "Excellent" },
];

const InterviewHistory = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [interviews, setInterviews] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        document.title = "Interview History | Campus Recruit";
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/interviews', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setInterviews(data);
                }
            } catch (error) {
                console.error("Failed to fetch history", error);
            }
        };
        fetchHistory();
    }, []);

    const displayData = interviews || mockHistory;

    const filteredInterviews = displayData.filter(interview => {
        const matchesSearch = interview.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'All' || interview.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const downloadCertificate = (interview) => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // Colors
        const primaryColor = [99, 102, 241]; // Indigo 500
        const secondaryColor = [16, 185, 129]; // Emerald 500
        const textColor = [31, 41, 55]; // Gray 800

        // Border
        doc.setLineWidth(1);
        doc.setDrawColor(...primaryColor);
        doc.rect(10, 10, 277, 190);
        
        // Inner Border
        doc.setLineWidth(0.5);
        doc.setDrawColor(...secondaryColor);
        doc.rect(15, 15, 267, 180);

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(36);
        doc.setTextColor(...primaryColor);
        doc.text("CERTIFICATE OF EXCELLENCE", 148.5, 50, { align: "center" });

        // Subtext
        doc.setFont("helvetica", "normal");
        doc.setFontSize(16);
        doc.setTextColor(...textColor);
        doc.text("This certificate is proudly presented to", 148.5, 75, { align: "center" });

        // Name
        doc.setFont("helvetica", "bold");
        doc.setFontSize(32);
        doc.setTextColor(...textColor);
        doc.text(user?.name || "Student Name", 148.5, 95, { align: "center" });
        doc.setDrawColor(...textColor);
        doc.setLineWidth(0.5);
        doc.line(80, 100, 217, 100);

        // Details
        doc.setFont("helvetica", "normal");
        doc.setFontSize(16);
        doc.text("For outstanding performance in the mock interview assessment for", 148.5, 120, { align: "center" });
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(...secondaryColor);
        doc.text(interview.subject, 148.5, 135, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(16);
        doc.setTextColor(...textColor);
        doc.text(`Achieving a score of ${interview.score}/100`, 148.5, 150, { align: "center" });

        // Footer
        doc.setFontSize(12);
        doc.setTextColor(107, 114, 128);
        doc.text(`Date: ${interview.date}`, 40, 175);
        doc.text("Campus Recruit AI", 257, 175, { align: "right" });
        
        // Signature Line
        doc.setDrawColor(107, 114, 128);
        doc.line(210, 170, 257, 170);
        doc.setFontSize(10);
        doc.text("Authorized Signature", 233.5, 180, { align: "center" });

        doc.save(`Certificate_${interview.subject}.pdf`);
    };

    const shareOnLinkedIn = (interview) => {
        const text = `I just achieved a score of ${interview.score}/100 in ${interview.subject} on Campus Recruit AI! 🚀 #InterviewPrep #CareerGoals`;
        const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'width=600,height=600');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 font-sans selection:bg-purple-500/30 overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="relative z-10 max-w-6xl mx-auto"
            >
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6">
                    <div>
                        <button 
                            onClick={() => navigate('/student/dashboard')}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-2 text-sm font-bold uppercase tracking-wider"
                        >
                            <ArrowLeft size={16} /> Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Interview History
                        </h1>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search subjects..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        {/* Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <select 
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full sm:w-40 bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-8 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none cursor-pointer transition-all"
                            >
                                <option value="All">All Status</option>
                                <option value="Excellent">Excellent</option>
                                <option value="Good">Good</option>
                                <option value="Average">Average</option>
                                <option value="Outstanding">Outstanding</option>
                            </select>
                        </div>
                    </div>
                </header>

                {/* List */}
                <div className="space-y-4">
                    {filteredInterviews.length > 0 ? (
                        filteredInterviews.map((interview, index) => (
                            <motion.div 
                                key={interview.id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">{interview.subject}</h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                            <span className="flex items-center gap-1.5"><Calendar size={14} /> {interview.date}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={14} /> 25 mins</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6 md:gap-12 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                                    <div className="text-left md:text-right">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-gray-300">
                                            {interview.status === 'Excellent' || interview.status === 'Outstanding' ? <CheckCircle size={14} className="text-emerald-400" /> : <AlertCircle size={14} className="text-yellow-400" />}
                                            {interview.status}
                                        </span>
                                    </div>
                                    <div className="text-right min-w-[80px]">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Score</p>
                                        <div className={`text-2xl font-black ${getScoreColor(interview.score)}`}>
                                            {interview.score}<span className="text-sm text-gray-500 font-medium">/100</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {interview.score >= 80 && (
                                            <>
                                                <button 
                                                    onClick={() => downloadCertificate(interview)}
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 hover:text-emerald-300 transition-colors"
                                                    title="Download Certificate"
                                                >
                                                    <Download size={20} />
                                                </button>
                                                <button 
                                                    onClick={() => shareOnLinkedIn(interview)}
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-blue-400 hover:text-blue-300 transition-colors"
                                                    title="Share on LinkedIn"
                                                >
                                                    <Linkedin size={20} />
                                                </button>
                                            </>
                                        )}
                                        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                            <BarChart2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            <FileText size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No interviews found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default InterviewHistory;