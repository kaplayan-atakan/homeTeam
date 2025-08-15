import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppState } from '@/types';

const initialState: AppState = {
  theme: 'system',
  language: 'tr',
  isOnline: true,
  lastSync: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setLastSync: (state, action: PayloadAction<Date>) => {
      state.lastSync = action.payload;
    },
  },
});

export const { setTheme, setLanguage, setOnlineStatus, setLastSync } = appSlice.actions;
export default appSlice.reducer;
