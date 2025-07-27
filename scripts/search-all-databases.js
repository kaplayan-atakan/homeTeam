// Tüm database'leri kontrol et
const databases = db.adminCommand('listDatabases').databases;

print('Available databases:');
databases.forEach(database => {
  print(`Database: ${database.name}`);
  
  // Her database'de users collection'ını kontrol et
  const testDB = db.getSiblingDB(database.name);
  const collections = testDB.getCollectionNames();
  
  collections.forEach(collection => {
    if (collection === 'users') {
      print(`  Found users collection in ${database.name}`);
      
      // Bu database'deki kullanıcıları listele
      const users = testDB.users.find({}, {email: 1, role: 1, firstName: 1}).toArray();
      users.forEach(user => {
        print(`    User: ${user.email} - Role: ${user.role} - Name: ${user.firstName}`);
      });
    }
  });
});
