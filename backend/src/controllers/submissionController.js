const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Submit assignment answer
// @route   POST /api/submissions
// @access  Private (Student only)
const createSubmission = asyncHandler(async (req, res) => {
  const { assignmentId, answer } = req.body;

  // Validate input
  if (!assignmentId || !answer) {
    return res.status(400).json({
      success: false,
      message: 'Please provide assignment ID and answer'
    });
  }

  // Check if assignment exists and is published
  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  if (assignment.status !== 'Published') {
    return res.status(400).json({
      success: false,
      message: 'Assignment is not available for submission'
    });
  }

  // Check if due date has passed
  if (new Date() > assignment.dueDate) {
    return res.status(400).json({
      success: false,
      message: 'Assignment due date has passed. Submissions are no longer accepted.'
    });
  }

  // Check if student has already submitted
  const existingSubmission = await Submission.findOne({
    assignmentId,
    studentId: req.user.userId
  });

  if (existingSubmission) {
    return res.status(400).json({
      success: false,
      message: 'You have already submitted this assignment'
    });
  }

  // Create submission
  const submission = await Submission.create({
    assignmentId,
    studentId: req.user.userId,
    answer
  });

  // Populate assignment and student info
  await submission.populate([
    { path: 'assignmentId', select: 'title dueDate' },
    { path: 'studentId', select: 'name email' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Assignment submitted successfully',
    data: submission
  });
});

// @desc    Get submissions for an assignment
// @route   GET /api/submissions/:assignmentId
// @access  Private (Teacher only)
const getSubmissionsByAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  // Check if assignment exists and belongs to the teacher
  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  if (assignment.createdBy.toString() !== req.user.userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view submissions for this assignment'
    });
  }

  // Get submissions with student information
  const submissions = await Submission.find({ assignmentId })
    .populate('studentId', 'name email')
    .populate('assignmentId', 'title dueDate')
    .sort({ submittedAt: -1 });

  // Format response data
  const formattedSubmissions = submissions.map(submission => ({
    _id: submission._id,
    studentName: submission.studentId.name,
    studentEmail: submission.studentId.email,
    answer: submission.answer,
    submittedAt: submission.submittedAt,
    reviewed: submission.reviewed,
    grade: submission.grade,
    feedback: submission.feedback,
    assignmentTitle: submission.assignmentId.title
  }));

  res.status(200).json({
    success: true,
    count: submissions.length,
    data: formattedSubmissions
  });
});

// @desc    Get student's own submissions
// @route   GET /api/submissions/my-submissions
// @access  Private (Student only)
const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ studentId: req.user.userId })
    .populate('assignmentId', 'title description dueDate status')
    .sort({ submittedAt: -1 });

  res.status(200).json({
    success: true,
    count: submissions.length,
    data: submissions
  });
});

// @desc    Update submission review status and grade
// @route   PUT /api/submissions/:id/review
// @access  Private (Teacher only)
const reviewSubmission = asyncHandler(async (req, res) => {
  const { grade, feedback } = req.body;

  // Find submission and populate assignment info
  const submission = await Submission.findById(req.params.id)
    .populate('assignmentId', 'createdBy title')
    .populate('studentId', 'name email');

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Submission not found'
    });
  }

  // Check if the teacher owns the assignment
  if (submission.assignmentId.createdBy.toString() !== req.user.userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to review this submission'
    });
  }

  // Validate grade if provided
  if (grade !== undefined) {
    if (typeof grade !== 'number' || grade < 0 || grade > 100) {
      return res.status(400).json({
        success: false,
        message: 'Grade must be a number between 0 and 100'
      });
    }
    submission.grade = grade;
  }

  // Update feedback if provided
  if (feedback !== undefined) {
    submission.feedback = feedback;
  }

  // Mark as reviewed
  submission.reviewed = true;
  await submission.save();

  res.status(200).json({
    success: true,
    message: 'Submission reviewed successfully',
    data: {
      submissionId: submission._id,
      studentName: submission.studentId.name,
      assignmentTitle: submission.assignmentId.title,
      grade: submission.grade,
      feedback: submission.feedback,
      reviewed: submission.reviewed
    }
  });
});

// @desc    Get analytics for assignments
// @route   GET /api/analytics
// @access  Private (Teacher only)
const getAnalytics = asyncHandler(async (req, res) => {
  // Get teacher's assignments
  const assignments = await Assignment.find({ createdBy: req.user.userId });
  const assignmentIds = assignments.map(assignment => assignment._id);

  // Get submission counts per assignment
  const submissionStats = await Submission.aggregate([
    { $match: { assignmentId: { $in: assignmentIds } } },
    {
      $group: {
        _id: '$assignmentId',
        totalSubmissions: { $sum: 1 },
        reviewedSubmissions: {
          $sum: { $cond: [{ $eq: ['$reviewed', true] }, 1, 0] }
        },
        averageGrade: {
          $avg: { $cond: [{ $ne: ['$grade', null] }, '$grade', null] }
        }
      }
    }
  ]);

  // Combine assignment info with submission stats
  const analytics = assignments.map(assignment => {
    const stats = submissionStats.find(
      stat => stat._id.toString() === assignment._id.toString()
    ) || {
      totalSubmissions: 0,
      reviewedSubmissions: 0,
      averageGrade: null
    };

    return {
      assignmentId: assignment._id,
      title: assignment.title,
      status: assignment.status,
      dueDate: assignment.dueDate,
      totalSubmissions: stats.totalSubmissions,
      reviewedSubmissions: stats.reviewedSubmissions,
      pendingReviews: stats.totalSubmissions - stats.reviewedSubmissions,
      averageGrade: stats.averageGrade ? Math.round(stats.averageGrade * 100) / 100 : null
    };
  });

  // Overall statistics
  const totalAssignments = assignments.length;
  const totalSubmissions = submissionStats.reduce((sum, stat) => sum + stat.totalSubmissions, 0);
  const totalReviewed = submissionStats.reduce((sum, stat) => sum + stat.reviewedSubmissions, 0);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalAssignments,
        totalSubmissions,
        totalReviewed,
        pendingReviews: totalSubmissions - totalReviewed
      },
      assignmentAnalytics: analytics
    }
  });
});

module.exports = {
  createSubmission,
  getSubmissionsByAssignment,
  getMySubmissions,
  reviewSubmission,
  getAnalytics
};
