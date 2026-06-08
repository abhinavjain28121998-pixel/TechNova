const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const fs = require("fs");

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const snapshot = await getDocs(collection(db, "posts"));
  const posts = [];
  snapshot.forEach(d => posts.push({ id: d.id, ...d.data() }));

  const needingUpdate = posts.filter(p => !p.coverImage || p.coverImage.endsWith('.svg') || p.coverImage.includes('picsum.photos'));
  
  needingUpdate.forEach(p => {
    console.log(`[POST] ${p.id} | ${p.title}`);
  });
}

run().catch(console.log).then(() => process.exit(0));
