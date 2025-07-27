// Tüm database'leri listele
print('Available databases:');
db.adminCommand('listDatabases').databases.forEach(db => print(db.name));

// Mevcut database'i kontrol et
print('\nCurrent database:', db.getName());

// Tüm collection'ları listele
print('\nCollections in current database:');
db.getCollectionNames().forEach(collection => print(collection));

// Users collection'ında tüm kayıtları listele
print('\nAll documents in users collection:');
if (db.users.countDocuments() > 0) {
  db.users.find().forEach(printjson);
} else {
  print('No documents found in users collection');
}

// Eğer users collection yoksa veya boşsa, diğer olası collection isimlerini kontrol et
const collections = db.getCollectionNames();
collections.forEach(collection => {
  if (collection.includes('user') || collection.includes('User')) {
    print(`\nDocuments in ${collection}:`);
    db.getCollection(collection).find().limit(5).forEach(printjson);
  }
});
