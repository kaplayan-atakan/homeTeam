# homeTeam Mobile App Quick Start

## 🚀 Hızlı Başlangıç

### 1. Gereksinimler Kontrolü
```bash
# Node.js versiyon kontrolü
node --version  # v18+

# React Native CLI
npm list -g @react-native-community/cli

# Android Studio/Xcode kurulu mu?
```

### 2. Proje Setup (3 Dakikada)
```bash
# 1. Backend başlat
cd homeTeam
npm run dev:backend

# 2. Mobile dependencies
cd mobile
npm install

# 3. iOS dependencies (sadece macOS)
cd ios && pod install && cd ..

# 4. Android emulator başlat (Android Studio'dan)

# 5. Mobile app çalıştır
npm start  # Metro bundler
# Yeni terminal:
npx react-native run-android  # veya run-ios
```

### 3. Test Kullanıcısı
- **Email**: test@hometeam.com  
- **Şifre**: Test123!
- **İsim**: Test Kullanıcı

### 4. Hızlı Debug
```bash
# Metro cache temizle
npm start --reset-cache

# Android build temizle
cd android && ./gradlew clean
```

### 5. Backend API Test
```bash
curl http://localhost:3001/api/test
# Response: {"success": true, "message": "API çalışıyor"}
```

---

**Detaylı setup için**: `docs/MOBILE_APP_TESTING_GUIDE.md`
