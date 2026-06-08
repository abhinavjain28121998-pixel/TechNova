const fs = require('fs');

function generateSVG(title, category, slug) {
  const hash = Array.from(slug).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hues = [210, 240, 270, 300, 330, 200, 180, 220]; // Professional blues, purples
  const hue1 = hues[hash % hues.length];
  const hue2 = hues[(hash + 3) % hues.length];
  
  const svg = `<svg width="1200" height="600" viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${hue1}, 80%, 20%)" />
        <stop offset="100%" stop-color="hsl(${hue2}, 80%, 10%)" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.1)" />
      </pattern>
    </defs>
    <rect width="1200" height="600" fill="url(#grad)" />
    <rect width="1200" height="600" fill="url(#grid)" />
    
    <!-- Abstract Shapes -->
    <circle cx="1000" cy="100" r="300" fill="hsl(${hue1}, 70%, 50%)" opacity="0.1" filter="blur(40px)" />
    <circle cx="200" cy="500" r="400" fill="hsl(${hue2}, 70%, 50%)" opacity="0.1" filter="blur(60px)" />
    
    <g transform="translate(100, 300)">
      <text x="0" y="-40" font-family="Inter, sans-serif" font-weight="900" font-size="64" fill="#ffffff" letter-spacing="-1">${title.substring(0, 40)}${title.length > 40 ? '...' : ''}</text>
      <text x="0" y="40" font-family="Inter, sans-serif" font-weight="500" font-size="32" fill="rgba(255,255,255,0.7)">${category.toUpperCase()} • ENTERPRISE AI</text>
    </g>
  </svg>`;
  
  fs.writeFileSync(`./public/banners/${slug}.svg`, svg);
}

generateSVG('Redefining Digital Transformation for the Enterprise AI Era', 'Digital Strategy', 'redefining-digital-transformation');
