import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await axios.post('http://localhost:8080/api/auth/login', credentials);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return { token, user };
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string }) => {
    const response = await axios.post('http://localhost:8080/api/auth/register', userData);
    console.log("Hi");
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return { token, user };
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe', async (_, { getState }) => {
  const state = getState() as { auth: AuthState };
  const response = await axios.get('http://localhost:8080/api/auth/me', {
    headers: { Authorization: `Bearer ${state.auth.token}` },
  });
  return response.data.user;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get user data';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer; 