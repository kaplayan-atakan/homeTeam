import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Subheading,
  FAB,
  ProgressBar,
  Chip,
  Avatar,
  Divider,
} from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { TaskStatus, TaskPriority, Task } from '../types/task.types';
import { 
  fetchTaskStatsAsync,
  fetchMyPendingTasksAsync,
  fetchMyOverdueTasksAsync,
  fetchMyCompletedTodayTasksAsync 
} from '../store/slices/tasksSlice';
import { fetchUserGroupsAsync } from '../store/slices/groupsSlice';

interface DashboardScreenProps {
  navigation: any;
}

interface TaskSummary {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useAppDispatch();

  // Redux state'den veri çek
  const { user } = useAppSelector((state) => state.auth);
  const { 
    taskStats,
    pendingTasks,
    overdueTasks,
    completedTasks,
    isLoading 
  } = useAppSelector((state) => state.tasks);
  const { groups } = useAppSelector((state) => state.groups);

  // Recent tasks - pending ve overdue'dan al
  const recentTasks = [...pendingTasks, ...overdueTasks].slice(0, 5);

  // REAL API DATA FETCHING with Redux - NO MORE MOCK DATA!
  const fetchDashboardData = useCallback(async () => {
    try {
      // Paralel olarak tüm verileri Redux actions ile çek
      await Promise.all([
        dispatch(fetchTaskStatsAsync()),
        dispatch(fetchMyPendingTasksAsync()),
        dispatch(fetchMyOverdueTasksAsync()),
        dispatch(fetchMyCompletedTodayTasksAsync()),
        dispatch(fetchUserGroupsAsync())
      ]);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      Alert.alert('Hata', 'Dashboard verileri yüklenirken bir hata oluştu');
    }
  }, [dispatch]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const renderTaskCard = (task: Task) => {
    const getPriorityColor = (priority: TaskPriority): string => {
      switch (priority) {
        case TaskPriority.HIGH:
          return '#F44336';
        case TaskPriority.MEDIUM:
          return '#FF9800';
        case TaskPriority.LOW:
          return '#4CAF50';
        default:
          return '#2196F3';
      }
    };

    const getStatusColor = (status: TaskStatus): string => {
      switch (status) {
        case TaskStatus.PENDING:
          return '#FFC107';
        case TaskStatus.IN_PROGRESS:
          return '#2196F3';
        case TaskStatus.COMPLETED:
          return '#4CAF50';
        case TaskStatus.OVERDUE:
          return '#F44336';
        default:
          return '#9E9E9E';
      }
    };

    return (
      <Card key={task.id} style={styles.taskCard}>
        <Card.Content>
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Chip
              mode="outlined"
              style={[
                styles.priorityChip,
                { borderColor: getPriorityColor(task.priority) },
              ]}
              textStyle={{ color: getPriorityColor(task.priority) }}
            >
              {task.priority}
            </Chip>
          </View>
          <Text style={styles.taskDescription}>{task.description}</Text>
          <View style={styles.taskFooter}>
            <Chip
              mode="flat"
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(task.status) },
              ]}
              textStyle={{ color: 'white' }}
            >
              {task.status}
            </Chip>
            <Text style={styles.taskDate}>
              {new Date(task.dueDate).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Dashboard yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Title style={styles.welcomeText}>
            Hoş geldin, {user?.firstName || 'Kullanıcı'}!
          </Title>
          <Subheading style={styles.dateText}>
            {new Date().toLocaleDateString('tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Subheading>
        </View>

        {/* Task Summary Cards */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{taskStats.total}</Text>
              <Text style={styles.statLabel}>Toplam Görev</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{taskStats.pending}</Text>
              <Text style={styles.statLabel}>Bekleyen</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{taskStats.completed}</Text>
              <Text style={styles.statLabel}>Tamamlanan</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{taskStats.overdue}</Text>
              <Text style={styles.statLabel}>Geciken</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Progress Bar */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <Text style={styles.progressTitle}>Genel İlerleme</Text>
            <ProgressBar
              progress={
                taskStats.total > 0
                  ? taskStats.completed / taskStats.total
                  : 0
              }
              style={styles.progressBar}
              color="#4CAF50"
            />
            <Text style={styles.progressText}>
              {taskStats.total > 0
                ? Math.round((taskStats.completed / taskStats.total) * 100)
                : 0}
              % tamamlandı
            </Text>
          </Card.Content>
        </Card>

        {/* Recent Tasks */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Son Görevler</Title>
              <Text
                style={styles.seeAllText}
                onPress={() => navigation.navigate('Tasks')}
              >
                Tümünü Gör
              </Text>
            </View>
            <Divider style={styles.divider} />
            {recentTasks.length > 0 ? (
              recentTasks.map(renderTaskCard)
            ) : (
              <Text style={styles.emptyText}>Henüz görev bulunmuyor</Text>
            )}
          </Card.Content>
        </Card>

        {/* User Groups */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Gruplarım</Title>
              <Text
                style={styles.seeAllText}
                onPress={() => navigation.navigate('Groups')}
              >
                Tümünü Gör
              </Text>
            </View>
            <Divider style={styles.divider} />
            {groups.length > 0 ? (
              <View style={styles.groupsContainer}>
                {groups.slice(0, 3).map((group: any) => (
                  <Card key={group.id} style={styles.groupCard}>
                    <Card.Content style={styles.groupContent}>
                      <Avatar.Text
                        size={40}
                        label={group.name.charAt(0)}
                        style={styles.groupAvatar}
                      />
                      <View style={styles.groupInfo}>
                        <Text style={styles.groupName}>{group.name}</Text>
                        <Text style={styles.groupMembers}>
                          {group.memberCount} üye
                        </Text>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Henüz grup bulunmuyor</Text>
            )}
          </Card.Content>
        </Card>

        <View style={styles.spacer} />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="Yeni Görev"
        onPress={() => navigation.navigate('CreateTask')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  dateText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  statCard: {
    width: '22%',
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 5,
  },
  progressCard: {
    marginHorizontal: 10,
    marginBottom: 15,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
  sectionCard: {
    marginHorizontal: 10,
    marginBottom: 15,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  divider: {
    marginBottom: 15,
    backgroundColor: '#E0E0E0',
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  taskCard: {
    marginBottom: 10,
    elevation: 1,
    backgroundColor: '#FFFFFF',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    marginRight: 10,
  },
  priorityChip: {
    height: 24,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    height: 24,
  },
  taskDate: {
    fontSize: 12,
    color: '#999999',
  },
  groupsContainer: {
    gap: 10,
  },
  groupCard: {
    elevation: 1,
    backgroundColor: '#FFFFFF',
  },
  groupContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  groupAvatar: {
    backgroundColor: '#1976D2',
    marginRight: 15,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  groupMembers: {
    fontSize: 12,
    color: '#666666',
  },
  spacer: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976D2',
  },
});

export default DashboardScreen;
