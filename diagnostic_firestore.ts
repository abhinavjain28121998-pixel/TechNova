import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export async function runDiagnostic() {
  console.log("Fetching all posts from Firestore...");
  const snapshot = await getDocs(collection(db, "posts"));
  
  const posts = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    posts.push({
      id: doc.id,
      title: data.title,
      status: data.status,
      date: data.date,
      coverImage: data.coverImage
    });
  });

  // Sort posts by date descending
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  console.log(`Found ${posts.length} total posts.\n`);
  
  let published = 0;
  let drafts = 0;
  let missingStatus = 0;

  posts.forEach(post => {
    if (post.status === 'published') published++;
    else if (post.status === 'draft') drafts++;
    else missingStatus++;

    console.log(`[${post.date}] ID: ${post.id}`);
    console.log(`  Title: ${post.title}`);
    console.log(`  Status: ${post.status || 'NO_STATUS_FIELD'}`);
    console.log(`  Cover Image: ${post.coverImage}`);
    console.log('--------------------------------------------------');
  });

  console.log(`\nSummary:`);
  console.log(`Total: ${posts.length}`);
  console.log(`Published: ${published}`);
  console.log(`Drafts: ${drafts}`);
  console.log(`Missing Status: ${missingStatus}`);
  
  process.exit(0);
}

runDiagnostic().catch(console.error);
