# homeTeam API Endpoint Test Cases

Bu dokümant mobile uygulama ve admin dashboard'da kullanılan tüm API endpoint'lerinin test case'lerini içerir.

## 🔐 Authentication Endpoints

### POST /auth/register
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Başarılı Kayıt**
   - **Giriş:** Valid firstName, lastName, email, password
   - **Beklenen:** 201, user objesi, access token
   - **Test Data:** 
     ```json
     {
       "firstName": "Test",
       "lastName": "User", 
       "email": "test@example.com",
       "password": "Test123!@#"
     }
     ```

2. **❌ Email Zaten Kayıtlı**
   - **Giriş:** Mevcut email adresi
   - **Beklenen:** 409, "Bu email adresi zaten kullanımda"

3. **❌ Geçersiz Email Formatı**
   - **Giriş:** "invalid-email"
   - **Beklenen:** 400, validation error

4. **❌ Zayıf Şifre**
   - **Giriş:** "123"
   - **Beklenen:** 400, "Şifre en az 8 karakter olmalı"

5. **❌ Eksik Alanlar**
   - **Giriş:** firstName eksik
   - **Beklenen:** 400, validation error

### POST /auth/login
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Başarılı Giriş**
   - **Giriş:** Geçerli email + password
   - **Beklenen:** 200, user objesi, access + refresh token

2. **❌ Yanlış Şifre**
   - **Giriş:** Doğru email + yanlış password
   - **Beklenen:** 401, "Email veya şifre hatalı"

3. **❌ Kayıtlı Olmayan Email**
   - **Giriş:** Olmayan email
   - **Beklenen:** 401, "Email veya şifre hatalı"

4. **❌ Email Format Hatası**
   - **Giriş:** "not-an-email"
   - **Beklenen:** 400, validation error

### GET /auth/profile
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Profil Bilgisi Alma**
   - **Giriş:** Geçerli JWT token
   - **Beklenen:** 200, user profile data

2. **❌ Token Yok**
   - **Giriş:** Authorization header yok
   - **Beklenen:** 401, "Token gerekli"

3. **❌ Geçersiz Token**
   - **Giriş:** Bozuk/expired token
   - **Beklenen:** 401, "Geçersiz token"

### POST /auth/refresh
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Token Yenileme**
   - **Giriş:** Geçerli refresh token
   - **Beklenen:** 200, yeni access token

2. **❌ Geçersiz Refresh Token**
   - **Giriş:** Expired/invalid refresh token
   - **Beklenen:** 401, "Refresh token geçersiz"

### POST /auth/logout
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Çıkış Yapma**
   - **Giriş:** Geçerli access token
   - **Beklenen:** 200, "Başarıyla çıkış yapıldı"

2. **❌ Token Olmadan Çıkış**
   - **Giriş:** Token yok
   - **Beklenen:** 401, "Token gerekli"

## 👥 Users Endpoints

### GET /users
**Kullanım:** Admin (User Management)
**Test Cases:**

1. **✅ Kullanıcı Listesi (Admin)**
   - **Giriş:** Admin token + pagination params
   - **Beklenen:** 200, paginated user list

2. **❌ Normal Kullanıcı Erişimi**
   - **Giriş:** Normal user token
   - **Beklenen:** 403, "Admin yetkisi gerekli"

### GET /users/profile
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Kendi Profili Görme**
   - **Giriş:** Geçerli user token
   - **Beklenen:** 200, kendi profile data

### PATCH /users/profile
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Profil Güncelleme**
   - **Giriş:** Geçerli update data
   - **Beklenen:** 200, updated profile

2. **❌ Geçersiz Data**
   - **Giriş:** Invalid email format
   - **Beklenen:** 400, validation error

### PATCH /users/:id/role
**Kullanım:** Admin
**Test Cases:**

1. **✅ Rol Değiştirme (Admin)**
   - **Giriş:** Admin token + target user ID + new role
   - **Beklenen:** 200, "Rol güncellendi"

2. **❌ Normal User Rol Değiştirme**
   - **Giriş:** Normal user token
   - **Beklenen:** 403, "Admin yetkisi gerekli"

## 📋 Tasks Endpoints

### GET /tasks
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Task Listesi**
   - **Giriş:** Valid pagination params
   - **Beklenen:** 200, paginated task list

