# newMobile – Android Build Analizi ve Çözüm Yol Haritası

Bu doküman, newMobile (React Native) uygulamasını cihazda çalıştırma denemeleri sırasında elde edilen çıktıları, karşılaşılan hataları ve uygulanabilir çözüm yollarını özetler.

## Özet
- Metro başarılı şekilde başlatıldı (RN 0.72.10, Metro 0.76.8).
- `npm run android` ile Android derlemesinde AAR metadata kontrolünde hata alındı.
- Temel sebep: Android Gradle Plugin (AGP), Gradle ve compileSdk sürüm uyuşmazlığı + bir bağımlılığın (`androidx.core:core-ktx:1.16.0`) API 35/AGP 8.6.0 gereksinimi.

## Yapılan İşlemler (Kronoloji)
1) Uygulama giriş noktası ve kabuk entegrasyonu
   - `index.js`: `react-native-gesture-handler` import eklendi (RN Navigation/gestures için zorunlu).
   - `App.tsx`: Redux Store + PersistGate + React Native Paper + RootNavigator ile gerçek uygulama kabuğu kuruldu.

2) Bağımlılık yüklemeleri
   - Yüklendi: `redux-persist`, `@react-native-async-storage/async-storage`, `axios`, `react-native-gesture-handler`, `react-native-paper`, `react-native-vector-icons`.

3) Çalıştırma denemeleri
   - `npm start` (Metro): Başarılı, uyarı olarak RN 0.81.0 mevcut bilgisi.
   - `npm run android`: Derleme sırasında hata.

## Hata Çıktıları (Özet)
Komut: `npm run android`

Önemli bölümler:
```
FAILURE: Build failed with an exception.

* What went wrong:
Execution failed for task ':app:checkDebugAarMetadata'.
> 4 issues were found when checking AAR metadata:

  1. Dependency 'androidx.core:core-ktx:1.16.0' requires ... compile against version 35 or later ...
     :app is currently compiled against android-34.
     Also, the maximum recommended compile SDK version for Android Gradle plugin 7.4.2 is 33.
     Recommended action: Update ... Android Gradle plugin to one that supports 35, then update ... compileSdkVersion >= 35.

  2. Dependency 'androidx.core:core-ktx:1.16.0' requires Android Gradle plugin 8.6.0 or higher.
     This build currently uses Android Gradle plugin 7.4.2.

  3. Dependency 'androidx.core:core:1.16.0' requires ... compile against version 35 or later ...

  4. Dependency 'androidx.core:core:1.16.0' requires Android Gradle plugin 8.6.0 or higher.
```
Ek gözlemler:
- İlk çalıştırmada Gradle 7.6.1 indirildi/çalıştı (logda görüldü). Bu, AGP 7.4.x ile eşleşir.
- Proje dosyalarında (`android/build.gradle`) AGP 8.0.1 ve `gradle-wrapper.properties` içinde Gradle 8.0.1 tanımlı. Buna rağmen koşuda 7.6.1 kullanılmış olması, sarmalayıcının/eski cache’in devreye girmiş olabileceğini gösteriyor.
- `androidx.core:core-ktx:1.16.0` ve `androidx.core:core:1.16.0` artık API 35 ve AGP 8.6.0 istiyor.

## Teşhis (Root Cause)
- Bağımlılıklardan biri (ör. `react-native-safe-area-context`, `react-native-vector-icons` veya transitif bağımlılık) `androidx.core` 1.16.0’ı çekiyor.
- Derleme zinciri şu an `compileSdkVersion = 34`, AGP ise efektif olarak 7.4.x ile koşuyor gibi davranıyor. Bu kombinasyon `androidx.core` 1.16.0 ile uyumsuz.
- Ek not: AGP 8.x sürümleri Java 17 gerektirir. Yerel JDK 17 yoksa yükseltme sonrası yeni hata alınabilir.

## Denenen/Atılan Adımlar
- Metro başlatıldı, Android build denendi (başarısız). Bu aşamada Gradle/AGP yükseltmesi yapılmadı; kod tarafında UI/Store kabuğu kuruldu ve eksik runtime paketleri yüklendi.

## Çözüm Seçenekleri
Aşağıdaki yaklaşımlardan biri uygulanmalı. Önerilen yol B.

