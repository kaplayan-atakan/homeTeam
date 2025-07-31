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

## 🚀 NPM Scripts Yönetimi ve Sürdürülebilirlik

### 📋 **Standart NPM Scripts Listesi**

Bu projede SADECE aşağıdaki standart script'ler kullanılmalıdır. Yeni script eklenmesi veya değiştirilmesi mutlaka bu listeye uygun olmalıdır.

#### **🔧 Development Scripts**
```bash
npm run dev              # Tüm uygulamaları paralel başlatır (backend + mobile + admin)
npm run dev:backend      # Sadece NestJS backend development server
npm run dev:mobile       # Sadece React Native Metro bundler
npm run dev:admin        # Sadece Next.js development server
```

#### **🏗️ Build Scripts**
```bash
npm run build            # Production build (backend + admin)
npm run build:backend    # NestJS production build
npm run build:admin      # Next.js production build
```
*Not: Mobile build ayrı Android/iOS toolchain gerektirdiğinden buraya dahil değil*

#### **🧪 Test Scripts**
```bash
npm run test             # Tüm test suite'leri çalıştır
npm run test:backend     # Backend unit/integration tests
npm run test:mobile      # React Native tests (Jest)
npm run test:admin       # Admin dashboard tests
```

#### **🔍 Code Quality Scripts**
```bash
npm run lint             # Tüm uygulamalarda lint kontrolü
npm run lint:backend     # Backend ESLint kontrolü
npm run lint:mobile      # Mobile ESLint kontrolü  
npm run lint:admin       # Admin dashboard ESLint kontrolü
```

#### **🐳 Docker Scripts**
```bash
npm run docker:up        # Docker containers'ı başlat (MongoDB + Redis)
npm run docker:down      # Docker containers'ı durdur
npm run docker:logs      # Container loglarını izle
```

#### **🧹 Maintenance Scripts**
```bash
npm run clean            # Tüm node_modules ve build dosyalarını temizle
npm run clean:backend    # Backend node_modules + dist temizle
npm run clean:mobile     # Mobile node_modules temizle
npm run clean:admin      # Admin node_modules + .next temizle
```

#### **📦 Installation Scripts**
```bash
npm run install:all      # Tüm uygulamalarda dependencies yükle
npm run install:backend  # Backend dependencies
npm run install:mobile   # Mobile dependencies
npm run install:admin    # Admin dependencies
```

#### **🔧 Utility Scripts**
```bash
npm run api:test         # Backend API test suite (PowerShell)
```

### 🎯 **Script Eşleme Kuralları**

Kullanıcı promptları aşağıdaki eşleme tablosuna göre script'lere dönüştürülmelidir:

#### **Development Promptları → Scripts**
```
"backend'i çalıştır" → npm run dev:backend
"mobile'ı başlat" → npm run dev:mobile  
"admin'i aç" → npm run dev:admin
"her şeyi başlat" → npm run dev
"development server" → npm run dev
"dev mode" → npm run dev
```

#### **Build Promptları → Scripts**
```
"production build" → npm run build
"deploy için hazırla" → npm run build
"backend build et" → npm run build:backend
"admin build" → npm run build:admin
```

#### **Test Promptları → Scripts**
```
"testleri çalıştır" → npm run test
"test et" → npm run test
"backend testleri" → npm run test:backend
"mobile testleri" → npm run test:mobile
```

#### **Docker Promptları → Scripts**
```
"database başlat" → npm run docker:up
"MongoDB çalıştır" → npm run docker:up
"Redis başlat" → npm run docker:up
"container'ları durdur" → npm run docker:down
"docker logları" → npm run docker:logs
```

#### **Maintenance Promptları → Scripts**
```
"temizle" → npm run clean
"node_modules sil" → npm run clean
"build dosyalarını sil" → npm run clean
"dependencies yükle" → npm run install:all
"lint kontrolü" → npm run lint
"kod kalitesi" → npm run lint
```

#### **API Test Promptları → Scripts**
```
"API testleri" → npm run api:test
"backend test et" → npm run api:test
"endpoint testleri" → npm run api:test
```

### ⚠️ **YASAKLI EYLEMLER**

#### **❌ Asla Yapılmaması Gerekenler**
1. **Custom script oluşturma** - Sadece yukarıdaki standart scripts kullan
2. **Script'leri doğrudan değiştirme** - Önce instruction'ları güncellenmelidir
3. **Terminal'de manual komut çalıştırma** - Her zaman npm scripts kullan
4. **Workspace dışına çıkma** - Sadece tanımlı klasörlerde çalış

