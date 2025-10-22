
import * as admin from 'firebase-admin';
import { categories } from '../src/app/data/categories';

// Initialize Firebase Admin SDK
const serviceAccount = require('../../../../.config/firebase/key.json'); // Download this from your Firebase project settings

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://dealdee-bf882.firebaseio.com'
});

const db = admin.firestore();

async function migrateCategories() {
  const categoriesCollection = db.collection('categories');

  for (const category of categories) {
    const { id, names, subCategories } = category;
    const categoryDoc = {
      names,
      subCategories: subCategories ? subCategories.map(sub => ({ id: sub.id, names: sub.names })) : []
    };

    try {
      await categoriesCollection.doc(id).set(categoryDoc);
      console.log(`Successfully migrated category: ${id}`);
    } catch (error) {
      console.error(`Error migrating category: ${id}`, error);
    }
  }
}

migrateCategories().then(() => {
  console.log('Category migration complete.');
  process.exit(0);
}).catch(error => {
  console.error('Category migration failed:', error);
  process.exit(1);
});
