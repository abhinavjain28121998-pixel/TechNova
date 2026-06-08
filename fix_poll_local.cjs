const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, updateDoc, doc } = require("firebase/firestore");
const fs = require("fs");
const axios = require("axios");
const path = require("path");

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const snapshot = await getDocs(collection(db, "posts"));
  const posts = [];
  snapshot.forEach(d => posts.push({ id: d.id, ...d.data() }));

  const freq = {};
  posts.forEach(p => {
    freq[p.coverImage] = (freq[p.coverImage] || 0) + 1;
  });

  const kept = new Set();
  const actuallyToUpdate = [];
  for (const p of posts) {
    if (!p.coverImage || p.coverImage === 'undefined' || p.coverImage.includes('picsum.photos') || freq[p.coverImage] > 1) {
      if (freq[p.coverImage] > 1 && !kept.has(p.coverImage) && !p.coverImage.includes('picsum.photos')) {
        kept.add(p.coverImage); 
      } else {
        actuallyToUpdate.push(p);
      }
    }
  }

  console.log(`Downloading ${actuallyToUpdate.length} unique AI images (might take a while)...`);

  for (let i = 0; i < actuallyToUpdate.length; i++) {
    const p = actuallyToUpdate[i];
    const promptUrl = encodeURI(`https://image.pollinations.ai/prompt/Highly professional abstract technology banner, corporate editorial art, concept: ${p.title}, dark background, blue and purple neon vectors, clean minimal?width=1200&height=600&nologo=true`);
    const localPath = `/banners/auto-${p.id}.jpg`;
    const fullPath = path.join(process.cwd(), 'public', localPath);
    
    console.log(`[${i+1}/${actuallyToUpdate.length}] ${p.id}...`);
    try {
      const res = await axios({
        url: promptUrl,
        method: 'GET',
        responseType: 'stream',
        timeout: 30000
      });
      
      const writer = fs.createWriteStream(fullPath);
      res.data.pipe(writer);
      
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      
      await updateDoc(doc(db, "posts", p.id), { coverImage: localPath });
      console.log(`  -> Saved and updated!`);
    } catch (e) {
      console.error(`  -> Download failed: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}

run().catch(console.error).then(() => process.exit(0));
