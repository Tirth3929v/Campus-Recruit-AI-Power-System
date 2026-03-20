import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Candidates.module.css';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import Tooltip from '../../components/Tooltip';

const Candidates = () => {
  const [applications, setApplications] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Adjust number of items per page here
  const [modalState, setModalState] = useState({ isOpen: false, appId: null, newStatus: null, applicantName: '' });
  const [bulkModalState, setBulkModalState] = useState({ isOpen: false, newStatus: null });
  const [interviewModalState, setInterviewModalState] = useState({ isOpen: false, appId: null, applicantName: '' });
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedApps, setSelectedApps] = useState([]);
  const { id: jobId } = useParams();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchApplicants = async () => {
      // Reset states when fetching new applicants
      setApplications([]);
      setLoading(true);
      setError(null);
      setSelectedApps([]);
      setCurrentPage(1);

      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get(`/api/jobs/${jobId}/applicants`, config);
        setApplications(data);
        if (data.length > 0 && data[0].job) {
          setJobTitle(data[0].job.title);
        }
        setLoading(false);
      } catch (err) {
        setError(
          err.response && err.response.data.message
            ? err.response.data.message
            : 'Failed to fetch applicants'
        );
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [jobId]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Reset to first page when status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Reset selection when filters or page change
  useEffect(() => {
    setSelectedApps([]);
  }, [currentPage, statusFilter, searchTerm]);

  const initiateStatusChange = (appId, newStatus, applicantName) => {
    setModalState({ isOpen: true, appId, newStatus, applicantName });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, appId: null, newStatus: null, applicantName: '' });
  };

  const confirmStatusChange = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.put(`/api/jobs/applications/${modalState.appId}/status`, { status: modalState.newStatus }, config);
      
      setApplications(applications.map(app => 
        app._id === modalState.appId ? { ...app, status: modalState.newStatus } : app
      ));
    } catch (err) {
      addToast('Failed to update status', 'error');
    } finally {
      closeModal();
    }
  };

  const handleSelectOne = (appId) => {
    setSelectedApps((prevSelected) => {
      if (prevSelected.includes(appId)) {
        return prevSelected.filter((id) => id !== appId);
      } else {
        return [...prevSelected, appId];
      }
    });
  };

  const isAllOnPageSelected =
    currentItems.length > 0 && currentItems.every((app) => selectedApps.includes(app._id));

  const handleSelectAll = () => {
    if (isAllOnPageSelected) {
      const allCurrentIds = currentItems.map((app) => app._id);
      setSelectedApps((prev) => prev.filter((id) => !allCurrentIds.includes(id)));
    } else {
      const allCurrentIds = currentItems.map((app) => app._id);
      setSelectedApps((prev) => [...new Set([...prev, ...allCurrentIds])]);
    }
  };

  const handleBulkAction = (e) => {
    const newStatus = e.target.value;
    if (!newStatus || newStatus === 'Bulk Actions') return;
    setBulkModalState({ isOpen: true, newStatus });
    e.target.value = 'Bulk Actions'; // Reset dropdown
  };

  const closeBulkModal = () => {
    setBulkModalState({ isOpen: false, newStatus: null });
  };

  const confirmBulkStatusChange = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
      await axios.put('/api/jobs/applications/status/bulk', { applicationIds: selectedApps, status: bulkModalState.newStatus }, config);
      setApplications((prevApps) =>
        prevApps.map((app) => (selectedApps.includes(app._id) ? { ...app, status: bulkModalState.newStatus } : app))
      );
      setSelectedApps([]);
    } catch (err) {
      addToast('Failed to update statuses in bulk', 'error');
    } finally {
      closeBulkModal();
    }
  };

  const openScheduleModal = (appId, applicantName) => {
    setInterviewModalState({ isOpen: true, appId, applicantName });
  };

  const closeScheduleModal = () => {
    setInterviewModalState({ isOpen: false, appId: null, applicantName: '' });
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const interviewData = {
      applicationId: interviewModalState.appId,
      date: formData.get('date'),
      type: formData.get('type'),
      meetingLink: formData.get('meetingLink'),
      notes: formData.get('notes'),
    };

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
      
      await axios.post('/api/jobs/interviews', interviewData, config);
      
      addToast('Interview scheduled successfully', 'success');
      
      // Optionally update status to Interview
      initiateStatusChange(interviewModalState.appId, 'Interview', interviewModalState.applicantName);
      
    } catch (err) {
      addToast('Failed to schedule interview', 'error');
    } finally {
      closeScheduleModal();
    }
  };

  const handleNoteChange = (appId, newNote) => {
    setApplications(applications.map(app => 
      app._id === appId ? { ...app, note: newNote } : app
    ));
  };

  const saveNote = async (appId, note) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`/api/jobs/applications/${appId}/note`, { note }, config);
      addToast('Note saved successfully', 'success');
    } catch (err) {
      addToast('Failed to save note', 'error');
    }
  };

  const handleDownload = async (resumePath, applicantName) => {
    try {
      const response = await axios.get(`http://localhost:5000/${resumePath}`, {
        responseType: 'blob',
      });
      
      const extension = resumePath.split('.').pop();
      const filename = `${applicantName.replace(/\s+/g, '_')}_Resume.${extension}`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.open(`http://localhost:5000/${resumePath}`, '_blank');
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleExportCSV = () => {
    if (sortedApplications.length === 0) return;

    const headers = ['Candidate Name', 'Email', 'Status', 'Applied Date', 'Notes'];
    const csvRows = [headers.join(',')];

    sortedApplications.forEach(app => {
      const row = [
        `"${app.applicant ? app.applicant.name : 'N/A'}"`,
        `"${app.applicant ? app.applicant.email : 'N/A'}"`,
        `"${app.status || 'Applied'}"`,
        `"${new Date(app.createdAt || Date.now()).toLocaleDateString()}"`,
        `"${app.note || ''}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `candidates_${jobTitle.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredApplications = applications.filter((app) => {
    const name = app.applicant ? app.applicant.name : '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || (app.status || 'Applied') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedApplications = [...filteredApplications];
  if (sortConfig.key) {
    sortedApplications.sort((a, b) => {
      let aValue = '';
      let bValue = '';

      if (sortConfig.key === 'name') {
        aValue = a.applicant ? a.applicant.name.toLowerCase() : '';
        bValue = b.applicant ? b.applicant.name.toLowerCase() : '';
      } else if (sortConfig.key === 'email') {
        aValue = a.applicant ? a.applicant.email.toLowerCase() : '';
        bValue = b.applicant ? b.applicant.email.toLowerCase() : '';
      } else if (sortConfig.key === 'status') {
        aValue = (a.status || 'Applied').toLowerCase();
        bValue = (b.status || 'Applied').toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedApplications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedApplications.length / itemsPerPage);

  return (
    <div className={styles.container}>
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={confirmStatusChange}
        title="Confirm Status Change"
      >
        <p>
          Are you sure you want to change the status for{' '}
          <strong>{modalState.applicantName}</strong> to{' '}
          <strong>{modalState.newStatus}</strong>?
        </p>
      </Modal>

      <Modal
        isOpen={bulkModalState.isOpen}
        onClose={closeBulkModal}
        onConfirm={confirmBulkStatusChange}
        title="Confirm Bulk Status Change"
      >
        <p>
          Are you sure you want to change the status for{' '}
          <strong>{selectedApps.length} selected candidates</strong> to{' '}
          <strong>{bulkModalState.newStatus}</strong>?
        </p>
      </Modal>

      <Modal
        isOpen={interviewModalState.isOpen}
        onClose={closeScheduleModal}
        title={`Schedule Interview for ${interviewModalState.applicantName}`}
        onConfirm={() => document.getElementById('interviewForm').requestSubmit()}
      >
        <form id="interviewForm" onSubmit={handleScheduleInterview}>
          <div className={styles.modalFormGroup}>
            <label className={styles.label}>Date & Time</label>
            <input type="datetime-local" name="date" required className={styles.searchInput} style={{borderRadius: '4px'}} />
          </div>
          <div className={styles.modalFormGroup}>
            <label className={styles.label}>Interview Type</label>
            <select name="type" className={styles.filterSelect} style={{width: '100%', borderRadius: '4px'}}>
              <option value="Technical">Technical</option>
              <option value="HR">HR</option>
              <option value="Behavioral">Behavioral</option>
              <option value="Final">Final</option>
            </select>
          </div>
          <div className={styles.modalFormGroup}>
            <label className={styles.label}>Meeting Link</label>
            <input type="url" name="meetingLink" placeholder="https://meet.google.com/..." className={styles.searchInput} style={{borderRadius: '4px'}} />
          </div>
          <div className={styles.modalFormGroup}>
            <label className={styles.label}>Notes</label>
            <textarea 
              name="notes" 
              className={styles.notesArea} 
              placeholder="Instructions for candidate..."
              rows="3"
            ></textarea>
          </div>
        </form>
      </Modal>

      <Link to="/employee/jobs" className={styles.backLink}>&larr; Back to Job Postings</Link>
      <h1 className={styles.title}>Applicants for {jobTitle || 'Job'}</h1>
      
      {loading ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th><input type="checkbox" disabled /></th>
                <th>Candidate Name</th>
                <th>Email</th>
                <th>Resume</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td><input type="checkbox" disabled /></td>
                  <td><div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '120px' }}></div></td>
                  <td><div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '180px' }}></div></td>
                  <td><div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '100px' }}></div></td>
                  <td><div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '100px' }}></div></td>
                  <td><div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '150px' }}></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : error ? (
        <div className={styles.error}>Error: {error}</div>
      ) : (
        <>
          {applications.length > 0 && (
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search applicants by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="All">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offered">Offered</option>
              <option value="Rejected">Rejected</option>
            </select>
            <button onClick={handleExportCSV} className={styles.exportButton}>
              Export CSV
            </button>
          </div>
        </div>
          )}

          {selectedApps.length > 0 && (
        <div className={styles.bulkActionsContainer}>
          <strong>{selectedApps.length} selected</strong>
          <select onChange={handleBulkAction} className={styles.filterSelect}>
            <option>Bulk Actions</option>
            <option value="Interview">Change status to Interview</option>
            <option value="Offered">Change status to Offered</option>
            <option value="Rejected">Change status to Rejected</option>
          </select>
        </div>
          )}

          {sortedApplications.length === 0 ? (
        <div className={styles.empty}>
          {searchTerm && applications.length > 0 ? 'No applicants found matching your search.' : 'No candidates have applied for this job yet.'}
        </div>
          ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={isAllOnPageSelected}
                  />
                </th>
                <th onClick={() => requestSort('name')} className={styles.sortableHeader}>
                  Candidate Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
                </th>
                <th onClick={() => requestSort('email')} className={styles.sortableHeader}>
                  Email {sortConfig.key === 'email' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
                </th>
                <th>Resume</th>
                <th onClick={() => requestSort('status')} className={styles.sortableHeader}>
                  Status {sortConfig.key === 'status' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
                </th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((app) => (
                <tr key={app._id}>
                  <td>
                    <input
                      type="checkbox"
                      onChange={() => handleSelectOne(app._id)}
                      checked={selectedApps.includes(app._id)}
                    />
                  </td>
                  <td>{app.applicant ? app.applicant.name : 'N/A'}</td>
                  <td>{app.applicant ? app.applicant.email : 'N/A'}</td>
                  <td>
                    {/* For this link to work, you must serve static files from your 'uploads' folder in your main server file. Ex: app.use('/uploads', express.static('uploads')); */}
                    {app.applicant && app.applicant.resume ? (
                      <Tooltip text="Click to download PDF">
                        <button 
                          onClick={() => handleDownload(app.applicant.resume, app.applicant.name)}
                          className={styles.downloadButton}
                        >
                          Download Resume
                        </button>
                      </Tooltip>
                    ) : (
                      'No Resume'
                    )}
                    <Tooltip text="Schedule Interview">
                      <button
                        onClick={() => openScheduleModal(app._id, app.applicant?.name)}
                        className={styles.scheduleButton}
                      >
                        📅
                      </button>
                    </Tooltip>
                  </td>
                  <td>
                    <select
                      value={app.status || 'Applied'}
                      onChange={(e) => initiateStatusChange(app._id, e.target.value, app.applicant?.name || 'this candidate')}
                      className={styles.statusSelect}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview</option>
                      <option value="Offered">Offered</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td>
                    <textarea
                      className={styles.notesArea}
                      value={app.note || ''}
                      onChange={(e) => handleNoteChange(app._id, e.target.value)}
                      placeholder="Add notes..."
                    />
                    <button onClick={() => saveNote(app._id, app.note)} className={styles.saveNoteButton}>
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          )}

          {sortedApplications.length > itemsPerPage && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={styles.pageButton}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={styles.pageButton}
          >
            Next
          </button>
        </div>
          )}
        </>
      )}
    </div>
  );
};

export default Candidates;