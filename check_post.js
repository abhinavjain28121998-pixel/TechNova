import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, query, where, updateDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function findPost() {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where('slug', '==', 'how-ai-agents-are-reshaping-modern-enterprise-workflows'));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log("Post not found");
    return;
  }
  
  for (const docSnap of snapshot.docs) {
    console.log("FOUND POST:", docSnap.id);
    const data = docSnap.data();
    console.log("Current coverImage:", data.coverImage);
    console.log("Current content length:", data.content ? data.content.length : 0);
  }
}

findPost().catch(console.error);
