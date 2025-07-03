# GitHub Instructions – Özel Uygulama (Ev İşi Takip ve Yönetim)

Bu doküman, aile/grup bazlı görev takım yönetimi uygulamasını (örn. ev işleri, rutin görevler) geliştirirken uyulması gereken temel standartları ve rehber ilkeleri içerir. React Native tabanlı mobil geliştirme, gerçek zamanlı mesajlaşma, SLA bazlı görev yönetimi, müzik entegrasyonu ve çoklu kimlik doğrulama gibi bileşenler barındıracak olan bu proje için hazırlanmıştır.

---

## 🟣 Proje Genel Bakışı

- Uygulama, kullanıcıların grup halinde görevleri takip edebilecekleri ve her kullanıcıya atanan görevler için önceden belirlenmiş SLA sürelerini izleyecekleri bir yapı sunar.  
- Fikir örneği: Aile içinde “çöp atma, sofra kurma, alışveriş” gibi rutin işlerin takibi. Görev tamamlandığında “done” durumuna geçilir.  
- Görevlerin süresi dolduğunda veya göreve yorum yapıldığında ilgili kişilere anında bildirim gönderilir.  
- Grup kapasitesine göre farklı planlar tanımlanabilir; kapasiteyi artırmak için plan yükseltmeleri yapılabilir.  
- WebSocket aracılığıyla gerçek zamanlı mesajlaşma (bkz. backend entegrasyonu) ve Google benzeri SSO servisleri ile kullanıcıların kolay kayıt ve giriş yapabilmeleri hedeflenir.  
- Spotify veya YouTube hesaplarını bağlayan kullanıcılara, belirli bir görev için şarkı/listede çalma özelliği sunulur; görev “başlat” butonuna basıldığında müzik çalma işlemi tetiklenir.  

---

## 🛠️ Teknoloji Yığını

- **React Native & TypeScript:** Mobil uygulamanın temel çatısı ve yazım dili.  
- **Node.js, NestJS (veya benzeri):** Backend API, SLA yönetimi, bildirim mekanizması ve kullanıcı kimlik doğrulama süreçleri.  
- **MongoDB / Redis:** Verilerin saklanması ve önbellekleme. Redis ayrıca SLA takibi gibi yüksek hızlı işlemlerde kullanılabilir.  
- **Docker:** Üretim ve test ortamlarının tutarlı bir şekilde yönetimi.  
- **WebSockets (ör. Socket.IO):** Grup içi gerçek zamanlı mesajlaşma özelliği.  
- **SSO (Google, Facebook vb.):** Kullanıcıların hızlı ve güvenli şekilde kayıt ve giriş yapabilmesi için.  
- **Müzik API entegrasyonları (Spotify, YouTube):** Belirli görevler için çalma listesi tetikleyerek interaktif bir deneyim sunmak amacıyla.  

---

## 📂 Proje ve Dosya Yapısı

- **Mobil (React Native) Klasörü:**  
  - `src/components/` – Tekrar kullanılabilir React Native bileşenleri.  
  - `src/screens/` – Uygulamanın ekran bazlı mantığı (Görev Listesi, Sohbet, Profil vb.).  
  - `src/config/` – Uygulamanın temel ayarları ve sabit değerleri.  

- **Backend (Node.js / NestJS) Klasörü:**  
  - `src/modules/` – Görev yönetimi, kullanıcı, bildirim, müzik entegrasyonu gibi modüller.  
  - `src/websocket/` – Gerçek zamanlı mesajlaşma ve SLA süresi bilgilendirme.  
  - `src/config/` – Ortam değişkenleri ve güvenlik ayarları.  

Örnek proje yapısı (kısaltılmış):
```
root/
├─ mobile/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ screens/
│  │  ├─ config/
│  ├─ package.json
├─ backend/
│  ├─ src/
│  │  ├─ modules/
│  │  ├─ websocket/
│  │  ├─ config/
│  ├─ package.json
├─ docker-compose.yml
└─ README.md
```

---

## 🧑‍💻 Kodlama Standartları

