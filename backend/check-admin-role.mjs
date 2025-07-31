// Admin role kontrol ve düzeltme scripti
import mongoose from 'mongoose';

// User schema tanımı
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['USER', 'ADMIN'], 
    default: 'USER' 
  },
  isActive: { type: Boolean, default: true },
  oauthProvider: { type: String },
  oauthId: { type: String },
  emailVerified: { type: Boolean, default: false },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function checkAndFixAdminRole() {
  try {
    console.log('🔗 MongoDB bağlantısı kuruluyor...');
    await mongoose.connect('mongodb://localhost:27018/hometeam');
    console.log('✅ MongoDB bağlantısı başarılı\n');
    
    // Admin kullanıcısını bul
    console.log('🔍 Admin kullanıcısı aranıyor...');
    const adminUser = await User.findOne({ email: 'admin@hometeam.com' });
    
    if (!adminUser) {
      console.log('❌ admin@hometeam.com kullanıcısı bulunamadı');
      console.log('\n📋 Mevcut kullanıcılar:');
      const allUsers = await User.find({}).select('email role isActive');
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.role} - ${user.isActive ? 'Aktif' : 'Pasif'}`);
      });
      return;
    }
    
    console.log('👤 Admin kullanıcı bilgileri:');
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`🆔 ID: ${adminUser._id}`);
    console.log(`👥 Mevcut Rol: ${adminUser.role}`);
    console.log(`✅ Aktif: ${adminUser.isActive}`);
    console.log(`🔐 OAuth Provider: ${adminUser.oauthProvider || 'Local'}`);
    console.log(`📅 Oluşturulma: ${adminUser.createdAt}`);
    
    // Rol kontrolü ve düzeltme
    if (adminUser.role !== 'ADMIN') {
      console.log('\n⚠️ Kullanıcının ADMIN rolü yok! Düzeltiliyor...');
      
      const updateResult = await User.updateOne(
        { email: 'admin@hometeam.com' },
        { 
          $set: { 
            role: 'ADMIN',
            updatedAt: new Date()
          } 
        }
      );
      
      if (updateResult.modifiedCount > 0) {
        console.log('✅ Admin rolü başarıyla atandı!');
        
        // Güncellenmiş kullanıcıyı tekrar getir
        const updatedUser = await User.findOne({ email: 'admin@hometeam.com' });
        console.log(`🔄 Yeni rol: ${updatedUser.role}`);
      } else {
        console.log('❌ Admin rolü atanamadı');
      }
    } else {
      console.log('\n✅ Kullanıcının zaten ADMIN rolü var');
    }
    
    // Tüm admin kullanıcıları listele
    console.log('\n👥 Tüm ADMIN rolündeki kullanıcılar:');
    const adminUsers = await User.find({ role: 'ADMIN' }).select('email isActive createdAt');
    if (adminUsers.length > 0) {
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.isActive ? 'Aktif' : 'Pasif'} - ${user.createdAt}`);
      });
    } else {
      console.log('❌ Hiç ADMIN kullanıcı bulunamadı!');
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔗 MongoDB bağlantısı kapatıldı');
  }
}

// Scripti çalıştır
checkAndFixAdminRole();
