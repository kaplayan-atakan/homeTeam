import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GroupsState, Group, CreateGroupDto, UpdateGroupDto } from '../../types/group.types';
import { groupService } from '../../services/groupService';

// Async thunks
export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await groupService.getUserGroups();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Gruplar yüklenirken hata oluştu');
    }
  }
);

export const fetchGroupById = createAsyncThunk(
  'groups/fetchGroupById',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await groupService.getGroupById(groupId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Grup yüklenirken hata oluştu');
    }
  }
);

export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData: CreateGroupDto, { rejectWithValue }) => {
    try {
      const response = await groupService.createGroup(groupData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Grup oluşturulurken hata oluştu');
    }
  }
);

export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async ({ groupId, groupData }: { groupId: string; groupData: UpdateGroupDto }, { rejectWithValue }) => {
    try {
      const response = await groupService.updateGroup(groupId, groupData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Grup güncellenirken hata oluştu');
    }
  }
);

export const joinGroup = createAsyncThunk(
  'groups/joinGroup',
  async (inviteCode: string, { rejectWithValue }) => {
    try {
      const response = await groupService.joinGroup(inviteCode);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Gruba katılırken hata oluştu');
    }
  }
);

export const leaveGroup = createAsyncThunk(
  'groups/leaveGroup',
  async (groupId: string, { rejectWithValue }) => {
    try {
      await groupService.leaveGroup(groupId);
      return groupId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Gruptan ayrılırken hata oluştu');
    }
  }
);

// Initial state
const initialState: GroupsState = {
  groups: [],
  currentGroup: null,
  loading: false,
  error: null,
};

// Slice
const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentGroup: (state, action: PayloadAction<Group | null>) => {
      state.currentGroup = action.payload;
    },
    addGroup: (state, action: PayloadAction<Group>) => {
      state.groups.push(action.payload);
    },
    removeGroup: (state, action: PayloadAction<string>) => {
      state.groups = state.groups.filter(group => group.id !== action.payload);
      if (state.currentGroup?.id === action.payload) {
        state.currentGroup = null;
      }
    },
    updateGroupInList: (state, action: PayloadAction<Group>) => {
      const index = state.groups.findIndex(group => group.id === action.payload.id);
      if (index !== -1) {
        state.groups[index] = action.payload;
      }
      if (state.currentGroup?.id === action.payload.id) {
        state.currentGroup = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Groups
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Group By ID
    builder
      .addCase(fetchGroupById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGroup = action.payload;
        // Listedeki grubu da güncelle
        const index = state.groups.findIndex(group => group.id === action.payload.id);
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
      })
      .addCase(fetchGroupById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Group
    builder
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.push(action.payload);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Group
    builder
      .addCase(updateGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.groups.findIndex(group => group.id === action.payload.id);
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
        if (state.currentGroup?.id === action.payload.id) {
          state.currentGroup = action.payload;
        }
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Join Group
    builder
      .addCase(joinGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.push(action.payload);
      })
      .addCase(joinGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Leave Group
    builder
      .addCase(leaveGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = state.groups.filter(group => group.id !== action.payload);
        if (state.currentGroup?.id === action.payload) {
          state.currentGroup = null;
        }
      })
      .addCase(leaveGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setCurrentGroup,
  addGroup,
  removeGroup,
  updateGroupInList,
} = groupsSlice.actions;

export default groupsSlice.reducer;
