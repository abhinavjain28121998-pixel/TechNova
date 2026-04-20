import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('response', resp => {
      if (resp.url().includes('firestore.googleapis.com')) {
        console.log('FIRESTORE RESP:', resp.status(), resp.url());
      }
    });
    
    await page.goto('https://tech-nova-iota.vercel.app/blog', { waitUntil: 'networkidle0' });
    
    await browser.close();
})();
