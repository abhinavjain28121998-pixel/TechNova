const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, updateDoc, doc } = require("firebase/firestore");
const fs = require("fs");
const axios = require("axios");

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const snapshot = await getDocs(collection(db, "posts"));
  const posts = [];
  snapshot.forEach(d => posts.push({ id: d.id, ...d.data() }));

  // Count image frequencies
  const freq = {};
  posts.forEach(p => {
    freq[p.coverImage] = (freq[p.coverImage] || 0) + 1;
  });

  const toUpdate = posts.filter(p => {
    // If it's a generic seed path:
    if (p.coverImage && p.coverImage.includes('picsum.photos')) return true;
    // If it's undefined
    if (!p.coverImage || p.coverImage === 'undefined') return true;
    // If it's a duplicate image
    if (freq[p.coverImage] > 1) return true;
    return false;
  });

  // Keep track of one valid entry for each repeated image to keep the first one
  const kept = new Set();
  const actuallyToUpdate = [];
  for (const p of posts) {
    if (toUpdate.some(u => u.id === p.id)) {
      if (freq[p.coverImage] > 1 && !kept.has(p.coverImage)) {
        kept.add(p.coverImage); // Keep the first occurrence
      } else {
        actuallyToUpdate.push(p);
      }
    }
  }

  console.log(`Found ${actuallyToUpdate.length} posts needing new banners.`);

  for (let i = 0; i < actuallyToUpdate.length; i++) {
    const p = actuallyToUpdate[i];
    const prompt = encodeURIComponent(`Abstract modern beautiful highly professional corporate editorial illustration for article titled "${p.title}", dark blue neon tech AI style, 8k resolution, minimalist`);
    const url = `https://image.pollinations.ai/prompt/${prompt}?width=1200&height=600&nologo=true`;
    
    console.log(`[${i+1}/${actuallyToUpdate.length}] Updating ${p.id}...`);
    try {
      // Just setting the URL should be enough if pollinations is stable
      // But maybe we should fetch and check if it resolves?
      // Since it's going directly into the browser, we'll just set it.
      await updateDoc(doc(db, "posts", p.id), { coverImage: url });
      console.log(`  -> Set to pollinations URL`);
    } catch (e) {
      console.error(`  -> Failed: ${e.message}`);
    }
    // minimal sleep
    await new Promise(r => setTimeout(r, 200));
  }
}

run().catch(console.error).then(() => process.exit(0));
