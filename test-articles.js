import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/blog', { waitUntil: 'networkidle2' });
  
  const content = await page.content();
  if (content.includes('Model Context Protocol')) {
    console.log('SUCCESS: Model Context Protocol article found!');
  } else {
    console.log('FAILED: Model Context Protocol article NOT found!');
  }
  
  if (content.includes('AI Observability and Telemetry')) {
    console.log('SUCCESS: AI Observability article found!');
  } else {
    console.log('FAILED: AI Observability article NOT found!');
  }

  await browser.close();
})();
