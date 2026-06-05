import { db } from './src/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

async function clean() {
  try {
    const postsRef = collection(db, 'posts');
    const snap = await getDocs(postsRef);
    console.log(`Found ${snap.docs.length} posts`);
    
    let deletedCount = 0;
    
    for (const item of snap.docs) {
      const data = item.data();
      if (item.id !== data.slug) {
          console.log(`Deleting ID: ${item.id} (slug: ${data.slug})`);
          await deleteDoc(doc(db, 'posts', item.id));
          deletedCount++;
      }
    }
    console.log(`Deleted ${deletedCount} documents`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

clean();
