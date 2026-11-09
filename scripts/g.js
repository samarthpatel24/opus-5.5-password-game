// usage: node g.js <cmd> [args...]  cmds: state | type <s> | setall <s> | replace <start> <end> <s> | key <k> | shot <name> | eval <js>
const { chromium } = require('playwright');
const fs = require('fs'), LOCK = __dirname + '/lock';
async function lock() { for (let i = 0; i < 200; i++) { try { fs.mkdirSync(LOCK); return; } catch { await new Promise(r => setTimeout(r, 100)); } } throw new Error('lock timeout'); }
const [cmd, ...a] = process.argv.slice(2);
(async () => {
  await lock();
  try {
    const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const p = b.contexts()[0].pages().find(x => x.url().includes('password-game'));
    const ed = '.ProseMirror';
    // select UTF-16 range [s,e) across editor text nodes
    const sel = (s, e) => p.evaluate(([s, e]) => {
      const root = document.querySelector('.ProseMirror'); const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n, off = 0, r = document.createRange(), ss = false, last;
      while ((n = w.nextNode())) { const L = n.data.length; last = n;
        if (!ss && s <= off + L) { r.setStart(n, s - off); ss = true; }
        if (ss && e <= off + L) { r.setEnd(n, e - off); break; } off += L; }
      if (!ss) { r.setStart(last, last.data.length); r.setEnd(last, last.data.length); }
      const S = getSelection(); S.removeAllRanges(); S.addRange(r);
    }, [s, e]);
    const text = () => p.evaluate(() => document.querySelector('.ProseMirror').innerText.replace(/\n$/, ''));
    if (cmd === 'type') { await p.focus(ed); const L = (await text()).length; await sel(L, L); await p.waitForTimeout(50); await p.keyboard.insertText(a[0]); }
    else if (cmd === 'setall') { await p.focus(ed); await p.keyboard.press('Meta+A'); await p.keyboard.press('Backspace'); if (a[0]) await p.keyboard.insertText(a[0]); }
    else if (cmd === 'replace') { await p.focus(ed); await sel(+a[0], +a[1]); await p.waitForTimeout(50); if (a[2]) await p.keyboard.insertText(a[2]); else await p.keyboard.press('Backspace'); }
    else if (cmd === 'fmt') { // fmt <regex> <tag> <key> [want=1]: make each matching char have (or lack) tag
      await p.focus(ed); const want = a[3] !== '0';
      const info = await p.evaluate(([re, tag]) => { const root = document.querySelector('.ProseMirror'); const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n, off = 0, out = [];
        while ((n = w.nextNode())) { const has = !!n.parentElement.closest(tag); for (let i = 0; i < n.data.length; i++) if (new RegExp(re).test(n.data[i])) out.push([off + i, has]); off += n.data.length; } return out; }, [a[0], a[1]]);
      for (const [i, has] of info) if (has !== want) { await sel(i, i + 1); await p.waitForTimeout(80); await p.keyboard.press(a[2]); await p.waitForTimeout(40); }
      console.log('toggled', info.filter(x => x[1] !== want).length);
    }
    else if (cmd === 'rep') { await p.focus(ed); const i = (await text()).indexOf(a[0]); if (i < 0) console.log('NOT FOUND'); else { await sel(i, i + a[0].length); await p.waitForTimeout(60); if (a[1]) await p.keyboard.insertText(a[1]); else await p.keyboard.press('Backspace'); } }
    else if (cmd === 'opt') { // opt <selectIndex> <value> <regex|ALL>: apply select option to each matching char run (ALL = whole text)
      await p.focus(ed); const t = await text(); const runs = [];
      if (a[2] === 'ALL') runs.push([0, t.length]); else { const re = new RegExp(a[2], 'g'); let m; while ((m = re.exec(t))) runs.push([m.index, m.index + m[0].length]); }
      for (const [s, e] of runs) { await p.focus(ed); await sel(s, e); await p.waitForTimeout(80); await p.locator('select').nth(+a[0]).selectOption(a[1]); await p.waitForTimeout(60); }
      console.log('runs', runs.length);
    }
    else if (cmd === 'sizes') { // give every instance of the same letter (case-insensitive) a distinct font size
      const S = ['28px','32px','36px','42px','49px','64px','81px','25px','16px','12px','9px','4px','1px','0px'];
      const info = await p.evaluate(() => { const root = document.querySelector('.ProseMirror'); const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n, off = 0, out = [];
        while ((n = w.nextNode())) { const fs = getComputedStyle(n.parentElement).fontSize; for (let i = 0; i < n.data.length; i++) if (/[a-zA-Z]/.test(n.data[i])) out.push([off + i, n.data[i].toLowerCase(), fs]); off += n.data.length; } return out; });
      const k = {}; let ops = 0;
      for (const [i, ch, fs] of info) { const want = S[k[ch] = (k[ch] ?? -1) + 1]; if (fs !== want) { await sel(i, i + 1); await p.waitForTimeout(60); await p.locator('select').nth(0).selectOption(want); await p.waitForTimeout(30); await p.focus(ed); ops++; } }
      console.log('ops', ops);
    }
    else if (cmd === 'key') { await p.focus(ed); await p.keyboard.press(a[0]); }
    else if (cmd === 'shot') { await p.screenshot({ path: __dirname + '/shots/' + a[0] + '.png', fullPage: true }); }
    else if (cmd === 'eval') { console.log(await p.evaluate(a[0])); }
    await p.waitForTimeout(600);
    if (cmd !== 'eval' && cmd !== 'shot') {
      const st = await p.evaluate(() => {
        const t = document.querySelector('.ProseMirror').innerText.replace(/\n$/, '');
        const rules = [...document.querySelectorAll('.rule')].map(r => (r.className.includes('rule-error') ? 'X ' : 'ok ') + r.querySelector('.rule-top').innerText.trim() + ': ' + r.querySelector('.rule-desc').innerText.trim().replace(/\s+/g, ' ').slice(0, 160));
        return { t, len: t.length, rules };
      });
      console.log('PW[' + st.len + ']: ' + st.t);
      st.rules.filter(r => r.startsWith('X')).forEach(r => console.log(r));
      console.log('passing:', st.rules.filter(r => r.startsWith('ok')).map(r => r.match(/Rule (\d+)/)?.[1]).join(','));
    }
  } finally { fs.rmdirSync(LOCK); process.exit(0); }
})();