2. **✅ Filtreleme**
   - **Giriş:** status=pending, priority=high
   - **Beklenen:** 200, filtered tasks

### POST /tasks
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Task Oluşturma**
   - **Giriş:** Valid task data
   - **Beklenen:** 201, created task object

2. **❌ Eksik Gerekli Alanlar**
   - **Giriş:** title eksik
   - **Beklenen:** 400, validation error

### GET /tasks/:id
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Task Detayı**
   - **Giriş:** Valid task ID
   - **Beklenen:** 200, task details

2. **❌ Olmayan Task**
   - **Giriş:** Non-existent ID
   - **Beklenen:** 404, "Task bulunamadı"

### PATCH /tasks/:id
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Task Güncelleme**
   - **Giriş:** Valid update data
   - **Beklenen:** 200, updated task

2. **❌ Başkasının Task'ını Güncelleme**
   - **Giriş:** Unauthorized user
   - **Beklenen:** 403, "Bu task'ı güncelleme yetkiniz yok"

### DELETE /tasks/:id
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Task Silme**
   - **Giriş:** Task owner veya admin
   - **Beklenen:** 200, "Task silindi"

2. **❌ Yetkisiz Silme**
   - **Giriş:** Unauthorized user
   - **Beklenen:** 403, "Bu task'ı silme yetkiniz yok"

### POST /tasks/:id/complete
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Task Tamamlama**
   - **Giriş:** Assigned user + completion data
   - **Beklenen:** 200, completed task

2. **❌ Atanmamış User Tamamlama**
   - **Giriş:** Non-assigned user
   - **Beklenen:** 403, "Bu task'ı tamamlama yetkiniz yok"

### POST /tasks/:id/assign
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Task Atama**
   - **Giriş:** Group admin + target user ID
   - **Beklenen:** 200, "Task atandı"

2. **❌ Olmayan User'a Atama**
   - **Giriş:** Non-existent user ID
   - **Beklenen:** 404, "Kullanıcı bulunamadı"

### GET /tasks/my/pending
**Kullanım:** Mobile
**Test Cases:**

1. **✅ Bekleyen Task'larım**
   - **Giriş:** User token
   - **Beklenen:** 200, user's pending tasks

### GET /tasks/my/overdue
**Kullanım:** Mobile
**Test Cases:**

1. **✅ Geciken Task'larım**
   - **Giriş:** User token
   - **Beklenen:** 200, user's overdue tasks

### GET /tasks/group/:groupId
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Grup Task'ları**
   - **Giriş:** Group member token + group ID
   - **Beklenen:** 200, group tasks

2. **❌ Üye Olmayan Grup**
   - **Giriş:** Non-member user
   - **Beklenen:** 403, "Bu gruba erişim yetkiniz yok"

## 👨‍👩‍👧‍👦 Groups Endpoints

### GET /groups
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Kullanıcının Grupları**
   - **Giriş:** User token
   - **Beklenen:** 200, user's groups

### POST /groups
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Grup Oluşturma**
   - **Giriş:** Valid group data
   - **Beklenen:** 201, created group

2. **❌ Aynı İsimde Grup**
   - **Giriş:** Existing group name
   - **Beklenen:** 409, "Bu isimde grup zaten var"

### GET /groups/:id
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Grup Detayı**
   - **Giriş:** Group member token + group ID
   - **Beklenen:** 200, group details

2. **❌ Üye Olmayan Grup Detayı**
   - **Giriş:** Non-member user
   - **Beklenen:** 403, "Bu gruba erişim yetkiniz yok"

### PATCH /groups/:id
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Grup Güncelleme**
   - **Giriş:** Group admin + update data
   - **Beklenen:** 200, updated group

2. **❌ Normal Üye Güncelleme**
   - **Giriş:** Normal member
   - **Beklenen:** 403, "Grup admin yetkisi gerekli"

### DELETE /groups/:id
**Kullanım:** Admin
**Test Cases:**

1. **✅ Grup Silme**
   - **Giriş:** Group owner/admin
   - **Beklenen:** 200, "Grup silindi"

2. **❌ Normal Üye Silme**
   - **Giriş:** Normal member
   - **Beklenen:** 403, "Grup silme yetkiniz yok"

### POST /groups/:id/join
**Kullanım:** Mobile
**Test Cases:**

