const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
const getAssignments = asyncHandler(async (req, res) => {
  let query = {};
  let filter = {};

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Role-based filtering
  if (req.user.role === 'student') {
    // Students can only see published assignments
    filter.status = 'Published';
  } else if (req.user.role === 'teacher') {
    // Teachers see their own assignments with optional status filter
    filter.createdBy = req.user.userId;
    
    // Optional status filter for teachers
    if (req.query.status && ['Draft', 'Published', 'Completed'].includes(req.query.status)) {
      filter.status = req.query.status;
    }
  }

  // Build query
  query = Assignment.find(filter)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  // Execute query
  const assignments = await query;
  const total = await Assignment.countDocuments(filter);

  // Pagination info
  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalAssignments: total,
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1
  };

  res.status(200).json({
    success: true,
    count: assignments.length,
    pagination,
    data: assignments
  });
});

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private (Teacher only)
const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, dueDate } = req.body;

  // Validate input
  if (!title || !description || !dueDate) {
    return res.status(400).json({
      success: false,
      message: 'Please provide title, description, and due date'
    });
  }

  // Create assignment
  const assignment = await Assignment.create({
    title,
    description,
    dueDate: new Date(dueDate),
    createdBy: req.user.userId
  });

  // Populate creator info
  await assignment.populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    message: 'Assignment created successfully',
    data: assignment
  });
});

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Teacher only)
const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check ownership
  if (assignment.createdBy.toString() !== req.user.userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this assignment'
    });
  }

  // Only allow editing if assignment is in Draft status
  if (assignment.status !== 'Draft') {
    return res.status(400).json({
      success: false,
      message: 'Can only edit assignments in Draft status'
    });
  }

  const { title, description, dueDate } = req.body;
  
  // Update fields if provided
  if (title) assignment.title = title;
  if (description) assignment.description = description;
  if (dueDate) assignment.dueDate = new Date(dueDate);

  await assignment.save();
  await assignment.populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'Assignment updated successfully',
    data: assignment
  });
});

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Teacher only)
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check ownership
  if (assignment.createdBy.toString() !== req.user.userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this assignment'
    });
  }

  // Only allow deletion if assignment is in Draft status
  if (assignment.status !== 'Draft') {
    return res.status(400).json({
      success: false,
      message: 'Can only delete assignments in Draft status'
    });
  }

  await Assignment.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Assignment deleted successfully'
  });
});

// @desc    Update assignment status
// @route   PUT /api/assignments/:id/status
// @access  Private (Teacher only)
const updateAssignmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !['Draft', 'Published', 'Completed'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid status (Draft, Published, Completed)'
    });
  }

  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check ownership
  if (assignment.createdBy.toString() !== req.user.userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this assignment'
    });
  }

  // Status transition validation
  const validTransitions = {
    'Draft': ['Published'],
    'Published': ['Completed'],
    'Completed': [] // No transitions from completed
  };

  if (!validTransitions[assignment.status].includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot change status from ${assignment.status} to ${status}`
    });
  }

  assignment.status = status;
  await assignment.save();
  await assignment.populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'Assignment status updated successfully',
    data: assignment
  });
});

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id).populate('createdBy', 'name email');

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Students can only view published assignments
  if (req.user.role === 'student' && assignment.status !== 'Published') {
    return res.status(403).json({
      success: false,
      message: 'Assignment not available'
    });
  }

  // Teachers can only view their own assignments
  if (req.user.role === 'teacher' && assignment.createdBy._id.toString() !== req.user.userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this assignment'
    });
  }

  res.status(200).json({
    success: true,
    data: assignment
  });
});

module.exports = {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus,
  getAssignment
};
