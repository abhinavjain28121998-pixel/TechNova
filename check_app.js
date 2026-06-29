import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', err => {
    errors.push(err.message);
  });
  await page.goto('http://localhost:3000/blog/the-evolution-of-ai-agents', { waitUntil: 'domcontentloaded' });
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log("Errors:", errors);
  await browser.close();
})();
