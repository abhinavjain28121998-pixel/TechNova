import fs from 'fs';
import path from 'path';

const unsplashIds = [
  '1551288049-bebda4e38f71', // teamwork data
  '1518770660439-4636190af475', // circuit board
  '1451187580459-434902bd0c0e', // analytics dashboard
  '1460925895917-afdab827c52f', // messy data/tech
  '1550751827-4bd374c3f58b', // cybersecurity
  '1504384308090-c894fd10fdd2', // abstract digital 
  '1531297122-e12836be60b7', // trading screens
  '1526304640581-d334cdbbf45e', // money finance
  '1553729459-efe14d8bd8dc', // people looking at monitors
  '1486406146926-c627a92ad1ab', // corporate building
  '1522071820081-009f0129c71c', // team meeting
  '1491336477066-31156b5e4f35', // coffee, laptop
  '1507679799987-c724130c2d43', // phone apps
  '1517048676732-5acca8433ec1', // data
  '1451187580459-434902bd0c0e', // graph
  '1504868584819-ef4859aeb4ba', // code on screen
  '1555949963-ff9fe0c870eb', // binary/code
  '1511216335778-4cb8f49fa2a5', // vr headset
  '1484417894907-623942c8ee29', // laptop night
];

let filesToUpdate = [];
const dataDir = './src/data';
fs.readdirSync(dataDir).forEach(f => {
  if (f.endsWith('.ts')) filesToUpdate.push(path.join(dataDir, f));
});

let stringToId = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return unsplashIds[Math.abs(hash) % unsplashIds.length];
};

filesToUpdate.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  content = content.replace(/'https:\/\/image\.pollinations\.ai[^']+'/g, (match) => {
    let id = stringToId(match);
    return `'https://images.unsplash.com/photo-${id}?q=80&w=1200&auto=format&fit=crop'`;
  });
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + filePath);
  }
});

let compFiles = ['src/pages/Post.tsx', 'src/pages/Home.tsx', 'src/pages/Blog.tsx', 'src/pages/Categories.tsx', 'src/components/SEO.tsx'];
compFiles.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  let newContent = content.replace(/`https:\/\/image\.pollinations\.ai\/prompt[^`]+`/g, 
    `'https://images.unsplash.com/photo-1504384308090-c894fd10fdd2?q=80&w=1200&auto=format&fit=crop'`
  );
  if (content !== newContent) {
    fs.writeFileSync(f, newContent);
    console.log('Updated ' + f);
  }
});
