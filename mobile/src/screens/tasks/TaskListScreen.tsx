import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  FAB,
  Searchbar,
  SegmentedButtons,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyTasksAsync, setFilter } from '../../store/slices/tasksSlice';
import { RootState, AppDispatch } from '../../store';

interface TaskListScreenProps {
  navigation: any;
}

const TaskListScreen: React.FC<TaskListScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { myTasks, isLoading, error } = useSelector((state: RootState) => state.tasks);

  useEffect(() => {
    loadTasks();
  }, [selectedStatus]);

  const loadTasks = async () => {
    const filter = selectedStatus !== 'all' ? { status: selectedStatus } : {};
    await dispatch(fetchMyTasksAsync(filter));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const navigateToTaskDetail = (taskId: string) => {
    navigation.navigate('TaskDetail', { taskId });
  };

  const navigateToCreateTask = () => {
    navigation.navigate('CreateTask');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA726';
      case 'in_progress':
        return '#42A5F5';
      case 'completed':
        return '#66BB6A';
      case 'overdue':
        return '#EF5350';
      default:
        return '#BDBDBD';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Bekliyor';
      case 'in_progress':
        return 'Devam Ediyor';
      case 'completed':
        return 'Tamamlandı';
      case 'overdue':
        return 'Süresi Geçti';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return '#81C784';
      case 'medium':
        return '#FFB74D';
      case 'high':
        return '#FF8A65';
      case 'urgent':
        return '#E57373';
      default:
        return '#BDBDBD';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'Düşük';
      case 'medium':
        return 'Orta';
      case 'high':
        return 'Yüksek';
      case 'urgent':
        return 'Acil';
      default:
        return priority;
    }
  };

  const renderTaskItem = ({ item }: { item: any }) => (
    <Card
      style={styles.taskCard}
      onPress={() => navigateToTaskDetail(item.id)}
      mode="outlined"
    >
      <Card.Content>
        <View style={styles.taskHeader}>
          <Text variant="titleMedium" style={styles.taskTitle}>
            {item.title}
          </Text>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.chipText}
            compact
          >
            {getStatusText(item.status)}
          </Chip>
        </View>

        {item.description && (
          <Text variant="bodyMedium" style={styles.taskDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.taskFooter}>
          <Chip
            style={[styles.priorityChip, { backgroundColor: getPriorityColor(item.priority) }]}
            textStyle={styles.chipText}
            compact
            icon="flag"
          >
            {getPriorityText(item.priority)}
          </Chip>

          <View style={styles.taskInfo}>
            {item.group && (
              <Text variant="bodySmall" style={styles.groupText}>
                👥 {item.group.name}
              </Text>
            )}
            <Text variant="bodySmall" style={styles.dateText}>
              📅 {new Date(item.dueDate).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const filteredTasks = myTasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Görev ara..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <SegmentedButtons
          value={selectedStatus}
          onValueChange={setSelectedStatus}
          buttons={[
            { value: 'all', label: 'Tümü' },
            { value: 'pending', label: 'Bekleyen' },
            { value: 'in_progress', label: 'Devam Eden' },
            { value: 'completed', label: 'Tamamlanan' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6200EE']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={styles.emptyText}>
              {isLoading ? 'Yükleniyor...' : 'Henüz görev bulunmuyor'}
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              {!isLoading && 'Yeni görev oluşturmak için + butonuna tıklayın'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={navigateToCreateTask}
        label="Yeni Görev"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  searchbar: {
    marginBottom: 16,
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  segmentedButtons: {
    backgroundColor: 'transparent',
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  taskCard: {
    marginBottom: 12,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    marginRight: 8,
    fontWeight: '600',
  },
  statusChip: {
    borderRadius: 12,
  },
  priorityChip: {
    borderRadius: 12,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  taskDescription: {
    color: '#666',
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskInfo: {
    alignItems: 'flex-end',
  },
  groupText: {
    color: '#666',
    marginBottom: 2,
  },
  dateText: {
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200EE',
  },
});

export default TaskListScreen;
