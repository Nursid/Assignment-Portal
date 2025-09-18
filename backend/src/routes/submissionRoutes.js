const express = require('express');
const router = express.Router();
const {
  createSubmission,
  getSubmissionsByAssignment,
  getMySubmissions,
  reviewSubmission,
  getAnalytics
} = require('../controllers/submissionController');
const { authenticate, teacherOnly, studentOnly } = require('../middleware/authMiddleware');

router.post('/', authenticate, studentOnly, createSubmission);

router.get('/my-submissions', authenticate, studentOnly, getMySubmissions);

router.get('/:assignmentId', authenticate, teacherOnly, getSubmissionsByAssignment);

router.put('/:id/review', authenticate, teacherOnly, reviewSubmission);


module.exports = router;
