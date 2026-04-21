import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, query, where, updateDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function updatePostData() {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where('slug', '==', 'how-ai-agents-are-reshaping-modern-enterprise-workflows'));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log("Post not found");
    return;
  }
  
  for (const docSnap of snapshot.docs) {
    const docRef = doc(db, 'posts', docSnap.id);
    const data = docSnap.data();
    
    const coverImage = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200';
    
    // Add an image directly to the content if one isn't already there.
    let content = data.content;
    if (!content.includes('![AI Agents')) {
        content = `![AI Agents in Enterprise Architecture](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200)\n\n` + content;
    }

    await updateDoc(docRef, { coverImage, content });
    console.log(`Updated post: ${docSnap.id} with coverImage and content embedded image.`);
  }
}

updatePostData().catch(console.error);
