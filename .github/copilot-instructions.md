# GitHub Copilot Instructions - homeTeam Projesi

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Proje Hakkında

Bu proje, aile ve grup bazlı görev takibi için geliştirilen bir React Native mobil uygulaması ve NestJS backend API'sidir. Proje, SOLID prensipleri ve modüler mimariyi benimser.

## Teknoloji Yığını

### Backend
- **Framework**: NestJS + TypeScript
- **Veritabanı**: MongoDB + Redis
- **Kimlik Doğrulama**: JWT + OAuth (Google, Facebook)
- **Gerçek Zamanlı İletişim**: WebSocket (Socket.IO)
- **Müzik Entegrasyonu**: Spotify + YouTube API
- **Container**: Docker + Docker Compose
- **Cache Management**: Redis ile Session, API Response ve Rate Limiting
- **Error Logging**: MongoDB tabanlı kapsamlı hata takibi

### Frontend (Mobile)
- **Framework**: React Native + TypeScript
- **State Management**: Redux Toolkit + Redux Persist
- **Navigation**: React Navigation v6
- **UI Framework**: React Native Paper
- **HTTP Client**: Axios
- **WebSocket**: Socket.IO Client

### Admin Dashboard (Web)
- **Framework**: Next.js 14 + TypeScript
- **UI Framework**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand + React Query (TanStack Query)
- **Charts & Analytics**: Recharts + Chart.js
- **Authentication**: NextAuth.js ile Backend JWT entegrasyonu
- **Real-time Updates**: Socket.IO Client
- **HTTP Client**: Axios + React Query

## Kodlama Standartları

### Genel Kurallar
- **Dil**: Kod ve değişken isimleri İngilizce, hata mesajları ve kullanıcı arayüzü Türkçe
- **İsimlendirme**: camelCase (fonksiyon/değişken), PascalCase (class/component/interface)
- **SOLID Prensipleri**: Her modül ve sınıf tek sorumluluk ilkesine uymalı
- **Modüler Mimari**: İş mantığı katmanları net bir şekilde ayrılmalı
- **Error Handling**: Tüm hata mesajları Türkçe ve açıklayıcı olmalı

### Backend (NestJS) Kuralları
- Her modül kendi klasöründe: `dto/`, `schemas/`, `services/`, `controllers/`
- Dependency Injection kullan
- Guard'lar ve Decorator'lar ile yetkilendirme
- Validation Pipe ile input doğrulama
- MongoDB ile Mongoose kullan
- Redis ile cache yönetimi
- WebSocket için Socket.IO

### Frontend (React Native) Kuralları
- Fonksiyonel componentler kullan
- React Hooks pattern'i uygula
- TypeScript strict mode
- Redux Toolkit ile state management
- Custom hooks ile logic separation
- React Navigation v6 pattern'leri
- React Native Paper components

## Önemli Özellikler

1. **SLA Takibi**: Görevlerin belirlenen sürede tamamlanması takibi
2. **Gerçek Zamanlı Bildirimler**: WebSocket ile anlık güncellemeler
3. **Müzik Entegrasyonu**: Görev başlatıldığında çalma listesi çalma
4. **OAuth Entegrasyonu**: Google ve Facebook ile giriş
5. **Offline Support**: Temel görev işlemleri offline çalışabilir
6. **Gamification**: Puan sistemi ve başarı rozeti
7. **Çoklu Grup Desteği**: Kullanıcı birden fazla gruba üye olabilir

## Tek Repo Yapısı (TEK KAYNAK İLKESİ)

⚠️ **ÖNEMLİ**: Bu proje TEK REPOSITORY stratejisini benimser. Tüm uygulamalar (backend, mobile, admin) tek repo'da geliştirilir.

### Ana Klasör Yapısı

```
homeTeam/ (Ana Repository)
├── backend/           # NestJS API Server
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── tasks/
│   │   │   ├── groups/
│   │   │   ├── notifications/
│   │   │   ├── music/
│   │   │   └── logs/
│   │   ├── websocket/
│   │   ├── config/
│   │   ├── cache/
│   │   └── common/
│   ├── Dockerfile
│   └── package.json
├── mobile/            # React Native Uygulaması (TEK MOBİL APP)
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── store/
│   │   ├── services/
│   │   ├── types/
│   │   └── config/
│   ├── android/
│   ├── ios/
│   └── package.json
├── admin/             # Next.js Admin Dashboard
│   ├── src/
│   │   ├── app/ (Next.js 14 App Router)
│   │   ├── components/
│   │   │   ├── ui/ (Shadcn/ui components)
│   │   │   ├── charts/
│   │   │   ├── forms/
│   │   │   └── layout/
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── utils/
│   │   │   └── validations/
│   │   ├── store/
│   │   ├── types/
│   │   └── hooks/
│   └── package.json
├── docs/              # Shared Documentation
│   ├── API_TEST_RESULTS.md
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT-ROADMAP.md
│   └── SYSTEM-STATUS.md
├── docker/            # Docker Configurations
│   ├── docker-compose.yml
│   └── Dockerfile.*
├── scripts/           # Build/Test Scripts
│   ├── test-api.ps1
│   ├── *.js (test scripts)
│   └── *.json (test data)
├── .github/           # GitHub Workflows & Instructions
│   ├── copilot-instructions.md
│   └── workflows/
└── README.md          # Ana proje dokümantasyonu
```

