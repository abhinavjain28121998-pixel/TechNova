import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('https://unsplash.com/s/photos/modern-technology', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));
  
  const ids = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a'))
      .map(a => a.href)
      .filter(href => href.includes('/photos/'))
      .map(href => href.split('/photos/')[1])
      .filter(id => id && id.length > 5 && !id.includes('/'));
  });
  
  console.log('Found IDs:', new Set(ids).size);
  console.log(Array.from(new Set(ids)).slice(0, 10));
  
  await browser.close();
})();
