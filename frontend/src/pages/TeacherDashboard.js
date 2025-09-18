import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus,
  setFilter,
  clearError
} from '../redux/slices/assignmentSlice';
import { fetchSubmissionsByAssignment, clearAssignmentSubmissions } from '../redux/slices/submissionSlice';
import { formatDate, formatDateOnly, getStatusColor, isOverdue } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import AssignmentForm from '../components/AssignmentForm';
import SubmissionList from '../components/SubmissionList';
import AnalyticsCard from '../components/AnalyticsCard';

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const { assignments, loading, error, filter, pagination } = useSelector((state) => state.assignments);
  const { assignmentSubmissions } = useSelector((state) => state.submissions);
  
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [viewingSubmissions, setViewingSubmissions] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAssignments({ 
      status: filter === 'all' ? undefined : filter,
      page: currentPage,
      limit: 10
    }));
  }, [dispatch, filter, currentPage]);

  const handleFilterChange = (newFilter) => {
    dispatch(setFilter(newFilter));
    setCurrentPage(1);
  };

  const handleCreateAssignment = () => {
    setEditingAssignment(null);
    setShowAssignmentForm(true);
  };

  const handleEditAssignment = (assignment) => {
    if (assignment.status !== 'Draft') {
      alert('Only draft assignments can be edited');
      return;
    }
    setEditingAssignment(assignment);
    setShowAssignmentForm(true);
  };

  const handleDeleteAssignment = async (assignment) => {
    if (assignment.status !== 'Draft') {
      alert('Only draft assignments can be deleted');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      await dispatch(deleteAssignment(assignment._id));
    }
  };

  const handleStatusUpdate = async (assignment, newStatus) => {
    const validTransitions = {
      'Draft': ['Published'],
      'Published': ['Completed'],
      'Completed': []
    };

    if (!validTransitions[assignment.status].includes(newStatus)) {
      alert(`Cannot change status from ${assignment.status} to ${newStatus}`);
      return;
    }

    await dispatch(updateAssignmentStatus({ id: assignment._id, status: newStatus }));
  };

  const handleViewSubmissions = async (assignment) => {
    setViewingSubmissions(assignment);
    await dispatch(fetchSubmissionsByAssignment(assignment._id));
  };

  const handleCloseSubmissions = () => {
    setViewingSubmissions(null);
    dispatch(clearAssignmentSubmissions());
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingAssignment) {
        await dispatch(updateAssignment({ id: editingAssignment._id, data: formData }));
      } else {
        await dispatch(createAssignment(formData));
      }
      setShowAssignmentForm(false);
      setEditingAssignment(null);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleFormCancel = () => {
    setShowAssignmentForm(false);
    setEditingAssignment(null);
  };

  const getNextStatus = (currentStatus) => {
    const transitions = {
      'Draft': 'Published',
      'Published': 'Completed',
      'Completed': null
    };
    return transitions[currentStatus];
  };

  if (viewingSubmissions) {
    return (
      <SubmissionList 
        assignment={viewingSubmissions}
        submissions={assignmentSubmissions}
        onBack={handleCloseSubmissions}
      />
    );
  }

  if (showAssignmentForm) {
    return (
      <AssignmentForm
        assignment={editingAssignment}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your assignments and view submissions</p>
        </div>
        <button
          onClick={handleCreateAssignment}
          className="btn-primary w-full sm:w-auto"
        >
          Create Assignment
        </button>
      </div>

      <ErrorMessage 
        message={error} 
        onClose={() => dispatch(clearError())} 
      />

      {/* Analytics Card */}
      <AnalyticsCard />

      {/* Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by status:</span>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {['all', 'Draft', 'Published', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`px-3 py-1.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Assignments ({assignments.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8">
            <LoadingSpinner size="large" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No assignments found. Create your first assignment!
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <div key={assignment._id} className="p-4 sm:p-6 hover:bg-gray-50">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900">
                        {assignment.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </span>
                      {isOverdue(assignment.dueDate) && assignment.status !== 'Completed' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-2">
                      {assignment.description}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0 sm:space-x-4">
                      <span>Due: {formatDate(assignment.dueDate)}</span>
                      <span>Created: {formatDateOnly(assignment.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 lg:ml-4">
                    {/* View Submissions Button */}
                    {assignment.status !== 'Draft' && (
                      <button
                        onClick={() => handleViewSubmissions(assignment)}
                        className="text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-medium py-1 px-2 rounded hover:bg-primary-50 transition-colors w-full sm:w-auto text-center"
                      >
                        View Submissions
                      </button>
                    )}

                    {/* Edit Button */}
                    {assignment.status === 'Draft' && (
                      <button
                        onClick={() => handleEditAssignment(assignment)}
                        className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium py-1 px-2 rounded hover:bg-blue-50 transition-colors w-full sm:w-auto text-center"
                      >
                        Edit
                      </button>
                    )}

                    {/* Status Update Button */}
                    {getNextStatus(assignment.status) && (
                      <button
                        onClick={() => handleStatusUpdate(assignment, getNextStatus(assignment.status))}
                        className="text-green-600 hover:text-green-700 text-xs sm:text-sm font-medium py-1 px-2 rounded hover:bg-green-50 transition-colors w-full sm:w-auto text-center"
                      >
                        Mark as {getNextStatus(assignment.status)}
                      </button>
                    )}

                    {/* Delete Button */}
                    {assignment.status === 'Draft' && (
                      <button
                        onClick={() => handleDeleteAssignment(assignment)}
                        className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium py-1 px-2 rounded hover:bg-red-50 transition-colors w-full sm:w-auto text-center"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="text-xs sm:text-sm text-gray-700">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-2 sm:px-3 py-1 rounded border border-gray-300 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-2 sm:px-3 py-1 rounded border border-gray-300 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
