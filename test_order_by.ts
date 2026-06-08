import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check() {
  try {
    const q = query(collection(db, "posts"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    console.log(`Successfully fetched ${snapshot.docs.length} posts with orderBy`);
  } catch(e) {
    console.error("Failed:", e);
  }
  process.exit(0);
}

check();
