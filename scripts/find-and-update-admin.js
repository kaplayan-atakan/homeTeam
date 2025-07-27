// Admin kullanıcısını bul
const adminUser = db.users.findOne({email: 'admin@hometeam.com'});

if (adminUser) {
  print('Admin user found:', JSON.stringify(adminUser, null, 2));
  
  // Role'ü admin yap
  const updateResult = db.users.updateOne(
    {email: 'admin@hometeam.com'}, 
    {$set: {role: 'admin'}}
  );
  
  print('Update result:', JSON.stringify(updateResult));
  
  // Güncellenmiş kullanıcıyı kontrol et
  const updatedUser = db.users.findOne({email: 'admin@hometeam.com'});
  print('Updated user role:', updatedUser.role);
  
} else {
  print('Admin user not found!');
}

// Tüm kullanıcıları listele
print('\nAll users in database:');
db.users.find({}, {email: 1, role: 1, firstName: 1, lastName: 1}).forEach(printjson);