#### **✅ Doğru Yaklaşım**
1. **Terminal Kontrolü (ÖNCELİK)** - Çalıştırma script'lerinden önce mutlaka aktif terminalleri kontrol et
2. **Dosya Yolu Doğrulama (ZORUNLU)** - Her terminal komutundan önce doğru dizinde olduğunu garanti et
3. **Prompt analizi** - Kullanıcı isteğini script eşleme tablosundan bul
4. **Duplicate kontrolü** - Aynı process zaten çalışıyorsa kullanıcıyı bilgilendir
5. **Script çalıştırma** - İlgili npm run komutunu kullan
6. **Sonuç bildirme** - Hangi script'in çalıştırıldığını belirt
7. **Hata durumunda** - Log'ları kontrol et ve standart script öner

### 🔍 **Terminal Kontrol Süreci (ÖNCELİK!)**

**Çalıştırma öncesi MUTLAKA bu kontrolleri yap:**

#### **1. Dosya Yolu Doğrulama (ZORUNLU)**
```powershell
# Terminal komutundan önce MUTLAKA doğru dizine git
cd "c:\Users\atakan.kaplayan\homeTeam"        # Root directory
cd "c:\Users\atakan.kaplayan\homeTeam\backend" # Backend işlemleri için
cd "c:\Users\atakan.kaplayan\homeTeam\mobile"  # Mobile işlemleri için
cd "c:\Users\atakan.kaplayan\homeTeam\admin"   # Admin işlemleri için
cd "c:\Users\atakan.kaplayan\homeTeam\scripts" # Test script'leri için
```

**📍 Dosya Yolu Güvenlik Kuralları:**
- ❌ ASLA current directory'ye güvenme
- ✅ Her komuttan önce mutlaka `cd` ile doğru dizine git
- ✅ Absolute path kullan: `c:\Users\atakan.kaplayan\homeTeam\...`
- ✅ İşlem türüne göre doğru klasöre yönlen:
  ```
  npm run dev:backend  → cd backend/
  npm run dev:mobile   → cd mobile/
  npm run dev:admin    → cd admin/
  npm run api:test     → cd scripts/
  ```

#### **2. Aktif Terminal Kontrolü**
```bash
# Önce aktif terminalleri kontrol et
get_terminal_output # Her açık terminal için
```

#### **2. Process Çakışma Kontrolü**
Development script'lerinden önce kontrol edilmesi gerekenler:

| Script | Çakışma Riski | Kontrol Edilecek |
|--------|---------------|------------------|
| `npm run dev` | ⚠️ YÜKSEK | Tüm port'lar (3000, 8081, 3001) |
| `npm run dev:backend` | ⚠️ ORTA | Port 3000, database connection |
| `npm run dev:mobile` | ⚠️ ORTA | Port 8081, Metro bundler |
| `npm run dev:admin` | ⚠️ ORTA | Port 3001, Next.js dev server |
| `npm run docker:up` | ⚠️ DÜŞÜK | Port 27018, 6380 |

#### **3. Duplicate Process Bildirimi**
Eğer aynı process zaten çalışıyorsa:
```
⚠️ UYARI: [Script Adı] zaten çalışıyor!
📍 Terminal ID: [terminal_id]
🔧 Öneri: Mevcut process'i kullan veya önce durdur
```

#### **4. Port Çakışması Çözümü**
```bash
# Port 8081 örneği (React Native Metro)
npx react-native start --port 8082  # Alternatif port kullan
```

### 📝 **Script Kullanım Örnekleri**

#### **Örnek 1: Terminal Kontrolü ile Development**
```bash
# Kullanıcı: "Backend'i çalıştır"
# 1. Önce terminal kontrolü
get_terminal_output  # Aktif terminalleri kontrol et
# 2. Port 3000 kontrolü - eğer boşsa:
cd "c:\Users\atakan.kaplayan\homeTeam\backend"  # Doğru dizine git
npm run dev:backend  # ✅ Doğru
```

#### **Örnek 2: Duplicate Process Tespiti**
```bash
# Kullanıcı: "Mobile uygulamayı başlat"
# 1. Terminal kontrolü sonucu: Port 8081 zaten kullanımda
# 2. Kullanıcıya bildir:
⚠️ UYARI: React Native Metro zaten çalışıyor!
📍 Terminal ID: [id]
🔧 Öneri: Mevcut Metro'yu kullan
```

#### **Örnek 3: Production Ready**
```bash
# Kullanıcı: "Deploy için hazırla"
cd "c:\Users\atakan.kaplayan\homeTeam"  # Root dizine git
npm run build  # ✅ Build işlemi çakışma riski düşük
```

#### **Örnek 4: Docker Terminal Kontrolü**
```bash
# Kullanıcı: "Database'i başlat"
# 1. Önce kontrol et
get_terminal_output  # MongoDB/Redis kontrol
# 2. Eğer çalışmıyorsa:
cd "c:\Users\atakan.kaplayan\homeTeam"  # Root dizine git
npm run docker:up  # ✅ Doğru
```

Bu script yönetim sistemi projinin standardizasyonunu ve sürdürülebilirliğini garanti eder!
