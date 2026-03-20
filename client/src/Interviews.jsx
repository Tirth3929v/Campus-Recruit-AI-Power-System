import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Interviews.module.css';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState({ isOpen: false, interviewId: null, currentData: {} });
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, interviewId: null, candidateName: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get('/api/jobs/interviews', config);
        setInterviews(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch interviews');
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this interview?')) return;

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      await axios.put(`/api/jobs/interviews/${id}/cancel`, {}, config);
      
      setInterviews(interviews.map(i => i._id === id ? { ...i, status: 'Cancelled' } : i));
      addToast('Interview cancelled successfully', 'success');
    } catch (err) {
      addToast('Failed to cancel interview', 'error');
    }
  };

  const openRescheduleModal = (interview) => {
    setRescheduleModal({ 
      isOpen: true, 
      interviewId: interview._id, 
      currentData: { 
        date: interview.date, 
        meetingLink: interview.meetingLink,
        notes: interview.notes 
      } 
    });
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updateData = {
      date: formData.get('date'),
      meetingLink: formData.get('meetingLink'),
      notes: formData.get('notes'),
    };

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
      
      const { data } = await axios.put(`/api/jobs/interviews/${rescheduleModal.interviewId}/reschedule`, updateData, config);
      
      setInterviews(interviews.map(i => i._id === rescheduleModal.interviewId ? data.interview : i));
      addToast('Interview rescheduled successfully', 'success');
      setRescheduleModal({ isOpen: false, interviewId: null, currentData: {} });
    } catch (err) {
      addToast('Failed to reschedule interview', 'error');
    }
  };

  const openFeedbackModal = (interview) => {
    setFeedbackModal({
      isOpen: true,
      interviewId: interview._id,
      candidateName: interview.candidate ? interview.candidate.name : 'Candidate'
    });
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const feedbackData = {
      rating: formData.get('rating'),
      feedback: formData.get('feedback'),
    };

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
      
      const { data } = await axios.put(`/api/jobs/interviews/${feedbackModal.interviewId}/feedback`, feedbackData, config);
      
      setInterviews(interviews.map(i => i._id === feedbackModal.interviewId ? data.interview : i));
      addToast('Feedback submitted successfully', 'success');
      setFeedbackModal({ isOpen: false, interviewId: null, candidateName: '' });
    } catch (err) {
      addToast('Failed to submit feedback', 'error');
    }
  };

  const handleExportPDF = async (id, candidateName) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await axios.get(`/api/jobs/interviews/${id}/pdf`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `feedback_${candidateName.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      addToast('Failed to export PDF', 'error');
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    const name = interview.candidate ? interview.candidate.name : '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'upcoming') {
      return matchesSearch && interview.status !== 'Completed' && interview.status !== 'Cancelled';
    } else {
      return matchesSearch && (interview.status === 'Completed' || interview.status === 'Cancelled');
    }
  });

  if (loading) return <div className={styles.loading}>Loading interviews...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <Modal
        isOpen={rescheduleModal.isOpen}
        onClose={() => setRescheduleModal({ isOpen: false, interviewId: null, currentData: {} })}
        title="Reschedule Interview"
        onConfirm={() => document.getElementById('rescheduleForm').requestSubmit()}
      >
        <form id="rescheduleForm" onSubmit={handleReschedule}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>New Date & Time</label>
            <input type="datetime-local" name="date" required defaultValue={rescheduleModal.currentData.date ? new Date(rescheduleModal.currentData.date).toISOString().slice(0, 16) : ''} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Meeting Link</label>
            <input type="url" name="meetingLink" defaultValue={rescheduleModal.currentData.meetingLink} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal({ isOpen: false, interviewId: null, candidateName: '' })}
        title={`Interview Feedback for ${feedbackModal.candidateName}`}
        onConfirm={() => document.getElementById('feedbackForm').requestSubmit()}
      >
        <form id="feedbackForm" onSubmit={handleFeedbackSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Rating (1-5)</label>
            <select name="rating" required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
              {[1, 2, 3, 4, 5].map(num => <option key={num} value={num}>{num}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Feedback / Comments</label>
            <textarea name="feedback" required rows="4" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }} placeholder="Enter detailed feedback..."></textarea>
          </div>
        </form>
      </Modal>

      <h1 className={styles.title}>Scheduled Interviews</h1>
      
      <div className={styles.tabs}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'upcoming' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'completed' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed / Cancelled
        </button>
      </div>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by candidate name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {filteredInterviews.length === 0 ? (
        <div className={styles.empty}>
          {searchTerm ? 'No interviews found matching your search.' : 'No interviews scheduled yet.'}
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Candidate</th>
                <th>Job Position</th>
                <th>Type</th>
                <th>Status</th>
                <th>Meeting Link</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInterviews.map((interview) => (
                <tr key={interview._id}>
                  <td>{new Date(interview.date).toLocaleString()}</td>
                  <td>{interview.candidate ? interview.candidate.name : 'Unknown'}</td>
                  <td>{interview.job ? interview.job.title : 'N/A'}</td>
                  <td><span className={styles.typeBadge}>{interview.type}</span></td>
                  <td>{interview.status}</td>
                  <td>
                    {interview.meetingLink ? (
                      <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className={styles.link}>Join Meeting</a>
                    ) : 'N/A'}
                  </td>
                  <td className={styles.notes}>{interview.notes || '-'}</td>
                  <td>
                    {interview.status !== 'Cancelled' && (
                      <div className={styles.actions}>
                        <button onClick={() => openRescheduleModal(interview)} className={`${styles.actionButton} ${styles.rescheduleBtn}`}>Reschedule</button>
                        {interview.status !== 'Completed' && <button onClick={() => openFeedbackModal(interview)} className={`${styles.actionButton} ${styles.feedbackBtn}`}>Feedback</button>}
                        {interview.status === 'Completed' && <button onClick={() => handleExportPDF(interview._id, interview.candidate?.name)} className={`${styles.actionButton} ${styles.pdfBtn}`}>PDF</button>}
                        <button onClick={() => handleCancel(interview._id)} className={`${styles.actionButton} ${styles.cancelBtn}`}>Cancel</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Interviews;