// screenshot the color rule, sample center pixel of the swatch via an in-page canvas; optional arg 'refresh' clicks refresh first
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { while (1) { try { fs.mkdirSync('lock'); break } catch { await new Promise(r => setTimeout(r, 100)) } }
  try { const b = await chromium.connectOverCDP('http://127.0.0.1:9222'); const p = b.contexts()[0].pages().find(x => x.url().includes('password-game'));
    const r = p.locator('.rule', { hasText: 'color in hex' }); await r.scrollIntoViewIfNeeded();
    if (process.argv[2] === 'refresh') { await r.locator('.refresh, img[src*=refresh]').first().click(); await p.waitForTimeout(300); }
    const buf = await r.screenshot({ path: 'color.png' }); const bb = await r.boundingBox();
    const px = await p.evaluate(async ([d, w]) => { const im = new Image(); im.src = 'data:image/png;base64,' + d; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
      const s = im.width / w, out = {}; for (let y = Math.floor(im.height * 0.45); y < im.height * 0.85; y += 10) { const v = g.getImageData(Math.floor(im.width / 2), y, 1, 1).data; const h = [...v].slice(0, 3).map(x => x.toString(16).padStart(2, '0')).join(''); out[h] = (out[h] || 0) + 1; } return out; }, [buf.toString('base64'), bb.width]);
    console.log(JSON.stringify(px));
  } finally { fs.rmdirSync('lock'); process.exit(0) } })();
