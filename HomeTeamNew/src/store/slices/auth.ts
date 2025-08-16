import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi, tokenManager } from '../../services/api';

export type User = { id: string; name: string; email: string };
export type AuthState = { token: string | null; refreshToken: string | null; user: User | null; loading: boolean; error?: string };

const initialState: AuthState = { token: null, refreshToken: null, user: null, loading: false };

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string }) => {
    const res = await authApi.login(payload);
    const data = res?.data ?? res;
    return {
      token: data.accessToken,
      refreshToken: data.refreshToken ?? null,
      user: data.user ?? null,
    } as { token: string; refreshToken: string | null; user: User | null };
  },
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload: { name: string; email: string; password: string }) => {
    const res = await authApi.register(payload);
    return res;
  },
);

export const requestResetThunk = createAsyncThunk('auth/requestReset', async (payload: { email: string }) => {
  const res = await authApi.requestPasswordReset(payload);
  return res;
});

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      tokenManager.setTokens(action.payload);
    },
    logout(state) {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      tokenManager.clear();
    },
  },
  extraReducers: (b) => {
    b.addCase(loginThunk.pending, (s) => { s.loading = true; s.error = undefined; });
    b.addCase(loginThunk.fulfilled, (s, a) => {
      s.loading = false;
      s.token = a.payload.token;
      s.refreshToken = a.payload.refreshToken;
      s.user = a.payload.user;
      tokenManager.setTokens(s.token, s.refreshToken);
    });
    b.addCase(loginThunk.rejected, (s, a) => { s.loading = false; s.error = a.error.message; });
  },
});

export const authReducer = slice.reducer;
export const { setToken, logout } = slice.actions;
export { slice as authSlice };
