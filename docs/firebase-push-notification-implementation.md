# Firebase Cloud Messaging (FCM) Push Notification Implementation Guide

## Technical Overview

This implementation guide focuses on integrating Firebase Cloud Messaging (FCM) for push notifications in your homeTeam application across both backend (NestJS) and mobile (React Native) components.

## Backend Implementation (NestJS)

### 1. Install Required Packages

```bash
cd backend
npm install firebase-admin
```

### 2. Initialize Firebase Admin SDK

```typescript name=backend/src/config/firebase.config.ts
import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FirebaseService {
  constructor() {
    // For production, use environment variables or secrets management
    const serviceAccount = require('../path-to-firebase-service-account.json');
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  getFirebaseAdmin() {
    return admin;
  }
}
```

### 3. Create Notification Module & Service

```typescript name=backend/src/notification/notification.module.ts
import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { FirebaseService } from '../config/firebase.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceToken } from './entities/device-token.entity';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceToken, Notification]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, FirebaseService],
  exports: [NotificationService],
})
export class NotificationModule {}
```

### 4. Implement Device Token Management

```typescript name=backend/src/notification/entities/device-token.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('device_tokens')
export class DeviceToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @Column()
  platform: 'ios' | 'android';

  @ManyToOne(() => User, user => user.deviceTokens)
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

```typescript name=backend/src/notification/entities/notification.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  body: string;

  @Column({ type: 'json', nullable: true })
  data: Record<string, any>;

  @Column({ default: 'sent' })
  status: 'sent' | 'delivered' | 'read';

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  sentAt: Date;

  @Column({ nullable: true })
  readAt: Date;
}
```

### 5. Implement Notification Service

```typescript name=backend/src/notification/notification.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseService } from '../config/firebase.config';
import { DeviceToken } from './entities/device-token.entity';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(DeviceToken)
    private deviceTokenRepository: Repository<DeviceToken>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private firebaseService: FirebaseService,
  ) {}

  async registerDeviceToken(userId: string, token: string, platform: 'ios' | 'android') {
    // Check if token already exists for this user
    const existingToken = await this.deviceTokenRepository.findOne({
      where: { userId, token },
    });

    if (!existingToken) {
      const deviceToken = this.deviceTokenRepository.create({
        userId,
        token,
        platform,
      });
      return this.deviceTokenRepository.save(deviceToken);
    }
    
    return existingToken;
  }

  async unregisterDeviceToken(userId: string, token: string) {
    return this.deviceTokenRepository.delete({ userId, token });
  }

  async sendNotification(userId: string, title: string, body: string, data?: Record<string, any>) {
    const userDeviceTokens = await this.deviceTokenRepository.find({
      where: { userId },
    });

    if (userDeviceTokens.length === 0) {
      this.logger.warn(`No device tokens found for user ${userId}`);
      return { success: false, message: 'No device tokens found for user' };
    }

    const admin = this.firebaseService.getFirebaseAdmin();

    // Save notification to database
    const notification = this.notificationRepository.create({
      userId,
      title,
      body,
      data,
    });
    await this.notificationRepository.save(notification);

    // Send to all user devices
    const tokensToSendTo = userDeviceTokens.map(dt => dt.token);
    
    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          notificationId: notification.id,
        },
        tokens: tokensToSendTo,
      };

      const response = await admin.messaging().sendMulticast(message);
      
      this.logger.log(`Successfully sent messages: ${response.successCount}/${tokensToSendTo.length}`);
      
      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokensToSendTo[idx]);
            this.logger.error(`Failed to send notification to token: ${tokensToSendTo[idx]}, error: ${resp.error}`);
            
            // Remove invalid tokens
            if (resp.error.code === 'messaging/invalid-registration-token' || 
                resp.error.code === 'messaging/registration-token-not-registered') {
              this.deviceTokenRepository.delete({ token: tokensToSendTo[idx] });
            }
          }
        });
      }
      
      return {
        success: true,
        sentCount: response.successCount,
        failureCount: response.failureCount,
        notificationId: notification.id,
      };
    } catch (error) {
      this.logger.error(`Error sending notification: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async getUserNotificationHistory(userId: string, page = 1, limit = 20) {
    return this.notificationRepository.find({
      where: { userId },
      order: { sentAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async markNotificationAsRead(notificationId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });
    
    if (!notification) {
      return { success: false, message: 'Notification not found' };
    }
    
    notification.status = 'read';
    notification.readAt = new Date();
    await this.notificationRepository.save(notification);
    
    return { success: true };
  }
}
```

### 6. Create Notification Controller

```typescript name=backend/src/notification/notification.controller.ts
import { Controller, Post, Body, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @Post('register-device')
  registerDevice(
    @User('id') userId: string,
    @Body() body: { token: string; platform: 'ios' | 'android' },
  ) {
    return this.notificationService.registerDeviceToken(
      userId,
      body.token,
      body.platform,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('unregister-device')
  unregisterDevice(
    @User('id') userId: string,
    @Body() body: { token: string },
  ) {
    return this.notificationService.unregisterDeviceToken(userId, body.token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send')
  sendNotification(
    @Body() body: { 
      userId: string; 
      title: string; 
      body: string;
      data?: Record<string, any>;
    },
  ) {
    return this.notificationService.sendNotification(
      body.userId,
      body.title,
      body.body,
      body.data,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  getNotificationHistory(
    @User('id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.notificationService.getUserNotificationHistory(
      userId,
      +page,
      +limit,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markNotificationAsRead(id);
  }
}
```

## Mobile Implementation (React Native)

### 1. Install Required Packages

```bash
cd mobile
npm install @react-native-firebase/app @react-native-firebase/messaging
npm install @notifee/react-native
```

### 2. Configure Firebase in React Native Project

Add your `google-services.json` to `mobile/android/app/` and `GoogleService-Info.plist` to `mobile/ios/`.

### 3. Update Android Configuration

```groovy name=mobile/android/build.gradle
buildscript {
    dependencies {
        // ... other dependencies
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

```groovy name=mobile/android/app/build.gradle
apply plugin: 'com.google.gms.google-services'

android {
    defaultConfig {
        // ...
        multiDexEnabled true
    }
}

dependencies {
    // ...
    implementation 'com.android.support:multidex:1.0.3'
}
```

### 4. Create Notification Service for React Native

```typescript name=mobile/src/services/NotificationService.ts
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api'; // Your API service

class NotificationService {
  private initialized = false;
  
  async init() {
    if (this.initialized) return;
    
    // Request permissions
    await this.requestPermission();
    
    // Register foreground handler
    this.registerForegroundHandler();
    
    // Register background handler
    messaging().setBackgroundMessageHandler(this.onMessageReceived);
    
    // Check if app was opened from a notification
    this.checkInitialNotification();
    
    // Register the device with backend when token is generated or refreshed
    await this.registerTokenHandlers();
    
    this.initialized = true;
  }
  
  async requestPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled = 
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
    if (enabled) {
      console.log('FCM Authorization status:', authStatus);
    } else {
      console.log('FCM permission denied');
    }
    
    // For iOS, register for remote notifications
    if (Platform.OS === 'ios') {
      await notifee.requestPermission();
    }
  }
  
  registerForegroundHandler() {
    // Handle notification received while app is in foreground
    messaging().onMessage(async (remoteMessage) => {
      console.log('Notification received in foreground:', remoteMessage);
      
      await this.displayForegroundNotification(remoteMessage);
    });
  }
  
  async displayForegroundNotification(remoteMessage: any) {
    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });
    
    // Display notification
    await notifee.displayNotification({
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      data: remoteMessage.data,
      android: {
        channelId,
        smallIcon: 'ic_notification', // Make sure to create this icon
        pressAction: {
          id: 'default',
        },
      },
      ios: {
        foregroundPresentationOptions: {
          badge: true,
          sound: true,
          banner: true,
          list: true,
        },
      },
    });
  }
  
  async onMessageReceived(remoteMessage: any) {
    console.log('Background notification received:', remoteMessage);
    
    // Handle background notification (e.g., update local storage)
    const notificationId = remoteMessage.data?.notificationId;
    if (notificationId) {
      await AsyncStorage.setItem('lastNotificationId', notificationId);
    }
  }
  
  async checkInitialNotification() {
    // Check if app was opened from a notification
    const initialNotification = await messaging().getInitialNotification();
    
    if (initialNotification) {
      console.log('App opened from notification:', initialNotification);
      
      // Handle the notification (e.g., navigate to relevant screen)
      this.handleNotificationOpen(initialNotification);
    }
  }
  
  async registerTokenHandlers() {
    // Get the FCM token
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    
    // Save token to AsyncStorage
    await AsyncStorage.setItem('fcmToken', token);
    
    // Register the token with your backend
    this.registerTokenWithBackend(token);
    
    // Listen for token refresh
    messaging().onTokenRefresh(async (newToken) => {
      console.log('FCM Token refreshed:', newToken);
      await AsyncStorage.setItem('fcmToken', newToken);
      this.registerTokenWithBackend(newToken);
    });
  }
  
  async registerTokenWithBackend(token: string) {
    try {
      // Get the user's auth token from storage
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) return;
      
      // Register device token with backend
      await api.post('/notifications/register-device', {
        token,
        platform: Platform.OS,
      });
      
      console.log('Device registered successfully with backend');
    } catch (error) {
      console.error('Failed to register device with backend:', error);
    }
  }
  
  async unregisterToken() {
    try {
      const token = await AsyncStorage.getItem('fcmToken');
      if (!token) return;
      
      // Unregister from backend
      await api.delete('/notifications/unregister-device', {
        data: { token },
      });
      
      console.log('Device unregistered successfully from backend');
    } catch (error) {
      console.error('Failed to unregister device from backend:', error);
    }
  }
  
  handleNotificationOpen(remoteMessage: any) {
    // Extract data from notification
    const notificationId = remoteMessage.data?.notificationId;
    const screenToNavigate = remoteMessage.data?.screen || 'Notifications';
    
    // TODO: Navigate to the appropriate screen based on notification data
    // This requires access to navigation, which should be passed from the component
    
    // Mark notification as read
    if (notificationId) {
      this.markNotificationAsRead(notificationId);
    }
  }
  
  async markNotificationAsRead(notificationId: string) {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      console.log('Notification marked as read');
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }
}

