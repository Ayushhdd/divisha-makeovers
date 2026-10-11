import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';
import { getPortalRole, loadSession, saveSession, clearSession } from '../utils/authSession';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password, rememberMe, adminOnly = false }, { rejectWithValue }) => {
    try {
      const role = adminOnly ? 'admin' : 'customer';
      const { data } = await api.post('/auth/login', { email, password, rememberMe, adminOnly, customerOnly: !adminOnly });
      if (data.role !== role) {
        return rejectWithValue(`A ${role} account is required to sign in here.`);
      }
      saveSession(role, data);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      saveSession('customer', data);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const fetchProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/profile');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...loadSession(getPortalRole()),
    portalRole: getPortalRole(),
    loading: false,
    error: null,
  },
  reducers: {
    activatePortal: (state, action) => {
      if (state.portalRole === action.payload) return;
      Object.assign(state, loadSession(action.payload));
      state.portalRole = action.payload;
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      clearSession(state.portalRole);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        if (action.payload.role !== state.portalRole) return;
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        if (state.portalRole !== 'customer') return;
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        if (!state.token || action.payload.role !== state.portalRole) return;
        state.user = { ...state.user, ...action.payload };
        saveSession(state.portalRole, { ...state.user, token: state.token });
      });
  },
});

export const { logout, clearError, activatePortal } = authSlice.actions;
export default authSlice.reducer;
