# Sistematik Hata Analizi ve Log Takibi Rehberi

## Genel Yaklaşım

Bu dokümanda homeTeam projesinde karşılaşılan tüm hataların sistematik olarak log'lardan analiz edilmesi için standart yaklaşım belirtilmiştir.

## Hata Analizi Süreci

### 1. İlk Adım: MongoDB Log'larından Direkt Kontrol

```bash
# Son 5 hatayı göster
docker exec -it hometeam-mongodb mongosh --authenticationDatabase=admin -u admin -p homeTeam2025! hometeam --eval 'db.errorlogs.find({}).sort({createdAt: -1}).limit(5).pretty()'

# Belirli kategori hatalarını göster
docker exec -it hometeam-mongodb mongosh --authenticationDatabase=admin -u admin -p homeTeam2025! hometeam --eval 'db.errorlogs.find({category: "validation"}).sort({createdAt: -1}).limit(3).pretty()'

# Belirli endpoint hatalarını göster
docker exec -it hometeam-mongodb mongosh --authenticationDatabase=admin -u admin -p homeTeam2025! hometeam --eval 'db.errorlogs.find({"request.url": "/groups"}).sort({createdAt: -1}).limit(3).pretty()'
```

### 2. Hata Kategorileri ve Çözüm Yaklaşımları

#### A. Authentication Hataları (category: "authentication")
- **Belirti**: `JWT token verification failure`, `Unauthorized` mesajları
- **Çözüm Yaklaşımı**: 
  - Token süresini kontrol et
  - JWT secret konfigürasyonunu doğrula
  - Yeni token al ve tekrar dene

#### B. Validation Hataları (category: "validation")
- **Belirti**: `property X should not exist`, `Unexpected token` mesajları
- **Çözüm Yaklaşımı**:
  - DTO schema'larını kontrol et
  - JSON format'ını doğrula
  - PowerShell JSON escape problemleri için curl kullan

#### C. Database Hataları (category: "database")
- **Belirti**: MongoDB connection, schema validation hataları
- **Çözüm Yaklaşımı**:
  - Schema tanımlarını kontrol et
  - Required field'ları doğrula
  - Default value'ları ekle

#### D. Business Logic Hataları (category: "business")
- **Belirti**: İş mantığı kuralları ihlali
- **Çözüm Yaklaşımı**:
  - Service layer'ı incele
  - Business rule'ları doğrula

### 3. PowerShell JSON Problemi Çözümü

**Problem**: PowerShell curl komutlarında JSON escape hatası
```bash
# YANLIŞ - PowerShell escape problemi
curl -X POST http://localhost:3001/groups -H "Content-Type: application/json" -d '{"name": "Test Group", "description": "Test Description"}'

# DOĞRU - Çözüm
curl -X POST http://localhost:3001/groups -H "Content-Type: application/json" -d "{\"name\": \"Test Group\", \"description\": \"Test Description\"}"
```

### 4. Hata Çözme Metodolojisi

#### Adım 1: Hata Kategorisini Belirle
```javascript
// Log'dan hata kategorisini bul
const errorCategory = logEntry.category; // "authentication", "validation", "database", "business"
```

#### Adım 2: Correlation ID ile İlgili Log'ları Takip Et
```bash
# Belirli correlation ID ile tüm log'ları bul
docker exec -it hometeam-mongodb mongosh --authenticationDatabase=admin -u admin -p homeTeam2025! hometeam --eval 'db.errorlogs.find({correlationId: "1753313306749-ueypp1kek"}).pretty()'
```

#### Adım 3: Request Context'ini Analiz Et
```javascript
// Request detaylarını incele
const requestDetails = {
  method: logEntry.request.method,
  url: logEntry.request.url,
  headers: logEntry.request.headers,
  body: logEntry.request.body
};
```

#### Adım 4: Stack Trace Analizi
```javascript
// Stack trace'den root cause'u bul
const stackTrace = logEntry.stack;
// İlk satır genellikle ana hatayı gösterir
const rootCause = stackTrace.split('\n')[0];
```

