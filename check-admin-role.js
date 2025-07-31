const { MongoClient } = require('mongodb');

async function checkAdminRole() {
  const client = new MongoClient('mongodb://localhost:27018/hometeam');
  
  try {
    await client.connect();
    console.log('📁 MongoDB bağlantısı başarılı');
    
    const db = client.db('hometeam');
    const usersCollection = db.collection('users');
    
    // Admin kullanıcısını bul
    const adminUser = await usersCollection.findOne({ email: 'admin@hometeam.com' });
    
    if (adminUser) {
      console.log('\n👤 Admin Kullanıcı Bulundu:');
      console.log('📧 Email:', adminUser.email);
      console.log('🆔 ID:', adminUser._id);
      console.log('👥 Rol:', adminUser.role);
      console.log('✅ Aktif:', adminUser.isActive);
      console.log('📅 Oluşturulma:', adminUser.createdAt);
      console.log('🔐 OAuth Provider:', adminUser.oauthProvider);
      
      // Rol kontrolü
      if (adminUser.role === 'ADMIN') {
        console.log('\n✅ Kullanıcının ADMIN rolü var');
      } else {
        console.log('\n❌ Kullanıcının ADMIN rolü YOK - Mevcut rol:', adminUser.role);
        
        // Admin rolü ata
        const updateResult = await usersCollection.updateOne(
          { email: 'admin@hometeam.com' },
          { $set: { role: 'ADMIN' } }
        );
        
        if (updateResult.modifiedCount > 0) {
          console.log('🔧 Admin rolü başarıyla atandı!');
        }
      }
    } else {
      console.log('❌ admin@hometeam.com kullanıcısı bulunamadı');
    }
    
    // Tüm kullanıcıları listele
    console.log('\n📋 Tüm Kullanıcılar:');
    const allUsers = await usersCollection.find({}).toArray();
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.role} - ${user.isActive ? 'Aktif' : 'Pasif'}`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await client.close();
  }
}

checkAdminRole();
