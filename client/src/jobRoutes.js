import express from 'express';
import { getJobs, applyToJob, createJob, deleteJob, getJobApplicants, updateApplicationStatus, getEmployeeStats, updateBulkApplicationStatus, updateApplicationNote, scheduleInterview, getScheduledInterviews, cancelInterview, rescheduleInterview, submitInterviewFeedback, exportInterviewPDF } from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Corresponds to the frontend's GET /api/jobs
router.get('/', getJobs);
router.post('/', protect, createJob);
router.get('/stats', protect, getEmployeeStats);

router.delete('/:id', protect, deleteJob);

router.post('/:id/apply', protect, applyToJob);

router.get('/:id/applicants', protect, getJobApplicants);

router.put('/applications/:id/status', protect, updateApplicationStatus);

router.put('/applications/status/bulk', protect, updateBulkApplicationStatus);

router.put('/applications/:id/note', protect, updateApplicationNote);

router.post('/interviews', protect, scheduleInterview);
router.get('/interviews', protect, getScheduledInterviews);
router.put('/interviews/:id/cancel', protect, cancelInterview);
router.put('/interviews/:id/reschedule', protect, rescheduleInterview);
router.put('/interviews/:id/feedback', protect, submitInterviewFeedback);
router.get('/interviews/:id/pdf', protect, exportInterviewPDF);

export default router;