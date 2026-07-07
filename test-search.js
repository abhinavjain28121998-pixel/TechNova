import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  await page.goto('http://localhost:3000/blog', { waitUntil: 'networkidle2' });
  
  // Try to type into the search bar
  const searchInput = await page.$('input[placeholder="Search articles by title or tags..."]');
  if (searchInput) {
    console.log('Search input found!');
    await searchInput.type('React');
    await new Promise(r => setTimeout(r, 1000));
    const url = page.url();
    console.log('URL after search:', url);
  } else {
    console.log('Search input NOT found!');
  }
  
  await browser.close();
})();
