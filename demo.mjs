import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  
  page.on('response', async (response) => {
    if (response.url().includes('login')) {
      console.log('Login Response Status:', response.status());
      try {
        console.log('Login Response Body:', await response.text());
      } catch (e) { }
    }
  });

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  console.log('Navigating to login page...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

  console.log('Typing credentials...');
  await page.waitForSelector('input[type="email"]');
  
  // Clear any existing value
  await page.evaluate(() => document.querySelector('input[type="email"]').value = '');
  await page.type('input[type="email"]', 'admin@ethara.com', { delay: 100 });
  
  await page.waitForSelector('input[type="password"]');
  await page.evaluate(() => document.querySelector('input[type="password"]').value = '');
  await page.type('input[type="password"]', 'password123', { delay: 100 });

  console.log('Clicking login...');
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.toLowerCase().includes('sign in') || text.toLowerCase().includes('login')) {
      await btn.click();
      break;
    }
  }

  console.log('Waiting for network to settle...');
  await new Promise(r => setTimeout(r, 5000));
  
  const currentUrl = page.url();
  console.log('Final URL is:', currentUrl);
  
})();
