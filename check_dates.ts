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
    console.log(doc.id, doc.data().date);
  });
  
  process.exit(0);
}

check();
