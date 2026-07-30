import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  
  const hasPre = await page.evaluate(() => {
    return !!document.querySelector('pre');
  });
  
  console.log('Has <pre> tag on Home:', hasPre);

  await browser.close();
})();
