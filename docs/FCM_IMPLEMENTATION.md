# Firebase Cloud Messaging (FCM) Implementation

Bu dokümantasyon homeTeam uygulamasında Firebase Cloud Messaging entegrasyonunu açıklar.

## 🏗️ Backend Implementation

### 1. Firebase Service Setup
- **Dosya**: `backend/src/config/firebase.service.ts`
- **Amaç**: Firebase Admin SDK başlatma ve messaging service sağlama
- **Özellikler**:
  - Environment variable ile service account key yönetimi
  - Singleton pattern ile service instance yönetimi
  - Error handling ve initialization status kontrolü

### 2. Database Schemas
#### DeviceToken Schema (`backend/src/modules/notifications/schemas/device-token.schema.ts`)
```typescript
{
  userId: ObjectId,           // User referansı
  token: String,              // FCM device token
  platform: 'ios' | 'android', // Platform bilgisi
  deviceInfo: {               // Cihaz detayları
    model?: String,
    version?: String,
    appVersion?: String
  },
  isActive: Boolean,          // Aktif durum
  lastUsed: Date             // Son kullanım tarihi
}
```

#### Notification Schema (`backend/src/modules/notifications/schemas/notification.schema.ts`)
```typescript
{
  recipient: ObjectId,        // Alıcı user ID
  title: String,              // Bildirim başlığı
  body: String,               // Bildirim içeriği
  type: String,               // Bildirim tipi (task_assigned, etc.)
  status: 'SENT' | 'DELIVERED' | 'READ', // Durum
  data?: Object,              // Ekstra payload
  sentAt: Date,               // Gönderim tarihi
  deliveredAt?: Date,         // Teslim tarihi
  readAt?: Date,              // Okunma tarihi
  fcmMessageId?: String       // FCM mesaj ID
}
```

### 3. Notification Service
- **Dosya**: `backend/src/modules/notifications/notification.service.ts`
- **Amaç**: FCM operasyonları ve bildirim yönetimi
- **Ana Metodlar**:
  - `registerDeviceToken()`: Device token kaydetme
  - `sendNotificationToUser()`: Kullanıcıya bildirim gönderme
  - `sendNotificationToGroup()`: Gruba bildirim gönderme
  - `getUserNotificationHistory()`: Bildirim geçmişi
  - `markNotificationAsRead()`: Okundu işaretleme
  - `getUnreadNotificationCount()`: Okunmamış sayısı

### 4. Notification Controller
- **Dosya**: `backend/src/modules/notifications/notification.controller.ts`
- **Endpoints**:
  - `POST /notifications/register-device`: Device token kaydetme
  - `POST /notifications/send-to-user`: Kullanıcıya bildirim
  - `POST /notifications/send-to-group`: Gruba bildirim
  - `GET /notifications/history`: Bildirim geçmişi
  - `POST /notifications/:id/read`: Okundu işaretleme
  - `GET /notifications/unread-count`: Okunmamış sayısı
  - `GET /notifications/device-tokens`: Kullanıcı device token'ları

### 5. Module Registration
- **Dosya**: `backend/src/modules/notifications/notification.module.ts`
- **Dosya**: `backend/src/app.module.ts` (NotificationModule import)

## 📱 Mobile Implementation

### 1. Firebase Service
- **Dosya**: `mobile/src/services/firebaseNotificationService.ts`
- **Amaç**: Mobile FCM operasyonları ve bildirim yönetimi
- **Özellikler**:
  - FCM token alma ve backend'e kaydetme
  - Permission handling (Android/iOS)
  - Foreground/Background/Quit state notification handling
  - Notification data payload işleme
  - Navigation handling bildirim açılışında

### 2. App Integration
- **Dosya**: `mobile/App.tsx`
- **Değişiklik**: Firebase notification service başlatma

### 3. Notifications Screen
- **Dosya**: `mobile/src/screens/NotificationsScreen.tsx`
- **Özellikler**:
  - Bildirim geçmişi listesi
  - Okundu/Okunmadı durumu gösterimi
  - Arama functionality
  - Pull-to-refresh
  - Pagination (infinite scroll)
  - Toplu okundu işaretleme

