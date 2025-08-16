# GitHub Copilot Instructions — HomeTeamNew (Mobile)

Bu dosya, HomeTeamNew React Native mobil uygulaması için Copilot’a proje-özel bağlam sağlar. Amaç, kodlama standartlarının, teknoloji yığınının, çalışma komutlarının ve yol haritasının tek yerde netleşmesi ve üretkenliği artırmaktır.

## Amaç (Uygulama Tanımı)
Aile ve grup bazlı görev yönetimi. Kullanıcılar gruplar oluşturur, görev atar, durum/son tarih takip eder, bildirim alır ve (ileride) Spotify/YouTube entegrasyonuyla görev esnasında müzik kontrolü yapar. Offline destek ve gerçek zamanlı güncellemeler hedeflenir.

## Teknoloji Yığını
- React Native 0.81 + TypeScript (strict)
- Navigation: React Navigation v7 (Bottom Tabs + Native Stack)
- UI: React Native Paper (MD3, light/dark theme)
- State: Redux Toolkit + Redux Persist (AsyncStorage)
- HTTP: Axios (token/refresh interceptor)
- Test: Jest + React Native preset (transform ayarları, AsyncStorage mock)

## Klasör Yapısı (Özet)
```
src/
  navigation/        # AppNavigator (Tabs + Nested Stacks)
  screens/           # Home, Groups, Tasks + Auth(Login) + Detail ekranları
  services/          # api.ts (axios instance, token/refresh, BASE_URL)
  store/             # slices(auth, groups, tasks) + store configure + hooks
  theme/             # Paper theme (MD3)
  types/             # Tip deklarasyonları (shim)
```

## Çalıştırma (Yerel Geliştirme)
- Metro: npm run start (8081)
- Android: npm run android (cihaz/emülatör)
- Test: npm test
- Lint: npm run lint

Ağ/Backend:
- BASE_URL: http://localhost:3001 (adb reverse ile)
- Emülatör/cihaz için: `adb reverse tcp:3001 tcp:3001` (cihaz-id gerekirse `-s <deviceId>`)

## Kodlama Standartları
- İsimlendirme İngilizce (kod), UI/hata mesajları Türkçe
- Fonksiyonel component + Hooks
- TS strict, tip güvenliği öncelikli
- SOLID ve modüler mimari (feature/slice bazlı ayrım)
- Error handling kullanıcı dostu, açık mesajlar

## Yol Haritası (DoD’e hizalı)
Aşama 1 — Temel Altyapı
- [x] Proje iskeleti (RN 0.81, TS strict, ESLint/Prettier)
- [x] Navigation (Tabs + Nested Stack)
- [x] Theme (Paper MD3, light/dark)
- [x] Redux Toolkit + Persist (auth, groups, tasks)
- [x] Axios client + token/refresh interceptor
- [x] BASE_URL = http://localhost:3001 (adb reverse dokümantasyonu)
- [x] Jest yapılandırması (transformIgnorePatterns, AsyncStorage mock)
- [x] Basit testler (auth reducer, groups/tasks thunks, App render)

Aşama 2 — Çekirdek Özellikler
- [ ] Auth akışı: login/register/reset gerçek API ile (endpoint ve response uyumu)
- [ ] Token yenileme (refresh) akışının E2E doğrulaması
- [ ] Groups: liste/detay + oluşturma/düzenleme formları
- [ ] Tasks: liste/detay + oluşturma/düzenleme + deadline/reminder
- [ ] Form validation (React Hook Form / Zod değerlendirilebilir)

Aşama 3 — Gelişmiş
- [ ] Push & In-app bildirimler (FCM + Socket.IO client)
- [ ] Offline-first; queue & sync stratejisi
- [ ] Müzik entegrasyonları (Spotify/YouTube OAuth + playback)

Aşama 4 — Kalite / Yayına Hazırlık
- [ ] Unit/Integration/E2E (Detox/Maestro) kapsamı ↑
- [ ] Performans profilleme, FlatList optimizasyonları, image cache
- [ ] CI/CD entegrasyonları ve store asset’leri

## Kaldığımız Yer (Son Durum)
- Uygulama Metro/Android üzerinde çalışır durumda.
- Auth/Groups/Tasks slice’ları ve temel ekranlar hazır.
- Detail ekranları artık API’den veriyi çekiyor.
- Token interceptor hem store’dan okuyor (bindStore) hem de refresh ile yeniliyor.
- Testler geçiyor (3 suite: auth reducer, groups/tasks thunks, App render). PersistGate uyarısı biliniyor ve zararsız.
- Backend’e bağlanmak için 3001 portu reverse edilmiş; Windows Firewall’da izin tanımlı.

## Copilot’a İpuçları
- RN 0.81 ekosistemine uygun import/konfig üret.
- Navigation v7 API’lerini kullan (native-stack + bottom-tabs).
- Redux Toolkit createSlice/createAsyncThunk ile tip güvenli akış.
- Axios interceptor’larında token’ı öncelikle store’dan oku; 401’lerde refresh kuyruğunu bozma.
- Testlerde RN preset + transformIgnorePatterns’i koru; AsyncStorage mockunu bozma.
- UI metinlerini Türkçe öner; tip/prop isimlerini İngilizce tut.

## Notlar
- Gerekirse endpoint yolları/response şemaları backend ile senkronize edilmelidir.
- Emülatör/cihaz değişiminde `adb reverse` adımı unutulmamalı.
- Port 8081 çakışmalarında, mevcut Metro sürecini kapat veya alternatif portla başlat.
