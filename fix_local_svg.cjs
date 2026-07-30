const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, updateDoc, doc } = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

function generateSVG(title, category, slug) {
  const hash = Array.from(slug).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hues = [210, 240, 270, 300, 330, 200, 180, 220, 250, 190, 215, 230]; 
  const hue1 = hues[hash % hues.length];
  const hue2 = hues[(hash * 3 + 7) % hues.length];
  const hue3 = hues[(hash * 5 + 11) % hues.length];
  
  const bgType = hash % 3;
  
  let bgShapes = '';
  if (bgType === 0) {
    bgShapes = `
      <circle cx="1000" cy="100" r="400" fill="hsl(${hue1}, 80%, 60%)" opacity="0.15" filter="blur(60px)" />
      <circle cx="200" cy="500" r="500" fill="hsl(${hue2}, 80%, 60%)" opacity="0.15" filter="blur(80px)" />
      <path d="M0,600 Q300,500 600,600 T1200,600 L1200,600 L0,600 Z" fill="hsl(${hue3}, 50%, 20%)" opacity="0.2" />`;
  } else if (bgType === 1) {
    bgShapes = `
      <polygon points="0,0 1200,600 0,600" fill="hsl(${hue1}, 70%, 40%)" opacity="0.05" />
      <circle cx="600" cy="300" r="400" fill="hsl(${hue2}, 80%, 50%)" opacity="0.1" filter="blur(40px)" />
      <circle cx="900" cy="100" r="200" fill="hsl(${hue3}, 90%, 60%)" opacity="0.2" filter="blur(70px)" />`;
  } else {
    bgShapes = `
      <ellipse cx="600" cy="0" rx="800" ry="300" fill="hsl(${hue1}, 80%, 50%)" opacity="0.1" filter="blur(50px)" />
      <ellipse cx="600" cy="600" rx="800" ry="300" fill="hsl(${hue3}, 80%, 50%)" opacity="0.1" filter="blur(50px)" />`;
  }
  
  let gridOp = (hash % 10 + 5) / 100;

  const titleLines = [];
  let currentLine = '';
  const words = title.split(' ');
  for (const w of words) {
    if ((currentLine + ' ' + w).length > 30) {
      titleLines.push(currentLine);
      currentLine = w;
    } else {
      currentLine += (currentLine ? ' ' : '') + w;
    }
  }
  if (currentLine) titleLines.push(currentLine);
  if (titleLines.length > 3) titleLines.splice(3, titleLines.length - 3, '...');

  const catStr = (category || 'Enterprise AI').toUpperCase();

  const svg = `<svg width="1200" height="600" viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${hue1}, 80%, 15%)" />
        <stop offset="50%" stop-color="hsl(${hue2}, 70%, 10%)" />
        <stop offset="100%" stop-color="hsl(${hue3}, 90%, 5%)" />
      </linearGradient>
      <pattern id="grid${hash}" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,${gridOp})" />
      </pattern>
      <pattern id="dots${hash}" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="1" height="1" fill="rgba(255,255,255,${gridOp * 2})" />
      </pattern>
    </defs>
    <rect width="1200" height="600" fill="url(#grad${hash})" />
    <rect width="1200" height="600" fill="url(#grid${hash})" />
    
    <g opacity="0.3">
      <rect x="1000" y="400" width="100" height="100" fill="url(#dots${hash})" />
      <rect x="100" y="100" width="80" height="80" fill="url(#dots${hash})" />
    </g>
    
    ${bgShapes}
    
    <g transform="translate(100, 260)">
      <text x="0" y="-80" font-family="Inter, system-ui, sans-serif" font-weight="600" font-size="20" fill="hsl(${hue1}, 80%, 70%)" letter-spacing="4">${catStr}</text>
      ${titleLines.map((line, i) => `<text x="0" y="${i * 64}" font-family="Inter, system-ui, sans-serif" font-weight="800" font-size="64" fill="#ffffff" letter-spacing="-1">${line}</text>`).join('')}
    </g>
    
    <g transform="translate(100, 520)">
      <line x1="0" y1="0" x2="60" y2="0" stroke="hsl(${hue2}, 80%, 60%)" stroke-width="4" />
      <text x="80" y="6" font-family="Inter, system-ui, sans-serif" font-weight="500" font-size="16" fill="rgba(255,255,255,0.5)">AI STUDIO BUILD / ENTERPRISE</text>
    </g>
  </svg>`;
  
  const dest = path.join(process.cwd(), 'public', 'banners', `${slug}.svg`);
  fs.writeFileSync(dest, svg);
  return `/banners/${slug}.svg`;
}

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
    const hasCoverImage = p.coverImage && p.coverImage !== 'undefined';
    const isPicsum = hasCoverImage && p.coverImage.includes('picsum.photos');
    const isDuplicate = hasCoverImage && freq[p.coverImage] > 1;

    if (!hasCoverImage || isPicsum || isDuplicate) {
      if (isDuplicate && !kept.has(p.coverImage) && !isPicsum) {
        kept.add(p.coverImage); 
      } else {
        actuallyToUpdate.push(p);
      }
    }
  }

  console.log(`Generating ${actuallyToUpdate.length} unique Premium SVG Banners...`);

  for (let i = 0; i < actuallyToUpdate.length; i++) {
    const p = actuallyToUpdate[i];
    try {
      const docId = p.slug || p.id;
      const svgPath = generateSVG(p.title, p.category, docId);
      await updateDoc(doc(db, "posts", docId), { coverImage: svgPath });
      console.log(`[${i+1}/${actuallyToUpdate.length}] Saved SVG and updated Firestore for ${docId}`);
    } catch (e) {
      console.error(`Failed on ${p.slug || p.id}: ${e.message}`);
    }
  }
}

run().catch(console.error).then(() => process.exit(0));
