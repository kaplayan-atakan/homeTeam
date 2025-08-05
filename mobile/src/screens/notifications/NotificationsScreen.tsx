import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Badge,
  Searchbar,
  FAB,
} from 'react-native-paper';
import { firebaseNotificationService } from '../../services/firebaseNotificationService';

interface Notification {
  _id: string;
  title: string;
  body: string;
  type: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  createdAt: string;
  readAt?: string;
  data?: {
    taskId?: string;
    groupId?: string;
    userId?: string;
  };
}

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Bildirimleri yükle
  const loadNotifications = useCallback(async (reset = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const newNotifications = await firebaseNotificationService.getNotificationHistory(
        currentPage,
        20
      );

      if (reset) {
        setNotifications(newNotifications);
        setPage(2);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
        setPage(prev => prev + 1);
      }

      setHasMore(newNotifications.length === 20);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Hata', 'Bildirimler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [loading, page]);

  // Okunmamış bildirim sayısını yükle
  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await firebaseNotificationService.getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, []);

  // Bildirim refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await Promise.all([
      loadNotifications(true),
      loadUnreadCount(),
    ]);
    setRefreshing(false);
  }, [loadNotifications, loadUnreadCount]);

  // Daha fazla bildirim yükle
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadNotifications();
    }
  }, [hasMore, loading, loadNotifications]);

  // Bildirimi okundu olarak işaretle
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await firebaseNotificationService.markNotificationAsRead(notificationId);
      
      // Local state güncelle
      setNotifications(prev => 
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, status: 'READ', readAt: new Date().toISOString() }
            : notification
        )
      );
      
      // Okunmamış sayısını güncelle
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Alert.alert('Hata', 'Bildirim işaretlenirken hata oluştu');
    }
  }, []);

  // Component mount
  useEffect(() => {
    loadNotifications(true);
    loadUnreadCount();
  }, []);

  // Bildirim tipine göre ikon ve renk
  const getNotificationStyle = (type: string, status: string) => {
    const isRead = status === 'READ';
    
    const styles = {
      'task_assigned': { 
        color: isRead ? '#757575' : '#2196F3', 
        icon: '📋',
        chip: 'Görev Atandı' 
      },
      'task_completed': { 
        color: isRead ? '#757575' : '#4CAF50', 
        icon: '✅',
        chip: 'Görev Tamamlandı' 
      },
      'group_invitation': { 
        color: isRead ? '#757575' : '#FF9800', 
        icon: '👥',
        chip: 'Grup Daveti' 
      },
      'reminder': { 
        color: isRead ? '#757575' : '#9C27B0', 
        icon: '⏰',
        chip: 'Hatırlatma' 
      },
      'announcement': { 
        color: isRead ? '#757575' : '#F44336', 
        icon: '📢',
        chip: 'Duyuru' 
      },
    };

    return styles[type as keyof typeof styles] || { 
      color: isRead ? '#757575' : '#607D8B', 
      icon: '🔔',
      chip: 'Bildirim' 
    };
  };

  // Bildirim item render
  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const style = getNotificationStyle(item.type, item.status);
    const isUnread = item.status !== 'READ';
    
    return (
      <Card 
        style={[
          styles.notificationCard,
          isUnread && styles.unreadCard
        ]}
        onPress={() => isUnread && markAsRead(item._id)}
      >
        <Card.Content>
          <View style={styles.notificationHeader}>
            <View style={styles.notificationInfo}>
              <View style={styles.titleRow}>
                <Title style={[styles.title, { color: style.color }]}>
                  {style.icon} {item.title}
                </Title>
                {isUnread && <Badge style={styles.unreadBadge} />}
              </View>
              <Chip 
                mode="outlined" 
                compact 
                style={[styles.typeChip, { borderColor: style.color }]}
                textStyle={{ color: style.color, fontSize: 10 }}
              >
                {style.chip}
              </Chip>
            </View>
          </View>
          
          <Paragraph style={styles.body}>
            {item.body}
          </Paragraph>
          
          <View style={styles.notificationFooter}>
            <Paragraph style={styles.timestamp}>
              {new Date(item.createdAt).toLocaleString('tr-TR')}
            </Paragraph>
            
            {isUnread && (
              <Button 
                mode="text" 
                compact 
                onPress={() => markAsRead(item._id)}
                textColor={style.color}
              >
                Okundu İşaretle
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Filtrelenmiş bildirimler
  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header with unread count */}
      <View style={styles.header}>
        <Searchbar
          placeholder="Bildirimler ara..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        {unreadCount > 0 && (
          <Chip icon="bell" style={styles.unreadChip}>
            {unreadCount} okunmamış
          </Chip>
        )}
      </View>

      {/* Notifications list */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item._id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
      />

      {/* Mark all as read FAB */}
      {unreadCount > 0 && (
        <FAB
          icon="email-mark-as-unread"
          label="Tümünü Okundu İşaretle"
          style={styles.fab}
          onPress={async () => {
            Alert.alert(
              'Tümünü Okundu İşaretle',
              'Tüm bildirimler okundu olarak işaretlensin mi?',
              [
                { text: 'İptal', style: 'cancel' },
                {
                  text: 'Evet',
                  onPress: async () => {
                    // Tüm okunmamış bildirimleri işaretle
                    const unreadNotifications = notifications.filter(n => n.status !== 'READ');
                    for (const notification of unreadNotifications) {
                      await markAsRead(notification._id);
                    }
                  },
                },
              ]
            );
          }}
        />
      )}
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchbar: {
    marginBottom: 8,
  },
  unreadChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#ff5722',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  notificationCard: {
    marginBottom: 12,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#ff5722',
    marginLeft: 8,
  },
  typeChip: {
    alignSelf: 'flex-start',
    height: 24,
  },
  body: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 12,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});

export default NotificationsScreen;
