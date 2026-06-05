import puppeteer from 'puppeteer';

async function test() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900 });
  await page.setContent('<html><body style="background: linear-gradient(to right, #0f2027, #203a43, #2c5364); display: flex; align-items: center; justify-content: center;"><h1 style="color: white; font-family: sans-serif; font-size: 80px;">Test Banner Image</h1></body></html>');
  await page.screenshot({ path: 'public/puppeteer_test.png' });
  await browser.close();
  console.log('Saved public/puppeteer_test.png');
}

test().catch(console.error);
