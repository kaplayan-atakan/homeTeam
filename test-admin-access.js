const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function updateAdminRoleViaAPI() {
  try {
    console.log('🔐 Admin girişi yapılıyor...');
    
    // Admin giriş
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@hometeam.com',
      password: 'Admin123!'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Admin girişi başarısız:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.data.accessToken;
    const userId = loginResponse.data.data.user.id;
    console.log('✅ Admin girişi başarılı');
    console.log('🆔 User ID:', userId);
    console.log('👥 Mevcut rol:', loginResponse.data.data.user.role);
    
    // Admin rolü kontrolü
    if (loginResponse.data.data.user.role === 'ADMIN') {
      console.log('✅ Kullanıcının zaten ADMIN rolü var!');
      
      // Test: Admin endpoint'ine erişim dene
      try {
        console.log('\n🧪 Admin endpoint erişimi test ediliyor...');
        const usersResponse = await axios.get(`${BASE_URL}/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Admin endpoint erişimi başarılı!');
        console.log(`📊 Toplam kullanıcı sayısı: ${usersResponse.data.data.length}`);
      } catch (error) {
        console.log('❌ Admin endpoint erişimi başarısız:', error.response?.data?.message);
        console.log('🚫 HTTP Status:', error.response?.status);
      }
    } else {
      console.log('⚠️ Kullanıcının ADMIN rolü yok');
      console.log('🔧 Bu durumda direkt backend üzerinden role güncellenmesi gerekiyor');
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.response?.data?.message || error.message);
    if (error.response?.status === 401) {
      console.log('🔑 Authentication hatası - Email/şifre kontrol edin');
    }
  }
}

updateAdminRoleViaAPI();
