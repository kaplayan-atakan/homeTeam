'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, BarChart3, CheckSquare, Users } from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth.store';
import type { DashboardStats } from '@/types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

type TaskPerformance = {
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
};

type UserActivity = {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
};

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, tokens } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !tokens?.accessToken) {
      router.replace('/login');
    }
  }, [isAuthenticated, tokens, router]);

  const { data: overview } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => apiClient.get<DashboardStats>(API_ENDPOINTS.ANALYTICS_DASHBOARD),
    enabled: isAuthenticated && !!tokens?.accessToken,
    staleTime: 30_000,
  });

  const { data: taskPerf } = useQuery({
    queryKey: ['analytics', 'tasks', 'performance'],
    queryFn: async () => apiClient.get<TaskPerformance>(API_ENDPOINTS.ANALYTICS_TASK_PERFORMANCE),
    enabled: isAuthenticated && !!tokens?.accessToken,
    staleTime: 30_000,
  });

  const { data: userAct } = useQuery({
    queryKey: ['analytics', 'users', 'activity'],
    queryFn: async () => apiClient.get<UserActivity>(API_ENDPOINTS.ANALYTICS_USER_ACTIVITY),
    enabled: isAuthenticated && !!tokens?.accessToken,
    staleTime: 30_000,
  });

  const priorityData = useMemo(() => {
    const p = taskPerf?.tasksByPriority;
    if (!p) return [] as Array<{ name: string; value: number }>;
    return [
      { name: 'Düşük', value: p.low ?? 0 },
      { name: 'Orta', value: p.medium ?? 0 },
      { name: 'Yüksek', value: p.high ?? 0 },
      { name: 'Acil', value: p.urgent ?? 0 },
    ];
  }, [taskPerf]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Sistem genel istatistikleri ve grafikler</p>
        </div>
        <BarChart3 className="h-6 w-6 text-blue-600" />
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalUsers?.toLocaleString?.() ?? '-'}</div>
            <p className="text-xs text-muted-foreground">son 30sn içinde</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Kullanıcı</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.activeUsers?.toLocaleString?.() ?? '-'}</div>
            <p className="text-xs text-muted-foreground">son 30sn içinde</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Görev</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalTasks?.toLocaleString?.() ?? '-'}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">{overview?.completedTasks ?? 0} tamamlandı</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geciken</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overview?.overdueTasks?.toLocaleString?.() ?? '-'}</div>
            <p className="text-xs text-muted-foreground">takip gerekli</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Önceliğe Göre Görevler</CardTitle>
            <CardDescription>Görevlerin öncelik seviyesine göre dağılımı</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kullanıcı Aktivitesi</CardTitle>
            <CardDescription>Son aktiflik ve kayıt metrikleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Günlük Aktif</span>
                <Badge variant="secondary">{userAct?.dailyActiveUsers ?? '-'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Haftalık Aktif</span>
                <Badge variant="secondary">{userAct?.weeklyActiveUsers ?? '-'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Aylık Aktif</span>
                <Badge variant="secondary">{userAct?.monthlyActiveUsers ?? '-'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Bu Hafta Yeni</span>
                <Badge>{userAct?.newUsersThisWeek ?? '-'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Bu Ay Yeni</span>
                <Badge>{userAct?.newUsersThisMonth ?? '-'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
