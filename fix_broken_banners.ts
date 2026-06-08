import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function fix() {
  await updateDoc(doc(db, "posts", "gen-ai-trade-finance-automation"), { coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71" });
  await updateDoc(doc(db, "posts", "gen-ai-mergers-acquisitions-analysis"), { coverImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf" });
  await updateDoc(doc(db, "posts", "gen-ai-intelligent-cash-flow-forecasting"), { coverImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c" });
  await updateDoc(doc(db, "posts", "gen-ai-financial-statement-analysis"), { coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f" });
  process.exit(0);
}
fix();
