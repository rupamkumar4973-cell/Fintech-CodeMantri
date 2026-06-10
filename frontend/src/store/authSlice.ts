import { createSlice, type PayloadAction } from '@reduxjs/toolkit';


interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  kycStatus: 'Pending' | 'Uploaded' | 'Approved' | 'Rejected';
  createdAt: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action: PayloadAction<{ user: UserProfile; token: string; refreshToken: string }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.error = null;
      
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    updateKycStatus: (state, action: PayloadAction<'Pending' | 'Uploaded' | 'Approved' | 'Rejected'>) => {
      if (state.user) {
        state.user.kycStatus = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    authFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { authStart, authSuccess, updateKycStatus, authFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
