/* ================= UI HELPERS ================= */
const ICO = {
  home: 'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19a2 2 0 0 1 2-2h13',
  cal: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  check: 'M9 4h6v3H9zM7 5H5v16h14V5h-2M9 14l2 2 4-4',
  chat: 'M4 5h16v11H9l-5 4z',
  chart: 'M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3',
  users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M17 11a2.5 2.5 0 1 0 0-5M17 14c2.5 0 4 2 4 5',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  gear: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  upload: 'M12 16V4M7 9l5-5 5 5M4 20h16',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  plus: 'M12 5v14M5 12h14',
  x: 'M6 6l12 12M18 6L6 18',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  logout: 'M10 4H5v16h5M15 8l4 4-4 4M19 12H9',
  alert: 'M12 3l10 18H2zM12 10v5M12 18v.5',
  pin: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  copy: 'M9 9h11v11H9zM5 15V4h11',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  flag: 'M5 21V4M5 4h12l-2 4 2 4H5',
  target: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'
};
const ic = (n, s) => '<svg class="ic" width="' + (s || 18) + '" height="' + (s || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (ICO[n] || '') + '"/></svg>';
const MARK = '<svg class="mark" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" class="mark-bg"/><path d="M6 22h8l3-8 5 15 4-11 2 4h6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ECG = '<svg class="ecg" viewBox="0 0 600 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40h150l12-22 14 52 16-60 14 46 10-16h60l12-14 14 36 12-22h280" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const pill = (t, tone) => '<span class="pill ' + (tone || '') + '">' + esc(t) + '</span>';
const STAT = { draf: ['Draf', 'muted'], menunggu: ['Menunggu validasi', 'warn'], valid: ['Divalidasi', 'good'], kembali: ['Dikembalikan', 'bad'] };
const statPill = s => pill(STAT[s][0], STAT[s][1]);
const bar = (p, tone) => '<div class="bar" role="img" aria-label="' + n0(p) + ' persen"><i class="' + (tone || '') + '" style="width:' + clamp(p || 0, 0, 100) + '%"></i></div>';
const toneOf = p => p >= 80 ? 'good' : p >= 50 ? '' : 'warn';
const kpi = (label, val, sub, extra) => '<div class="kpi card"><div class="eyebrow">' + esc(label) + '</div><div class="kpi-v">' + val + '</div>' + (sub ? '<div class="kpi-s">' + sub + '</div>' : '') + (extra || '') + '</div>';
const card = (title, body, right, cls) => '<section class="card ' + (cls || '') + '">' + (title ? '<header class="card-h"><h3>' + title + '</h3>' + (right ? '<div class="card-r">' + right + '</div>' : '') + '</header>' : '') + '<div class="card-b">' + body + '</div></section>';
const empty = (t, sub) => '<div class="empty"><div class="empty-t">' + esc(t) + '</div>' + (sub ? '<div class="empty-s">' + esc(sub) + '</div>' : '') + '</div>';
const pageHead = (t, sub, right) => '<div class="phead"><div><h1>' + esc(t) + '</h1>' + (sub ? '<p class="sub">' + sub + '</p>' : '') + '</div>' + (right ? '<div class="phead-r">' + right + '</div>' : '') + '</div>';
const table = (head, rows, cls) => '<div class="tbl-wrap"><table class="tbl ' + (cls || '') + '"><thead><tr>' + head.map(h => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' + rows.join('') + '</tbody></table></div>';
const field = (id, label, inner, hint, cls) => '<div class="field ' + (cls || '') + '"><label for="' + id + '">' + label + '</label>' + inner + (hint ? '<div class="hint">' + hint + '</div>' : '') + '</div>';
const input = (id, v, o) => { o = o || {}; return '<input id="' + id + '" name="' + (o.name || id) + '" type="' + (o.type || 'text') + '" value="' + esc(v == null ? '' : v) + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.req ? ' required' : '') + (o.extra ? ' ' + o.extra : '') + '>'; };
const selectEl = (id, opts, val, o) => { o = o || {}; return '<select id="' + id + '" name="' + (o.name || id) + '"' + (o.extra ? ' ' + o.extra : '') + '>' + opts.map(x => { const v = Array.isArray(x) ? x[0] : x, l = Array.isArray(x) ? x[1] : x; return '<option value="' + esc(v) + '"' + (String(v) === String(val) ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join('') + '</select>'; };
const textarea = (id, v, o) => { o = o || {}; return '<textarea id="' + id + '" name="' + (o.name || id) + '" rows="' + (o.rows || 3) + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.req ? ' required' : '') + '>' + esc(v || '') + '</textarea>'; };
const stName = id => { const s = stase(id); return s ? s.pendek : '-'; };
const asmTone = s => s === 'dinilai' ? 'good' : 'warn';

/* privasi pasien */
function bgActive(cid) { const e = S.bg[cid]; return !!e && e.until > Date.now(); }
function ptLabel(c) { return bgActive(c.id) ? esc(c.ini) + ' &middot; RM ' + esc(c.rm) : 'Pasien ' + '••••' + esc(String(c.rm).slice(-2)); }

/* ---------- Grafik ---------- */
function radar(vals, labels, max) {
  const W = 340, H = 300, cx = 170, cy = 150, R = 92, n = vals.length;
  const pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  let g = '';
  [1 / 3, 2 / 3, 1].forEach(f => { g += '<polygon class="ch-grid" points="' + vals.map((_, i) => pt(i, R * f).map(x => x.toFixed(1)).join(',')).join(' ') + '"/>'; });
  vals.forEach((_, i) => { const p = pt(i, R); g += '<line class="ch-grid" x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '"/>'; });
  const poly = vals.map((v, i) => pt(i, R * clamp((v || 0) / max, 0, 1)).map(x => x.toFixed(1)).join(',')).join(' ');
  g += '<polygon class="ch-area" points="' + poly + '"/>';
  vals.forEach((v, i) => { const p = pt(i, R * clamp((v || 0) / max, 0, 1)); g += '<circle class="ch-dot" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.2"/>'; });
  labels.forEach((l, i) => { const p = pt(i, R + 20); const a = p[0] < cx - 4 ? 'end' : p[0] > cx + 4 ? 'start' : 'middle'; g += '<text class="ch-txt" x="' + p[0].toFixed(1) + '" y="' + (p[1] + 4).toFixed(1) + '" text-anchor="' + a + '">' + esc(l) + '</text>'; });
  return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Grafik radar">' + g + '</svg>';
}
function lineChart(series, labels, o) {
  o = o || {}; const W = 600, H = 230, L = 38, Rr = 16, T = 14, B = 30;
  const lo = o.min != null ? o.min : 0, hi = o.max != null ? o.max : 100; const n = labels.length;
  const X = i => L + (n <= 1 ? (W - L - Rr) / 2 : i * (W - L - Rr) / (n - 1)), Y = v => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
  let g = '';
  for (let k = 0; k <= 4; k++) { const v = lo + (hi - lo) * k / 4; g += '<line class="ch-grid" x1="' + L + '" x2="' + (W - Rr) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '"/><text class="ch-txt" x="' + (L - 6) + '" y="' + (Y(v) + 4).toFixed(1) + '" text-anchor="end">' + n0(v) + '</text>'; }
  const step = Math.ceil(n / 8);
  labels.forEach((l, i) => { if (i % step === 0 || i === n - 1) g += '<text class="ch-txt" x="' + X(i).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(l) + '</text>'; });
  series.forEach((s, si) => {
    const pts = s.vals.map((v, i) => v == null ? null : [X(i), Y(v)]).filter(Boolean);
    if (!pts.length) return;
    if (si === 0 && o.area) g += '<polygon class="ch-fill" points="' + L + ',' + Y(lo) + ' ' + pts.map(p => p.map(x => x.toFixed(1)).join(',')).join(' ') + ' ' + pts[pts.length - 1][0].toFixed(1) + ',' + Y(lo) + '"/>';
    g += '<polyline class="ch-line s' + si + '" points="' + pts.map(p => p.map(x => x.toFixed(1)).join(',')).join(' ') + '"/>';
    pts.forEach((p, i) => { g += '<circle class="ch-pt s' + si + '" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (i === pts.length - 1 ? 5 : 2.6) + '"/>'; });
    const last = pts[pts.length - 1]; const lv = s.vals.filter(v => v != null).pop();
    g += '<text class="ch-lbl s' + si + '" x="' + (last[0] - 6).toFixed(1) + '" y="' + (last[1] - 10).toFixed(1) + '" text-anchor="end">' + n1(lv) + '</text>';
  });
  return '<svg class="chart wide" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.label || 'Grafik garis') + '">' + g + '</svg>' + (series.length > 1 ? '<div class="legend">' + series.map((s, i) => '<span><i class="sw s' + i + '"></i>' + esc(s.name) + '</span>').join('') + '</div>' : '');
}
function hbars(items, o) {
  o = o || {}; const max = o.max || Math.max.apply(null, items.map(x => x.v).concat([1]));
  return '<div class="hbars">' + items.map(x => '<div class="hb"><div class="hb-l" title="' + esc(x.l) + '">' + esc(x.l) + '</div><div class="hb-t"><i class="' + (x.tone || '') + '" style="width:' + clamp(x.v / max * 100, 0, 100) + '%"></i></div><div class="hb-v">' + (x.t != null ? x.t : n0(x.v)) + '</div></div>').join('') + '</div>';
}
function columns(vals, labels, o) {
  o = o || {}; const max = o.max || Math.max.apply(null, vals.concat([1]));
  return '<div class="cols">' + vals.map((v, i) => '<div class="col"><div class="col-v">' + v + '</div><div class="col-b"><i style="height:' + clamp(v / max * 100, 2, 100) + '%"></i></div><div class="col-l">' + esc(labels[i]) + '</div></div>').join('') + '</div>';
}
function heat(v, max) { const p = clamp((v || 0) / max, 0, 1); return 'background:color-mix(in srgb,var(--brand) ' + Math.round(p * 80) + '%,var(--surface-2));' + (p > .55 ? 'color:var(--brand-ink)' : ''); }
function qrSvg(text) {
  try { if (typeof qrcode === 'function') { const q = qrcode(0, 'M'); q.addData(text); q.make(); return '<div class="qr">' + q.createSvgTag(4, 2) + '</div>'; } } catch (e) { }
  return '<div class="qr qr-off">QR tidak dapat dimuat. Gunakan tautan di bawah.</div>';
}
function gauge(p, label) {
  if (p == null) return '<div class="gauge"><div class="gauge-t"></div><div class="hint">Belum ada data</div></div>';
  return '<div class="gauge"><div class="gauge-t"><i style="left:' + clamp(p, 0, 100) + '%"></i></div><div class="gauge-s"><span>0</span><span>50</span><span>100</span></div><div class="gauge-l">' + esc(label || '') + '</div></div>';
}

/* ---------- Modal dan toast ---------- */
function openModal(title, body, o) {
  o = o || {}; const m = document.getElementById('modal');
  m.innerHTML = '<div class="mback" data-a="mbg"><div class="modal ' + (o.wide ? 'wide' : '') + '" role="dialog" aria-modal="true" aria-labelledby="mtitle"><div class="mhead"><h3 id="mtitle">' + title + '</h3><button type="button" class="icon-btn" data-a="mclose" aria-label="Tutup">' + ic('x') + '</button></div><div class="mbody">' + body + '</div></div></div>';
  m.hidden = false; document.body.classList.add('noscroll');
  const f = m.querySelector('input:not([type=hidden]),select,textarea,button.btn'); if (f) setTimeout(() => f.focus(), 30);
}
function closeModal() { const m = document.getElementById('modal'); m.hidden = true; m.innerHTML = ''; document.body.classList.remove('noscroll'); }
let toastT = null;
function toast(msg, tone) { const t = document.getElementById('toast'); t.className = 'toast ' + (tone || ''); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 3600); }
function copyText(txt, okMsg) {
  const fb = () => { openModal('Salin teks', '<p class="sub">Peramban menolak akses papan klip. Pilih dan salin teks berikut.</p><textarea id="cp-area" rows="10" readonly>' + esc(txt) + '</textarea>'); const a = document.getElementById('cp-area'); if (a) a.select(); };
  try { navigator.clipboard.writeText(txt).then(() => toast(okMsg || 'Disalin ke papan klip', 'good'), fb); } catch (e) { fb(); }
}
function csvEsc(v) { v = String(v == null ? '' : v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
function toCSV(rows) { return rows.map(r => r.map(csvEsc).join(',')).join('\n'); }
function parseCSV(t) {
  const rows = []; let row = [], cur = '', q = false; t = String(t).replace(/^﻿/, '');
  const det = (t.split('\n')[0] || '').split(';').length > (t.split('\n')[0] || '').split(',').length ? ';' : ',';
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) { if (ch === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true; else if (ch === det) { row.push(cur); cur = ''; } else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; } else if (ch !== '\r') cur += ch;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(x => String(x).trim() !== ''));
}