1. **✅ Gruba Katılma**
   - **Giriş:** Valid invite code/link
   - **Beklenen:** 200, "Gruba katıldınız"

2. **❌ Geçersiz Davet Kodu**
   - **Giriş:** Invalid invite code
   - **Beklenen:** 400, "Geçersiz davet kodu"

3. **❌ Zaten Üye**
   - **Giriş:** Already member user
   - **Beklenen:** 409, "Zaten bu grubun üyesisiniz"

### POST /groups/:id/leave
**Kullanım:** Mobile
**Test Cases:**

1. **✅ Gruptan Ayrılma**
   - **Giriş:** Group member token
   - **Beklenen:** 200, "Gruptan ayrıldınız"

2. **❌ Üye Olmayan Ayrılma**
   - **Giriş:** Non-member user
   - **Beklenen:** 404, "Bu grubun üyesi değilsiniz"

### POST /groups/:id/members
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Üye Davet Etme**
   - **Giriş:** Group admin + email
   - **Beklenen:** 200, "Davet gönderildi"

2. **❌ Normal Üye Davet**
   - **Giriş:** Normal member
   - **Beklenen:** 403, "Davet gönderme yetkiniz yok"

### DELETE /groups/:id/members/:memberId
**Kullanım:** Admin
**Test Cases:**

1. **✅ Üye Çıkarma**
   - **Giriş:** Group admin + member ID
   - **Beklenen:** 200, "Üye çıkarıldı"

2. **❌ Normal Üye Çıkarma**
   - **Giriş:** Normal member
   - **Beklenen:** 403, "Üye çıkarma yetkiniz yok"

## 🔔 Notifications Endpoints

### GET /notifications
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Bildirim Listesi**
   - **Giriş:** User token + pagination
   - **Beklenen:** 200, user's notifications

2. **✅ Okunmamış Filtresi**
   - **Giriş:** isRead=false
   - **Beklenen:** 200, unread notifications

### POST /notifications
**Kullanım:** Admin
**Test Cases:**

1. **✅ Bildirim Oluşturma**
   - **Giriş:** Admin token + notification data
   - **Beklenen:** 201, created notification

2. **❌ Normal User Oluşturma**
   - **Giriş:** Normal user token
   - **Beklenen:** 403, "Admin yetkisi gerekli"

### PATCH /notifications/:id
**Kullanım:** Mobile + Admin
**Test Cases:**

1. **✅ Bildirim Güncelleme**
   - **Giriş:** Notification owner + update data
   - **Beklenen:** 200, updated notification

### POST /notifications/mark-read
**Kullanım:** Mobile
**Test Cases:**

1. **✅ Bildirim Okundu İşareti**
   - **Giriş:** Notification ID array
   - **Beklenen:** 200, "Bildirimler okundu olarak işaretlendi"

### POST /notifications/mark-all-read
**Kullanım:** Mobile
**Test Cases:**

1. **✅ Tümünü Okundu İşareti**
   - **Giriş:** User token
   - **Beklenen:** 200, "Tüm bildirimler okundu"

## 🎵 Music Endpoints

### GET /music/integrations
**Kullanım:** Mobile
**Test Cases:**

1. **✅ Müzik Entegrasyonları**
   - **Giriş:** User token
   - **Beklenen:** 200, connected music services

### POST /music/connect
**Kullanım:** Mobile
**Test Cases:**

1. **✅ Spotify Bağlama**
   - **Giriş:** Spotify auth code
   - **Beklenen:** 200, "Spotify bağlandı"

2. **❌ Geçersiz Auth Code**
   - **Giriş:** Invalid auth code
   - **Beklenen:** 400, "Geçersiz yetkilendirme kodu"

### POST /music/play
**Kullanım:** Mobile
**Test Cases:**

1. **✅ Müzik Çalma**
   - **Giriş:** Track/playlist ID
   - **Beklenen:** 200, "Müzik çalıyor"

2. **❌ Servis Bağlı Değil**
   - **Giriş:** User without connected service
   - **Beklenen:** 400, "Önce müzik servisi bağlayın"

## 📊 Admin Dashboard Specific Endpoints

### GET /logs/stats
**Kullanım:** Admin
**Test Cases:**

1. **✅ Hata İstatistikleri**
   - **Giriş:** Admin token + date range
   - **Beklenen:** 200, error statistics

