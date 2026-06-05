import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

async function clean() {
  const snap = await getDocs(collection(db, 'posts'));
  console.log('Total documents:', snap.docs.length);
  const seenSlugs = new Set();
  
  for (const item of snap.docs) {
    const data = item.data();
    if (item.id !== data.slug) {
        console.log(`Deleting doc ID ${item.id} because it doesn't match slug ${data.slug}`);
        await deleteDoc(doc(db, 'posts', item.id));
    } else {
        if (seenSlugs.has(data.slug)) {
            console.log(`Deleting duplicate doc with slug ${data.slug}`);
            await deleteDoc(doc(db, 'posts', item.id));
        } else {
            seenSlugs.add(data.slug);
        }
    }
  }
}
clean().then(() => { process.exit(0); }).catch(console.error);
