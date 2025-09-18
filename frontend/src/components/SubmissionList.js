import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reviewSubmission } from '../redux/slices/submissionSlice';
import { formatDate } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';

const SubmissionList = ({ assignment, submissions, onBack }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.submissions);
  
  const [reviewingSubmission, setReviewingSubmission] = useState(null);
  const [reviewData, setReviewData] = useState({ grade: '', feedback: '' });

  const handleStartReview = (submission) => {
    setReviewingSubmission(submission._id);
    setReviewData({
      grade: submission.grade || '',
      feedback: submission.feedback || ''
    });
  };

  const handleCancelReview = () => {
    setReviewingSubmission(null);
    setReviewData({ grade: '', feedback: '' });
  };

  const handleReviewSubmit = async (submissionId) => {
    const grade = parseFloat(reviewData.grade);
    
    if (reviewData.grade && (isNaN(grade) || grade < 0 || grade > 100)) {
      alert('Grade must be a number between 0 and 100');
      return;
    }

    try {
      await dispatch(reviewSubmission({
        id: submissionId,
        grade: reviewData.grade ? grade : undefined,
        feedback: reviewData.feedback.trim() || undefined
      }));
      
      setReviewingSubmission(null);
      setReviewData({ grade: '', feedback: '' });
    } catch (error) {
      console.error('Review submission error:', error);
    }
  };

  const handleReviewChange = (field, value) => {
    setReviewData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
          <p className="text-gray-600">Submissions ({submissions.length})</p>
        </div>
      </div>

      {/* Assignment Details */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <span className="ml-2 text-gray-900">{assignment.status}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Due Date:</span>
            <span className="ml-2 text-gray-900">{formatDate(assignment.dueDate)}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Created:</span>
            <span className="ml-2 text-gray-900">{formatDate(assignment.createdAt)}</span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-gray-700">{assignment.description}</p>
        </div>
      </div>

      {/* Submissions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Student Submissions
          </h2>
        </div>

        {loading ? (
          <div className="p-8">
            <LoadingSpinner size="large" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No submissions yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {submissions.map((submission) => (
              <div key={submission._id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {submission.studentName}
                    </h3>
                    <p className="text-sm text-gray-500">{submission.studentEmail}</p>
                    <p className="text-sm text-gray-500">
                      Submitted: {formatDate(submission.submittedAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {submission.reviewed && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Reviewed
                      </span>
                    )}
                    {submission.grade && (
                      <span className="text-lg font-semibold text-primary-600">
                        {submission.grade}/100
                      </span>
                    )}
                  </div>
                </div>

                {/* Student Answer */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Student Answer:</h4>
                  <p className="text-gray-900 whitespace-pre-wrap">{submission.answer}</p>
                </div>

                {/* Review Section */}
                {reviewingSubmission === submission._id ? (
                  <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                    <h4 className="font-medium text-gray-700">Review Submission</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Grade (0-100)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={reviewData.grade}
                          onChange={(e) => handleReviewChange('grade', e.target.value)}
                          className="input-field"
                          placeholder="Enter grade"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Feedback
                      </label>
                      <textarea
                        rows={4}
                        value={reviewData.feedback}
                        onChange={(e) => handleReviewChange('feedback', e.target.value)}
                        className="input-field resize-none"
                        placeholder="Enter feedback for the student"
                        maxLength={1000}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {reviewData.feedback.length}/1000 characters
                      </p>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={handleCancelReview}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReviewSubmit(submission._id)}
                        className="btn-primary"
                      >
                        Save Review
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {submission.feedback && (
                      <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-700 mb-2">Previous Feedback:</h4>
                        <p className="text-gray-900">{submission.feedback}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleStartReview(submission)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        {submission.reviewed ? 'Update Review' : 'Review Submission'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionList;
