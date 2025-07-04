// Group modeli için tür tanımlamaları

import { User } from './task.types';

export enum GroupRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export interface GroupMember {
  user: User;
  role: GroupRole;
  joinedAt: string;
  permissions: {
    canCreateTasks: boolean;
    canAssignTasks: boolean;
    canDeleteTasks: boolean;
    canManageMembers: boolean;
  };
}

export interface GroupSettings {
  canMembersCreateTasks: boolean;
  canMembersAssignTasks: boolean;
  canMembersDeleteTasks: boolean;
  requireApprovalForTasks: boolean;
  allowMusicIntegration: boolean;
  maxTasksPerMember: number;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  isPrivate: boolean;
  inviteCode?: string;
  owner: User;
  members: GroupMember[];
  settings: GroupSettings;
  stats: {
    totalTasks: number;
    completedTasks: number;
    activeTasks: number;
    totalMembers: number;
  };
  createdAt: string;
  updatedAt: string;
}

// DTO'lar
export interface CreateGroupDto {
  name: string;
  description?: string;
  isPrivate: boolean;
  settings?: Partial<GroupSettings>;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
  isPrivate?: boolean;
  settings?: Partial<GroupSettings>;
}

export interface JoinGroupDto {
  inviteCode: string;
}

export interface InviteMemberDto {
  email: string;
  role?: GroupRole;
}

// Redux Store için state türleri
export interface GroupsState {
  groups: Group[];
  currentGroup: Group | null;
  loading: boolean;
  error: string | null;
}
