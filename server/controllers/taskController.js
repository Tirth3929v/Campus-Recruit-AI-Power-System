const Task = require('../models/Task');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private/Admin
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo: assignedTo || req.user.id,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, task });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    let query;

    if (req.user.role === 'admin') {
      // Admin sees tasks they created
      query = Task.find({ createdBy: req.user.id });
    } else if (req.user.role === 'employee') {
      // Employee sees tasks assigned to them
      query = Task.find({ assignedTo: req.user.id });
    } else {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const tasks = await query.populate('assignedTo', 'name email').sort('-createdAt');

    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Toggle task completion
// @route   PATCH /api/tasks/:id/toggle
// @access  Private
exports.toggleTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user is either the creator (admin) or the assignee (employee/admin)
    if (task.createdBy.toString() !== req.user.id && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    task.isCompleted = !task.isCompleted;
    await task.save();

    res.status(200).json({ success: true, task });
  } catch (err) {
    console.error('Toggle task error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
