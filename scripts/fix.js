// node fix.js <target>: remove 🔥 runs and restore text to target (first-diff repair), under the shared lock
const { chromium } = require('playwright'); const fs = require('fs'), LOCK = __dirname + '/lock';
const T = process.argv[2] || fs.readFileSync(__dirname + '/target.txt', 'utf8');
(async () => {
  for (let i = 0; i < 300; i++) { try { fs.mkdirSync(LOCK); break; } catch { await new Promise(r => setTimeout(r, 50)); } }
  try {
    const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const p = b.contexts()[0].pages().find(x => x.url().includes('password-game'));
    const sel = (s, e) => p.evaluate(([s, e]) => { const root = document.querySelector('.ProseMirror'); const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n, off = 0, r = document.createRange(), ss = false, last;
      while ((n = w.nextNode())) { const L = n.data.length; last = n; if (!ss && s <= off + L) { r.setStart(n, s - off); ss = true; } if (ss && e <= off + L) { r.setEnd(n, e - off); break; } off += L; }
      if (!ss) { r.setStart(last, last.data.length); r.setEnd(last, last.data.length); } const S = getSelection(); S.removeAllRanges(); S.addRange(r); }, [s, e]);
    await p.focus('.ProseMirror');
    for (let k = 0; k < 60; k++) {
      const C = await p.evaluate(() => document.querySelector('.ProseMirror').innerText.replace(/\n$/, ''));
      if (C === T) break;
      let i = 0; while (i < C.length && C[i] === T[i]) i++;
      if (C.startsWith('🔥', i)) { let j = i; while (C.startsWith('🔥', j)) j += 2; await sel(i, j); await p.waitForTimeout(40); await p.keyboard.press('Backspace'); }
      else if (C.length > T.length && C.slice(i + (C.length - T.length)) === T.slice(i)) { await sel(i, i + C.length - T.length); await p.waitForTimeout(40); await p.keyboard.press('Backspace'); }
      else { // insert missing chars from T up to where C resumes matching
        let m = 1; while (m < T.length - i && !(C.slice(i) === T.slice(i + m) || (C[i] && C.slice(i, i + 3) === T.slice(i + m, i + m + 3)))) m++;
        await sel(i, i); await p.waitForTimeout(40); await p.keyboard.insertText(T.slice(i, i + m)); }
      await p.waitForTimeout(40);
    }
    console.log('now:', await p.evaluate(() => document.querySelector('.ProseMirror').innerText.replace(/\n$/, '')));
  } finally { fs.rmdirSync(LOCK); process.exit(0); }
})();