### A) Geçici Çözüm – androidx.core sürümünü düşürme (pin)
- `android/build.gradle` içinde `configurations.all { resolutionStrategy { ... } }` ile `androidx.core:core-ktx` ve `androidx.core:core` sürümünü 1.12.0/1.13.1 gibi API 34 ile uyumlu sürüme sabitleyin.
- Artıları: Hızlı çözüm.
- Eksileri: Yeni kütüphanelerle uyumsuzluk/ileride çakışma riski.

Örnek pin (yönlendirici, yalnızca fikir vermek içindir):
```
configurations.all {
  resolutionStrategy {
    force 'androidx.core:core:1.13.1'
    force 'androidx.core:core-ktx:1.13.1'
  }
}
```

### B) Kalıcı Çözüm – Android toolchain yükseltmesi (önerilen)
1) compile/target SDK’yi 35’e çıkarın:
   - `android/build.gradle` (ext) ve tüm alt projelerde `compileSdkVersion = 35`, `targetSdkVersion = 35`.
   - `android/app/build.gradle` içindeki `android { compileSdk 35 ... }` güncellemesi.
2) Android Gradle Plugin’i 8.6.0’a yükseltin:
   - `android/build.gradle` içinde:
     - `classpath("com.android.tools.build:gradle:8.6.0")`
3) Gradle Wrapper’ı uygun sürüme yükseltin:
   - `android/gradle/wrapper/gradle-wrapper.properties` → `distributionUrl`’u `gradle-8.7-all.zip` (veya AGP 8.6 ile uyumlu bir 8.7+ sürümü) yapın.
4) Java 17 kullanın:
   - Yerel JDK 17’in kurulu olduğundan emin olun ve Android Studio/Gradle bu JDK’yı kullansın.
   - `compileOptions`/`kotlinOptions` içinde Java 17 hedeflenmesi (örn. `sourceCompatibility = JavaVersion.VERSION_17`).
5) RN 0.72.10 ile AGP/Gradle yükseltmesi: Genellikle çalışır; fakat RN 0.72’nin eski şablonlarıyla küçük düzeltmeler gerekebilir. Alternatif olarak RN yükseltmesi (0.73/0.74+) de değerlendirilebilir.

Artıları: Geleceğe dönük, kütüphane ekosistemiyle uyumlu.
Eksileri: JDK/Gradle/AGP yükseltmesi sebebiyle çevre gereksinimleri artar.

### C) React Native sürüm yükseltmesi
- RN’in daha yeni bir sürümüne (ör. 0.74+) yükseltip şablonun güncel Android yapılandırmasını almak.
- Artıları: Güncel toolchain ile doğal uyum.
- Eksileri: Kod geçişi, test yükü.

## Önerilen Sonraki Adımlar (Plan)
1) Toolchain yükseltmesi (B seçeneği) uygulansın.
2) Yükseltme sonrası:
   - `npm run android` tekrar çalıştırılsın.
   - Hata devam ederse, `--stacktrace`/`--info` ile loglar genişletsin, gerekirse geçici pin (A) eklensin.
3) Uygulama açıldıktan sonra “Zorunlu Test Kontrolleri” çalıştırılsın:
   - Uygulama açılıyor mu?
   - Giriş/kimlik doğrulama akışı?
   - Navigasyon tabları arasında geçiş?
   - API çağrıları (şimdilik sahte/placeholder veya backend’e bağlı) hatasız mı?

## Mevcut Durum – Kısa Durum Raporu
- ✅ Metro çalışıyor.
- ✅ Uygulama kabuğu (Redux + Persist + Paper + Navigation) entegre.
- ⚠️ Android derlemesi: `checkDebugAarMetadata` hatası nedeniyle başarısız.
- 🔧 Gerekli aksiyon: AGP/Gradle/SDK yükseltmeleri.

## Ek Notlar
- Kod tarafındaki yeni importlar (örn. `react-native-paper`, `redux-persist`) nedeniyle `npm install` zorunluydu; bu adım tamamlandı.
- Android’de Material Icons için `react-native-vector-icons` kullanılıyor; Android tarafında otomatik linkleme yapıldığı için ekstra manuel adım gerekmiyor (RN 0.72). Eğer ikonlar görünmezse, proguard veya font dosyalarıyla ilgili konfigürasyon kontrol edilmeli.

---
Bu doküman, build zinciri güncellendikten sonra tekrar gözden geçirilip “Çalıştı/Çalışmadı” ve ek hata notları ile güncellenecektir.
