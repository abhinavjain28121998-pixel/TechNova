import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    await page.goto('https://tech-nova-iota.vercel.app/blog', { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 4000));
    
    const h3s = await page.evaluate(() => Array.from(document.querySelectorAll('h3')).map(h => h.innerText));
    console.log("H3s:", h3s);
    
    await browser.close();
})();
