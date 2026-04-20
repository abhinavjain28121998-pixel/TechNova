import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  console.log("Fetching...");
  const q = query(collection(db, "posts"), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map(d => ({ id: d.id, title: d.data().title }));
  console.log("Posts ordered:", posts);
}

check().catch(console.error);
