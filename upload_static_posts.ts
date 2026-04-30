import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';
// We just read package.json or use tsx
import { POSTS } from './src/data/posts.ts';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function upload() {
  for (const post of POSTS) {
    if (!post.id) continue;
    
    // Ensure all undefined fields are handled or removed if needed, 
    // but firestore handles undefined poorly, so we strip them
    const data = JSON.parse(JSON.stringify(post));
    
    console.log("Uploading " + post.slug);
    await setDoc(doc(db, 'posts', data.id), data, { merge: true });
  }
  console.log("Done uploading");
  process.exit(0);
}

upload().catch(console.error);
