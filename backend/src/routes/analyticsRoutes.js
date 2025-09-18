const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/submissionController');
const { authenticate, teacherOnly } = require('../middleware/authMiddleware');

router.get('/', authenticate, teacherOnly, getAnalytics);

module.exports = router;