2. **❌ Normal User Erişimi**
   - **Giriş:** Normal user token
   - **Beklenen:** 403, "Admin yetkisi gerekli"

### GET /logs/recent
**Kullanım:** Admin
**Test Cases:**

1. **✅ Son Hatalar**
   - **Giriş:** Admin token + limit
   - **Beklenen:** 200, recent error logs

### GET /users (Admin Panel)
**Kullanım:** Admin
**Test Cases:**

1. **✅ Kullanıcı Yönetimi Listesi**
   - **Giriş:** Admin token + search/filter params
   - **Beklenen:** 200, paginated users with management data

2. **✅ Kullanıcı Arama**
   - **Giriş:** search query
   - **Beklenen:** 200, matching users

### GET /tasks/stats/overview
**Kullanım:** Admin
**Test Cases:**

1. **✅ Task İstatistikleri**
   - **Giriş:** Admin token + date filters
   - **Beklenen:** 200, task completion stats

## 🚀 Mobile App Specific Endpoints

### GET /tasks/my/pending
**Kullanım:** Mobile (Dashboard)
**Test Cases:**

1. **✅ Ana Sayfa Bekleyen Görevler**
   - **Giriş:** User token
   - **Beklenen:** 200, pending tasks for dashboard

### GET /tasks/my/completed-today
**Kullanım:** Mobile (Dashboard)
**Test Cases:**

1. **✅ Bugün Tamamlanan Görevler**
   - **Giriş:** User token
   - **Beklenen:** 200, today's completed tasks

### POST /tasks/quick/simple
**Kullanım:** Mobile (Quick Add)
**Test Cases:**

1. **✅ Hızlı Görev Ekleme**
   - **Giriş:** Minimal task data (title only)
   - **Beklenen:** 201, created simple task

### PATCH /tasks/:id/quick-complete
**Kullanım:** Mobile (Swipe Actions)
**Test Cases:**

1. **✅ Hızlı Tamamlama**
   - **Giriş:** Task ID
   - **Beklenen:** 200, quickly completed task

## 📱 Performance & Error Handling Tests

### Rate Limiting Tests
1. **⚠️ Rate Limit Aşımı**
   - **Giriş:** 100+ requests/minute
   - **Beklenen:** 429, "Too many requests"

### Timeout Tests
1. **⚠️ Request Timeout**
   - **Giriş:** Simulated slow network
   - **Beklenen:** Timeout error handling

### Network Error Tests
1. **⚠️ Network Kesintisi**
   - **Giriş:** Offline durumu
   - **Beklenen:** Graceful error handling

### Invalid Data Tests
1. **❌ Malformed JSON**
   - **Giriş:** Bozuk JSON data
   - **Beklenen:** 400, JSON parse error

2. **❌ SQL Injection Attempt**
   - **Giriş:** Malicious SQL in input
   - **Beklenen:** 400, sanitized input

## 🔄 Integration Tests

### WebSocket Tests
1. **✅ Real-time Task Updates**
   - **Senaryo:** Task status change → WebSocket notification
   - **Beklenen:** Instant UI update

2. **✅ Group Notifications**
   - **Senaryo:** New group member → All members get notification
   - **Beklenen:** Real-time notification delivery

### Cross-Platform Sync Tests
1. **✅ Mobile-Admin Sync**
   - **Senaryo:** Mobile'da task create → Admin'de görünmeli
   - **Beklenen:** Consistent data across platforms

## 📋 Test Execution Checklist

### Pre-Test Setup
- [ ] Backend server running on port 3001
- [ ] MongoDB connection active
- [ ] Redis cache running
- [ ] Test database cleaned
- [ ] Test users created

### Test Categories
- [ ] Authentication flows
- [ ] User management
- [ ] Task CRUD operations
- [ ] Group operations
- [ ] Notification system
- [ ] Music integration
- [ ] Admin dashboard functions
- [ ] Mobile-specific features
- [ ] Error handling
- [ ] Performance limits

### Post-Test Cleanup
- [ ] Test data cleared
- [ ] Database reset
- [ ] Cache cleared
- [ ] Log files archived

---

**Total Test Cases:** 150+
**Estimated Test Duration:** 8-12 hours
**Coverage Areas:** Authentication, CRUD, Permissions, Real-time, Performance
