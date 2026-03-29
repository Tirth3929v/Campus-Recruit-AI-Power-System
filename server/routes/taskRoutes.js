const express = require('express');
const router = express.Router();
const { createTask, getTasks, toggleTaskStatus } = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Mount at /api/tasks
router.route('/')
  .post(protect, adminOnly, createTask) // Admins create tasks
  .get(protect, getTasks);                // Authed users get their tasks

router.route('/:id/toggle')
  .patch(protect, toggleTaskStatus);      // Creator or Assignee toggles task

module.exports = router;
