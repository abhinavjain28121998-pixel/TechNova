import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check() {
  const q = query(collection(db, "posts"), where("status", "==", "published"), orderBy("date", "desc"), limit(5));
  try {
    const snapshot = await getDocs(q);
    console.log("SUCCESS length:", snapshot.docs.length);
  } catch(e) {
    console.log("ERROR:", e.message);
  }
}

check().catch(console.error);
