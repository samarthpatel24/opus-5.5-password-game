// background: keep time (after 🌑), digit slot (after may), pad+prime length (after #bdcec2) consistent; shared mkdir lock
// fixed digits outside regions: chess 6 + hex 2 (+ leap 0) = 8, so slot + time + length digit sums must total 17
const { chromium } = require('playwright'); const fs = require('fs'), LOCK = __dirname + '/lock';
const sleep = ms => new Promise(r => setTimeout(r, ms)); const ds = s => [...s].reduce((a, c) => a + (/\d/.test(c) ? +c : 0), 0);
const PRIMES = [101, 103, 107, 109, 113, 127, 131, 97, 89, 83, 79];
const glen = s => [...new Intl.Segmenter().segment(s)].length;
const once = process.argv[2] === 'once';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const p = b.contexts()[0].pages().find(x => x.url().includes('password-game'));
  const sel = (s, e) => p.evaluate(([s, e]) => { const root = document.querySelector('.ProseMirror'); const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n, off = 0, r = document.createRange(), ss = false, last;
    while ((n = w.nextNode())) { const L = n.data.length; last = n; if (!ss && s <= off + L) { r.setStart(n, s - off); ss = true; } if (ss && e <= off + L) { r.setEnd(n, e - off); break; } off += L; }
    if (!ss) { r.setStart(last, last.data.length); r.setEnd(last, last.data.length); } const S = getSelection(); S.removeAllRanges(); S.addRange(r); }, [s, e]);
  const put = async (s, e, str) => { await p.focus('.ProseMirror'); await sel(s, e); await sleep(70); if (str) await p.keyboard.insertText(str); else if (e > s) await p.keyboard.press('Backspace'); await sleep(50); };
  for (;;) {
    if (fs.existsSync(__dirname + '/tick.stop')) process.exit(0);
    try { fs.mkdirSync(LOCK); } catch { await sleep(200); continue; }
    try {
      const t = await p.evaluate(() => document.querySelector('.ProseMirror').innerText.replace(/\n$/, ''));
      const d = new Date(), time = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      const mS = /may(\d*)XXXV/.exec(t), mT = /🌑([\d:]*)finland/.exec(t), mE = /#bdcec2(!*)(\d*)$/.exec(t);
      if (!mS || !mT || !mE) { fs.appendFileSync(__dirname + '/tick.log', 'parse fail ' + t + '\n'); }
      else {
        const core = glen(t) - mS[1].length - mT[1].length - mE[1].length - mE[2].length;
        let plan = null;
        for (const N of PRIMES) { const slot = 17 - ds(time) - ds(String(N)); if (slot < 0 || slot > 27) continue;
          const sStr = slot === 0 ? '' : slot <= 9 ? String(slot) : slot <= 18 ? '9' + (slot - 9) : '99' + (slot - 18);
          const pad = N - core - sStr.length - time.length - String(N).length; if (pad >= 1 && pad <= 20) { plan = { N, sStr, pad }; break; } }
        if (!plan) fs.appendFileSync(__dirname + '/tick.log', 'no plan core=' + core + ' time=' + time + '\n');
        else if (mS[1] !== plan.sStr || mT[1] !== time || mE[1].length !== plan.pad || mE[2] !== String(plan.N)) {
          // edit from the end backwards so earlier offsets stay valid
          await put(mE.index + 7, t.length, '!'.repeat(plan.pad) + plan.N);
          await put(mT.index + 2, mT.index + 2 + mT[1].length, time);
          await put(mS.index + 3, mS.index + 3 + mS[1].length, plan.sStr);
          fs.appendFileSync(__dirname + '/tick.log', new Date().toISOString() + ' ' + time + ' N=' + plan.N + ' slot=' + plan.sStr + ' pad=' + plan.pad + ' core=' + core + '\n');
        }
        // fix digit font sizes
        const bad = await p.evaluate(() => { const root = document.querySelector('.ProseMirror'); const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n, off = 0, out = [];
          while ((n = w.nextNode())) { const fs = getComputedStyle(n.parentElement).fontSize; for (let i = 0; i < n.data.length; i++) if (/\d/.test(n.data[i]) && fs !== (+n.data[i]) ** 2 + 'px') out.push([off + i, (+n.data[i]) ** 2 + 'px']); off += n.data.length; } return out; });
        for (const [i, sz] of bad) { await p.focus('.ProseMirror'); await sel(i, i + 1); await sleep(70); await p.locator('select').nth(0).selectOption(sz); await sleep(40); }
      }
    } catch (e) { fs.appendFileSync(__dirname + '/tick.log', 'err ' + e.message + '\n'); }
    fs.rmdirSync(LOCK); if (once) process.exit(0); await sleep(2000);
  }
})();
