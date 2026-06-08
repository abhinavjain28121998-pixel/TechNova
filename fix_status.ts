import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function fix() {
  const snapshot = await getDocs(collection(db, "posts"));
  for (const item of snapshot.docs) {
    if (!item.data().status) {
      await updateDoc(doc(db, "posts", item.id), { status: 'published' });
      console.log(`Updated ${item.id}`);
    }
  }
  console.log("Done");
  process.exit(0);
}

fix().catch(console.error);
