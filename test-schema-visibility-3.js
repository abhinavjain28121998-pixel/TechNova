import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/blog/agentic-ai-automation-multi-agent-workflows', { waitUntil: 'networkidle2' });
  
  const hasPre = await page.evaluate(() => {
    return !!document.querySelector('article pre');
  });
  
  console.log('Has <pre> tag:', hasPre);

  await browser.close();
})();
