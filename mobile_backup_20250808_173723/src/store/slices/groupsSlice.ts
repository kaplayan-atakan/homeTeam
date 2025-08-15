import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { groupService } from '../../services/groupService';
import { GroupRole } from '../../types/group.types';

export interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: GroupRole;
  joinedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface GroupStats {
  totalMembers: number;
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

export interface GroupsState {
  groups: Group[];
  currentGroup: Group | null;
  groupMembers: GroupMember[];
  groupStats: GroupStats | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  groups: [],
  currentGroup: null,
  groupMembers: [],
  groupStats: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
};

// Real API Async Thunks - NO MORE MOCK DATA!
export const fetchUserGroupsAsync = createAsyncThunk(
  'groups/fetchUserGroups',
  async (_, { rejectWithValue }) => {
    try {
      return await groupService.getUserGroups();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Gruplar yüklenirken hata oluştu');
    }
  }
);

export const fetchGroupByIdAsync = createAsyncThunk(
  'groups/fetchGroupById',
  async (groupId: string, { rejectWithValue }) => {
    try {
      return await groupService.getGroupById(groupId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Grup yüklenirken hata oluştu');
    }
  }
);

export const createGroupAsync = createAsyncThunk(
  'groups/createGroup',
  async (groupData: { name: string; description: string }, { rejectWithValue }) => {
    try {
      return await groupService.createGroup(groupData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Grup oluşturulurken hata oluştu');
    }
  }
);

export const updateGroupAsync = createAsyncThunk(
  'groups/updateGroup',
  async ({ 
    groupId, 
    groupData 
  }: { 
    groupId: string; 
    groupData: { name?: string; description?: string } 
  }, { rejectWithValue }) => {
    try {
      return await groupService.updateGroup(groupId, groupData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Grup güncellenirken hata oluştu');
    }
  }
);

export const deleteGroupAsync = createAsyncThunk(
  'groups/deleteGroup',
  async (groupId: string, { rejectWithValue }) => {
    try {
      await groupService.deleteGroup(groupId);
      return groupId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Grup silinirken hata oluştu');
    }
  }
);

export const addMemberAsync = createAsyncThunk(
  'groups/addMember',
  async ({ 
    groupId, 
    memberData 
  }: { 
    groupId: string; 
    memberData: { userId: string; role?: GroupRole } 
  }, { rejectWithValue }) => {
    try {
      return await groupService.addMember(groupId, memberData.userId, memberData.role);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Üye eklenirken hata oluştu');
    }
  }
);

export const removeMemberAsync = createAsyncThunk(
  'groups/removeMember',
  async ({ groupId, userId }: { groupId: string; userId: string }, { rejectWithValue }) => {
    try {
      await groupService.removeMember(groupId, userId);
      return { groupId, userId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Üye çıkarılırken hata oluştu');
    }
  }
);

export const fetchGroupMembersAsync = createAsyncThunk(
  'groups/fetchGroupMembers',
  async (groupId: string, { rejectWithValue }) => {
    try {
      return await groupService.getGroupMembers(groupId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Grup üyeleri yüklenirken hata oluştu');
    }
  }
);

export const fetchGroupStatsAsync = createAsyncThunk(
  'groups/fetchGroupStats',
  async (groupId: string, { rejectWithValue }) => {
    try {
      return await groupService.getGroupStats(groupId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Grup istatistikleri yüklenirken hata oluştu');
    }
  }
);

export const leaveGroupAsync = createAsyncThunk(
  'groups/leaveGroup',
  async (groupId: string, { rejectWithValue }) => {
    try {
      await groupService.leaveGroup(groupId);
      return groupId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Gruptan ayrılırken hata oluştu');
    }
  }
);

export const joinGroupAsync = createAsyncThunk(
  'groups/joinGroup',
  async (inviteCode: string, { rejectWithValue }) => {
    try {
      return await groupService.joinGroup(inviteCode);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Gruba katılırken hata oluştu');
    }
  }
);

// Groups slice
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
    updateGroupInList: (state, action: PayloadAction<Group>) => {
      const updatedGroup = action.payload;
      const groupIndex = state.groups.findIndex(group => group.id === updatedGroup.id);
      
      if (groupIndex !== -1) {
        state.groups[groupIndex] = updatedGroup;
      }
      
      if (state.currentGroup && state.currentGroup.id === updatedGroup.id) {
        state.currentGroup = updatedGroup;
      }
    },
    removeGroupFromList: (state, action: PayloadAction<string>) => {
      const groupId = action.payload;
      state.groups = state.groups.filter(group => group.id !== groupId);
      
      if (state.currentGroup && state.currentGroup.id === groupId) {
        state.currentGroup = null;
      }
    },
    addGroupToList: (state, action: PayloadAction<Group>) => {
      state.groups.unshift(action.payload);
    },
    clearCurrentGroup: (state) => {
      state.currentGroup = null;
      state.groupMembers = [];
      state.groupStats = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch User Groups
    builder
      .addCase(fetchUserGroupsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserGroupsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload;
      })
      .addCase(fetchUserGroupsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Group By ID
    builder
      .addCase(fetchGroupByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGroup = action.payload;
      })
      .addCase(fetchGroupByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Group
    builder
      .addCase(createGroupAsync.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createGroupAsync.fulfilled, (state, action) => {
        state.isCreating = false;
        state.groups.unshift(action.payload);
      })
      .addCase(createGroupAsync.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Update Group
    builder
      .addCase(updateGroupAsync.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateGroupAsync.fulfilled, (state, action) => {
        state.isUpdating = false;
        groupsSlice.caseReducers.updateGroupInList(state, { 
          payload: action.payload, 
          type: 'updateGroupInList' 
        });
      })
      .addCase(updateGroupAsync.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete Group
    builder
      .addCase(deleteGroupAsync.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(deleteGroupAsync.fulfilled, (state, action) => {
        state.isUpdating = false;
        const groupId = action.payload;
        groupsSlice.caseReducers.removeGroupFromList(state, { 
          payload: groupId, 
          type: 'removeGroupFromList' 
        });
      })
      .addCase(deleteGroupAsync.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Add Member
    builder
      .addCase(addMemberAsync.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(addMemberAsync.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.groupMembers.push(action.payload);
        
        // Update member count in current group
        if (state.currentGroup) {
          state.currentGroup.memberCount += 1;
        }
      })
      .addCase(addMemberAsync.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Remove Member
    builder
      .addCase(removeMemberAsync.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(removeMemberAsync.fulfilled, (state, action) => {
        state.isUpdating = false;
        const { userId } = action.payload;
        state.groupMembers = state.groupMembers.filter(member => member.userId !== userId);
        
        // Update member count in current group
        if (state.currentGroup) {
          state.currentGroup.memberCount = Math.max(0, state.currentGroup.memberCount - 1);
        }
      })
      .addCase(removeMemberAsync.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Fetch Group Members
    builder
      .addCase(fetchGroupMembersAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupMembersAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groupMembers = action.payload;
      })
      .addCase(fetchGroupMembersAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Group Stats
    builder
      .addCase(fetchGroupStatsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupStatsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groupStats = action.payload;
      })
      .addCase(fetchGroupStatsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Leave Group
    builder
      .addCase(leaveGroupAsync.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(leaveGroupAsync.fulfilled, (state, action) => {
        state.isUpdating = false;
        const groupId = action.payload;
        groupsSlice.caseReducers.removeGroupFromList(state, { 
          payload: groupId, 
          type: 'removeGroupFromList' 
        });
      })
      .addCase(leaveGroupAsync.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Join Group
    builder
      .addCase(joinGroupAsync.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(joinGroupAsync.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.groups.push(action.payload);
      })
      .addCase(joinGroupAsync.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setCurrentGroup,
  updateGroupInList,
  removeGroupFromList,
  addGroupToList,
  clearCurrentGroup,
} = groupsSlice.actions;

export default groupsSlice.reducer;
