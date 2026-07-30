import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Checking an older article
  await page.goto('http://localhost:3000/blog/generative-ai-employee-onboarding-automation', { waitUntil: 'networkidle2' });
  
  const text = await page.evaluate(() => document.body.innerText);
  if (text.includes('"@context"')) {
    console.log('FAILED: Schema JSON is visible in the older article!');
  } else {
    console.log('SUCCESS: Schema JSON is NOT visible in the older article.');
  }

  await browser.close();
})();