### Tek Repo Stratejisi Kuralları

1. **Hiçbir zaman ayrı repo oluşturma**: Tüm geliştirmeler ana repo'da yapılır
2. **Klasör bazlı organize**: Her uygulama kendi klasöründe, bağımsız package.json
3. **Shared dependencies**: Ortak bağımlılıklar root package.json'da tanımlanabilir
4. **Cross-platform koordinasyon**: Version'lar ve API değişiklikleri senkronize
5. **Unified CI/CD**: Tek pipeline ile tüm uygulamalar deploy edilir

## Veritabanı Yapısı

### Ana Koleksiyonlar
- **users**: Kullanıcı bilgileri ve OAuth entegrasyonları
- **groups**: Grup bilgileri ve üyelik durumları
- **tasks**: Görevler, SLA, durum ve yorumlar
- **notifications**: Sistem bildirimleri

### İlişkiler
- User -> Groups (Many-to-Many)
- Group -> Tasks (One-to-Many)
- User -> Tasks (One-to-Many - assignedTo)
- Task -> Comments (One-to-Many)

## API Endpoint Örüntüleri

```typescript
// RESTful API pattern
GET /api/tasks - Liste getir
POST /api/tasks - Yeni oluştur
GET /api/tasks/:id - Tekil getir
PATCH /api/tasks/:id - Güncelle
DELETE /api/tasks/:id - Sil

// Response format
{
  "success": boolean,
  "message": string,
  "data": T,
  "error"?: string
}
```

## WebSocket Events

```typescript
// Client -> Server
'join_group' - Gruba katıl
'task_update' - Görev güncelle
'add_comment' - Yorum ekle

// Server -> Client
'task_updated' - Görev güncellendi
'comment_added' - Yorum eklendi
'notification' - Yeni bildirim
'sla_warning' - SLA uyarısı
```

## Güvenlik

- JWT token tabanlı kimlik doğrulama
- Role-based access control (RBAC)
- Input validation ve sanitization
- Rate limiting (express-rate-limit)
- CORS ayarları
- Environment variables ile sensitive data

## Test Stratejisi

- **Unit Tests**: Servis katmanı için %80+ coverage
- **Integration Tests**: API endpoint'leri
- **E2E Tests**: Ana kullanıcı akışları
- **Mobile Tests**: React Native Testing Library

## Performans

- **Pagination**: Büyük listelerde sayfalama
- **Lazy Loading**: Component'lerde lazy loading
- **Image Optimization**: Resim sıkıştırma ve cache
- **Database Indexing**: MongoDB optimal index'ler
- **Redis Caching**: Sık kullanılan veriler

## Bildirim Sistem

```typescript
// Bildirim türleri
'task_assigned' - Görev atandı
'task_due_soon' - Görev yaklaşıyor
'task_overdue' - Görev gecikti
'task_completed' - Görev tamamlandı
'comment_added' - Yorum eklendi
'group_invite' - Grup daveti
```

Bu talimatları takip ederek, tutarlı ve kaliteli kod üretmeye odaklan. Modüler mimari ve SOLID prensiplerini her zaman ön planda tut.

## 🔒 Tek Repo Sürdürülebilirlik Kuralları

### ❌ **YAPILMAMASI GEREKENLER**
1. **Hiçbir zaman yeni repo oluşturma**
   - Mobile için ayrı repo açma
   - Backend/Frontend split repo stratejisi
   - Feature bazlı repo ayırma

2. **Klasör dışı development**
   - Root seviyede development dosyası bırakma
   - Geçici test dosyalarını organize etmeme
   - Documentation'ı dağınık bırakma

3. **Cross-platform bağımlılık kırma**
   - API versioning koordinasyonu yapmama
   - Mobile-Backend uyumsuzluğu yaratma
   - Admin dashboard entegrasyonunu ihmal etme

### ✅ **YAPILMASI GEREKENLER**
1. **Organize klasör yapısını koruma**
   ```
   ├── backend/     # Tüm API geliştirmesi
   ├── mobile/      # Tek mobil uygulama
   ├── admin/       # Web dashboard
   ├── docs/        # Tüm dokümantasyon
   ├── docker/      # Container configs
   └── scripts/     # Build/test scripts
   ```

2. **Version koordinasyonu**
   - API değişikliklerinde mobile güncelleme
   - Breaking changes için migration guide
   - Semantic versioning kullanma

3. **Shared development practices**
   - TypeScript interfaces paylaşma
   - Error handling consistency
   - Documentation güncel tutma

### 🚨 **ACİL MÜDAHALE KURALLARI**
Eğer birisi yanlışlıkla:
- Yeni repo oluşturmaya çalışırsa → Ana repo'ya yönlendir
- Dosyaları dağıtırsa → Organize klasör yapısına geri koy
- Cross-platform uyumsuzluk yaratırsa → API contract kontrolü yap

Bu kurallar projinin sürdürülebilirliği için kritiktir!
