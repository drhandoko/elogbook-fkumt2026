/* Simulator ringan layanan Google Apps Script untuk pengujian di Node. */
const crypto = require('crypto'), vm = require('vm'), fs = require('fs');
const toSigned = b => Array.from(b).map(x => x > 127 ? x - 256 : x);
const toBuf = x => typeof x === 'string' ? Buffer.from(x, 'utf8') : Buffer.from(x.map(v => v & 255));
function makeRuntime(src, opts) {
  opts = opts || {};
  const logs = [];
  const sheets = {};
  const mkRange = (sh, r, c, nr, nc) => ({
    getValues: () => { const o = []; for (let i = 0; i < nr; i++) { const row = []; for (let j = 0; j < nc; j++) { const v = (sh.data[r - 1 + i] || [])[c - 1 + j]; row.push(v === undefined ? '' : v); } o.push(row); } return o; },
    setValues: vals => { vals.forEach((row, i) => { const rr = r - 1 + i; sh.data[rr] = sh.data[rr] || []; row.forEach((v, j) => { if (typeof v === 'string' && v.length > 50000) throw new Error('Cell limit 50000'); sh.data[rr][c - 1 + j] = v; }); }); },
    clearContent: () => { for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) { if (sh.data[r - 1 + i]) sh.data[r - 1 + i][c - 1 + j] = ''; } },
    getValue: () => { const v = (sh.data[r - 1] || [])[c - 1]; return v === undefined ? '' : v; },
    setValue: v => { sh.data[r - 1] = sh.data[r - 1] || []; sh.data[r - 1][c - 1] = v; },
    getRow: () => r,
    createTextFinder: txt => ({ matchEntireCell() { return this; }, findNext() { for (let i = 0; i < nr; i++) { const v = String((sh.data[r - 1 + i] || [])[c - 1] || ''); if (v.indexOf(txt) >= 0) return mkRange(sh, r + i, c, 1, 1); } return null; } })
  });
  const mkSheet = name => { const sh = { name, data: [] }; sh.api = { getLastRow: () => { let l = 0; sh.data.forEach((row, i) => { if (row && row.some(v => v !== '' && v != null)) l = i + 1; }); return l; }, getRange: (r, c, nr, nc) => mkRange(sh, r, c, nr || 1, nc || 1), setFrozenRows() { }, deleteRow: r => { sh.data.splice(r - 1, 1); } }; return sh; };
  const cache = {};
  const props = {};
  const ctx = {
    console, Logger: { log: m => logs.push(String(m)) },
    Session: { getActiveUser: () => ({ getEmail: () => opts.activeEmail || 'admin@umt.test' }), getScriptTimeZone: () => 'Asia/Jakarta' },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'SHA256' },
      getUuid: () => crypto.randomUUID(),
      base64Encode: x => (typeof x === 'string' ? Buffer.from(x, 'utf8') : toBuf(x)).toString('base64'),
      base64Decode: s => toSigned(Buffer.from(s, 'base64')),
      computeHmacSha256Signature: (v, k) => toSigned(crypto.createHmac('sha256', toBuf(k)).update(toBuf(v)).digest()),
      computeDigest: (a, s) => toSigned(crypto.createHash('sha256').update(toBuf(s)).digest()),
      newBlob: x => { const b = toBuf(x); return { getBytes: () => toSigned(b), getDataAsString: () => b.toString('utf8') }; },
      formatDate: (d, tz, f) => { const p = n => String(n).padStart(2, '0'); const m = { yyyy: d.getFullYear(), MM: p(d.getMonth() + 1), dd: p(d.getDate()), HH: p(d.getHours()), mm: p(d.getMinutes()), ss: p(d.getSeconds()) }; return f.replace(/yyyy|MM|dd|HH|mm|ss/g, t => m[t]); }
    },
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: n => sheets[n] ? sheets[n].api : null, insertSheet: n => { sheets[n] = mkSheet(n); return sheets[n].api; } }) },
    CacheService: { getScriptCache: () => ({ get: k => { const e = cache[k]; if (!e) return null; if (e.exp < Date.now()) { delete cache[k]; return null; } return e.v; }, put: (k, v, ttl) => { cache[k] = { v: String(v), exp: Date.now() + (ttl || 600) * 1000 }; }, remove: k => { delete cache[k]; } }) },
    LockService: { getScriptLock: () => ({ waitLock() { }, releaseLock() { } }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] == null ? null : props[k], setProperty: (k, v) => { props[k] = v; } }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: s => ({ setMimeType() { return this; }, getContent: () => s }) },
    HtmlService: { createHtmlOutput: h => ({ setTitle() { return this; }, html: h }) }
  };
  vm.createContext(ctx);
  vm.runInContext(src, ctx, { filename: 'Code.gs' });
  const call = (action, body) => { const out = ctx.doPost({ postData: { contents: JSON.stringify(Object.assign({ action }, body || {})) } }); return JSON.parse(out.getContent()); };
  return { ctx, call, logs, sheets, cache, props, run: code => vm.runInContext(code, ctx) };
}
module.exports = { makeRuntime };