export default new NotificationService();
```

### 5. Integrate the Notification Service into App Entry Point

```typescript name=mobile/src/App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import notifee from '@notifee/react-native';
import NotificationService from './services/NotificationService';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './contexts/AuthContext';

const App = () => {
  useEffect(() => {
    // Initialize notification service
    NotificationService.init();
    
    // Set up notifee foreground event listener
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case notifee.ForegroundServiceType.PRESS:
          console.log('User pressed notification:', detail.notification);
          if (detail.notification?.data) {
            NotificationService.handleNotificationOpen({
              data: detail.notification.data,
            });
          }
          break;
      }
    });
    
    // Clean up listeners
    return () => {
      unsubscribe();
    };
  }, []);
  
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
```

### 6. Create a Notifications Screen

```typescript name=mobile/src/screens/NotificationsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';

interface Notification {
  id: string;
  title: string;
  body: string;
  status: 'sent' | 'delivered' | 'read';
  sentAt: string;
  readAt?: string;
  data?: Record<string, any>;
}

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const fetchNotifications = async (pageNumber = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNumber === 1) {
        setLoading(true);
      }
      
      const response = await api.get('/notifications/history', {
        params: { page: pageNumber, limit: 20 },
      });
      
      const newNotifications = response.data;
      
      if (refresh || pageNumber === 1) {
        setNotifications(newNotifications);
      } else {
        setNotifications([...notifications, ...newNotifications]);
      }
      
      setHasMore(newNotifications.length === 20);
      setPage(pageNumber);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  const handleRefresh = () => {
    fetchNotifications(1, true);
  };
  
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1);
    }
  };
  
  const markAsRead = async (notification: Notification) => {
    if (notification.status === 'read') return;
    
    try {
      await api.post(`/notifications/${notification.id}/read`);
      
      // Update local state
      setNotifications(
        notifications.map(n => 
          n.id === notification.id
            ? { ...n, status: 'read', readAt: new Date().toISOString() }
            : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };
  
  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification);
    
    // Navigate based on notification data
    if (notification.data?.screen) {
      navigation.navigate(notification.data.screen, notification.data.params);
    }
  };
  
  const renderNotificationItem = ({ item: notification }: { item: Notification }) => {
    const isUnread = notification.status !== 'read';
    const timeAgo = formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true });
    
    return (
      <TouchableOpacity
        style={[styles.notificationItem, isUnread && styles.unreadItem]}
        onPress={() => handleNotificationPress(notification)}
      >
        {isUnread && <View style={styles.unreadDot} />}
        
        <View style={styles.contentContainer}>
          <Text style={[styles.title, isUnread && styles.boldText]}>
            {notification.title}
          </Text>
          <Text style={styles.body}>{notification.body}</Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
        ListFooterComponent={
          hasMore && !refreshing ? (
            <ActivityIndicator style={styles.footerLoader} />
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 12,
  },
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadItem: {
    backgroundColor: '#EEF6FF',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0066CC',
    marginRight: 10,
    alignSelf: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  boldText: {
    fontWeight: 'bold',
  },
  body: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  footerLoader: {
    marginVertical: 16,
  },
});

export default NotificationsScreen;
```

## Integration Steps & Best Practices

### 1. Setup Steps

1. **Create Firebase Project**:
   - Go to Firebase Console (https://console.firebase.google.com/)
   - Create a new project
   - Add Android and iOS apps to your project
   - Download and place configuration files in your project

2. **Backend Configuration**:
   - Generate a service account key from Firebase Console > Project Settings > Service Accounts
   - Store this securely in your backend

3. **Mobile Configuration**:
   - Configure Firebase in React Native using the steps outlined above
   - Add required app capabilities in iOS (Push Notifications, Background Modes)

### 2. Testing Push Notifications

```typescript name=backend/src/notification/test-notification.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('test-notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestNotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  @Roles('admin')
  sendTestNotification(@Body() body: { 
    userId: string; 
    title: string; 
    body: string;
    data?: Record<string, any>;
  }) {
    return this.notificationService.sendNotification(
      body.userId,
      body.title, 
      body.body,
      body.data,
    );
  }
}
```

### 3. Security Considerations

- Never hardcode Firebase credentials in your mobile app
- Use Firebase App Check to prevent abuse of your backend resources
- Implement rate limiting for notification endpoints
- Validate user permissions before sending notifications

### 4. Performance Optimization

- Implement batch processing for sending notifications to many users
- Set up a queue system for high-volume notifications
- Use Firebase Topic Messaging for broad audience notifications
- Implement token cleanup jobs to remove stale device tokens

## Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [React Native Firebase Messaging](https://rnfirebase.io/messaging/usage)
- [Notifee Documentation](https://notifee.app/react-native/docs/overview)