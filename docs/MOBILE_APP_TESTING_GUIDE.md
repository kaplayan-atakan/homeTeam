# homeTeam Mobile App Development & Testing Setup Guide

## 📱 homeTeam React Native Uygulaması Test Ortamı Kurulumu

### 🎯 Proje Genel Bakış
homeTeam, aile görev yönetimi için geliştirilmiş modern bir React Native uygulamasıdır. Bu rehber, uygulamayı geliştirme ortamında kurma ve test etme için adım adım talimatlar içerir.

---

## 🔧 Gerekli Yazılımlar ve Kurulum

### 1. Temel Gereksinimler
```bash
# Node.js (v18 veya üstü) - Projedeki minimum requirement
node --version  # v18+

# React Native CLI
npm install -g @react-native-community/cli

# Java Development Kit (JDK 11 - Android için)
java -version  # JDK 11+

# Git (repository klonlama için)
git --version
```

### 2. Android Geliştirme Ortamı
- **Android Studio**: [İndir](https://developer.android.com/studio)
- **Android SDK**: API Level 30+ (Android Studio ile birlikte gelir)
- **Android Emulator**: Virtual Device oluşturun

### 3. iOS Geliştirme Ortamı (macOS sadece)
- **Xcode**: App Store'dan indirin
- **iOS Simulator**: Xcode ile birlikte gelir
- **CocoaPods**: `sudo gem install cocoapods`

---

## 📦 Proje Kurulumu

### Adım 1: Repository Klonlama
```bash
# Ana dizinde homeTeam repository'sini klonlayın
git clone https://github.com/kaplayan-atakan/homeTeam.git
cd homeTeam

# Projenin mevcut durumunu kontrol edin
ls -la  # backend/, mobile/, admin/, docs/ klasörlerini görmeli
```

### Adım 2: Backend Hazırlığı (Zorunlu)
```bash
# Backend dizinine gidin
cd backend

# Dependencies yükleyin
npm install

# Environment dosyasını oluşturun (örnek .env.example'dan)
cp .env.example .env

# Docker ile MongoDB ve Redis başlatın
cd ..  # homeTeam root dizinine
docker-compose up -d

# Backend'i geliştirme modunda başlatın
cd backend
npm run start:dev
```

### Adım 3: Mobile App Dependencies
```bash
# Mobile dizinine gidin
cd ../mobile

# Dependencies yükleyin
npm install

# iOS için (sadece macOS)
cd ios
pod install
cd ..
```

---

## ⚙️ Konfigürasyon

### 1. Environment Konfigürasyonu
Mobile uygulaması `src/config/config.ts` dosyasında önceden yapılandırılmıştır:

```typescript
// Mevcut konfigürasyon:
API_BASE_URL: 
  iOS: 'http://localhost:3001/api'
  Android: 'http://10.0.2.2:3001/api'

WEBSOCKET_URL:
  iOS: 'ws://localhost:3001'
  Android: 'ws://10.0.2.2:3001'
```

### 2. Firebase Konfigürasyonu (İsteğe Bağlı)
Push notification için Firebase setup:

```bash
# Android için google-services.json zaten mevcut
ls mobile/android/app/google-services.json  # ✅ Var

# iOS için GoogleService-Info.plist zaten mevcut  
ls mobile/ios/GoogleService-Info.plist      # ✅ Var
```

### 3. Google Sign-In Konfigürasyonu
Detaylı setup için: `mobile/GOOGLE_SIGNIN_SETUP.md` dosyasını inceleyin.

---

## 🚀 Uygulamayı Çalıştırma

### Android Emulator'da Çalıştırma

#### 1. Emulator Hazırlığı
```bash
# Android Studio'yu açın ve AVD Manager'dan emulator oluşturun
# API Level 30+ (Android 11+) önerilen
# RAM: 4GB+, Storage: 32GB+
```

#### 2. Uygulamayı Başlatma
```bash
# Terminal 1: Metro bundler'ı başlatın
cd homeTeam/mobile
npm start

# Terminal 2: Android build ve run
npx react-native run-android
```

### iOS Simulator'da Çalıştırma (macOS)

```bash
# iOS simulator'da çalıştırın
cd homeTeam/mobile
npx react-native run-ios

# Belirli simulator seçmek için:
npx react-native run-ios --simulator="iPhone 14"
```

---

## 🔍 Test Senaryoları

### 1. Kimlik Doğrulama Testleri

#### Kayıt ve Giriş
```bash
# Test kullanıcısı oluşturma:
Email: test@hometeam.com
Şifre: Test123!
İsim: Test Kullanıcı
```

#### OAuth Testleri (Konfigürasyon gerektirir)
- Google Sign-In
- Facebook Login (gelecekte)

### 2. Ana Özellik Testleri

#### Dashboard Fonksiyonalitesi
- [ ] Ana sayfa yükleniyor
- [ ] Görev istatistikleri görüntüleniyor
- [ ] Günlük özet çalışıyor

#### Görev Yönetimi
- [ ] Yeni görev oluşturma
- [ ] Görev listesi görüntüleme
- [ ] Görev detaylarını görme
- [ ] Görev durumu güncelleme
- [ ] Görev silme

#### Grup Yönetimi
- [ ] Grup listesi görüntüleme
- [ ] Grup detayları
- [ ] Grup üyeleri

### 3. Real-time Özellik Testleri

#### WebSocket Bağlantısı
```bash
# Backend terminal'de WebSocket loglarını izleyin
# Mobil uygulamada görev güncellemesi yapın
# Real-time güncellemeleri gözlemleyin
```

#### Push Notification (Firebase gerektirir)
- [ ] Uygulama açıkken bildirim alma
- [ ] Uygulama kapalıyken bildirim alma
- [ ] Bildirim tıklama ile yönlendirme

---

## 🔧 Sorun Giderme

### Metro Bundler Sorunları
```bash
# Cache temizleme
npx react-native start --reset-cache

# Node modules temizleme
cd mobile
rm -rf node_modules
npm install
```

### Android Build Hataları
```bash
# Gradle clean
cd mobile/android
./gradlew clean
cd ..

# Yeniden build
npx react-native run-android
```

### iOS Build Hataları (macOS)
```bash
# Pods temizleme
cd mobile/ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Xcode cache temizleme
rm -rf ~/Library/Developer/Xcode/DerivedData

# Yeniden build
npx react-native run-ios
```

### Backend Bağlantı Sorunları

#### Port Kontrolü
```bash
# Backend çalışıyor mu kontrol edin
curl http://localhost:3001/api/test
# Beklenen response: {"success": true, "message": "API çalışıyor"}

# Database bağlantıları
docker ps  # MongoDB ve Redis container'larını kontrol edin
```

#### Network Debugging
```bash
# Android emulator için
adb shell ping 10.0.2.2

# iOS simulator için
ping localhost
```

---

## 📊 Debug ve Monitoring

### 1. React Native Debugger
```bash
# React Native Debugger kurulumu
npm install -g react-native-debugger

# Kullanım: Emulator'da Dev Menu açın (Cmd+D / Ctrl+D)
# "Debug" seçeneğini seçin
```

### 2. Redux DevTools
```bash
# Redux store'u izlemek için React Native Debugger kullanın
# Store state'leri ve action'ları real-time görün
```

### 3. Network Monitoring
```bash
# Flipper kullanarak network isteklerini izleyin
npm install -g flipper
```

### 4. Console Logging
```bash
# Metro bundler terminal'de console.log çıktılarını izleyin
# Chrome DevTools ile remote debugging
```

---

## 🎯 Performance Testing

### 1. App Performance
- [ ] Uygulama başlatma süresi (<3 saniye)
- [ ] Ekran geçiş animasyonları (60 FPS)
- [ ] Liste scroll performance
- [ ] Memory usage monitoring

### 2. API Performance
- [ ] API response süreleri (<500ms)
- [ ] Offline/online geçiş testleri
- [ ] Concurrent request handling

### 3. Database Performance
- [ ] Görev listeleme hızı
- [ ] Arama functionality
- [ ] Pagination performance

---

## 📱 Platform-Specific Testing

### Android Özel Testleri
- [ ] Farklı ekran boyutları (phone, tablet)
- [ ] Android 11+ permission model
- [ ] Back button navigation
- [ ] Hardware back button

### iOS Özel Testleri (macOS)
- [ ] Safe area handling
- [ ] iPhone X+ notch handling
- [ ] iOS gesture navigation
- [ ] Landscape mode

---

## 🔄 CI/CD ve Automation

### Automated Testing
```bash
# Unit testleri çalıştırma
cd mobile
npm test

# Lint kontrolü
npm run lint

# TypeScript kontrolü
npx tsc --noEmit
```

### Build Testing
```bash
# Android Release Build testi
cd mobile/android
./gradlew assembleRelease

# iOS Release Build testi (macOS)
cd mobile
npx react-native run-ios --configuration Release
```

---

## 📚 Kaynak Dökümanlar

- **Proje Mimarisi**: `docs/ARCHITECTURE.md`
- **API Endpoint'leri**: `docs/API_TEST_RESULTS.md`
- **Sistem Durumu**: `docs/SYSTEM-STATUS.md`
- **Firebase Setup**: `docs/FCM_IMPLEMENTATION.md`
- **Google Sign-In**: `mobile/GOOGLE_SIGNIN_SETUP.md`

---

## 🆘 Yardım ve Destek

### Log Dosyaları
```bash
# Metro bundler logları
# Terminal output'unu kaydedin

# Android logcat
adb logcat | grep -i hometeam

# iOS device logs (macOS)
xcrun simctl spawn booted log stream --predicate 'process == "homeTeam"'
```

### Hata Raporlama
1. **Error Screenshot**: Hata ekran görüntüsü
2. **Console Logs**: Metro bundler çıktısı
3. **Device Info**: OS version, device model
4. **Steps to Reproduce**: Hatayı tekrar üretme adımları

---

**homeTeam Mobile App Testing Guide v1.0**  
*Son güncelleme: Ağustos 2025*
