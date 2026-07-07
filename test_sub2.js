import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  try {
    const subscribersRef = collection(db, 'subscribers');
    await addDoc(subscribersRef, {
      email: 'test2@example.com',
      name: 'Abhinav',
      subscribedAt: new Date().toISOString(),
      status: 'active',
      source: 'article_footer'
    });
    console.log('Success');
  } catch (e) {
    console.error('Error:', e.message);
  }
}
run();
