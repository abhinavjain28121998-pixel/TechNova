import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.type().toUpperCase(), msg.text()));
    
    await page.goto('https://tech-nova-iota.vercel.app/blog', { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 4000));
    
    await browser.close();
})();
