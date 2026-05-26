import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.type().toUpperCase(), msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    page.on('requestfailed', request =>
      console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText)
    );
    
    console.log("Navigating to local preview server...");
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    console.log("Finished navigating.");
    
    const content = await page.content();
    console.log("Root div content length:", content.length);
    if (content.length < 5000) {
       console.log("Page content:", content);
    }
    
    await browser.close();
})();
