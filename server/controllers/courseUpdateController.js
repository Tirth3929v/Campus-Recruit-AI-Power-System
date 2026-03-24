const CourseUpdateRequest = require('../models/CourseUpdateRequest');
const Course = require('../models/Course');

// Employee: Submit course update request
exports.submitUpdateRequest = async (req, res) => {
  try {
    console.log('\n=== SUBMIT UPDATE REQUEST ===');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    
    const { courseId, updatedFields, reason, updateType } = req.body;

    if (!courseId || !updateType) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Course ID and update type are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      console.log('Course not found:', courseId);
      return res.status(404).json({ error: 'Course not found' });
    }

    console.log('Creating update request...');
    const updateRequest = await CourseUpdateRequest.create({
      course: courseId,
      requestedBy: req.user._id,
      requestedByName: req.user.name,
      requestedByEmail: req.user.email,
      updateType,
      updatedFields: updatedFields || {},
      reason: reason || ''
    });

    console.log('Update request created:', updateRequest._id);
    console.log('=== END SUBMIT UPDATE REQUEST ===\n');

    res.status(201).json({
      success: true,
      message: 'Update request submitted successfully. Awaiting admin approval.',
      request: updateRequest
    });
  } catch (err) {
    console.error('\n=== 🔥 SUBMIT UPDATE REQUEST ERROR ===');
    console.error('Error Type:', err.name);
    console.error('Error Message:', err.message);
    console.error('Stack:', err.stack);
    console.error('=== END ERROR ===\n');
    
    res.status(500).json({ 
      error: 'Failed to submit update request',
      message: err.message 
    });
  }
};

// Employee: Get their own update requests
exports.getMyUpdateRequests = async (req, res) => {
  try {
    const requests = await CourseUpdateRequest.find({ requestedBy: req.user._id })
      .populate('course', 'title thumbnail category')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error('Get my update requests error:', err);
    res.status(500).json({ error: 'Failed to fetch update requests' });
  }
};

// Admin: Get all pending update requests
exports.getAllUpdateRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    console.log('Fetching course update requests with filter:', filter);
    console.log('User role:', req.user?.role);

    const requests = await CourseUpdateRequest.find(filter)
      .populate('course', 'title thumbnail category instructor')
      .sort({ createdAt: -1 })
      .lean(); // Use lean for better performance

    console.log(`Found ${requests.length} course update requests`);

    // Manually populate requestedBy from Employee model or User model
    const populatedRequests = await Promise.all(requests.map(async (req) => {
      if (req.requestedBy) {
        try {
          // Try Employee model first
          const Employee = require('../models/Employee');
          let user = await Employee.findById(req.requestedBy).select('name email').lean();
          
          // If not found in Employee, try User model
          if (!user) {
            const User = require('../models/User');
            user = await User.findById(req.requestedBy).select('name email').lean();
          }
          
          if (user) {
            req.requestedBy = user;
          } else {
            // Keep the ID if user not found
            console.log('User not found for ID:', req.requestedBy);
            req.requestedBy = {
              _id: req.requestedBy,
              name: req.requestedByName || 'Unknown',
              email: req.requestedByEmail || 'N/A'
            };
          }
        } catch (err) {
          console.error('Error populating requestedBy:', err.message);
          // Use fallback data from request
          req.requestedBy = {
            _id: req.requestedBy,
            name: req.requestedByName || 'Unknown',
            email: req.requestedByEmail || 'N/A'
          };
        }
      }
      return req;
    }));

    res.json(populatedRequests);
  } catch (err) {
    console.error('\n=== 🔥 GET ALL UPDATE REQUESTS ERROR ===');
    console.error('Error Type:', err.name);
    console.error('Error Message:', err.message);
    console.error('Stack Trace:', err.stack);
    console.error('=== END ERROR REPORT ===\n');
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch update requests', 
      message: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Admin: Approve update request
exports.approveUpdateRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminResponse } = req.body;

    const updateRequest = await CourseUpdateRequest.findById(requestId);
    if (!updateRequest) {
      return res.status(404).json({ error: 'Update request not found' });
    }

    if (updateRequest.status !== 'pending') {
      return res.status(400).json({ error: 'This request has already been processed' });
    }

    const course = await Course.findById(updateRequest.course);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Apply the updates to the course
    if (updateRequest.updateType === 'edit') {
      await Course.findByIdAndUpdate(
        updateRequest.course,
        { $set: updateRequest.updatedFields },
        { new: true, runValidators: true }
      );

      // Add to update history
      course.updateHistory = course.updateHistory || [];
      course.updateHistory.push({
        updatedBy: updateRequest.requestedByName,
        updatedByEmail: updateRequest.requestedByEmail,
        updateType: updateRequest.updateType,
        updatedFields: updateRequest.updatedFields,
        employeeReason: updateRequest.reason,
        adminResponse: adminResponse || 'Approved',
        reviewedBy: req.user.name || req.user.email,
        status: 'approved',
        updatedAt: new Date()
      });
      await course.save();
    } else if (updateRequest.updateType === 'delete') {
      // Add to history before deleting
      course.updateHistory = course.updateHistory || [];
      course.updateHistory.push({
        updatedBy: updateRequest.requestedByName,
        updatedByEmail: updateRequest.requestedByEmail,
        updateType: updateRequest.updateType,
        updatedFields: {},
        employeeReason: updateRequest.reason,
        adminResponse: adminResponse || 'Approved for deletion',
        reviewedBy: req.user.name || req.user.email,
        status: 'approved',
        updatedAt: new Date()
      });
      await course.save();
      await Course.findByIdAndDelete(updateRequest.course);
    }

    // Update request status
    updateRequest.status = 'approved';
    updateRequest.adminResponse = adminResponse || 'Approved';
    updateRequest.reviewedBy = req.user._id;
    updateRequest.reviewedAt = new Date();
    await updateRequest.save();

    res.json({
      success: true,
      message: 'Update request approved and applied',
      request: updateRequest
    });
  } catch (err) {
    console.error('Approve update request error:', err);
    res.status(500).json({ error: 'Failed to approve update request' });
  }
};

// Admin: Reject update request
exports.rejectUpdateRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminResponse } = req.body;

    const updateRequest = await CourseUpdateRequest.findById(requestId);
    if (!updateRequest) {
      return res.status(404).json({ error: 'Update request not found' });
    }

    if (updateRequest.status !== 'pending') {
      return res.status(400).json({ error: 'This request has already been processed' });
    }

    // Add rejection to course history
    const course = await Course.findById(updateRequest.course);
    if (course) {
      course.updateHistory = course.updateHistory || [];
      course.updateHistory.push({
        updatedBy: updateRequest.requestedByName,
        updatedByEmail: updateRequest.requestedByEmail,
        updateType: updateRequest.updateType,
        updatedFields: updateRequest.updatedFields,
        employeeReason: updateRequest.reason,
        adminResponse: adminResponse || 'Rejected',
        reviewedBy: req.user.name || req.user.email,
        status: 'rejected',
        updatedAt: new Date()
      });
      await course.save();
    }

    updateRequest.status = 'rejected';
    updateRequest.adminResponse = adminResponse || 'Rejected';
    updateRequest.reviewedBy = req.user._id;
    updateRequest.reviewedAt = new Date();
    await updateRequest.save();

    res.json({
      success: true,
      message: 'Update request rejected',
      request: updateRequest
    });
  } catch (err) {
    console.error('Reject update request error:', err);
    res.status(500).json({ error: 'Failed to reject update request' });
  }
};