- **Değişken ve Fonksiyon İsimlendirme:** İngilizce (camelCase) formatında, net ve açıklayıcı olmalıdır.  
- **Fonksiyonel/Komponent Tasarımı:** React Native tarafında fonksiyonel komponentler tercih edilmeli, modülerlik ön planda tutulmalıdır.  
- **Hata Yönetimi:** Tüm hata mesajları Türkçe verilmeli ve kullanıcıya açıklayıcı şekilde gösterilmelidir.  
- **Erişilebilirlik:** WCAG standartlarına dikkat edilmeli (örn. renk kontrastı, buton boyutları, sesli geri bildirim).  
- **Test:** Birim test, entegrasyon ve e2e testleri en az %80 kapsama oranıyla yazılmalıdır.  
- **Kod Okunabilirliği:** Kod, düzenli ve anlaşılır tutulmalı; karmaşık fonksiyonlardan uzak durulmalı; mantık net bloklara ayrılmalıdır.  
- **Yorum ve Dokümantasyon:** Türkçe açıklamalar ve commit mesajları kullanılmalıdır; sebep/amaç belirtmek önemlidir.  

---

## 🌐 Dil ve Lokalizasyon

- **Ana dil:** Kullanıcı arayüzü, hata mesajları ve dokümantasyon dahil olmak üzere Türkçe.  
- **Kodda isimlendirme:** İngilizce (camelCase).  
- **SSO ve Müzik API entegrasyonları:** Mevcut API’lerin İngilizce dokümantasyonu kullanılır, ancak bunların oluşturacağı kullanıcı mesajları Türkçe’ye çevrilir.  
- **Türkçe karakter desteği:** `ç, ğ, ı, ö, ş, ü` gibi karakterleri hem veri tabanında hem de arayüzde tam destekle.  

---

## 🚀 Geliştirme ve DevOps Standartları

- **CI/CD:** Otomatik test, lint ve dağıtım süreçleri (örn. GitHub Actions) devreye alınmalıdır.  
- **Kod Kalite Araçları:** ESLint, Prettier (kod formatlama), SonarQube (kalite ölçümü) gibi araçlar kullanılmalı.  
- **Containerization:** Docker kullanılarak container ortamları oluşturulmalı ve test edilmelidir.  
- **Monitoring:** Sentry (hata izleme), Prometheus & Grafana (metrik ve izleme) gibi araçlar entegre edilebilir.  
- **Ortam Değişkenleri:** `.env.example` örnek dosyasıyla önemli yapılandırmalar netleştirilmeli; gizli anahtarlar repo’da saklanmamalıdır.  

---

## ⚡ Performans, Ölçeklenebilirlik ve Erişilebilirlik

- **Performans:** Uygulama içi listelemeler ve müzik entegrasyonları için caching stratejileri uygulanmalıdır.  
- **Ölçeklenebilirlik:** Microservices yapı veya API Gateway (örn. NestJS modüler tasarım) ile yatayda büyümeye olanak tanınmalı.  
- **Erişilebilirlik:** Her ekranda ve özelliğin tasarımında erişilebilirlik kriterleri gözetilmelidir (örn. ekranda VoiceOver desteği, butonların dokunmatik alan büyüklüğü).  

---

## 📑 Dokümantasyon ve Katılımcı Rehberi

- **Katılım Kuralları:** Katkıda bulunacaklar için Pull Request (PR) süreci, görev atama ve SLA yönetimi kuralları netleştirilmeli.  
- **Türkçe Yorum ve Açıklama:** Hem kod içinde hem de PR açıklamalarında kullanılmalı, kısa ve öz olmalı.  
- **Sprint veya Yol Haritası:** Rutin ev işleri, SLA otomasyonu, bildirimler, müzik entegrasyonu, anlık mesajlaşma gibi ana modüllerin geliştirilme aşamaları planlanmalı.  

---

## 📝 Örnekler ve Kod Blokları

1. **React Native Bileşen Örneği**  
   ```typescript
   import React from 'react';
   import { View, Text, Button } from 'react-native';
   
   interface TodoItemProps {
     title: string;
     onComplete: () => void;
   }
   
   export const TodoItem: React.FC<TodoItemProps> = ({ title, onComplete }) => {
     return (
       <View style={{ padding: 10 }}>
         <Text>{title}</Text>
         <Button title="Tamamla" onPress={onComplete} />
       </View>
     );
   };
   ```

2. **NestJS Microservice Modül Örneği**  
   ```typescript
   import { Module } from '@nestjs/common';
   import { TasksController } from './tasks.controller';
   import { TasksService } from './tasks.service';

   @Module({
     controllers: [TasksController],
     providers: [TasksService],
   })
   export class TasksModule {}
   ```

Geliştirme sürecinde bu rehbere uygun şekilde ilerlemek, grup bazlı görev yönetimine sahip, SLA takipli, müzik entegreli ve gerçek zamanlı mesajlaşma özellikli mobil uygulamanın sürdürülebilir, ölçeklenebilir ve kullanıcı dostu bir yapıda kalmasını sağlayacaktır.