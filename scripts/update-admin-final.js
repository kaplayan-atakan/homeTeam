// hometeam database'ine geç
db = db.getSiblingDB('hometeam');

// Admin kullanıcısının role'ünü güncelle
const updateResult = db.users.updateOne(
  {email: 'admin@hometeam.com'}, 
  {$set: {role: 'admin'}}
);

print('Update result:', JSON.stringify(updateResult));

// Güncellenmiş kullanıcıyı kontrol et
const updatedUser = db.users.findOne(
  {email: 'admin@hometeam.com'}, 
  {email: 1, role: 1, firstName: 1, lastName: 1}
);

print('Updated admin user:', JSON.stringify(updatedUser, null, 2));

print('✅ Admin kullanıcısının rolü başarıyla güncellendi!');