## Sık Karşılaşılan Hatalar ve Çözümleri

### 1. JWT Token Süresi Geçmiş
**Belirti**: `UnauthorizedException: Unauthorized`
**Çözüm**:
```bash
# Yeni token al
curl -X POST http://localhost:3001/auth/login -H "Content-Type: application/json" -d "{\"email\": \"admin@hometeam.app\", \"password\": \"admin123456\"}"
```

### 2. JSON Format Hatası
**Belirti**: `Unexpected token '"', ""{\\"name\\""... is not valid JSON`
**Çözüm**: PowerShell yerine düz curl kullan veya JSON'ı proper escape et

### 3. Schema Validation Hatası
**Belirti**: `property username should not exist`
**Çözüm**: DTO'yu kontrol et ve istenmeyen field'ları kaldır

### 4. Required Field Missing
**Belirti**: `Path 'fieldName' is required`
**Çözüm**: Schema'da required field'ları optional yap veya default value ekle

## Otomatik Log Analizi Komutları

### En Son Hataları Kategorize Et
```bash
# Kategoriler bazında son hataları göster
docker exec -it hometeam-mongodb mongosh --authenticationDatabase=admin -u admin -p homeTeam2025! hometeam --eval '
db.errorlogs.aggregate([
  { $match: { createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) } } },
  { $group: { 
    _id: "$category", 
    count: { $sum: 1 }, 
    latestError: { $first: "$$ROOT" } 
  }},
  { $sort: { count: -1 } }
]).pretty()'
```

### Endpoint Bazında Hata Dağılımı
```bash
# Endpoint'ler bazında hata sayısı
docker exec -it hometeam-mongodb mongosh --authenticationDatabase=admin -u admin -p homeTeam2025! hometeam --eval '
db.errorlogs.aggregate([
  { $group: { 
    _id: "$request.url", 
    errorCount: { $sum: 1 },
    lastError: { $max: "$createdAt" }
  }},
  { $sort: { errorCount: -1 } }
]).pretty()'
```

## Proaktif Monitoring

### Çözülmemiş Hataları Takip Et
```bash
# Çözülmemiş hataları listele
docker exec -it hometeam-mongodb mongosh --authenticationDatabase=admin -u admin -p homeTeam2025! hometeam --eval 'db.errorlogs.find({isResolved: false}).sort({createdAt: -1}).limit(10).pretty()'
```

### SLA Takibi için Kritik Hatalar
```bash
# Son 1 saatte olan kritik hatalar
docker exec -it hometeam-mongodb mongosh --authenticationDatabase=admin -u admin -p homeTeam2025! hometeam --eval '
db.errorlogs.find({
  createdAt: { $gte: new Date(Date.now() - 60*60*1000) },
  $or: [
    { category: "database" },
    { statusCode: { $gte: 500 } }
  ]
}).sort({createdAt: -1}).pretty()'
```

## Hata Çözüldü Olarak İşaretleme

```bash
# Belirli correlation ID'li hatayı çözüldü olarak işaretle
docker exec -it hometeam-mongodb mongosh --authenticationDatabase=admin -u admin -p homeTeam2025! hometeam --eval '
db.errorlogs.updateOne(
  { correlationId: "CORRELATION_ID_HERE" },
  { 
    $set: { 
      isResolved: true, 
      resolvedAt: new Date(),
      resolutionNotes: "Çözüm açıklaması buraya"
    }
  }
)'
```

## Best Practices

1. **Her hata önce log'lardan kontrol edilmeli**
2. **Correlation ID ile ilgili tüm log'lar takip edilmeli**  
3. **Hata çözüldükten sonra isResolved: true yapılmalı**
4. **Tekrarlayan hataların root cause'u bulunmalı**
5. **PowerShell JSON problem'i için curl kullanılmalı**
6. **JWT token'ları düzenli refresh edilmeli**

Bu rehberi takip ederek sistematik bir şekilde tüm hataları analiz edebilir ve çözebiliriz.
