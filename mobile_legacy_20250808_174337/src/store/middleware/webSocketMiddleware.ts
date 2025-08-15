import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { webSocketService } from '../../services/webSocketService';
import { updateTaskInList, removeTaskFromList, addTaskToList } from '../slices/tasksSlice';
import { updateGroupInList, addGroup, removeGroup } from '../slices/groupsSlice';
import { Task } from '../../types/task.types';
import { Group } from '../../types/group.types';

// WebSocket middleware for handling real-time events
export const webSocketMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  // Auth durumundaki değişiklikleri dinle
  const state = store.getState() as any;
  const actionTyped = action as AnyAction;

  // Kullanıcı giriş yaptığında WebSocket'e bağlan
  if (actionTyped.type === 'auth/loginAsync/fulfilled') {
    webSocketService.connect().catch(console.error);
    
    // Kullanıcının gruplarına katıl
    const groups = state.groups.groups;
    groups.forEach((group: Group) => {
      webSocketService.joinGroup(group.id);
    });
  }

  // Kullanıcı çıkış yaptığında WebSocket bağlantısını kes
  if (actionTyped.type === 'auth/logout') {
    webSocketService.disconnect();
  }

  // Grup işlemlerinde WebSocket rooms'larını yönet
  if (actionTyped.type === 'groups/joinGroup/fulfilled') {
    const group = actionTyped.payload as Group;
    webSocketService.joinGroup(group.id);
  }

  if (actionTyped.type === 'groups/leaveGroup/fulfilled') {
    const groupId = actionTyped.payload as string;
    webSocketService.leaveGroup(groupId);
  }

  return result;
};

// WebSocket event handlers'ı başlat
export const initializeWebSocketHandlers = (store: any) => {
  // Task güncellemeleri
  webSocketService.on('task_updated', (task: Task) => {
    store.dispatch(updateTaskInList(task));
  });

  webSocketService.on('task_created', (task: Task) => {
    store.dispatch(addTaskToList(task));
  });

  webSocketService.on('task_deleted', (data: { taskId: string }) => {
    store.dispatch(removeTaskFromList(data.taskId));
  });

  webSocketService.on('task_completed', (task: Task) => {
    store.dispatch(updateTaskInList(task));
  });

  // Grup güncellemeleri
  webSocketService.on('group_updated', (group: Group) => {
    store.dispatch(updateGroupInList(group));
  });

  webSocketService.on('member_joined', (data: { group: Group; member: any }) => {
    store.dispatch(updateGroupInList(data.group));
  });

  webSocketService.on('member_left', (data: { group: Group; member: any }) => {
    store.dispatch(updateGroupInList(data.group));
  });

  // Bildirimler
  webSocketService.on('notification', (notification: any) => {
    // Toast notification göster
    console.log('Yeni bildirim:', notification);
    // TODO: Toast/Alert göster
  });

  webSocketService.on('sla_warning', (data: { task: Task; timeLeft: number }) => {
    console.log('SLA uyarısı:', data);
    // TODO: Kritik bildirim göster
  });

  // Bağlantı durumu güncellemeleri
  webSocketService.on('connect', () => {
    console.log('WebSocket bağlantısı kuruldu');
  });

  webSocketService.on('disconnect', () => {
    console.log('WebSocket bağlantısı kesildi');
  });

  webSocketService.on('reconnect', (attemptNumber: number) => {
    console.log(`WebSocket yeniden bağlandı (deneme: ${attemptNumber})`);
  });

  webSocketService.on('connect_error', (error: Error) => {
    console.error('WebSocket bağlantı hatası:', error);
  });

  webSocketService.on('reconnect_error', (error: Error) => {
    console.error('WebSocket yeniden bağlanma hatası:', error);
  });
};
