const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGE ERROR:', err.message));
  
  console.log('Navigating to http://localhost:4200...');
  await page.goto('http://localhost:4200', { waitUntil: 'networkidle' });
  
  console.log('Done.');
  await browser.close();
})();
