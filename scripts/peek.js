const { chromium } = require('playwright');
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const p = b.contexts()[0].pages().find(x => x.url().includes('password-game'));
  const t = await p.evaluate(() => document.body.innerText.slice(0, 1500));
  console.log(t);
  const h = await p.evaluate(() => { const e = document.querySelector('.ProseMirror, [contenteditable]'); return e ? e.outerHTML.slice(0,500) + '\nPARENT:' + e.parentElement.className : 'none'; });
  console.log(h);
  process.exit(0);
})();
