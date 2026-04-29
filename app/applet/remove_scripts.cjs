const fs = require('fs');

let content = fs.readFileSync('src/data/posts.ts', 'utf8');

// The scripts are embedded like:
// <script type="application/ld+json">
// { ... }
// </script>

const removeScripts = (str) => {
  return str.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
};

const newContent = removeScripts(content);

if (newContent !== content) {
  fs.writeFileSync('src/data/posts.ts', newContent, 'utf8');
  console.log('Removed script tags from src/data/posts.ts');
} else {
  console.log('No script tags found or removed.');
}
