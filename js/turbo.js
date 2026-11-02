// ============================================================
// TURBO — lapisan kecepatan (revisi 3)
// ============================================================
// Mengikuti pola sisi-frontend dari skill gas-scale-turbo:
//
//  1. SWR   — halaman langsung tampil dari data tersimpan di HP,
//             lalu disegarkan diam-diam di belakang layar.
//  2. Dedupe— permintaan baca yang sama & bersamaan cukup 1x ke server.
//  3. Epoch — setelah menyimpan, hasil baca lama tidak boleh dipakai lagi.
//  4. Warmup— membangunkan server Apps Script lebih awal supaya login
//             tidak kena "cold start" yang lama.
//  5. Perf  — ketik Perf.table() di Console untuk melihat waktu tiap aksi.
//
// TIDAK mengubah backend, URL /exec, nama aksi, maupun data di Sheets.
// Semua cache hanya disimpan di HP/browser pemakai (localStorage).
// ============================================================

const TURBO = {
  prefix: 'ckp_cache_',
  segarMs: 90000,          // di bawah ini data dianggap masih segar
  kedaluwarsaMs: 604800000 // 7 hari: cache lebih tua dari ini dibuang
};

let _writeEpoch = 0;       // naik tiap kali ada penyimpanan berhasil
const _inflight = {};      // permintaan baca yang sedang berjalan

// ------------------------------------------------------------
// Penyimpanan lokal (aman bila mode privat / kuota penuh)
// ------------------------------------------------------------
function _kunciCache(action, params) {
  return TURBO.prefix + action + '|' + JSON.stringify(params || {});
}

function cacheRead(action, params) {
  try {
    const raw = localStorage.getItem(_kunciCache(action, params));
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || typeof o.at !== 'number') return null;
    if (Date.now() - o.at > TURBO.kedaluwarsaMs) return null;
    return o;
  } catch (e) { return null; }
}

function cacheWrite(action, params, data) {
  try {
    localStorage.setItem(_kunciCache(action, params), JSON.stringify({ at: Date.now(), data }));
  } catch (e) { /* kuota penuh atau mode privat — abaikan, app tetap jalan */ }
}

function cacheClearAll() {
  try {
    Object.keys(localStorage)
      .filter(k => k.indexOf(TURBO.prefix) === 0)
      .forEach(k => localStorage.removeItem(k));
  } catch (e) { /* abaikan */ }
}

// ------------------------------------------------------------
// Pengukur waktu — Perf.table() / Perf.summary() di Console
// ------------------------------------------------------------
const Perf = {
  log: [],
  catat(aksi, ms, dariCache) {
    this.log.push({ aksi, ms, sumber: dariCache ? 'cache ✓' : 'server' });
    if (this.log.length > 200) this.log.shift();
  },
  table() { console.table(this.log); },
  summary() {
    const g = {};
    this.log.forEach(r => {
      (g[r.aksi] ||= { aksi: r.aksi, n: 0, totalMs: 0, cache: 0 });
      g[r.aksi].n++; g[r.aksi].totalMs += r.ms;
      if (r.sumber.indexOf('cache') === 0) g[r.aksi].cache++;
    });
    console.table(Object.values(g).map(r => ({
      aksi: r.aksi, panggilan: r.n,
      'rata2 ms': Math.round(r.totalMs / r.n),
      'dari cache': r.cache
    })));
  }
};

// ------------------------------------------------------------
// Pembungkus fetchData: dedupe + catat waktu + simpan ke cache
// ------------------------------------------------------------
const _fetchDataAsli = fetchData;

async function fetchTurbo(action, params, opts) {
  const k = _writeEpoch + '|' + _kunciCache(action, params);
  if (_inflight[k]) return _inflight[k];           // permintaan kembar menumpang

  const t0 = Date.now();
  const p = _fetchDataAsli(action, params, opts).then(res => {
    Perf.catat(action, Date.now() - t0, false);
    if (res !== null && res !== undefined) cacheWrite(action, params, res);
    return res;
  });

  _inflight[k] = p;
  p.then(() => { delete _inflight[k]; }, () => { delete _inflight[k]; });
  return p;
}
window.fetchData = fetchTurbo;

