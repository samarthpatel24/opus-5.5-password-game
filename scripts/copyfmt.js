// copy per-character formatting (bold, italic, font family, font size) from editor 0 to editor 1, in runs
const { chromium } = require('playwright'); const fs = require('fs'), LOCK = __dirname + '/lock'; const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => { while (1) { try { fs.mkdirSync(LOCK); break } catch { await sleep(100) } }
  try { const b = await chromium.connectOverCDP('http://127.0.0.1:9222'); const p = b.contexts()[0].pages().find(x => x.url().includes('password-game'));
    const props = k => p.evaluate(k => { const root = document.querySelectorAll('.ProseMirror')[k]; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n, out = [];
      while ((n = w.nextNode())) { const e = n.parentElement, cs = getComputedStyle(e); const f = { b: !!e.closest('strong'), i: !!e.closest('em'), ff: cs.fontFamily.replace(/"/g, ''), fs: cs.fontSize }; for (let i = 0; i < n.data.length; i++) out.push(f); } return out; }, k);
    const sel = (s, e) => p.evaluate(([s, e]) => { const root = document.querySelectorAll('.ProseMirror')[1]; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n, off = 0, r = document.createRange(), ss = false;
      while ((n = w.nextNode())) { const L = n.data.length; if (!ss && s <= off + L) { r.setStart(n, s - off); ss = true; } if (ss && e <= off + L) { r.setEnd(n, e - off); break; } off += L; } const S = getSelection(); S.removeAllRanges(); S.addRange(r); }, [s, e]);
    const ed = p.locator('.ProseMirror').nth(1);
    for (const key of ['ff', 'fs', 'b', 'i']) {
      const A = await props(0), B = await props(1); if (A.length !== B.length) { console.log('length mismatch', A.length, B.length); break; }
      let i = 0, ops = 0;
      while (i < A.length) { if (A[i][key] === B[i][key]) { i++; continue; } let j = i; while (j < A.length && A[j][key] === A[i][key] && A[j][key] !== B[j][key] && (key === 'ff' || key === 'fs' || B[j][key] === B[i][key])) j++;
        await ed.focus(); await sel(i, j); await sleep(80);
        if (key === 'ff') await p.locator('select').nth(1).selectOption(A[i].ff); else if (key === 'fs') await p.locator('select').nth(0).selectOption(A[i].fs);
        else await p.keyboard.press(key === 'b' ? 'Meta+B' : 'Meta+I');
        await sleep(50); ops++; i = j; }
      console.log(key, 'ops', ops);
    }
    const A = await props(0), B = await props(1); console.log('remaining diffs', A.filter((a, i) => JSON.stringify(a) !== JSON.stringify(B[i])).length);
    await sleep(1000); console.log((await p.evaluate(() => document.body.innerText)).slice(-200).replace(/\n+/g, ' | '));
  } finally { fs.rmdirSync(LOCK); process.exit(0) } })();
