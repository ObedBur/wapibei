const cloudinary = require('cloudinary').v2;

// Charge les variables d'environnement depuis .env
require('dotenv').config();

console.log('--- Test Cloudinary ---');
console.log(
  'Cloud Name:',
  process.env.CLOUDINARY_CLOUD_NAME
);
console.log(
  'API Key:',
  process.env.CLOUDINARY_API_KEY
    ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4)
    : 'MANQUANT'
);
console.log(
  'API Secret:',
  process.env.CLOUDINARY_API_SECRET
    ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4)
    : 'MANQUANT'
);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test 1 : Vérifier la config
console.log('\n1. Configuration...');

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error('❌ Variables manquantes dans .env !');
  process.exit(1);
}

console.log('✅ Variables présentes');

// Test 2 : Uploader une petite image test (1 pixel rouge en base64)
console.log('\n2. Test upload (image 1px)...');

const testImage =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

cloudinary.uploader
  .upload(testImage, {
    folder: 'wapibei/test',
  })
  .then((result) => {
    console.log('✅ Upload réussi !');
    console.log('   URL:', result.secure_url);
    console.log('   Public ID:', result.public_id);

    // Test 3 : Supprimer l'image test
    console.log('\n3. Suppression image test...');

    return cloudinary.uploader.destroy(result.public_id);
  })
  .then(() => {
    console.log('✅ Suppression réussie');
    console.log('\n🎉 Tous les tests Cloudinary sont OK !');
  })
  .catch((err) => {
    console.error('❌ Erreur:', err.message);

    if (err.http_code === 401) {
      console.error('   → API Key ou API Secret invalide');
    } else if (err.http_code === 404) {
      console.error('   → Cloud Name introuvable');
    }

    process.exit(1);
  });