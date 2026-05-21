const fs = require('fs');

const file = 'src/data/financeAIArticles.ts';
let t = fs.readFileSync(file, 'utf8');

// We want to remove the block starting with "### Article and FAQ Schema" to the last closing script tag
// Or just anything that contains <script type="application/ld+json"> directly

t = t.replace(/### Article and FAQ Schema \(JSON-LD\)/g, '');
t = t.replace(/```html\n<script type="application\/ld\+json">[\s\S]*?<\/script>\n\n<script type="application\/ld\+json">[\s\S]*?<\/script>\n```/g, '');
t = t.replace(/```html\s*<script type="application\/ld\+json">[\s\S]*?<\/script>\s*<script type="application\/ld\+json">[\s\S]*?<\/script>\s*```/g, '');

fs.writeFileSync(file, t);
console.log("Replaced schemas in financeAIArticles!");
