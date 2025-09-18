import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchAssignments = createAsyncThunk(
  'assignments/fetchAssignments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const url = `/assignments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch assignments';
      return rejectWithValue(message);
    }
  }
);

export const createAssignment = createAsyncThunk(
  'assignments/createAssignment',
  async (assignmentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/assignments', assignmentData);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create assignment';
      return rejectWithValue(message);
    }
  }
);

export const updateAssignment = createAsyncThunk(
  'assignments/updateAssignment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/assignments/${id}`, data);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update assignment';
      return rejectWithValue(message);
    }
  }
);

export const deleteAssignment = createAsyncThunk(
  'assignments/deleteAssignment',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/assignments/${id}`);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete assignment';
      return rejectWithValue(message);
    }
  }
);

export const updateAssignmentStatus = createAsyncThunk(
  'assignments/updateAssignmentStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/assignments/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update assignment status';
      return rejectWithValue(message);
    }
  }
);

export const fetchSingleAssignment = createAsyncThunk(
  'assignments/fetchSingleAssignment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/assignments/${id}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch assignment';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  assignments: [],
  currentAssignment: null,
  loading: false,
  error: null,
  filter: 'all',
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalAssignments: 0,
    hasNext: false,
    hasPrev: false,
  },
};

const assignmentSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAssignment: (state) => {
      state.currentAssignment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch assignments
      .addCase(fetchAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload.data;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create assignment
      .addCase(createAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments.unshift(action.payload);
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update assignment
      .addCase(updateAssignment.fulfilled, (state, action) => {
        const index = state.assignments.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
      })
      // Delete assignment
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.assignments = state.assignments.filter(a => a._id !== action.payload);
      })
      // Update assignment status
      .addCase(updateAssignmentStatus.fulfilled, (state, action) => {
        const index = state.assignments.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
      })
      // Fetch single assignment
      .addCase(fetchSingleAssignment.fulfilled, (state, action) => {
        state.currentAssignment = action.payload;
      });
  },
});

export const { setFilter, clearError, clearCurrentAssignment } = assignmentSlice.actions;
export default assignmentSlice.reducer;
