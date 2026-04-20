import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000/blog', { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 4000));
    
    const text = await page.evaluate(() => document.body.innerText);
    console.log("LOCALHOST TEXT:", text.substring(0, 500));
    
    await browser.close();
})();