## 🔧 Configuration Files

### 1. Firebase Config
- **Mobile**: `mobile/firebase.json`
- **Android**: `mobile/android/app/google-services.json`
- **iOS**: `mobile/ios/GoogleService-Info.plist`

### 2. Environment Variables (Backend)
```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

## 📦 Dependencies

### Backend
```json
{
  "firebase-admin": "^12.0.0"
}
```

### Mobile
```json
{
  "@react-native-firebase/app": "^20.1.0",
  "@react-native-firebase/messaging": "^20.1.0",
  "@react-native-firebase/analytics": "^20.1.0"
}
```

## 🚀 Usage Examples

### Backend: Kullanıcıya Bildirim Gönderme
```typescript
await notificationService.sendNotificationToUser(
  userId,
  'Yeni Görev',
  'Size yeni bir görev atandı: Bulaşık yıkama',
  'task_assigned',
  { taskId: '507f1f77bcf86cd799439011' }
);
```

### Backend: Gruba Bildirim Gönderme
```typescript
await notificationService.sendNotificationToGroup(
  groupId,
  'Grup Duyurusu',
  'Haftalık toplantı yarın saat 19:00\'da',
  'announcement'
);
```

### Mobile: FCM Token Alma
```typescript
const token = await firebaseNotificationService.getFCMToken();
console.log('FCM Token:', token);
```

### Mobile: Bildirim Geçmişi
```typescript
const notifications = await firebaseNotificationService.getNotificationHistory(1, 20);
```

## 🔔 Notification Types

1. **task_assigned**: Görev atama bildirimi
2. **task_completed**: Görev tamamlama bildirimi
3. **group_invitation**: Grup daveti bildirimi
4. **reminder**: Hatırlatma bildirimi
5. **announcement**: Duyuru bildirimi

## 🎯 Notification Data Payload

```typescript
{
  type: 'task_assigned',
  taskId: '507f1f77bcf86cd799439011',
  groupId: '507f1f77bcf86cd799439012',
  userId: '507f1f77bcf86cd799439013'
}
```

## 📋 TODO

- [ ] Firebase konfigürasyon dosyalarını gerçek değerlerle güncelle
- [ ] iOS push notification setup (APNs certificate)
- [ ] Bildirim kategorileri ve custom sound
- [ ] Rich notifications (resim, action buttons)
- [ ] Scheduled notifications
- [ ] A/B testing için notification variants
- [ ] Analytics ve tracking
- [ ] Rate limiting ve spam protection

## 🔐 Security Considerations

1. **Device Token Validation**: Backend'de device token geçerliliği kontrol edilmeli
2. **Rate Limiting**: Kullanıcı başına bildirim gönderim limiti
3. **Permission Check**: Notification permission durumu kontrol edilmeli
4. **Data Sanitization**: Notification içeriği sanitize edilmeli
5. **User Preferences**: Kullanıcı bildirim tercihleri yönetimi

## 🐛 Debugging

### FCM Token Kontrolü
```typescript
console.log('FCM Token:', await firebaseNotificationService.getCurrentToken());
console.log('Service Status:', firebaseNotificationService.isServiceInitialized());
```

### Backend Log Monitoring
```bash
# Notification service logları
grep "NotificationService" logs/app.log

# FCM mesaj gönderim logları
grep "FCM" logs/app.log
```

### Network Request Debugging
```typescript
// Mobile - API isteklerini logla
console.log('API Request:', endpoint, data);
console.log('API Response:', response);
```

## 📈 Performance Optimization

1. **Batch Notifications**: Çoklu gönderimler için batch API kullanımı
2. **Token Cleanup**: Inactive device token'ları düzenli temizleme
3. **Database Indexing**: Notification queries için optimum indexler
4. **Caching**: Frequent queries için Redis cache
5. **Background Processing**: Heavy notification operations için queue system

---

Bu implementasyon sayesinde homeTeam uygulaması tam fonksiyonel push notification sistemi ile donatılmıştır. Kullanıcılar görev atamaları, grup duyuruları ve diğer önemli olaylar hakkında anında bilgilendirilecektir.
