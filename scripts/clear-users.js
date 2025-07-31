const mongoose = require('mongoose');

async function clearUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/homeTeam');
    console.log('🔗 MongoDB bağlantısı kuruldu');
    
    const result = await mongoose.connection.db.collection('users').deleteMany({});
    console.log(`✅ ${result.deletedCount} kullanıcı silindi`);
    
    await mongoose.disconnect();
    console.log('👋 MongoDB bağlantısı kapatıldı');
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

clearUsers();
