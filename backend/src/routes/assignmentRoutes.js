const express = require('express');
const router = express.Router();
const {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus,
  getAssignment
} = require('../controllers/assignmentController');
const { authenticate, teacherOnly } = require('../middleware/authMiddleware');

router.get('/', authenticate, getAssignments);

router.post('/', authenticate, teacherOnly, createAssignment);

router.get('/:id', authenticate, getAssignment);

router.put('/:id', authenticate, teacherOnly, updateAssignment);

router.delete('/:id', authenticate, teacherOnly, deleteAssignment);

router.put('/:id/status', authenticate, teacherOnly, updateAssignmentStatus);

module.exports = router;
