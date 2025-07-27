# homeTeam - Aile Görev Takip Uygulaması

Modern aile ve grup yaşamı için geliştirilmiş kapsamlı görev takip ve yönetim uygulaması. React Native tabanlı mobil uygulama ve NestJS backend API ile SOLID prensipleri uygulanarak modüler mimari benimsenmiştir.

## 🌟 Özellikler

### 🎯 Temel Özellikler
- **Görev Yönetimi**: Detaylı görev oluşturma, atama ve takip
- **SLA Takibi**: Görevler için belirlenen süre takibi ve uyarılar
- **Gerçek Zamanlı Güncellemeler**: WebSocket ile anlık bildirimler
- **Çoklu Grup Desteği**: Farklı gruplarda üyelik ve görev yönetimi
- **Akıllı Bildirimler**: E-posta, push ve SMS bildirimleri

### 🚀 Gelişmiş Özellikler
- **OAuth Entegrasyonu**: Google ve Facebook ile hızlı giriş
- **Müzik Entegrasyonu**: Spotify ve YouTube çalma listesi entegrasyonu
- **Gamification**: Puan sistemi ve başarı rozetleri
- **Offline Desteği**: İnternet bağlantısı olmadan temel işlemler
- **Çoklu Dil Desteği**: Türkçe ve İngilizce

### 📱 Kullanıcı Deneyimi
- **Modern UI/UX**: React Native Paper ile native görünüm
- **Karanlık/Aydınlık Tema**: Kullanıcı tercih sistemi
- **Erişilebilirlik**: WCAG standartlarına uygun tasarım
- **Performans**: Optimize edilmiş listeler ve cache sistemi

## 🏗️ Teknoloji Yığını

### Backend
- **Framework**: NestJS + TypeScript
- **Veritabanı**: MongoDB + Redis
- **Kimlik Doğrulama**: JWT + Passport (OAuth)
- **Gerçek Zamanlı**: Socket.IO WebSocket
- **API Entegrasyonları**: Spotify, YouTube, Google, Facebook
- **Container**: Docker + Docker Compose

### Frontend (Mobile)
- **Framework**: React Native + TypeScript
- **State Management**: Redux Toolkit + Redux Persist
- **Navigation**: React Navigation v6
- **UI Kütüphanesi**: React Native Paper
- **HTTP Client**: Axios + Socket.IO Client
- **Bildirimler**: React Native Push Notifications

### DevOps & Tools
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions (planlı)
- **Monitoring**: Sentry, Prometheus (planlı)
- **Testing**: Jest, React Native Testing Library

## 📁 Proje Yapısı

```
homeTeam/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/        # İş mantığı modülleri
│   │   │   ├── auth/       # Kimlik doğrulama
│   │   │   ├── users/      # Kullanıcı yönetimi
│   │   │   ├── tasks/      # Görev yönetimi
│   │   │   ├── groups/     # Grup yönetimi
│   │   │   ├── notifications/ # Bildirim sistemi
│   │   │   └── music/      # Müzik entegrasyonu
│   │   ├── websocket/      # WebSocket sunucusu
│   │   └── config/         # Konfigürasyon
│   ├── Dockerfile
│   └── package.json
├── mobile/                 # React Native App
│   ├── src/
│   │   ├── components/     # Tekrar kullanılabilir bileşenler
│   │   ├── screens/        # Ekran komponenleri
│   │   ├── navigation/     # Navigasyon yapısı
│   │   ├── store/          # Redux store
│   │   ├── services/       # API servisleri
│   │   ├── types/          # TypeScript tipleri
│   │   └── utils/          # Yardımcı fonksiyonlar
│   ├── App.tsx
│   └── package.json
├── docker-compose.yml      # Geliştirme ortamı
└── README.md
```

## 🚀 Kurulum

### Gereksinimler
- Node.js v18+
- Docker & Docker Compose
- React Native development environment
- MongoDB & Redis (Docker ile sağlanır)

