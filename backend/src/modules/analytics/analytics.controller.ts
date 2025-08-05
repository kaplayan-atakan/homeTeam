import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // Dashboard istatistikleri (admin only)
  @Get('dashboard')
  @Roles(UserRole.ADMIN)
  async getDashboardStats() {
    return await this.analyticsService.getDashboardStats();
  }

  // Genel istatistikler (admin only)
  @Get('stats')
  @Roles(UserRole.ADMIN)
  async getGeneralStats(@Query('period') period?: string) {
    return await this.analyticsService.getGeneralStats(period);
  }

  // Kullanıcı aktivite istatistikleri
  @Get('users/activity')
  @Roles(UserRole.ADMIN)
  async getUserActivityStats(@Query('period') period?: string) {
    return await this.analyticsService.getUserActivityStats(period);
  }

  // Görev istatistikleri
  @Get('tasks/performance')
  @Roles(UserRole.ADMIN)
  async getTaskPerformanceStats(@Query('period') period?: string) {
    return await this.analyticsService.getTaskPerformanceStats(period);
  }

  // Grup istatistikleri
  @Get('groups/overview')
  @Roles(UserRole.ADMIN)
  async getGroupOverviewStats() {
    return await this.analyticsService.getGroupOverviewStats();
  }
}
