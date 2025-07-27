import { create } from 'zustand';
import { DashboardStats, TaskAnalytics, UserAnalytics, SystemHealth } from '@/types';

interface DashboardState {
  // State
  stats: DashboardStats | null;
  taskAnalytics: TaskAnalytics | null;
  userAnalytics: UserAnalytics | null;
  systemHealth: SystemHealth | null;
  isLoading: boolean;
  lastUpdated: Date | null;
  
  // Actions
  setStats: (stats: DashboardStats) => void;
  setTaskAnalytics: (analytics: TaskAnalytics) => void;
  setUserAnalytics: (analytics: UserAnalytics) => void;
  setSystemHealth: (health: SystemHealth) => void;
  setLoading: (loading: boolean) => void;
  refreshData: () => void;
  reset: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  // Initial State
  stats: null,
  taskAnalytics: null,
  userAnalytics: null,
  systemHealth: null,
  isLoading: false,
  lastUpdated: null,

  // Actions
  setStats: (stats: DashboardStats) => {
    set({
      stats,
      lastUpdated: new Date(),
    });
  },

  setTaskAnalytics: (taskAnalytics: TaskAnalytics) => {
    set({
      taskAnalytics,
      lastUpdated: new Date(),
    });
  },

  setUserAnalytics: (userAnalytics: UserAnalytics) => {
    set({
      userAnalytics,
      lastUpdated: new Date(),
    });
  },

  setSystemHealth: (systemHealth: SystemHealth) => {
    set({
      systemHealth,
      lastUpdated: new Date(),
    });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  refreshData: () => {
    // This will be called to trigger data refresh
    // The actual data fetching will be handled by React Query
    set({ isLoading: true });
  },

  reset: () => {
    set({
      stats: null,
      taskAnalytics: null,
      userAnalytics: null,
      systemHealth: null,
      isLoading: false,
      lastUpdated: null,
    });
  },
}));
