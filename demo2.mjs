import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] });
  const page = await browser.newPage();
  
  page.on('request', request => {
    if (request.resourceType() === 'fetch' || request.resourceType() === 'xhr') {
      console.log('XHR/FETCH REQ:', request.method(), request.url());
    }
  });

  page.on('response', async (response) => {
    if (response.status() >= 400) {
      console.log('ERROR RESPONSE:', response.status(), response.url());
      try {
        console.log('ERROR BODY:', await response.text());
      } catch(e) {}
    }
  });

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'admin@ethara.com');
  await page.type('input[type="password"]', 'password123');

  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.toLowerCase().includes('login') || text.toLowerCase().includes('sign in')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 4000));
})();
