import { apiClient } from './apiClient';
import { ApiResponse } from '../types/task.types';
import { Group, CreateGroupDto, UpdateGroupDto } from '../types/group.types';

export class GroupService {
  async getUserGroups(): Promise<ApiResponse<Group[]>> {
    const response = await apiClient.get('/groups/my-groups');
    return response.data;
  }

  async getGroupById(groupId: string): Promise<ApiResponse<Group>> {
    const response = await apiClient.get(`/groups/${groupId}`);
    return response.data;
  }

  async createGroup(groupData: CreateGroupDto): Promise<ApiResponse<Group>> {
    const response = await apiClient.post('/groups', groupData);
    return response.data;
  }

  async updateGroup(groupId: string, groupData: UpdateGroupDto): Promise<ApiResponse<Group>> {
    const response = await apiClient.patch(`/groups/${groupId}`, groupData);
    return response.data;
  }

  async deleteGroup(groupId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/groups/${groupId}`);
    return response.data;
  }

  async joinGroup(inviteCode: string): Promise<ApiResponse<Group>> {
    const response = await apiClient.post('/groups/join', { inviteCode });
    return response.data;
  }

  async leaveGroup(groupId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post(`/groups/${groupId}/leave`);
    return response.data;
  }

  async inviteMember(groupId: string, email: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post(`/groups/${groupId}/invite`, { email });
    return response.data;
  }

  async removeMember(groupId: string, userId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/groups/${groupId}/members/${userId}`);
    return response.data;
  }

  async updateMemberRole(groupId: string, userId: string, role: string): Promise<ApiResponse<void>> {
    const response = await apiClient.patch(`/groups/${groupId}/members/${userId}/role`, { role });
    return response.data;
  }

  async generateInviteCode(groupId: string): Promise<ApiResponse<{ inviteCode: string }>> {
    const response = await apiClient.post(`/groups/${groupId}/generate-invite`);
    return response.data;
  }

  async getGroupStats(groupId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`/groups/${groupId}/stats`);
    return response.data;
  }
}

export const groupService = new GroupService();
