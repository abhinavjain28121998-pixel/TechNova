import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const urls = [
    'http://localhost:3000/blog/ai-infrastructure-cost-optimization-llm-deployments',
    'http://localhost:3000/blog/open-source-enterprise-llms-security-privacy',
    'http://localhost:3000/blog/multimodal-ai-data-extraction-complex-documents'
  ];
  
  for (const url of urls) {
    await page.goto(url, { waitUntil: 'networkidle2' });
    const hasPre = await page.evaluate(() => {
      return !!document.querySelector('article pre');
    });
    console.log(`URL: ${url}, Has <pre> tag: ${hasPre}`);
  }
  
  await browser.close();
})();
