import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, LoginRequest, LoginResponse } from '../../types';
import { authService } from '../../services/authService';

interface AuthSliceState extends AuthState {
  loading: boolean;
  error: string | null;
}

const getInitialState = (): AuthSliceState => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      return { ...user, token, isAuthenticated: true, loading: false, error: null };
    } catch {
      // fall through
    }
  }
  return {
    token: null,
    username: null,
    fullName: null,
    role: null,
    providerId: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };
};

export const loginAsync = createAsyncThunk<LoginResponse, LoginRequest, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; username: string; fullName: string; role: string; providerId: number | null }>) {
      const { token, username, fullName, role, providerId } = action.payload;
      state.token = token;
      state.username = username;
      state.fullName = fullName;
      state.role = role;
      state.providerId = providerId;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ username, fullName, role, providerId }));
    },
    logout(state) {
      state.token = null;
      state.username = null;
      state.fullName = null;
      state.role = null;
      state.providerId = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.username = action.payload.username;
        state.fullName = action.payload.fullName;
        state.role = action.payload.role;
        state.providerId = action.payload.providerId;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify({
          username: action.payload.username,
          fullName: action.payload.fullName,
          role: action.payload.role,
          providerId: action.payload.providerId,
        }));
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Login failed';
      });
  },
});

export const { setCredentials, logout, clearError } = authSlice.actions;

export const selectAuth = (state: { auth: AuthSliceState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthSliceState }) => state.auth.isAuthenticated;
export const selectRole = (state: { auth: AuthSliceState }) => state.auth.role;
export const selectHasRole = (roles: string[]) => (state: { auth: AuthSliceState }) =>
  state.auth.role ? roles.includes(state.auth.role) : false;

export default authSlice.reducer;
