import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { groupsApi } from '../../services/api';

export type Group = { id: string; name: string; membersCount?: number };
export type GroupsState = { items: Group[]; loading: boolean; error?: string };

const initialState: GroupsState = { items: [], loading: false };

export const fetchGroups = createAsyncThunk('groups/fetch', async () => {
  const res = await groupsApi.list({ page: 1, limit: 50 });
  const data = res?.data ?? res;
  return (data.items ?? data) as Group[];
});

const slice = createSlice({
  name: 'groups',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchGroups.pending, (s) => { s.loading = true; s.error = undefined; });
    b.addCase(fetchGroups.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; });
    b.addCase(fetchGroups.rejected, (s, a) => { s.loading = false; s.error = a.error.message; });
  },
});

export const groupsReducer = slice.reducer;
export { slice as groupsSlice };
