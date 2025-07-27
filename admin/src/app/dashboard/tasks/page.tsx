'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Circle,
  XCircle,
} from 'lucide-react';
import { Task } from '@/types';

// Mock data - gerçek API çağrıları ile değiştirilecek
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Bulaşıkları yıka',
    description: 'Akşam yemeği sonrası bulaşıkları yıkayın',
    status: 'completed',
    priority: 'medium',
    assignedTo: '2',
    groupId: '1',
    dueDate: new Date('2024-01-20T18:00:00Z'),
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-20T18:30:00Z'),
    completedAt: new Date('2024-01-20T18:30:00Z')
  },
  {
    id: '2',
    title: 'Proje sunumunu hazırla',
    description: 'Haftalık proje durumu sunumunu hazırla',
    status: 'in_progress',
    priority: 'high',
    assignedTo: '1',
    groupId: '2',
    dueDate: new Date('2024-01-25T14:00:00Z'),
    createdAt: new Date('2024-01-10T14:20:00Z'),
    updatedAt: new Date('2024-01-22T09:15:00Z')
  },
  {
    id: '3',
    title: 'Çöpü çıkar',
    description: 'Salı günü çöpü sokağa çıkar',
    status: 'pending',
    priority: 'low',
    assignedTo: '3',
    groupId: '1',
    dueDate: new Date('2024-01-23T07:00:00Z'),
    createdAt: new Date('2024-01-20T09:15:00Z'),
    updatedAt: new Date('2024-01-20T09:15:00Z')
  },
  {
    id: '4',
    title: 'Rapor gözden geçir',
    description: 'Aylık performans raporunu incele ve onayla',
    status: 'overdue',
    priority: 'high',
    assignedTo: '1',
    groupId: '3',
    dueDate: new Date('2024-01-18T17:00:00Z'),
    createdAt: new Date('2024-01-15T16:45:00Z'),
    updatedAt: new Date('2024-01-15T16:45:00Z')
  }
];

export default function TasksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Görevleri getir
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      // API çağrısı
      // return await apiClient.get('/admin/tasks');
      // Şimdilik mock data
      return mockTasks;
    }
  });

  // Filtrelenmiş görevler
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Görev silme
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      // API çağrısı
      // return await apiClient.delete(`/admin/tasks/${taskId}`);
      console.log('Deleting task:', taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsDeleteDialogOpen(false);
      setSelectedTask(null);
    }
  });

  // Status badge renkleri ve ikonları
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'Tamamlandı'
        };
      case 'in_progress':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <Circle className="h-4 w-4" />,
          text: 'Devam Ediyor'
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="h-4 w-4" />,
          text: 'Bekliyor'
        };
      case 'overdue':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <XCircle className="h-4 w-4" />,
          text: 'Gecikmiş'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <Circle className="h-4 w-4" />,
          text: 'Bilinmiyor'
        };
    }
  };

  // Priority badge renkleri
  const getPriorityDisplay = (priority: string) => {
    switch (priority) {
      case 'high':
        return { color: 'bg-red-100 text-red-800', text: 'Yüksek' };
      case 'medium':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Orta' };
      case 'low':
        return { color: 'bg-green-100 text-green-800', text: 'Düşük' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: 'Bilinmiyor' };
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate: Date, status: string) => {
    return status !== 'completed' && new Date() > dueDate;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Görevler yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Hata: Görevler yüklenemedi</div>
      </div>
    );
  }

  // İstatistikler
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Görev Yönetimi</h1>
          <p className="text-gray-600">Sistem görevlerini yönetin</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Görev
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Yeni Görev Oluştur</DialogTitle>
              <DialogDescription>
                Yeni bir görev oluşturun.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="taskTitle" className="text-right">
                  Başlık
                </Label>
                <Input id="taskTitle" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Açıklama
                </Label>
                <Textarea id="description" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Öncelik
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Öncelik seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="assignedTo" className="text-right">
                  Atanan Kişi
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Kullanıcı seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Ahmet Yılmaz</SelectItem>
                    <SelectItem value="2">Ayşe Demir</SelectItem>
                    <SelectItem value="3">Mehmet Kaya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Görev Oluştur</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Görev</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">
              +15% geçen aya göre
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              %{completionRate.toFixed(1)} tamamlanma oranı
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devam Eden</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gecikmiş</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              Acil müdahale gerekli
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Genel İlerleme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tamamlanma Oranı</span>
              <span>{completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
              <div className="text-xs text-muted-foreground">Tamamlanan</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
              <div className="text-xs text-muted-foreground">Devam Eden</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {tasks.filter(t => t.status === 'pending').length}
              </div>
              <div className="text-xs text-muted-foreground">Bekleyen</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
              <div className="text-xs text-muted-foreground">Gecikmiş</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Görevler</CardTitle>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Görev ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Durum filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="pending">Bekleyen</SelectItem>
                <SelectItem value="in_progress">Devam Eden</SelectItem>
                <SelectItem value="completed">Tamamlanan</SelectItem>
                <SelectItem value="overdue">Gecikmiş</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Öncelik filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Öncelikler</SelectItem>
                <SelectItem value="high">Yüksek</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="low">Düşük</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Görev</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Öncelik</TableHead>
                <TableHead>Atanan</TableHead>
                <TableHead>Bitiş Tarihi</TableHead>
                <TableHead>Oluşturulma</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => {
                const statusDisplay = getStatusDisplay(task.status);
                const priorityDisplay = getPriorityDisplay(task.priority);
                const taskIsOverdue = isOverdue(task.dueDate, task.status);

                return (
                  <TableRow key={task.id} className={taskIsOverdue ? 'bg-red-50' : ''}>
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {statusDisplay.icon}
                          <span>{task.title}</span>
                          {taskIsOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {task.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusDisplay.color}>
                        {statusDisplay.text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityDisplay.color}>
                        {priorityDisplay.text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>Kullanıcı {task.assignedTo}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span className={taskIsOverdue ? 'text-red-600 font-medium' : ''}>
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(task.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Edit işlemi gelecekte implement edilecek
                            console.log('Edit task:', task.id);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTask(task);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredTasks.length === 0 && (
            <div className="text-center py-8">
              <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Görev bulunamadı</h3>
              <p className="mt-1 text-sm text-gray-500">
                Arama kriterlerinize uygun görev bulunamadı.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Görevi Sil</DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz. Görev &quot;{selectedTask?.title}&quot; 
              kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedTask && deleteTaskMutation.mutate(selectedTask.id)}
              disabled={deleteTaskMutation.isPending}
            >
              {deleteTaskMutation.isPending ? 'Siliniyor...' : 'Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