### 1. Repository'yi Klonlama
```bash
git clone https://github.com/kaplayan-atakan/homeTeam.git
cd homeTeam
```

### 2. Backend Kurulumu
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin
npm run start:dev
```

### 3. Mobile Kurulumu
```bash
cd mobile
npm install
# iOS için
cd ios && pod install && cd ..
# Android için development environment kurun
```

### 4. Docker ile Hızlı Başlangıç
```bash
# Ana dizinde
docker-compose up -d
```

Bu komut aşağıdaki servisleri başlatır:
- MongoDB (Port: 27017)
- Redis (Port: 6379)
- Backend API (Port: 3001)
- MongoDB Express (Port: 8081)
- Redis Commander (Port: 8082)

## 🔧 Konfigürasyon

### Environment Variables
Backend `.env` dosyasında aşağıdaki değişkenleri ayarlayın:

```env
# Veritabanı
MONGODB_URI=mongodb://localhost:27017/hometeam
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Müzik API
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
YOUTUBE_API_KEY=your-youtube-api-key
```

## 📱 Kullanım

### API Endpoints
```bash
# Kimlik Doğrulama
POST /api/auth/register     # Kayıt ol
POST /api/auth/login        # Giriş yap
GET  /api/auth/profile      # Profil bilgisi

# Görevler
GET    /api/tasks          # Görev listesi
POST   /api/tasks          # Yeni görev
GET    /api/tasks/:id      # Görev detayı
PATCH  /api/tasks/:id      # Görev güncelle
DELETE /api/tasks/:id      # Görev sil

# Gruplar
GET  /api/groups           # Grup listesi
POST /api/groups           # Yeni grup
GET  /api/groups/:id       # Grup detayı
```

### WebSocket Events
```typescript
// Client -> Server
'join_group'     // Gruba katıl
'task_update'    // Görev güncelle
'add_comment'    // Yorum ekle

// Server -> Client
'task_updated'   // Görev güncellendi
'notification'   // Yeni bildirim
'sla_warning'    // SLA uyarısı
```

## 🧪 Test

```bash
# Backend testleri
cd backend
npm run test
npm run test:e2e
npm run test:cov

# Mobile testleri
cd mobile
npm test
npm run test:watch
```

## 📊 Performans ve İzleme

- **Database Indexing**: MongoDB optimum index'ler
- **Redis Caching**: Sık kullanılan veriler cache'lenir
- **Pagination**: Büyük listelerde sayfalama
- **Lazy Loading**: Component'lerde performans optimizasyonu

## 🔒 Güvenlik

- JWT token tabanlı kimlik doğrulama
- Role-based access control (RBAC)
- Input validation ve sanitization
- Rate limiting
- CORS konfigürasyonu
- Environment variables ile sensitive data koruması

## 🤝 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit'leyin (`git commit -m 'feat: amazing feature eklendi'`)
4. Branch'inizi push'layın (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Commit Mesajı Formatı
```
feat: yeni özellik eklendi
fix: hata düzeltildi
docs: dokümantasyon güncellendi
style: kod stili düzenlendi
refactor: kod yeniden düzenlendi
test: test eklendi
chore: geliştirme araçları güncellendi
```

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır - [LICENSE](LICENSE) dosyasını inceleyebilirsiniz.

## 👥 Ekip

- **Atakan** - *Geliştirici* - [GitHub](https://github.com/kaplayan-atakan)

## 🆘 Destek

Sorularınız ve geri bildirimleriniz için:
- GitHub Issues
- Email: destek@hometeam.app

## 🎯 Roadmap

- [ ] iOS ve Android uygulama mağazası yayını
- [ ] Web dashboard (React.js)
- [ ] AI destekli görev önerileri
- [ ] Gelişmiş analitik dashboard
- [ ] Çoklu dil desteği genişletme
- [ ] Apple Watch ve Wear OS uygulamaları

---

⭐ **Bu proje faydalı oldu mu? Yıldız vererek destek olabilirsiniz!**
