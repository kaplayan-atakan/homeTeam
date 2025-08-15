# homeTeam Mobil Uygulama Geliştirme Görevi

## Proje Hakkında
homeTeam, aileler ve gruplar için görev yönetimi yapan bir uygulamadır. Mevcut uygulamayı sıfırdan geliştirerek performans ve kullanıcı deneyimini iyileştirmemiz gerekiyor.

## Teknik Gereksinimler
- React Native 0.72+ ile TypeScript kullanarak geliştirme
- Redux Toolkit ile state management
- React Navigation v6 ile navigation
- Socket.IO ile gerçek zamanlı iletişim
- Firebase (analytics, messaging) entegrasyonu
- Offline support ve veri senkronizasyonu
- Responsive tasarım (farklı ekran boyutları için)

## Öncelikli Geliştirme Adımları
1. Temel proje yapısını kurma ve çalışır durumda olduğunu doğrulama
2. Navigation yapısını oluşturma (Tab, Stack ve Drawer navigasyonları)
3. Kimlik doğrulama akışını (Login, Register, Password Reset) kurma
4. Görev yönetim ekranlarını geliştirme
5. Gerçek zamanlı bildirimler ve WebSocket bağlantısını kurma
6. Ayarlar ve kullanıcı profil yönetimi
7. Grup oluşturma ve yönetme
8. Müzik entegrasyonu (Spotify/YouTube)

## Önemli Hususlar
- Her adımdan sonra uygulamanın çalışabilir durumda olduğundan emin olunmalı
- Modüler ve ölçeklenebilir bir kod yapısı kurulmalı
- SOLID prensipleri gözetilmeli
- Performans optimizasyonları için React.memo, useMemo ve useCallback kullanılmalı
- Error boundary ve error handling özenle yapılmalı
- TypeScript ile tüm tipler tam olarak tanımlanmalı

## İlk Adımlar
1. Projeyi oluşturun ve paket bağımlılıklarını ekleyin
2. Temel klasör yapısını kurun
3. Tema ve stillendirme altyapısını hazırlayın
4. Redux Toolkit store yapısını kurun
5. Navigation yapısının iskeleti oluşturun
6. Basit bir login ekranı ile uygulamanın çalıştığını doğrulayın

Lütfen her aşamada geliştirmeyi adım adım yaparak, her özelliği ekledikten sonra uygulamayı test edin ve çalıştığından emin olun.