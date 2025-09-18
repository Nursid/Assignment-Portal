import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignments, clearError } from '../redux/slices/assignmentSlice';
import { createSubmission, fetchMySubmissions, clearSubmissionSuccess, clearError as clearSubmissionError } from '../redux/slices/submissionSlice';
import { formatDate, isOverdue } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { assignments, loading: assignmentLoading, error: assignmentError } = useSelector((state) => state.assignments);
  const { mySubmissions, loading: submissionLoading, error: submissionError, submissionSuccess } = useSelector((state) => state.submissions);
  
  const [submittingTo, setSubmittingTo] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Fetch published assignments
    dispatch(fetchAssignments({ page: currentPage, limit: 10 }));
    // Fetch student's submissions
    dispatch(fetchMySubmissions());
  }, [dispatch, currentPage]);

  useEffect(() => {
    if (submissionSuccess) {
      setSubmittingTo(null);
      setSubmissionText('');
      dispatch(clearSubmissionSuccess());
      // Refresh submissions
      dispatch(fetchMySubmissions());
    }
  }, [submissionSuccess, dispatch]);

  const getSubmissionForAssignment = (assignmentId) => {
    return mySubmissions.find(sub => sub.assignmentId._id === assignmentId);
  };

  const handleStartSubmission = (assignment) => {
    if (isOverdue(assignment.dueDate)) {
      alert('This assignment is overdue. Submissions are no longer accepted.');
      return;
    }

    const existingSubmission = getSubmissionForAssignment(assignment._id);
    if (existingSubmission) {
      alert('You have already submitted this assignment.');
      return;
    }

    setSubmittingTo(assignment._id);
    setSubmissionText('');
  };

  const handleCancelSubmission = () => {
    setSubmittingTo(null);
    setSubmissionText('');
  };

  const handleSubmissionSubmit = async (assignmentId) => {
    if (!submissionText.trim()) {
      alert('Please provide an answer before submitting.');
      return;
    }

    if (submissionText.length > 5000) {
      alert('Answer must be less than 5000 characters.');
      return;
    }

    try {
      await dispatch(createSubmission({
        assignmentId,
        answer: submissionText.trim()
      }));
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const getAssignmentStatus = (assignment) => {
    const submission = getSubmissionForAssignment(assignment._id);
    const overdue = isOverdue(assignment.dueDate);

    if (submission) {
      return {
        status: 'submitted',
        text: 'Submitted',
        color: 'bg-green-100 text-green-800'
      };
    } else if (overdue) {
      return {
        status: 'overdue',
        text: 'Overdue',
        color: 'bg-red-100 text-red-800'
      };
    } else {
      return {
        status: 'pending',
        text: 'Pending',
        color: 'bg-yellow-100 text-yellow-800'
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600">View and submit your assignments</p>
      </div>

      <ErrorMessage 
        message={assignmentError || submissionError} 
        onClose={() => {
          dispatch(clearError());
          dispatch(clearSubmissionError());
        }} 
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{assignments.length}</p>
              <p className="text-sm sm:text-base text-gray-600">Available Assignments</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{mySubmissions.length}</p>
              <p className="text-sm sm:text-base text-gray-600">Submitted</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {assignments.length - mySubmissions.length}
              </p>
              <p className="text-sm sm:text-base text-gray-600">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Assignments
          </h2>
        </div>

        {assignmentLoading ? (
          <div className="p-8">
            <LoadingSpinner size="large" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No assignments available at the moment.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {assignments.map((assignment) => {
              const submission = getSubmissionForAssignment(assignment._id);
              const status = getAssignmentStatus(assignment);
              const isSubmitting = submittingTo === assignment._id;

              return (
                <div key={assignment._id} className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900">
                          {assignment.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 mb-3">
                        {assignment.description}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0 sm:space-x-4">
                        <span>Due: {formatDate(assignment.dueDate)}</span>
                        <span>Created by: {assignment.createdBy?.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Submission Section */}
                  {submission ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-2">Your Submission:</h4>
                      <p className="text-gray-900 mb-3 whitespace-pre-wrap">{submission.answer}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>Submitted: {formatDate(submission.submittedAt)}</span>
                        {submission.reviewed && (
                          <>
                            <span className="text-green-600">Reviewed</span>
                            {submission.grade && (
                              <span className="font-semibold text-primary-600">
                                Grade: {submission.grade}/100
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      {submission.feedback && (
                        <div className="mt-3 bg-blue-50 rounded p-3">
                          <h5 className="font-medium text-gray-700 mb-1">Teacher Feedback:</h5>
                          <p className="text-gray-900">{submission.feedback}</p>
                        </div>
                      )}
                    </div>
                  ) : isSubmitting ? (
                    <div className="bg-blue-50 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                      <h4 className="font-medium text-gray-700 text-sm sm:text-base">Submit Your Answer:</h4>
                      <textarea
                        rows={4}
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-sm sm:text-base"
                        placeholder="Enter your answer here..."
                        maxLength={5000}
                        disabled={submissionLoading}
                      />
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                        <p className="text-xs text-gray-500">
                          {submissionText.length}/5000 characters
                        </p>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <button
                            onClick={handleCancelSubmission}
                            disabled={submissionLoading}
                            className="btn-secondary disabled:opacity-50 w-full sm:w-auto"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSubmissionSubmit(assignment._id)}
                            disabled={submissionLoading || !submissionText.trim()}
                            className="btn-primary flex items-center justify-center disabled:opacity-50 w-full sm:w-auto"
                          >
                            {submissionLoading ? (
                              <>
                                <LoadingSpinner size="small" className="mr-2" />
                                Submitting...
                              </>
                            ) : (
                              'Submit Assignment'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => handleStartSubmission(assignment)}
                        disabled={isOverdue(assignment.dueDate)}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                      >
                        {isOverdue(assignment.dueDate) ? 'Overdue' : 'Submit Assignment'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
