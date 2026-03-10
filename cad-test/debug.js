const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://cad.onshape.com/signin', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000); // Wait 3s for JS frameworks to render
  
  const inputs = await page.$$eval('input', els => els.map(e => ({ type: e.type, name: e.name, id: e.id, placeholder: e.placeholder })));
  console.log('\nInputs:', inputs);
  
  const buttons = await page.$$eval('button', els => els.map(e => ({ type: e.type, name: e.name, id: e.id, text: e.textContent })));
  console.log('\nButtons:', buttons);
  
  await browser.close();
})();
