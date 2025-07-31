import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';
import { Group, GroupDocument } from '../groups/group.schema';
import { Task, TaskDocument } from '../tasks/task.schema';

export interface DashboardStats {
  totalUsers: number;
  totalGroups: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  activeUsers: number;
  taskCompletionRate: number;
}

export interface UserActivityStats {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export interface TaskPerformanceStats {
  tasksCreatedToday: number;
  tasksCompletedToday: number;
  averageCompletionTime: number;
  overdueTasksCount: number;
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

export interface GroupOverviewStats {
  totalGroups: number;
  activeGroups: number;
  averageMembersPerGroup: number;
  groupsCreatedThisMonth: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  async getDashboardStats(): Promise<{
    success: boolean;
    message: string;
    data: DashboardStats;
  }> {
    try {
      // Paralel sorguları çalıştır
      const [
        totalUsers,
        totalGroups,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        activeUsers,
      ] = await Promise.all([
        this.userModel.countDocuments({ status: 'active' }),
        this.groupModel.countDocuments({ status: 'active' }),
        this.taskModel.countDocuments({ isActive: true }),
        this.taskModel.countDocuments({ status: 'completed', isActive: true }),
        this.taskModel.countDocuments({ status: 'pending', isActive: true }),
        this.taskModel.countDocuments({ 
          status: { $in: ['pending', 'in_progress'] },
          dueDate: { $lt: new Date() },
          isActive: true 
        }),
        this.userModel.countDocuments({ 
          status: 'active',
          lastLoginAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Son 7 gün
        }),
      ]);

      const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      const stats: DashboardStats = {
        totalUsers,
        totalGroups,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        activeUsers,
        taskCompletionRate: Math.round(taskCompletionRate * 100) / 100,
      };

      return {
        success: true,
        message: 'Dashboard istatistikleri başarıyla getirildi',
        data: stats,
      };
    } catch (error) {
      throw new Error(`Dashboard istatistikleri getirilemedi: ${error.message}`);
    }
  }

  async getGeneralStats(period?: string): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    try {
      const periodDate = this.getPeriodDate(period);
      
      const stats = await Promise.all([
        this.userModel.countDocuments({ 
          createdAt: { $gte: periodDate },
          status: 'active' 
        }),
        this.taskModel.countDocuments({ 
          createdAt: { $gte: periodDate },
          isActive: true 
        }),
        this.groupModel.countDocuments({ 
          createdAt: { $gte: periodDate },
          status: 'active' 
        }),
      ]);

      return {
        success: true,
        message: 'Genel istatistikler başarıyla getirildi',
        data: {
          newUsers: stats[0],
          newTasks: stats[1],
          newGroups: stats[2],
          period: period || 'all',
        },
      };
    } catch (error) {
      throw new Error(`Genel istatistikler getirilemedi: ${error.message}`);
    }
  }

  async getUserActivityStats(period?: string): Promise<{
    success: boolean;
    message: string;
    data: UserActivityStats;
  }> {
    try {
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers,
        newUsersThisWeek,
        newUsersThisMonth,
      ] = await Promise.all([
        this.userModel.countDocuments({ 
          lastLoginAt: { $gte: dayAgo },
          status: 'active'
        }),
        this.userModel.countDocuments({ 
          lastLoginAt: { $gte: weekAgo },
          status: 'active'
        }),
        this.userModel.countDocuments({ 
          lastLoginAt: { $gte: monthAgo },
          status: 'active'
        }),
        this.userModel.countDocuments({ 
          createdAt: { $gte: weekAgo },
          status: 'active'
        }),
        this.userModel.countDocuments({ 
          createdAt: { $gte: monthAgo },
          status: 'active'
        }),
      ]);

      const stats: UserActivityStats = {
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers,
        newUsersThisWeek,
        newUsersThisMonth,
      };

      return {
        success: true,
        message: 'Kullanıcı aktivite istatistikleri başarıyla getirildi',
        data: stats,
      };
    } catch (error) {
      throw new Error(`Kullanıcı aktivite istatistikleri getirilemedi: ${error.message}`);
    }
  }

  async getTaskPerformanceStats(period?: string): Promise<{
    success: boolean;
    message: string;
    data: TaskPerformanceStats;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [
        tasksCreatedToday,
        tasksCompletedToday,
        overdueTasksCount,
        tasksByPriority,
        averageCompletionData,
      ] = await Promise.all([
        this.taskModel.countDocuments({ 
          createdAt: { $gte: today, $lt: tomorrow },
          isActive: true 
        }),
        this.taskModel.countDocuments({ 
          completedAt: { $gte: today, $lt: tomorrow },
          status: 'completed',
          isActive: true 
        }),
        this.taskModel.countDocuments({ 
          status: { $in: ['pending', 'in_progress'] },
          dueDate: { $lt: new Date() },
          isActive: true 
        }),
        this.taskModel.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]),
        this.taskModel.aggregate([
          { 
            $match: { 
              status: 'completed',
              completedAt: { $exists: true },
              createdAt: { $exists: true },
              isActive: true 
            } 
          },
          { 
            $project: { 
              completionTime: { 
                $subtract: ['$completedAt', '$createdAt'] 
              } 
            } 
          },
          { 
            $group: { 
              _id: null, 
              avgTime: { $avg: '$completionTime' } 
            } 
          }
        ]),
      ]);

      const priorityStats = {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0,
      };

      tasksByPriority.forEach((item: any) => {
        if (priorityStats.hasOwnProperty(item._id)) {
          priorityStats[item._id] = item.count;
        }
      });

      const averageCompletionTime = averageCompletionData.length > 0 
        ? Math.round(averageCompletionData[0].avgTime / (1000 * 60 * 60)) // saat cinsinden
        : 0;

      const stats: TaskPerformanceStats = {
        tasksCreatedToday,
        tasksCompletedToday,
        averageCompletionTime,
        overdueTasksCount,
        tasksByPriority: priorityStats,
      };

      return {
        success: true,
        message: 'Görev performans istatistikleri başarıyla getirildi',
        data: stats,
      };
    } catch (error) {
      throw new Error(`Görev performans istatistikleri getirilemedi: ${error.message}`);
    }
  }

  async getGroupOverviewStats(): Promise<{
    success: boolean;
    message: string;
    data: GroupOverviewStats;
  }> {
    try {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const [
        totalGroups,
        activeGroups,
        groupsCreatedThisMonth,
        memberStats,
      ] = await Promise.all([
        this.groupModel.countDocuments(),
        this.groupModel.countDocuments({ status: 'active' }),
        this.groupModel.countDocuments({ 
          createdAt: { $gte: monthAgo },
          status: 'active' 
        }),
        this.groupModel.aggregate([
          { $match: { status: 'active' } },
          { 
            $project: { 
              memberCount: { $size: '$members' } 
            } 
          },
          { 
            $group: { 
              _id: null, 
              avgMembers: { $avg: '$memberCount' } 
            } 
          }
        ]),
      ]);

      const averageMembersPerGroup = memberStats.length > 0 
        ? Math.round(memberStats[0].avgMembers * 100) / 100
        : 0;

      const stats: GroupOverviewStats = {
        totalGroups,
        activeGroups,
        averageMembersPerGroup,
        groupsCreatedThisMonth,
      };

      return {
        success: true,
        message: 'Grup genel bakış istatistikleri başarıyla getirildi',
        data: stats,
      };
    } catch (error) {
      throw new Error(`Grup genel bakış istatistikleri getirilemedi: ${error.message}`);
    }
  }

  private getPeriodDate(period?: string): Date {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0); // Beginning of time
    }
  }
}
