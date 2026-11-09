// background: keep WANT 🐛 in the password (inserted right after 🐔), using the shared mkdir lock
const { chromium } = require('playwright'); const fs = require('fs'), LOCK = __dirname + '/lock'; const WANT = +(process.argv[2] || 6);
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const p = b.contexts()[0].pages().find(x => x.url().includes('password-game'));
  for (;;) {
    if (fs.existsSync(__dirname + '/feeder.stop')) process.exit(0);
    try { fs.mkdirSync(LOCK); } catch { await sleep(300); continue; }
    try {
      const t = await p.evaluate(() => document.querySelector('.ProseMirror').innerText);
      const n = (t.match(/🐛/g) || []).length, at = t.indexOf('🐔');
      if (n < WANT && at >= 0) {
        await p.focus('.ProseMirror');
        await p.evaluate(s => { const root = document.querySelector('.ProseMirror'); const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let x, off = 0;
          while ((x = w.nextNode())) { if (s <= off + x.data.length) { const r = document.createRange(); r.setStart(x, s - off); r.collapse(true); const S = getSelection(); S.removeAllRanges(); S.addRange(r); return; } off += x.data.length; } }, at + 2);
        await sleep(60); await p.keyboard.insertText('🐛'.repeat(WANT - n));
        fs.appendFileSync(__dirname + '/feeder.log', new Date().toISOString() + ' fed ' + (WANT - n) + '\n');
      }
    } catch (e) { fs.appendFileSync(__dirname + '/feeder.log', 'err ' + e.message + '\n'); }
    fs.rmdirSync(LOCK); await sleep(4000);
  }
})();
