const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'); const out = process.argv[2];
const srv = http.createServer((q, s) => { let p = q.url.split('?')[0]; if (p === '/') p = '/index.html'; const f = path.join(root, p); if (!fs.existsSync(f)) { s.writeHead(404); return s.end(); } const t = { '.html': 'text/html', '.js': 'text/javascript', '.svg': 'image/svg+xml' }[path.extname(f)] || 'text/plain'; s.writeHead(200, { 'Content-Type': t }); s.end(fs.readFileSync(f)); }).listen(0, async () => {
  const base = 'http://localhost:' + srv.address().port; const b = await chromium.launch(); const errs = [];
  for (const [name, vp, scheme] of [['desk', { width: 1280, height: 800 }, 'light'], ['phone', { width: 390, height: 800 }, 'light'], ['dark', { width: 1280, height: 800 }, 'dark']]) {
    const ctx = await b.newContext({ viewport: vp, colorScheme: scheme }); const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(name + ' ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(name + ' console ' + m.text()); });
    await pg.goto(base + '/'); await pg.waitForTimeout(400); await pg.screenshot({ path: `${out}/${name}-login.png` });
    const txt = await pg.innerText('body'); if (/AIPKI|Diktisaintek|PUKMPPD|JEJAK|password123/i.test(txt)) errs.push(name + ' kata terlarang di login');
    const sw = await pg.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1); if (sw) errs.push(name + ' scroll horizontal di login');
    await pg.goto(base + '/#demo'); await pg.reload(); await pg.waitForTimeout(300); await pg.screenshot({ path: `${out}/${name}-demo.png` });
    for (const [em, label] of [['mahasiswa1.demo@demo.umt.test', 'mhs'], ['kaprodi.demo@demo.umt.test', 'kap'], ['admin.demo@demo.umt.test', 'adm']]) {
      await pg.evaluate(e => { A.demo({ dataset: { e } }); }, em).catch(async () => { await pg.click(`[data-e="${em}"]`); }); await pg.waitForTimeout(300);
      await pg.screenshot({ path: `${out}/${name}-${label}.png` });
      const sw2 = await pg.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1); if (sw2) errs.push(name + ' scroll horizontal ' + label);
      await pg.evaluate(() => { A.logout(); }); await pg.waitForTimeout(100);
    }
    await ctx.close();
  }
  await b.close(); srv.close(); console.log(errs.length ? errs.join('\n') : 'SHOT: 0 masalah');
});
