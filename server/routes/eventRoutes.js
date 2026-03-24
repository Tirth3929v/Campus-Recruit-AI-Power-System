const express = require('express');
const router  = express.Router();
const { getAllEvents, createAndBroadcastEvent } = require('../controllers/eventController');
const { protect, employeeOnly } = require('../middleware/authMiddleware');

router.get('/',  getAllEvents);
router.post('/', protect, employeeOnly, createAndBroadcastEvent);

module.exports = router;