// ------------------------------------------------------------
// Pembungkus postData: setiap simpan berhasil membuang cache lama
// ------------------------------------------------------------
const _postDataAsli = postData;

async function postTurbo(action, data) {
  const t0 = Date.now();
  const res = await _postDataAsli(action, data);
  Perf.catat(action, Date.now() - t0, false);
  if (res && res.success) { _writeEpoch++; cacheClearAll(); }
  return res;
}
window.postData = postTurbo;

// ------------------------------------------------------------
// SWR — tampilkan cache dulu, lalu segarkan dari server
// ------------------------------------------------------------
// permintaan : [[action, params], ...]
// render     : fungsi yang menerima array hasil, sesuai urutan permintaan
async function muatSWR(permintaan, render) {
  const hits = permintaan.map(([a, p]) => cacheRead(a, p));
  const adaSemua = hits.every(h => h);

  let cacheTerender = false;
  if (adaSemua) {
    hits.forEach((h, i) => Perf.catat(permintaan[i][0], 0, true));
    try { render(hits.map(h => h.data)); cacheTerender = true; }
    catch (e) { console.warn('Render dari cache gagal:', e); }
  } else {
    showLoading(true);
  }

  // Masih sangat segar DAN sudah tergambar? Tidak perlu menembak server lagi.
  const palingTua = adaSemua ? Math.min(...hits.map(h => h.at)) : 0;
  if (adaSemua && cacheTerender && Date.now() - palingTua < TURBO.segarMs) {
    return hits.map(h => h.data);
  }

  const segar = await Promise.all(
    permintaan.map(([a, p]) => fetchTurbo(a, p, { diam: adaSemua }))
  );
  if (!adaSemua) showLoading(false);

  // Server gagal: pertahankan tampilan dari cache, jangan kosongkan layar.
  if (segar.some(s => s === null || s === undefined)) {
    return adaSemua ? hits.map(h => h.data) : null;
  }

  // Render ulang bila datanya berubah, atau bila render dari cache tadi gagal
  // (mis. grafik error) supaya layar tidak tertinggal setengah jadi.
  const lama = adaSemua ? JSON.stringify(hits.map(h => h.data)) : null;
  if (!adaSemua || !cacheTerender || JSON.stringify(segar) !== lama) {
    try { render(segar); } catch (e) { console.warn('Render data baru gagal:', e); }
  }
  return segar;
}

// Versi satu permintaan, supaya pemanggilan di app.js tetap ringkas
function muatSatu(action, params, render) {
  return muatSWR([[action, params]], ([d]) => render(d));
}

// ------------------------------------------------------------
// Warmup — bangunkan server GAS sebelum pemakai sempat login
// ------------------------------------------------------------
function warmUpServer() {
  try {
    if (sessionStorage.getItem('ckp_warm')) return;
    sessionStorage.setItem('ckp_warm', '1');
    fetch(GAS_URL + '?action=warmup', { method: 'GET', mode: 'no-cors', cache: 'no-store' })
      .catch(() => { /* tidak penting bila gagal — tujuannya hanya membangunkan server */ });
  } catch (e) { /* abaikan */ }
}

// ------------------------------------------------------------
// Prefetch — ambil data halaman lain saat perangkat sedang santai,
// supaya pindah menu terasa instan sejak kunjungan pertama.
// ------------------------------------------------------------
function prefetchData() {
  if (!currentUser) return;
  const nanti = window.requestIdleCallback || (fn => setTimeout(fn, 1200));
  nanti(() => {
    const userId = currentUser.userId;
    const { month, year } = getFilterPeriod();
    [
      ['getAlokasi', { userId }],
      ['getPengeluaran', { userId }],
      ['getPemasukan', { userId }],
      ['getTabungan', { userId }],
      ['getTarget', { userId }],
      ['getLaporan', { userId, month, year }]
    ].forEach(([a, p]) => {
      if (!cacheRead(a, p)) fetchTurbo(a, p, { diam: true });
    });
  });
}
