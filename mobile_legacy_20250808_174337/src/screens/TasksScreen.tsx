import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Button,
  Chip,
  FAB,
  Searchbar,
  Menu,
  Avatar,
  IconButton,
} from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { TaskStatus, TaskPriority, Task } from '../types/task.types';
import { fetchTasksAsync, updateTaskAsync, deleteTaskAsync } from '../store/slices/tasksSlice';

interface TasksScreenProps {
  navigation: any;
}

type FilterType = 'all' | 'pending' | 'in_progress' | 'completed' | 'overdue';
type SortType = 'dueDate' | 'priority' | 'created' | 'title';

const TasksScreen: React.FC<TasksScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('dueDate');
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const { tasks, isLoading, error } = useAppSelector((state) => state.tasks);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchTasksAsync({}));
  }, [dispatch]);

  const filteredTasks = React.useMemo(() => {
    let result = tasks;

    // Arama filtresi
    if (searchQuery) {
      result = result.filter((task: Task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Durum filtresi
    if (filter !== 'all') {
      result = result.filter((task: Task) => task.status === filter);
    }

    // Sıralama
    result.sort((a: Task, b: Task) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder: { [key in TaskPriority]: number } = { 
            [TaskPriority.URGENT]: 4, 
            [TaskPriority.HIGH]: 3, 
            [TaskPriority.MEDIUM]: 2, 
            [TaskPriority.LOW]: 1 
          };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, searchQuery, filter, sortBy]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchTasksAsync({}));
    } catch (error) {
      Alert.alert('Hata', 'Görevler yüklenirken bir hata oluştu');
    } finally {
      setRefreshing(false);
    }
  };

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    try {
      // API çağrısı burada yapılacak
      // await dispatch(updateTaskStatus({ taskId, status: newStatus }));
      Alert.alert('Başarılı', 'Görev durumu güncellendi');
    } catch (error) {
      Alert.alert('Hata', 'Görev durumu güncellenirken bir hata oluştu');
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING:
        return '#FF9800';
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

  const getStatusDisplayName = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING:
        return 'Bekliyor';
      case TaskStatus.IN_PROGRESS:
        return 'Devam Ediyor';
      case TaskStatus.COMPLETED:
        return 'Tamamlandı';
      case TaskStatus.OVERDUE:
        return 'Gecikti';
      default:
        return status;
    }
  };

  const renderTaskItem = ({ item: task }: { item: Task }) => (
    <Card style={styles.taskCard} onPress={() => handleTaskPress(task)}>
      <Card.Content>
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleContainer}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Chip
              style={[styles.priorityChip, { backgroundColor: getPriorityColor(task.priority) }]}
              textStyle={styles.priorityChipText}
              compact
            >
              {task.priority.toUpperCase()}
            </Chip>
          </View>
          <Menu
            visible={menuVisible === task.id}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => setMenuVisible(task.id)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                handleStatusUpdate(task.id, TaskStatus.IN_PROGRESS);
              }}
              title="Başlat"
              leadingIcon="play"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                handleStatusUpdate(task.id, TaskStatus.COMPLETED);
              }}
              title="Tamamla"
              leadingIcon="check"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('EditTask', { taskId: task.id });
              }}
              title="Düzenle"
              leadingIcon="pencil"
            />
          </Menu>
        </View>

        {task.description && (
          <Text style={styles.taskDescription} numberOfLines={2}>
            {task.description}
          </Text>
        )}

        <View style={styles.taskMeta}>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(task.status) }]}
            textStyle={styles.statusChipText}
            compact
          >
            {getStatusDisplayName(task.status)}
          </Chip>
          <Text style={styles.dueDate}>
            {new Date(task.dueDate).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>

        {task.assignedTo && task.assignedTo.id !== user?.id && (
          <View style={styles.assignedToContainer}>
            <Avatar.Text
              size={24}
              label={task.assignedTo.firstName?.charAt(0) || 'U'}
              style={styles.assignedAvatar}
            />
            <Text style={styles.assignedText}>
              {task.assignedTo.firstName} {task.assignedTo.lastName}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderFilterChip = (filterType: FilterType, label: string) => (
    <Chip
      key={filterType}
      selected={filter === filterType}
      onPress={() => setFilter(filterType)}
      style={[styles.filterChip, filter === filterType && styles.selectedFilter]}
      textStyle={filter === filterType ? styles.selectedFilterText : styles.filterText}
    >
      {label}
    </Chip>
  );

  return (
    <View style={styles.container}>
      {/* Arama Çubuğu */}
      <Searchbar
        placeholder="Görev ara..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {/* Filtreler */}
      <View style={styles.filterContainer}>
        {renderFilterChip('all', 'Tümü')}
        {renderFilterChip('pending', 'Bekliyor')}
        {renderFilterChip('in_progress', 'Devam')}
        {renderFilterChip('completed', 'Tamamlandı')}
        {renderFilterChip('overdue', 'Geciken')}
      </View>

      {/* Sıralama */}
      <View style={styles.sortContainer}>
        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setSortMenuVisible(true)}
              icon="sort"
              compact
            >
              Sırala
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setSortBy('dueDate');
              setSortMenuVisible(false);
            }}
            title="Son Teslim Tarihi"
            leadingIcon="calendar"
          />
          <Menu.Item
            onPress={() => {
              setSortBy('priority');
              setSortMenuVisible(false);
            }}
            title="Öncelik"
            leadingIcon="flag"
          />
          <Menu.Item
            onPress={() => {
              setSortBy('created');
              setSortMenuVisible(false);
            }}
            title="Oluşturma Tarihi"
            leadingIcon="clock"
          />
          <Menu.Item
            onPress={() => {
              setSortBy('title');
              setSortMenuVisible(false);
            }}
            title="Başlık"
            leadingIcon="alphabetical"
          />
        </Menu>
        <Text style={styles.taskCount}>
          {filteredTasks.length} görev
        </Text>
      </View>

      {/* Görev Listesi */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.taskList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Görev bulunamadı</Text>
          </View>
        }
      />

      {/* Yeni Görev FAB */}
      <FAB
        style={styles.fab}
        icon="plus"
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
  searchbar: {
    margin: 16,
    elevation: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#E0E0E0',
  },
  selectedFilter: {
    backgroundColor: '#6200EE',
  },
  filterText: {
    color: '#666',
  },
  selectedFilterText: {
    color: 'white',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  taskCount: {
    color: '#666',
    fontSize: 14,
  },
  taskList: {
    paddingHorizontal: 16,
    paddingBottom: 80,
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
  taskTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
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
    marginBottom: 12,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    fontSize: 10,
    color: 'white',
  },
  dueDate: {
    color: '#666',
    fontSize: 12,
  },
  assignedToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  assignedAvatar: {
    marginRight: 8,
  },
  assignedText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200EE',
  },
});

export default TasksScreen;
