import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    await page.goto('https://tech-nova-iota.vercel.app/blog/advancing-global-business-services-generative-ai-capabilities', { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 4000));
    
    const text = await page.evaluate(() => document.body.innerText);
    console.log("TEXT:", text.substring(0, 500));
    
    await browser.close();
})();
