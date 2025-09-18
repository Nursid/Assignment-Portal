import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics } from '../redux/slices/submissionSlice';
import LoadingSpinner from './LoadingSpinner';

const AnalyticsCard = () => {
  const dispatch = useDispatch();
  const { analytics, loading } = useSelector((state) => state.submissions);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const { overview, assignmentAnalytics } = analytics;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Overview</h3>
      
      {/* Overview Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{overview.totalAssignments}</p>
          <p className="text-sm text-blue-700">Total Assignments</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{overview.totalSubmissions}</p>
          <p className="text-sm text-green-700">Total Submissions</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">{overview.totalReviewed}</p>
          <p className="text-sm text-purple-700">Reviewed</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600">{overview.pendingReviews}</p>
          <p className="text-sm text-yellow-700">Pending Reviews</p>
        </div>
      </div>

      {/* Assignment Details */}
      {assignmentAnalytics.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Assignment Breakdown</h4>
          <div className="space-y-3">
            {assignmentAnalytics.slice(0, 5).map((assignment) => (
              <div key={assignment.assignmentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 truncate">{assignment.title}</p>
                  <p className="text-sm text-gray-500">
                    {assignment.totalSubmissions} submissions • {assignment.reviewedSubmissions} reviewed
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    {assignment.averageGrade ? `Avg: ${assignment.averageGrade}%` : 'No grades'}
                  </p>
                  <p className="text-xs text-gray-500">{assignment.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCard;
