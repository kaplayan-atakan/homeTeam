# Google Sign-In Yapılandırma Rehberi

## 1. Google Cloud Console Kurulumu

1. [Google Cloud Console](https://console.cloud.google.com/)'a gidin
2. Yeni bir proje oluşturun veya mevcut projeyi seçin
3. "APIs & Services" > "Credentials" bölümüne gidin
4. "Create Credentials" > "OAuth 2.0 Client IDs" seçin

### Android için:
- Application type: Android
- Package name: com.hometeam.mobile (package.json'dan alınacak)
- SHA-1 certificate fingerprint gerekli

### iOS için:
- Application type: iOS
- Bundle ID: com.hometeam.mobile

### Web için:
- Application type: Web application
- Authorized redirect URIs ekleyin

## 2. Android Konfigürasyonu

### 2.1 google-services.json Dosyası
`android/app/google-services.json` dosyasını Google Cloud Console'dan indirin ve ekleyin.

### 2.2 Android build.gradle Güncelleme

`android/build.gradle` dosyasına:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

`android/app/build.gradle` dosyasına:
```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

### 2.3 SHA-1 Fingerprint Alma
```bash
cd android
./gradlew signingReport
```

## 3. iOS Konfigürasyonu

### 3.1 GoogleService-Info.plist
`ios/GoogleService-Info.plist` dosyasını Google Cloud Console'dan indirin.

### 3.2 iOS URL Scheme
`ios/homeTeam/Info.plist` dosyasına REVERSED_CLIENT_ID ekleyin:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>googleSignIn</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>YOUR_REVERSED_CLIENT_ID</string>
        </array>
    </dict>
</array>
```

### 3.3 Podfile Güncelleme
iOS için pod install çalıştırın:
```bash
cd ios && pod install
```

## 4. Config Dosyası Güncelleme

`src/config/config.ts` dosyasındaki Google Auth konfigürasyonunu güncelleyin:
```typescript
GOOGLE_AUTH: {
  webClientId: 'your-web-client-id.apps.googleusercontent.com',
  iosClientId: 'your-ios-client-id.apps.googleusercontent.com',
  androidClientId: 'your-android-client-id.apps.googleusercontent.com',
},
```

## 5. Test Etme

1. Android/iOS cihazda uygulamayı çalıştırın
2. Login ekranında Google butonu görünmeli
3. Google hesabı seçim ekranı açılmalı
4. Başarılı girişten sonra ana ekrana yönlendirilmeli

## 6. Backend Token Doğrulaması

Gerçek uygulamada backend'de Google ID token'ının doğrulanması gerekir:
```javascript
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,
  });
  return ticket.getPayload();
}
```

## 7. Güvenlik Notları

- Client ID'leri ve secret'ları güvenli saklayın
- Production ortamında SSL/HTTPS kullanın
- Google API quotalarını kontrol edin
- Kullanıcı verilerini GDPR/KVKK uyumlu işleyin
