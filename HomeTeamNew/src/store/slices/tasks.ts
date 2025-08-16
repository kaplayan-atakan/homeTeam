import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { tasksApi } from '../../services/api';

export type Task = { id: string; title: string; status?: string; dueDate?: string };
export type TasksState = { items: Task[]; loading: boolean; error?: string };

const initialState: TasksState = { items: [], loading: false };

export const fetchTasks = createAsyncThunk('tasks/fetch', async () => {
  const res = await tasksApi.list({ page: 1, limit: 50 });
  const data = res?.data ?? res;
  return (data.items ?? data) as Task[];
});

const slice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchTasks.pending, (s) => { s.loading = true; s.error = undefined; });
    b.addCase(fetchTasks.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; });
    b.addCase(fetchTasks.rejected, (s, a) => { s.loading = false; s.error = a.error.message; });
  },
});

export const tasksReducer = slice.reducer;
export { slice as tasksSlice };
