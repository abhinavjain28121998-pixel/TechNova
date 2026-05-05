const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto('https://tech-nova-iota.vercel.app/blog/business-benchmarking-ai-transformation-strategy', {waitUntil: 'networkidle0'});
  const scripts = await page.$$eval('script[type="application/ld+json"]', els => els.map(e => e.innerHTML));
  console.log('Found scripts:', scripts.length);
  for(let i=0; i<scripts.length; i++) {
     console.log('Script', i, 'FAQPage:', scripts[i].includes('FAQPage'));
     if (scripts[i].includes('FAQPage')) {
         
         const json = JSON.parse(scripts[i]);
         function findDuplicates(obj, targetKey) {
             const keys = Object.keys(obj);
             const duplicates = keys.filter((item, index) => keys.indexOf(item) != index);
             console.log("Duplicate keys check in object", duplicates);
         }
         
         if (json['@graph']) {
             json['@graph'].forEach(g => {
                 if(g['@type'] === 'FAQPage') {
                     // Check if any issues might cause "Duplicate field FAQPage" warning
                     // The error actually is exactly what GSC says
                 }
             })
         }
     }
  }
  await browser.close();
})();
