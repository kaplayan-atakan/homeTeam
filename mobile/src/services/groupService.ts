import { apiClient } from './apiClient';
import { Group, GroupRole } from '../types/group.types';

interface CreateGroupData {
  name: string;
  description: string;
  isPrivate?: boolean;
}

interface UpdateGroupData {
  name?: string;
  description?: string;
  isPrivate?: boolean;
}

interface GroupMember {
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

interface GroupStats {
  totalMembers: number;
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

class GroupService {
  // Get user's groups
  async getUserGroups() {
    return await apiClient.getData('/groups/my');
  }

  // Create new group
  async createGroup(data: CreateGroupData) {
    return await apiClient.postData('/groups', data);
  }

  // Get group by ID
  async getGroupById(groupId: string) {
    return await apiClient.getData(`/groups/${groupId}`);
  }

  // Update group
  async updateGroup(groupId: string, data: UpdateGroupData) {
    return await apiClient.putData(`/groups/${groupId}`, data);
  }

  // Delete group
  async deleteGroup(groupId: string) {
    return await apiClient.deleteData(`/groups/${groupId}`);
  }

  // Get group members
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    return await apiClient.getData(`/groups/${groupId}/members`);
  }

  // Add member to group
  async addMember(groupId: string, userId: string, role: GroupRole = GroupRole.MEMBER) {
    return await apiClient.postData(`/groups/${groupId}/members`, { userId, role });
  }

  // Remove member from group
  async removeMember(groupId: string, userId: string) {
    return await apiClient.deleteData(`/groups/${groupId}/members/${userId}`);
  }

  // Update member role
  async updateMemberRole(groupId: string, userId: string, role: GroupRole) {
    return await apiClient.putData(`/groups/${groupId}/members/${userId}`, { role });
  }

  // Get group stats
  async getGroupStats(groupId: string): Promise<GroupStats> {
    return await apiClient.getData(`/groups/${groupId}/stats`);
  }

  // Search groups
  async searchGroups(query: string) {
    return await apiClient.getData(`/groups/search?q=${encodeURIComponent(query)}`);
  }

  // Get public groups
  async getPublicGroups() {
    return await apiClient.getData('/groups/public');
  }

  // Join public group
  async joinGroup(groupId: string) {
    return await apiClient.postData(`/groups/${groupId}/join`);
  }

  // Leave group
  async leaveGroup(groupId: string) {
    return await apiClient.deleteData(`/groups/${groupId}/leave`);
  }

  // Get group tasks
  async getGroupTasks(groupId: string) {
    return await apiClient.getData(`/groups/${groupId}/tasks`);
  }

  // Get group activity/logs
  async getGroupActivity(groupId: string) {
    return await apiClient.getData(`/groups/${groupId}/activity`);
  }
}

export const groupService = new GroupService();
export type { CreateGroupData, UpdateGroupData, GroupMember, GroupStats };
