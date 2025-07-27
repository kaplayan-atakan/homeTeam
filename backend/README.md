# homeTeam Backend API

## 🚀 Kurulum ve Başlatma

### Gereksinimler
- Node.js v18+
- Docker & Docker Compose
- MongoDB & Redis (Docker ile sağlanır)

### 1. Bağımlılıkları Kurun
```bash
npm install
```

### 2. Environment Dosyasını Hazırlayın
```bash
cp .env.example .env
# .env dosyasını ihtiyaçlarınıza göre düzenleyin
```

### 3. Docker Servisleri Başlatın
```bash
# Ana dizinde (docker-compose.yml olan yerde)
docker-compose up -d mongodb redis
```

### 4. Backend'i Başlatın
```bash
npm run start:dev
```

## 🔐 İlk Kurulum - Admin Kullanıcısı

Backend ilk kurulumda admin kullanıcısı oluşturmak için:

### MongoDB'ye Bağlanın:
```bash
docker exec -it hometeam-mongodb mongosh hometeam --username admin --password homeTeam2025! --authenticationDatabase admin
```

### Admin Kullanıcısı Oluşturun:
```javascript
db.users.insertOne({
  firstName: "Admin",
  lastName: "User",
  email: "admin@hometeam.app",
  password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMesJVcoQ/KcdHh.SK8YQ0S2VS",
  role: "admin",
  status: "active",
  profileImage: null,
  phoneNumber: null,
  googleAuth: null,
  facebookAuth: null,
  spotifyAuth: null,
  youtubeAuth: null,
  groups: [],
  notificationPreferences: {
    email: true,
    push: true,
    sms: false,
    taskReminders: true,
    groupMessages: true
  },
  lastLoginAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### MongoDB'den Çıkın:
```javascript
exit
```

## 👤 Admin Giriş Bilgileri

- **Email**: `admin@hometeam.app`
- **Password**: `admin123456`
- **Role**: `admin`

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Kullanıcı kaydı
- `POST /auth/login` - Giriş yap
- `GET /auth/profile` - Profil bilgisi
- `POST /auth/verify-token` - Token doğrula

### Users
- `GET /users` - Kullanıcı listesi (Admin only)
- `GET /users/profile` - Kendi profili
- `PATCH /users/profile` - Profil güncelle

### Groups
- `GET /groups` - Grup listesi
- `POST /groups` - Yeni grup oluştur
- `GET /groups/:id` - Grup detayı
- `PATCH /groups/:id` - Grup güncelle

### Tasks
- `GET /tasks` - Görev listesi
- `POST /tasks` - Yeni görev oluştur
- `GET /tasks/:id` - Görev detayı
- `PATCH /tasks/:id` - Görev güncelle
- `POST /tasks/:id/complete` - Görevi tamamla

### Notifications
- `GET /notifications` - Bildirim listesi
- `POST /notifications/mark-read` - Okundu işaretle

### Music
- `POST /music/connect` - Müzik servisi bağla
- `GET /music/integrations` - Entegrasyonlar

### Logs (Admin Only)
- `GET /logs/errors` - Hata logları
- `GET /logs/stats` - Log istatistikleri

## 🔧 Geliştirme

### Test Çalıştırma
```bash
npm run test
npm run test:e2e
npm run test:cov
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Build
```bash
npm run build
```

## 🐳 Docker

Tam stack'i Docker ile çalıştırmak için:

```bash
docker-compose up -d
```

Bu komut şu servisleri başlatır:
- MongoDB (Port: 27018)
- Redis (Port: 6380)
- Backend API (Port: 3001)

## 📝 Error Logging

Tüm API hataları otomatik olarak MongoDB'deki `errorlogs` koleksiyonuna kaydedilir:

- HTTP status kodları
- Hata mesajları
- Stack trace'ler
- Request URL ve method
- User ID (varsa)
- Timestamp

## 🔒 Güvenlik

- JWT token tabanlı authentication
- Role-based access control (RBAC)
- Input validation (class-validator)
- Rate limiting
- CORS konfigürasyonu
- Environment variables ile sensitive data
