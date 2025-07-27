// Admin kullanıcısının rolünü güncelle
const result = db.users.updateOne(
  { email: 'admin@hometeam.com' }, 
  { $set: { role: 'admin' } }
);

print('Update result:', JSON.stringify(result));

// Güncellenmiş kullanıcıyı kontrol et
const updatedUser = db.users.findOne(
  { email: 'admin@hometeam.com' }, 
  { email: 1, role: 1, _id: 1 }
);

print('Updated user:', JSON.stringify(updatedUser));

// Tüm kullanıcıları listele (doğrulama için)
print('\nAll users:');
db.users.find({}, { email: 1, role: 1 }).forEach(printjson);
