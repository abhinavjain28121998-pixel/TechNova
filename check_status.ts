import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check() {
  const snapshot = await getDocs(collection(db, "posts"));
  let total = 0;
  let published = 0;
  let draft = 0;
  let noStatus = 0;
  snapshot.forEach(doc => {
    total++;
    const data = doc.data();
    if (data.status === 'published') published++;
    else if (data.status === 'draft') draft++;
    else noStatus++;
  });
  console.log(`Total: ${total}, Published: ${published}, Draft: ${draft}, No Status: ${noStatus}`);
  process.exit(0);
}

check().catch(console.error);
