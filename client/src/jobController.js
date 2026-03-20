import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
  try {
    // You can add dummy data here if you don't have jobs in your DB yet
    // For example: const jobs = [{ _id: '1', title: 'Dev', company: 'Me' }];
    const jobs = await Job.find({});
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Export interview feedback to PDF
// @route   GET /api/jobs/interviews/:id/pdf
// @access  Private (Employee/Admin)
export const exportInterviewPDF = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidate', 'name email')
      .populate('job', 'title company')
      .populate('interviewer', 'name');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=interview_feedback_${interview.candidate.name.replace(/\s+/g, '_')}.pdf`);

    doc.pipe(res);

    // PDF Content
    doc.fontSize(20).text('Interview Feedback Report', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Candidate: ${interview.candidate.name} (${interview.candidate.email})`);
    doc.text(`Job Position: ${interview.job.title} at ${interview.job.company}`);
    doc.text(`Date: ${new Date(interview.date).toLocaleString()}`);
    doc.text(`Interviewer: ${interview.interviewer ? interview.interviewer.name : 'N/A'}`);
    doc.moveDown();
    
    doc.fontSize(14).text('Feedback & Rating', { underline: true });
    doc.fontSize(12).text(`Rating: ${interview.rating || 'N/A'} / 5`);
    doc.moveDown(0.5);
    doc.text(`Feedback:`);
    doc.text(interview.feedback || 'No feedback provided.');

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Schedule an interview
// @route   POST /api/jobs/interviews
// @access  Private (Employee/Admin)
export const scheduleInterview = async (req, res) => {
  const { applicationId, date, type, meetingLink, notes } = req.body;

  try {
    const application = await Application.findById(applicationId)
      .populate('applicant', 'name email')
      .populate('job', 'title company');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const interview = new Interview({
      application: applicationId,
      candidate: application.applicant._id,
      interviewer: req.user.id,
      job: application.job._id,
      date,
      type,
      meetingLink,
      notes
    });

    await interview.save();

    // Send Email Notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: application.applicant.email,
      subject: `Interview Scheduled: ${application.job.title}`,
      html: `
        <h2>Interview Scheduled</h2>
        <p>Dear ${application.applicant.name},</p>
        <p>You have an interview scheduled for the <strong>${application.job.title}</strong> position at <strong>${application.job.company}</strong>.</p>
        <p><strong>Date:</strong> ${new Date(date).toLocaleString()}</p>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        <p>Best regards,<br/>Recruitment Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Interview scheduled successfully', interview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Employee/Admin)
export const createJob = async (req, res) => {
  const { title, company, location, type, description } = req.body;

  try {
    const job = new Job({
      title,
      company,
      location,
      type,
      description,
      postedBy: req.user.id,
    });

    const createdJob = await job.save();
    res.status(201).json(createdJob);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Apply to a job
// @route   POST /api/jobs/:id/apply
// @access  Private (requires authentication)
export const applyToJob = async (req, res) => {
  const { id: jobId } = req.params;
  // This assumes your authentication middleware adds the user's ID to req.user
  const applicantId = req.user.id; 
  const { resumeURL } = req.body;

  if (!resumeURL) {
    return res.status(400).json({ message: 'A resume URL is required.' });
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    const application = new Application({
      job: jobId,
      applicant: applicantId,
      resumeURL,
    });

    await application.save();

    res.status(201).json({ message: 'Application submitted successfully!', application });

  } catch (error) {
    if (error.code === 11000) {
        return res.status(400).json({ message: 'You have already applied for this job.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get my applications
// @route   GET /api/jobs/my-applications
// @access  Private
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job', 'title company location type')
      .sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Employee/Admin)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    await job.deleteOne();
    res.status(200).json({ message: 'Job removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get applicants for a specific job
// @route   GET /api/jobs/:id/applicants
// @access  Private (Employee/Admin)
export const getJobApplicants = async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.id })
      .populate('applicant', 'name email resume')
      .populate('job', 'title');

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update application status
// @route   PUT /api/jobs/applications/:id/status
// @access  Private (Employee/Admin)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await application.save();

    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get employee dashboard stats
// @route   GET /api/jobs/stats
// @access  Private (Employee/Admin)
export const getEmployeeStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({});
    const totalApplications = await Application.countDocuments({});
    
    const recentApplications = await Application.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('job', 'title')
      .populate('applicant', 'name email');

    res.status(200).json({
      totalJobs,
      totalApplications,
      recentApplications,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update status for multiple applications
// @route   PUT /api/jobs/applications/status/bulk
// @access  Private (Employee/Admin)
export const updateBulkApplicationStatus = async (req, res) => {
  const { applicationIds, status } = req.body;

  if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
    return res.status(400).json({ message: 'Application IDs are required' });
  }

  try {
    const result = await Application.updateMany(
      { _id: { $in: applicationIds } },
      { $set: { status: status } }
    );

    res.status(200).json({ message: `${result.modifiedCount} applications updated successfully.` });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update application note
// @route   PUT /api/jobs/applications/:id/note
// @access  Private (Employee/Admin)
export const updateApplicationNote = async (req, res) => {
  try {
    const { note } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.note = note;
    await application.save();

    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all scheduled interviews
// @route   GET /api/jobs/interviews
// @access  Private (Employee/Admin)
export const getScheduledInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ interviewer: req.user.id })
      .populate('candidate', 'name email')
      .populate('job', 'title company')
      .sort({ date: 1 });
    res.status(200).json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Cancel an interview
// @route   PUT /api/jobs/interviews/:id/cancel
// @access  Private (Employee/Admin)
export const cancelInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidate', 'name email')
      .populate('job', 'title');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    interview.status = 'Cancelled';
    await interview.save();

    // Send Email Notification
    // ... (Implementation similar to scheduleInterview, notifying candidate of cancellation)

    res.status(200).json({ message: 'Interview cancelled successfully', interview });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Reschedule an interview
// @route   PUT /api/jobs/interviews/:id/reschedule
// @access  Private (Employee/Admin)
export const rescheduleInterview = async (req, res) => {
  const { date, meetingLink, notes } = req.body;

  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidate', 'name email')
      .populate('job', 'title');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    interview.date = date;
    if (meetingLink) interview.meetingLink = meetingLink;
    if (notes) interview.notes = notes;
    interview.status = 'Scheduled'; // Reset status if it was cancelled
    
    await interview.save();

    // Send Email Notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: interview.candidate.email,
      subject: `Interview Rescheduled: ${interview.job.title}`,
      html: `
        <h2>Interview Rescheduled</h2>
        <p>Dear ${interview.candidate.name},</p>
        <p>Your interview for the <strong>${interview.job.title}</strong> position has been rescheduled.</p>
        <p><strong>New Date:</strong> ${new Date(date).toLocaleString()}</p>
        <p><strong>Link:</strong> <a href="${interview.meetingLink}">${interview.meetingLink}</a></p>
        <p>Best regards,<br/>Recruitment Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Interview rescheduled successfully', interview });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Submit interview feedback
// @route   PUT /api/jobs/interviews/:id/feedback
// @access  Private (Employee/Admin)
export const submitInterviewFeedback = async (req, res) => {
  const { feedback, rating } = req.body;

  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    interview.feedback = feedback;
    interview.rating = rating;
    interview.status = 'Completed';
    await interview.save();

    res.status(200).json({ message: 'Feedback submitted successfully', interview });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};