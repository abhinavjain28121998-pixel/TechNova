import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function fetchPost() {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where('slug', '==', 'how-ai-agents-are-reshaping-modern-enterprise-workflows'));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    const data = snapshot.docs[0].data();
    fs.writeFileSync('./target_post.json', JSON.stringify(data, null, 2));
    console.log("Saved post to target_post.json");
  } else {
    console.log("Post not found.");
  }
}

fetchPost().catch(console.error);
