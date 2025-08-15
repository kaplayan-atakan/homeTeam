import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Group, GroupState } from '@/types';

const initialState: GroupState = {
  groups: [],
  selectedGroup: null,
  isLoading: false,
  error: null,
};

const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    setGroups: (state, action: PayloadAction<Group[]>) => {
      state.groups = action.payload;
    },
    addGroup: (state, action: PayloadAction<Group>) => {
      state.groups.push(action.payload);
    },
    updateGroup: (state, action: PayloadAction<Group>) => {
      const index = state.groups.findIndex(group => group.id === action.payload.id);
      if (index !== -1) {
        state.groups[index] = action.payload;
      }
    },
    setSelectedGroup: (state, action: PayloadAction<Group | null>) => {
      state.selectedGroup = action.payload;
    },
  },
});

export const { setGroups, addGroup, updateGroup, setSelectedGroup } = groupSlice.actions;
export default groupSlice.reducer;
