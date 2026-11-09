const { chromium } = require('playwright');
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const p = b.contexts()[0].pages().find(x => x.url().includes('password-game'));
  await p.click('.ProseMirror'); await p.keyboard.type('a'); await p.waitForTimeout(800);
  console.log(await p.evaluate(() => { const r = document.querySelector('.rule'); return r ? r.outerHTML.slice(0,800) + '\nPARENT:' + r.parentElement.outerHTML.slice(0,300) : document.body.innerHTML.slice(0,3000); }));
  process.exit(0);
})();
