# Proje Yapısı

Bu dosya, uygulamanın genel mimarisini ve klasör yapılandırmasını açıklamaktadır. React Native tabanlı ön yüz, Node.js / NestJS tabanlı backend ve harici entegrasyon servislerini içeren modüler bir mimariye sahiptir. Her aşamada SOLID prensiplerine uyulacak ve uygulama, birimlerin birbirinden bağımsız geliştirilebileceği şekilde tasarlanacaktır.

---

## Mobil (React Native) Klasörü

- **`src/components/`**  
  Tekrar kullanılabilir, küçük, bağımsız ve test edilebilir bileşenleri içerir. SOLID prensipleri uyarınca, her bileşen tek bir sorumluluğa sahip olacak şekilde tasarlanır.

- **`src/screens/`**  
  Ekran bazlı mantığı barındırır (Görev Listesi, Sohbet, Profil vb.). Modüler yapıyı güçlendirmek adına her ekran, bileşenlerden oluşan kompozisyon şeklinde yapılandırılır.

- **`src/config/`**  
  Uygulamanın temel ayarları ve sabit değerleri burada bulunur. Konfigürasyon yönetimi, değişime kapalı sabit değerler ve test ortamı değerleri gibi farklı katmanları birbirinden ayırarak yazılır.

---

## Backend (Node.js / NestJS) Klasörü

- **`src/modules/`**  
  Görev yönetimi, kullanıcı, bildirim, müzik entegrasyonu gibi farklı fonksiyonel alanlara ayrılmış modülleri içerir. Her modül, tek sorumluluk ilkesine (Single Responsibility Principle) dikkat edilerek oluşturulmalı ve bağımlılıkları kontrol edilebilir biçimde yönetilmelidir.

- **`src/websocket/`**  
  Gerçek zamanlı mesajlaşma özelliklerini (ör. Socket.IO) barındırır. Bu bölümün diğer modüllerle olan etkileşimleri, bağımsız olacak şekilde kurgulanmalıdır.

- **`src/config/`**  
  Ortam değişkenleri ve güvenlik ayarlarını içeren dosyalar yer alır. Üretim, test ve geliştirme ortamlarına göre değişebilen parametreler bu klasör aracılığıyla yönetilir.

---

## Klasör Organizasyon Örneği

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

## Modülerlik ve SOLID

- **Modülerlik:** Kodun değiştirilebilir, yeniden kullanılabilir ve test edilebilir çalışmalarına olanak sağlar.  
- **SOLID Prensipleri:**  
  1. **Tek Sorumluluk (SRP)** – Her sınıf veya modül tek bir sorumluluğa sahip olmalıdır.  
  2. **Açık/Kapalı (OCP)** – Karşılaması gereken işlevler değişmeden kalırken yeni işlevler eklemek için genişletilebilir olmalıdır.  
  3. **Liskov’un Yerine Geçme (LSP)** – Türeyen sınıflar, temel sınıfların sözleşmesini bozmayacak şekilde tasarlanmalıdır.  
  4. **Arayüz Ayrımı (ISP)** – Büyük arayüz yerine, daha spesifik ve küçük arayüzlerden oluşan bir yapı tercih edilmeli.  
  5. **Bağımlılıkların Ters Çevrilmesi (DIP)** – Üst seviye modüller alt seviye modüllere bağımlı olmamalı, arada soyutlamalar kullanılmalıdır.

Yukarıdaki standartlar, projenin uzun vadede sürdürülebilirliğini sağlamak ve bakımını kolaylaştırmak için önemlidir.  