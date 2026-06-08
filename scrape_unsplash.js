import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Scrape Unsplash
  await page.goto('https://unsplash.com/s/photos/abstract-technology', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Extract IDs
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[itemprop="contentUrl"]')).map(a => a.href);
  });
  
  console.log('Found Links:', links.length);
  console.log(links.slice(0, 5));
  
  await browser.close();
})();
