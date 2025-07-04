import React, { useEffect, useState } from 'react';
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
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { TaskStatus, TaskPriority } from '../types/task.types';

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
  const [taskSummary, setTaskSummary] = useState<TaskSummary>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });

  const { user } = useSelector((state: RootState) => state.auth);
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const { groups } = useSelector((state: RootState) => state.groups);

  useEffect(() => {
    calculateTaskSummary();
  }, [tasks]);

  const calculateTaskSummary = () => {
    const summary = {
      total: tasks.length,
      pending: tasks.filter(task => task.status === TaskStatus.PENDING).length,
      inProgress: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length,
      completed: tasks.filter(task => task.status === TaskStatus.COMPLETED).length,
      overdue: tasks.filter(task => task.status === TaskStatus.OVERDUE).length,
    };
    setTaskSummary(summary);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // API çağrıları burada yapılacak
      // await dispatch(fetchTasks());
      // await dispatch(fetchGroups());
    } catch (error) {
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setRefreshing(false);
    }
  };

  const getProgressValue = () => {
    if (taskSummary.total === 0) return 0;
    return taskSummary.completed / taskSummary.total;
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return '#F44336';
      case TaskPriority.HIGH:
        return '#FF9800';
      case TaskPriority.MEDIUM:
        return '#2196F3';
      case TaskPriority.LOW:
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  const recentTasks = tasks.slice(0, 5); // Son 5 görev

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hoş Geldin Kartı */}
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <View style={styles.welcomeContent}>
              <Avatar.Text
                size={50}
                label={user?.firstName?.charAt(0) || 'U'}
                style={styles.avatar}
              />
              <View style={styles.welcomeText}>
                <Title>Hoş geldin, {user?.firstName || 'Kullanıcı'}!</Title>
                <Subheading>Bugün {taskSummary.pending} görevin var</Subheading>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Görev Özeti */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title>Görev Özeti</Title>
            <View style={styles.progressContainer}>
              <Text>İlerleme: {Math.round(getProgressValue() * 100)}%</Text>
              <ProgressBar
                progress={getProgressValue()}
                color="#6200EE"
                style={styles.progressBar}
              />
            </View>
            
            <View style={styles.chipContainer}>
              <Chip
                icon="clock-outline"
                textStyle={styles.chipText}
                style={[styles.chip, { backgroundColor: '#FFF3E0' }]}
              >
                Bekliyor: {taskSummary.pending}
              </Chip>
              <Chip
                icon="play-circle-outline"
                textStyle={styles.chipText}
                style={[styles.chip, { backgroundColor: '#E3F2FD' }]}
              >
                Devam: {taskSummary.inProgress}
              </Chip>
              <Chip
                icon="check-circle-outline"
                textStyle={styles.chipText}
                style={[styles.chip, { backgroundColor: '#E8F5E8' }]}
              >
                Tamamlandı: {taskSummary.completed}
              </Chip>
              <Chip
                icon="alert-circle-outline"
                textStyle={styles.chipText}
                style={[styles.chip, { backgroundColor: '#FFEBEE' }]}
              >
                Geciken: {taskSummary.overdue}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Son Görevler */}
        <Card style={styles.recentTasksCard}>
          <Card.Content>
            <Title>Son Görevler</Title>
            {recentTasks.length > 0 ? (
              recentTasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  <View style={styles.taskItem}>
                    <View style={styles.taskHeader}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      <Chip
                        style={[
                          styles.priorityChip,
                          { backgroundColor: getPriorityColor(task.priority) }
                        ]}
                        textStyle={styles.priorityChipText}
                        compact
                      >
                        {task.priority}
                      </Chip>
                    </View>
                    <Text style={styles.taskDescription} numberOfLines={2}>
                      {task.description}
                    </Text>
                    <View style={styles.taskFooter}>
                      <Text style={styles.taskStatus}>{task.status}</Text>
                      <Text style={styles.taskDate}>
                        {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                      </Text>
                    </View>
                  </View>
                  {index < recentTasks.length - 1 && <Divider style={styles.divider} />}
                </React.Fragment>
              ))
            ) : (
              <Text style={styles.emptyText}>Henüz görev bulunmuyor</Text>
            )}
          </Card.Content>
        </Card>

        {/* Gruplar */}
        <Card style={styles.groupsCard}>
          <Card.Content>
            <Title>Gruplarım</Title>
            {groups.length > 0 ? (
              <View style={styles.groupsContainer}>
                {groups.slice(0, 3).map((group) => (
                  <Chip
                    key={group.id}
                    avatar={<Avatar.Text size={24} label={group.name.charAt(0)} />}
                    style={styles.groupChip}
                    onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })}
                  >
                    {group.name}
                  </Chip>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Henüz gruba dahil değilsiniz</Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Yeni Görev Oluştur FAB */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateTask')}
        label="Yeni Görev"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 16,
    elevation: 4,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  welcomeText: {
    flex: 1,
  },
  summaryCard: {
    marginBottom: 16,
    elevation: 4,
  },
  progressContainer: {
    marginVertical: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  chipText: {
    fontSize: 12,
  },
  recentTasksCard: {
    marginBottom: 16,
    elevation: 4,
  },
  taskItem: {
    paddingVertical: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  priorityChip: {
    height: 24,
  },
  priorityChipText: {
    fontSize: 10,
    color: 'white',
  },
  taskDescription: {
    color: '#666',
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskStatus: {
    fontSize: 12,
    color: '#999',
  },
  taskDate: {
    fontSize: 12,
    color: '#999',
  },
  divider: {
    marginVertical: 8,
  },
  groupsCard: {
    marginBottom: 80,
    elevation: 4,
  },
  groupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  groupChip: {
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200EE',
  },
});

export default DashboardScreen;
