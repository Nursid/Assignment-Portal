import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const createSubmission = createAsyncThunk(
  'submissions/createSubmission',
  async (submissionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/submissions', submissionData);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit assignment';
      return rejectWithValue(message);
    }
  }
);

export const fetchMySubmissions = createAsyncThunk(
  'submissions/fetchMySubmissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/submissions/my-submissions');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch submissions';
      return rejectWithValue(message);
    }
  }
);

export const fetchSubmissionsByAssignment = createAsyncThunk(
  'submissions/fetchSubmissionsByAssignment',
  async (assignmentId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/submissions/${assignmentId}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch submissions';
      return rejectWithValue(message);
    }
  }
);

export const reviewSubmission = createAsyncThunk(
  'submissions/reviewSubmission',
  async ({ id, grade, feedback }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/submissions/${id}/review`, { grade, feedback });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to review submission';
      return rejectWithValue(message);
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'submissions/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch analytics';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  submissions: [],
  mySubmissions: [],
  assignmentSubmissions: [],
  analytics: null,
  loading: false,
  error: null,
  submissionSuccess: false,
};

const submissionSlice = createSlice({
  name: 'submissions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSubmissionSuccess: (state) => {
      state.submissionSuccess = false;
    },
    clearAssignmentSubmissions: (state) => {
      state.assignmentSubmissions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Create submission
      .addCase(createSubmission.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.submissionSuccess = false;
      })
      .addCase(createSubmission.fulfilled, (state, action) => {
        state.loading = false;
        state.mySubmissions.push(action.payload);
        state.submissionSuccess = true;
      })
      .addCase(createSubmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.submissionSuccess = false;
      })
      // Fetch my submissions
      .addCase(fetchMySubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMySubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.mySubmissions = action.payload;
      })
      .addCase(fetchMySubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch submissions by assignment
      .addCase(fetchSubmissionsByAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubmissionsByAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.assignmentSubmissions = action.payload;
      })
      .addCase(fetchSubmissionsByAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Review submission
      .addCase(reviewSubmission.fulfilled, (state, action) => {
        const index = state.assignmentSubmissions.findIndex(s => s._id === action.payload.submissionId);
        if (index !== -1) {
          state.assignmentSubmissions[index].reviewed = true;
          state.assignmentSubmissions[index].grade = action.payload.grade;
          state.assignmentSubmissions[index].feedback = action.payload.feedback;
        }
      })
      // Fetch analytics
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      });
  },
});

export const { clearError, clearSubmissionSuccess, clearAssignmentSubmissions } = submissionSlice.actions;
export default submissionSlice.reducer;
