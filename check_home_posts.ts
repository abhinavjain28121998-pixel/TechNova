import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check() {
  const q = query(collection(db, "posts"), orderBy("date", "desc"), limit(10));
  const snapshot = await getDocs(q);
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    console.log(doc.id, { featured: data.featured, trending: data.trending, category: data.category });
  });
  process.exit(0);
}

check();
