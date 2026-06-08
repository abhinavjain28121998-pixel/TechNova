import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check() {
  const q = query(collection(db, "posts"), orderBy("date", "desc"), limit(20));
  const snapshot = await getDocs(q);
  snapshot.forEach(doc => console.log(doc.id, doc.data().coverImage));
  process.exit(0);
}

check().catch(console.error);
