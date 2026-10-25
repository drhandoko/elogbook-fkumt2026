// Menyusun aplikasi: node build.js
// Hasil: index.html (untuk Render, memakai config.js terpisah), dist/elogbook-fragment.html (untuk pratinjau artefak),
//        server/Code.gs dan server/appsscript.json (untuk Google Apps Script).
const fs = require('fs'), path = require('path');
const R = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
const W = (f, t) => { fs.mkdirSync(path.dirname(path.join(__dirname, f)), { recursive: true }); fs.writeFileSync(path.join(__dirname, f), t); };
const b64 = f => fs.readFileSync(path.join(__dirname, f)).toString('base64');
W('src/logos.js', '/* dibuat otomatis oleh build.js dari assets/ */\nconst LOGO_FK = \'data:image/svg+xml;base64,' + b64('assets/logo-fk.svg') + '\';\nconst LOGO_RS = \'data:image/svg+xml;base64,' + b64('assets/logo-rs.svg') + '\';\n');
const bundle = ['logos', 'core', 'seed', 'store', 'ui', 'views1', 'views2', 'views3', 'actions', 'enhancements'].map(n => R('src/' + n + '.js')).join('\n');
const css = R('src/style.css');
const fonts = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">';
const body = '<div id="app"></div><div id="busy" class="busy" hidden aria-live="polite" aria-label="Memproses"></div><div id="modal" hidden></div><div id="toast" class="toast" hidden></div>\n<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>';
const title = '<title>E-Logbook Profesi Dokter UMT</title>';
// 1. artefak (mode demo, tanpa server)
W('dist/elogbook-fragment.html', [title, '<meta name="claude:viewport-fit-sides" content="cover">', '<meta name="description" content="E-logbook dan e-portofolio Program Studi Profesi Dokter, Fakultas Kedokteran Universitas Murni Teguh">', fonts, '<style>' + css + '</style>', body, '<script>window.ELOGBOOK_DEMO=true;\n' + R('src/config.js') + '\n' + bundle + '</script>'].join('\n'));
// 2. situs statis untuk Render
W('index.html', ['<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">', title, '<meta name="description" content="E-logbook dan e-portofolio Program Studi Profesi Dokter, Fakultas Kedokteran Universitas Murni Teguh">', '<meta name="theme-color" content="#006AB0">', '<link rel="icon" type="image/svg+xml" href="logo-fk.svg">', fonts, '<style>' + css + '</style></head><body>', body, '<script src="config.js"></script>', '<script>' + bundle + '</script></body></html>'].join('\n'));
W('logo-fk.svg', R('assets/logo-fk.svg'));
// 3. Google Apps Script
W('server/Code.gs', R('vendor/sjcl.js') + '\n' + R('server/api.gs') + '\n\n/* ======== LOGIKA SKOR BERSAMA (dari src/core.js) ======== */\n' + R('src/core.js') + '\n' + R('server/live.gs'));
W('server/appsscript.json', JSON.stringify({ timeZone: 'Asia/Jakarta', dependencies: {}, exceptionLogging: 'STACKDRIVER', runtimeVersion: 'V8', webapp: { executeAs: 'USER_DEPLOYING', access: 'ANYONE_ANONYMOUS' } }, null, 2) + '\n');
const liveUrl = process.env.ELOGBOOK_API_URL || '';
if (liveUrl && !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(liveUrl)) throw new Error('ELOGBOOK_API_URL harus URL deployment Apps Script /exec');
W('config.js', R('src/config.js').replace("const API_URL = '';", 'const API_URL = ' + JSON.stringify(liveUrl) + ';'));
W('demo.html', R('index.html').replace('<script src="config.js"></script>', '<script>window.ELOGBOOK_DEMO = true;</script><script src="config.js"></script>'));
W('preview.html', R('dist/elogbook-fragment.html'));
['index.html','config.js','demo.html','logo-fk.svg','docs/panduan-live.html'].forEach(f=>W('public/'+f,R(f)));

console.log('OK  index.html', (R('index.html').length / 1024).toFixed(0) + ' KB;  fragment', (R('dist/elogbook-fragment.html').length / 1024).toFixed(0) + ' KB;  Code.gs', R('server/Code.gs').split('\n').length + ' baris');
