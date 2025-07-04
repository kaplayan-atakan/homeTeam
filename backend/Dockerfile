# Geliştirme ortamı için Dockerfile
FROM node:18-alpine

# Çalışma dizini
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci --only=production

# Kaynak kodları kopyala
COPY . .

# TypeScript build
RUN npm run build

# Port açık
EXPOSE 3001

# Kullanıcı oluştur (güvenlik)
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Kullanıcı geçiş
USER nestjs

# Uygulamayı başlat
CMD ["npm", "run", "start:prod"]
