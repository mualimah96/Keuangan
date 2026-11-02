// ============================================================
// STATE
// ============================================================
let currentUser = JSON.parse(localStorage.getItem('ckp_user') || 'null');
let alokasiCache = [];
let targetCache = [];
const $ = id => document.getElementById(id);
<<<<<<< HEAD
let chartYearly, chartPie, chartDaily, chartTabungan, chartLaporanPie;
=======
let chartYearly, chartPie, chartDaily, chartTabungan;
>>>>>>> 985e157642e7e1a313b98e22a2183099d66284ad
const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  populateFilters();
  bindAuthForms();
  bindNav();
  bindForms();
  if (currentUser) enterApp();
<<<<<<< HEAD
  // Belum login: bangunkan server Apps Script lebih dulu supaya
  // klik "Masuk" nanti tidak menunggu cold start.
  else warmUpServer();
=======
>>>>>>> 985e157642e7e1a313b98e22a2183099d66284ad
});

function populateFilters() {
  const bulanSel = document.getElementById('filter-bulan');
  const tahunSel = document.getElementById('filter-tahun');
  const now = new Date();
  monthNames.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = i + 1; opt.textContent = m;
    if (i + 1 === now.getMonth() + 1) opt.selected = true;
    bulanSel.appendChild(opt);
  });
  for (let y = now.getFullYear() - 2; y <= now.getFullYear() + 1; y++) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    if (y === now.getFullYear()) opt.selected = true;
    tahunSel.appendChild(opt);
  }
  bulanSel.addEventListener('change', refreshCurrentPage);
  tahunSel.addEventListener('change', refreshCurrentPage);
}

function getFilterPeriod() {
  return {
    month: document.getElementById('filter-bulan').value,
    year: document.getElementById('filter-tahun').value
  };
}

// ============================================================
// AUTH
// ============================================================
function bindAuthForms() {
  document.getElementById('switch-to-register').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('form-login').style.display = 'none';
    document.getElementById('form-register').style.display = 'block';
    document.getElementById('switch-to-register').style.display = 'none';
    document.getElementById('switch-to-login').style.display = 'block';
    document.getElementById('auth-title').textContent = 'Buat akun baru';
  });
  document.getElementById('switch-to-login').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('form-register').style.display = 'none';
    document.getElementById('form-login').style.display = 'block';
    document.getElementById('switch-to-login').style.display = 'none';
    document.getElementById('switch-to-register').style.display = 'block';
    document.getElementById('auth-title').textContent = 'Selamat datang kembali';
  });

  document.getElementById('form-login').addEventListener('submit', async e => {
    e.preventDefault();
    showLoading(true);
    const result = await postData('login', {
      email: document.getElementById('login-email').value,
      password: document.getElementById('login-password').value
    });
    showLoading(false);
    if (result.success) {
      currentUser = result.data;
      localStorage.setItem('ckp_user', JSON.stringify(currentUser));
      enterApp();
    } else {
      showNotif(result.message, 'error');
    }
  });

  document.getElementById('form-register').addEventListener('submit', async e => {
    e.preventDefault();
    showLoading(true);
    const result = await postData('register', {
      nama: document.getElementById('reg-nama').value,
      email: document.getElementById('reg-email').value,
      password: document.getElementById('reg-password').value
    });
    showLoading(false);
    if (result.success) {
      currentUser = result.data;
      localStorage.setItem('ckp_user', JSON.stringify(currentUser));
      enterApp();
    } else {
      showNotif(result.message, 'error');
    }
  });

  document.getElementById('btn-logout').addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('ckp_user');
    currentUser = null;
    document.getElementById('view-app').style.display = 'none';
    document.getElementById('view-auth').style.display = 'flex';
  });
}

function enterApp() {
  document.getElementById('view-auth').style.display = 'none';
  document.getElementById('view-app').style.display = 'flex';
  document.getElementById('greeting').textContent = `Halo, ${currentUser.nama}! 👋`;
  document.getElementById('user-avatar').textContent = currentUser.nama.charAt(0).toUpperCase();
  navigateTo('dashboard');
<<<<<<< HEAD
  prefetchData(); // ambil data menu lain saat perangkat santai -> pindah menu terasa instan
=======
>>>>>>> 985e157642e7e1a313b98e22a2183099d66284ad
}

// ============================================================
// NAVIGATION
// ============================================================
function bindNav() {
  document.querySelectorAll('.nav-item, .bn-item[data-page]').forEach(item => {
    item.addEventListener('click', e => { e.preventDefault(); navigateTo(item.dataset.page); });
  });
  document.querySelectorAll('[data-go]').forEach(b => {
    b.addEventListener('click', e => { e.preventDefault(); navigateTo(b.dataset.go); });
  });
  $('bn-akun').addEventListener('click', e => { e.preventDefault(); toggleDrawer(); });
  $('drawer-backdrop').addEventListener('click', closeDrawer);
  $('btn-menu-mobile').addEventListener('click', toggleDrawer);
  $('btn-close-modal').addEventListener('click', closeTargetModal);
  $('modal-target').addEventListener('click', e => { if (e.target.id === 'modal-target') closeTargetModal(); });
}

function navigateTo(page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
  document.querySelectorAll('.bn-item[data-page]').forEach(n => n.classList.toggle('active', n.dataset.page === page));
  closeDrawer();
  loadPage(page);
  window.scrollTo(0, 0);
}

function toggleDrawer() {
  const open = document.querySelector('.sidebar').classList.toggle('open');
  $('drawer-backdrop').classList.toggle('show', open);
}
function closeDrawer() {
  document.querySelector('.sidebar').classList.remove('open');
  $('drawer-backdrop').classList.remove('show');
}

let activePage = 'dashboard';
function loadPage(page) {
  activePage = page;
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  document.getElementById('page-' + page).style.display = 'block';
  refreshCurrentPage();
}

function refreshCurrentPage() {
  const loaders = {
    dashboard: loadDashboard, pemasukan: loadPemasukan, alokasi: loadAlokasi,
    pengeluaran: loadPengeluaran, target: loadTarget, tabungan: loadTabungan, laporan: loadLaporan
  };
  if (loaders[activePage]) loaders[activePage]();
}

// ============================================================
// DASHBOARD
// ============================================================
async function loadDashboard() {
<<<<<<< HEAD
  const { month, year } = getFilterPeriod();
  await muatSatu('getDashboard', { userId: currentUser.userId, month, year }, renderDashboard);
}

function renderDashboard(data) {
=======
  showLoading(true);
  const { month, year } = getFilterPeriod();
  const data = await fetchData('getDashboard', { userId: currentUser.userId, month, year });
  showLoading(false);
>>>>>>> 985e157642e7e1a313b98e22a2183099d66284ad
  if (!data) return;

  document.getElementById('kpi-pemasukan').textContent = formatRupiah(data.totalPemasukanBulan);
  document.getElementById('kpi-pengeluaran').textContent = formatRupiah(data.totalPengeluaranBulan);
  document.getElementById('kpi-tabungan').textContent = formatRupiah(data.totalTabunganBulan);

  const saldo = Number(data.saldoBersih) || 0;
  $('saldo-bersih').textContent = formatRupiah(saldo);
  $('saldo-card').classList.toggle('negatif', saldo < 0);
  renderMobileTarget(data.targetAktif);
  renderMobileRecent(data.transaksiTerbaru || []);

  const ctxY = document.getElementById('chart-yearly');
  if (chartYearly) chartYearly.destroy();
<<<<<<< HEAD
  chartYearly = buatChart(ctxY, {
=======
  chartYearly = new Chart(ctxY, {
>>>>>>> 985e157642e7e1a313b98e22a2183099d66284ad
    type: 'line',
    data: {
      labels: data.yearlyTrend.map(t => monthNames[t.bulan - 1].slice(0, 3)),
      datasets: [
        { label: 'Pemasukan', data: data.yearlyTrend.map(t => t.pemasukan), borderColor: '#006c46', tension: .35, fill: false },
        { label: 'Pengeluaran', data: data.yearlyTrend.map(t => t.pengeluaran), borderColor: '#ba1a1a', tension: .35, fill: false },
        { label: 'Tabungan', data: data.yearlyTrend.map(t => t.tabungan), borderColor: '#00b074', tension: .35, fill: false }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  });

  const ctxP = document.getElementById('chart-pie');
  if (chartPie) chartPie.destroy();
<<<<<<< HEAD
  chartPie = buatChart(ctxP, {
=======
  chartPie = new Chart(ctxP, {
>>>>>>> 985e157642e7e1a313b98e22a2183099d66284ad
    type: 'doughnut',
    data: {
      labels: data.pieByCategory.map(p => p.kategori),
      datasets: [{ data: data.pieByCategory.map(p => p.total), backgroundColor: ['#00b074','#006c46','#6ff8b5','#94a3a0','#003228','#ba1a1a'] }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  });

  const ctxD = document.getElementById('chart-daily');
  if (chartDaily) chartDaily.destroy();
<<<<<<< HEAD
  chartDaily = buatChart(ctxD, {
=======
  chartDaily = new Chart(ctxD, {
>>>>>>> 985e157642e7e1a313b98e22a2183099d66284ad
    type: 'line',
    data: { labels: data.dailyTrend.map(d => d.tanggal), datasets: [{ label: 'Pengeluaran Harian', data: data.dailyTrend.map(d => d.total), borderColor: '#00b074', backgroundColor: 'rgba(0,176,116,0.1)', fill: true, tension: .35 }] },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}

document.getElementById('btn-download-jpg').addEventListener('click', () => {
  html2canvas(document.getElementById('page-dashboard'), { backgroundColor: '#f8f9fb' }).then(canvas => {
    const link = document.createElement('a');
    const { month, year } = getFilterPeriod();
    link.download = `Dashboard_${currentUser.nama}_${monthNames[month-1]}_${year}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.92);
    link.click();
  });
});

// ============================================================
// PEMASUKAN
// ============================================================
async function loadPemasukan() {
<<<<<<< HEAD
  await muatSatu('getPemasukan', { userId: currentUser.userId }, renderPemasukan);
}

function renderPemasukan(data) {
  if (!data) return;
  const sorted = data.slice().sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
=======
  showLoading(true);
  const data = await fetchData('getPemasukan', { userId: currentUser.userId });
  showLoading(false);
  if (!data) return;
  const sorted = data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
>>>>>>> 985e157642e7e1a313b98e22a2183099d66284ad
  renderPemasukanSummary(sorted);
  const container = document.getElementById('list-pemasukan');
  container.innerHTML = sorted.length ? sorted.map(p => `
    <div class="transaksi-item">
      <span class="t-icon">${iconSumber(p.sumber)}</span>
      <div class="transaksi-info"><strong>${escapeHtml(p.sumber)}</strong><span>${formatTanggal(p.tanggal)}${p.keterangan ? ' · ' + escapeHtml(p.keterangan) : ''}</span></div>
      <div class="item-actions">
        <span class="transaksi-amount amount-positive">+${formatRupiah(p.nominal)}</span>
        <button class="btn-icon" onclick='editPemasukan(${JSON.stringify(p)})'>✏️</button>
        <button class="btn-icon" onclick="deletePemasukan('${p.id}')">🗑️</button>
      </div>
    </div>`).join('') : '<p>Belum ada catatan pemasukan.</p>';
}

function editPemasukan(p) {
  document.getElementById('pemasukan-id').value = p.id;
  document.getElementById('pemasukan-tanggal').value = toDateInput(p.tanggal);
  document.getElementById('pemasukan-sumber').value = p.sumber;
  document.getElementById('pemasukan-nominal').value = p.nominal;
  document.getElementById('pemasukan-keterangan').value = p.keterangan || '';
  syncSumberChips();
  window.scrollTo(0, 0);
}

async function deletePemasukan(id) {
  if (!confirm('Hapus catatan pemasukan ini?')) return;
  showLoading(true);
  const result = await postData('deletePemasukan', { id, userId: currentUser.userId });
  showLoading(false);
  showNotif(result.message, result.success ? 'success' : 'error');
  if (result.success) loadPemasukan();
}

// ============================================================
// ALOKASI DANA
// ============================================================
<<<<<<< HEAD
// REVISI 3 — pemakaian alokasi dihitung ULANG dari pengeluaran bulan yang
// sedang dipilih, bukan dari saldo berjalan backend. Dengan begitu setiap
// ganti bulan, semua kategori otomatis kembali ke 0%.
function hitungPemakaianBulan(pengeluaran, month, year) {
  const pakai = {};
  (pengeluaran || []).forEach(p => {
    const d = new Date(p.tanggal);
    if (isNaN(d)) return;
    if (d.getMonth() + 1 !== Number(month) || d.getFullYear() !== Number(year)) return;
    const k = String(p.kategori || '').trim().toLowerCase();
    pakai[k] = (pakai[k] || 0) + (Number(p.nominal) || 0);
  });
  return pakai;
}

async function loadAlokasi() {
  const userId = currentUser.userId;
  await muatSWR(
    [['getAlokasi', { userId }], ['getPengeluaran', { userId }]],
    ([alokasi, pengeluaran]) => renderAlokasi(alokasi, pengeluaran)
  );
}

function renderAlokasi(data, pengeluaran) {
  if (!data) return;
  alokasiCache = data;

  const { month, year } = getFilterPeriod();
  const pakai = hitungPemakaianBulan(pengeluaran, month, year);

  const info = document.getElementById('alokasi-periode-info');
  if (info) info.textContent =
    `Pemakaian budget bulan ${monthNames[month - 1]} ${year} — tiap ganti bulan hitungannya mulai lagi dari nol.`;

  const container = document.getElementById('list-alokasi');
  container.innerHTML = data.length ? data.map(a => {
    const budget   = Number(a.nominalAlokasi) || 0;
    const terpakai = pakai[String(a.kategori || '').trim().toLowerCase()] || 0;
    const sisa     = budget - terpakai;
    const persen   = budget > 0 ? Math.round((terpakai / budget) * 100) : 0;
    const cls = persen > 100 ? 'over' : persen >= 90 ? 'danger' : persen >= 70 ? 'warn' : '';
    return `
    <div class="alokasi-item">
      <div class="alokasi-item-top"><strong>${iconKategori(a.kategori)} ${escapeHtml(a.kategori)}</strong>
        <span class="alokasi-right"><span class="persen ${cls}">${persen}%</span>
=======
async function loadAlokasi() {
  showLoading(true);
  const data = await fetchData('getAlokasi', { userId: currentUser.userId });
  showLoading(false);
  if (!data) return;
  alokasiCache = data;
  const container = document.getElementById('list-alokasi');
  container.innerHTML = data.length ? data.map(a => {
    const persen = a.nominalAlokasi > 0 ? Math.round(((a.nominalAlokasi - a.saldoSaatIni) / a.nominalAlokasi) * 100) : 0;
    const cls = persen >= 90 ? 'danger' : persen >= 70 ? 'warn' : '';
    return `
    <div class="alokasi-item">
      <div class="alokasi-item-top"><strong>${escapeHtml(a.kategori)}</strong>
        <span class="alokasi-right"><span>${persen}%</span>
>>>>>>> 985e157642e7e1a313b98e22a2183099d66284ad
          <button class="btn-icon" onclick="editAlokasi('${a.id}')">✏️</button>
          <button class="btn-icon" onclick="deleteAlokasi('${a.id}')">🗑️</button>
        </span>
      </div>
<<<<<<< HEAD
      <div class="progress-bar"><div class="progress-fill ${cls}" style="width:${Math.min(persen, 100)}%"></div></div>
      <div class="alokasi-meta">
        <span>Terpakai ${formatRupiah(terpakai)} dari ${formatRupiah(budget)}</span>
        ${sisa < 0
          ? `<span class="badge-over">Lebih ${formatRupiah(Math.abs(sisa))}</span>`
          : `<span>Sisa ${formatRupiah(sisa)}</span>`}
=======
      <div class="progress-bar"><div class="progress-fill ${cls}" style="width:${Math.min(persen,100)}%"></div></div>
      <div class="alokasi-meta">
        <span>${formatRupiah(a.nominalAlokasi - a.saldoSaatIni)} dari ${formatRupiah(a.nominalAlokasi)}</span>
        <span>Sisa ${formatRupiah(a.saldoSaatIni)}</span>
>>>>>>> 985e157642e7e1a313b98e22a2183099d66284ad
      </div>
    </div>`;
  }).join('') : '<p>Belum ada kategori alokasi.</p>';
}

// ============================================================
// ALOKASI — EDIT & HAPUS
// ============================================================
function resetAlokasiForm() {
  $('form-alokasi').reset();
  $('alokasi-id').value = '';
  $('alokasi-form-title').textContent = 'Tambah Alokasi Baru';
  $('btn-cancel-alokasi').style.display = 'none';
}

function editAlokasi(id) {
  const a = alokasiCache.find(x => x.id === id);
  if (!a) return;
  $('alokasi-id').value = a.id;
  $('alokasi-kategori').value = a.kategori;
  $('alokasi-nominal').value = a.nominalAlokasi;
  $('alokasi-tanggal').value = toDateInput(a.tanggal);
  $('alokasi-form-title').textContent = 'Edit Alokasi';
  $('btn-cancel-alokasi').style.display = 'block';
  window.scrollTo(0, 0);
}

async function deleteAlokasi(id, force = false) {
  const a = alokasiCache.find(x => x.id === id);
  if (!a) return;
  if (!force && !confirm(`Hapus alokasi "${a.kategori}"?`)) return;
  showLoading(true);
  const result = await postData('deleteAlokasi', { id, userId: currentUser.userId, force });
  showLoading(false);
  if (result.needConfirm) {
    if (confirm(result.message + '\n\nTetap hapus kategori ini?')) return deleteAlokasi(id, true);
    return;
  }
  showNotif(result.message, result.success ? 'success' : 'error');
  if (result.success) loadAlokasi();
}

// ============================================================
// PENGELUARAN
// ============================================================
async function loadPengeluaran() {
<<<<<<< HEAD
  const userId = currentUser.userId;
  await muatSWR(
    [['getAlokasi', { userId }], ['getPengeluaran', { userId }]],
    ([alokasi, data]) => renderPengeluaran(alokasi, data)
  );
}

function renderPengeluaran(alokasi, data) {
=======
  showLoading(true);
  const [alokasi, data] = await Promise.all([
    fetchData('getAlokasi', { userId: currentUser.userId }),
    fetchData('getPengeluaran', { userId: currentUser.userId })
  ]);
  showLoading(false);
>>>>>>> 985e157642e7e1a313b98e22a2183099d66284ad
  if (alokasi) {
    alokasiCache = alokasi;
    const sel = document.getElementById('pengeluaran-kategori');
    sel.innerHTML = alokasi.length
      ? alokasi.map(a => `<option value="${escapeHtml(a.kategori)}">${escapeHtml(a.kategori)}</option>`).join('')
      : '<option value="">Belum ada alokasi — buat dulu di menu Alokasi Dana</option>';
    renderKategoriChips();
  }
  if (!data) return;
  const sorted = data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  renderPengeluaranMobile(sorted);
  const tbody = document.getElementById('list-pengeluaran');
  tbody.innerHTML = sorted.length ? sorted.map(p => `
    <tr>
      <td>${formatTanggal(p.tanggal)}</td>
      <td>${escapeHtml(p.kategori)}</td>
      <td>${escapeHtml(p.deskripsi || '-')}</td>
      <td>${escapeHtml(p.metode || '-')}</td>
      <td class="amount-negative">-${formatRupiah(p.nominal)}</td>
      <td>
        <button class="btn-icon" onclick='editPengeluaran(${JSON.stringify(p)})'>✏️</button>
        <button class="btn-icon" onclick="deletePengeluaran('${p.id}')">🗑️</button>
      </td>
    </tr>`).join('') : '<tr><td colspan="6">Belum ada catatan pengeluaran.</td></tr>';
}

function editPengeluaran(p) {
  document.getElementById('pengeluaran-id').value = p.id;
  document.getElementById('pengeluaran-tanggal').value = toDateInput(p.tanggal);
  document.getElementById('pengeluaran-kategori').value = p.kategori;
  syncKategoriChips();
  document.getElementById('pengeluaran-nominal').value = p.nominal;
  document.getElementById('pengeluaran-deskripsi').value = p.deskripsi || '';
  document.getElementById('pengeluaran-metode').value = p.metode || 'Cash';
  window.scrollTo(0, 0);
}

async function deletePengeluaran(id) {
  if (!confirm('Hapus catatan pengeluaran ini? Saldo alokasi akan dikembalikan.')) return;
  showLoading(true);
  const result = await postData('deletePengeluaran', { id, userId: currentUser.userId });
  showLoading(false);
  showNotif(result.message, result.success ? 'success' : 'error');
  if (result.success) loadPengeluaran();
}

// ============================================================
// TARGET IMPIAN
// ============================================================
document.getElementById('btn-open-target-form').addEventListener('click', () => {
  const card = document.getElementById('card-target-form');
  const willShow = card.style.display === 'none';
  resetTargetForm();
  if (willShow) card.style.display = 'block';
});

async function loadTarget() {
<<<<<<< HEAD
  await muatSatu('getTarget', { userId: currentUser.userId }, renderTarget);
}

function renderTarget(data) {
=======
  showLoading(true);
  const data = await fetchData('getTarget', { userId: currentUser.userId });
  showLoading(false);
>>>>>>> 985e157642e7e1a313b98e22a2183099d66284ad
  if (!data) return;
  targetCache = data;
  const container = document.getElementById('list-target');
  container.innerHTML = data.length ? data.map(t => {
    const persen = t.hargaTarget > 0 ? Math.round((t.terkumpul / t.hargaTarget) * 100) : 0;
    const isDone = t.status === 'Done';
    return `
    <div class="target-card" onclick="openTargetDetail('${t.id}')">
      <div class="target-card-top"><h3 style="margin:0">${escapeHtml(t.namaBarang)}</h3>
        <div class="card-actions">
          <span class="badge ${isDone ? 'done' : ''}">${isDone ? 'Selesai' : 'Aktif'}</span>
          <button class="btn-icon" onclick="event.stopPropagation(); editTarget('${t.id}')">✏️</button>
          <button class="btn-icon" onclick="event.stopPropagation(); deleteTarget('${t.id}')">🗑️</button>
        </div>
      </div>
      <p>${escapeHtml(t.keterangan || '')}</p>
      <div class="target-meta"><span>Terkumpul</span><strong>${formatRupiah(t.terkumpul)}</strong></div>
      <div class="target-meta"><span>Target Harga</span><strong>${formatRupiah(t.hargaTarget)}</strong></div>
      <div class="target-meta"><span>Cicilan/Bulan</span><strong>${formatRupiah(t.cicilanBulan)}</strong></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(persen,100)}%"></div></div>
      <div class="target-meta"><span>Progress</span><strong>${persen}%</strong></div>
      ${!isDone ? `<button class="btn-secondary btn-block" style="margin-top:10px" onclick="event.stopPropagation(); promptCicilan('${t.id}')">+ Tambah Cicilan</button>` : `<button class="btn-secondary btn-block" style="margin-top:10px" disabled>✓ Target Tercapai</button>`}
      <p class="hint">Klik kartu untuk melihat riwayat cicilan</p>
    </div>`;
  }).join('') : '<p>Belum ada target impian. Buat target baru untuk mulai menabung.</p>';
}

function resetTargetForm() {
  $('form-target').reset();
  $('target-id').value = '';
  $('target-form-title').textContent = 'Buat Target Baru';
  $('btn-cancel-target').style.display = 'none';
  $('card-target-form').style.display = 'none';
}

function editTarget(id) {
  const t = targetCache.find(x => x.id === id);
  if (!t) return;
  $('target-id').value = t.id;
  $('target-nama').value = t.namaBarang;
  $('target-harga').value = t.hargaTarget;
  $('target-cicilan').value = t.cicilanBulan;
  $('target-selesai').value = toDateInput(t.targetSelesai);
  $('target-keterangan').value = t.keterangan || '';
  $('target-form-title').textContent = 'Edit Target';
  $('btn-cancel-target').style.display = 'block';
  $('card-target-form').style.display = 'block';
  window.scrollTo(0, 0);
}

async function deleteTarget(id) {
  const t = targetCache.find(x => x.id === id);
  if (!t) return;
  if (!confirm(`Hapus target "${t.namaBarang}"?\nSeluruh riwayat cicilannya juga akan ikut terhapus.`)) return;
  showLoading(true);
  const result = await postData('deleteTarget', { id, userId: currentUser.userId });
  showLoading(false);
  showNotif(result.message, result.success ? 'success' : 'error');
  if (result.success) loadTarget();
}

function closeTargetModal() { $('modal-target').style.display = 'none'; }

async function openTargetDetail(id) {
  const t = targetCache.find(x => x.id === id);
  if (!t) return;
  const body = $('modal-target-body');
  body.innerHTML = '<p>Memuat riwayat cicilan...</p>';
  $('modal-target').style.display = 'flex';

  const riwayat = await fetchData('getCicilan', { userId: currentUser.userId, targetId: id });
  if (riwayat === null) { closeTargetModal(); return; }

  const urut = [...riwayat].sort((a, b) => new Date(a.waktu) - new Date(b.waktu));
  const persen = t.hargaTarget > 0 ? Math.round((t.terkumpul / t.hargaTarget) * 100) : 0;
  const sisa = Math.max(0, Number(t.hargaTarget) - Number(t.terkumpul));
  const isDone = t.status === 'Done';
  const awal = Number(t.terkumpul) - urut.reduce((s, c) => s + Number(c.nominal), 0);

  const items = urut.map((c, i) => `
    <div class="cicilan-item">
      <div><strong>Cicilan ke-${i + 1}</strong><span>${formatWaktu(c.waktu)}</span></div>
      <div class="cicilan-right"><strong class="amount-positive">+${formatRupiah(c.nominal)}</strong><span>Terkumpul: ${formatRupiah(c.terkumpulSetelah)}</span></div>
    </div>`).reverse();
  if (awal > 0) {
    items.push(`
    <div class="cicilan-item">
      <div><strong>Saldo awal</strong><span>Sebelum riwayat dicatat</span></div>
      <div class="cicilan-right"><strong class="amount-positive">+${formatRupiah(awal)}</strong></div>
    </div>`);
  }

  body.innerHTML = `
    <h3 style="margin-right:40px">${escapeHtml(t.namaBarang)} <span class="badge ${isDone ? 'done' : ''}">${isDone ? 'Selesai' : 'Aktif'}</span></h3>
    <p>${escapeHtml(t.keterangan || '')}</p>
    <div class="target-meta"><span>Terkumpul</span><strong>${formatRupiah(t.terkumpul)}</strong></div>
    <div class="target-meta"><span>Target Harga</span><strong>${formatRupiah(t.hargaTarget)}</strong></div>
    <div class="target-meta"><span>Sisa</span><strong>${formatRupiah(sisa)}</strong></div>
    <div class="target-meta"><span>Cicilan/Bulan</span><strong>${formatRupiah(t.cicilanBulan)}</strong></div>
    <div class="target-meta"><span>Target Selesai</span><strong>${t.targetSelesai ? formatTanggal(t.targetSelesai) : '-'}</strong></div>
    <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(persen,100)}%"></div></div>
    <div class="target-meta"><span>Progress</span><strong>${persen}%</strong></div>
    <h3 style="margin-top:18px">Riwayat Cicilan</h3>
    <div class="cicilan-list">${items.length ? items.join('') : '<p>Belum ada cicilan yang dicatat.</p>'}</div>`;
}

async function promptCicilan(targetId) {
  const nominal = prompt('Masukkan nominal cicilan (Rp):');
  if (!nominal || isNaN(nominal) || Number(nominal) <= 0) return;
  showLoading(true);
  const result = await postData('addCicilan', { targetId, nominal, userId: currentUser.userId });
  showLoading(false);
  showNotif(result.message, result.success ? 'success' : 'error');
  if (result.success) loadTarget();
}

// ============================================================
// TABUNGAN
// ============================================================
document.getElementById('btn-open-tabungan-form').addEventListener('click', () => {
  const card = document.getElementById('card-tabungan-form');
  card.style.display = card.style.display === 'none' ? 'block' : 'none';
});

async function loadTabungan() {
<<<<<<< HEAD
  await muatSatu('getTabungan', { userId: currentUser.userId }, renderTabungan);
}

function renderTabungan(data) {
  if (!data) return;
  const sorted = data.slice().sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
=======
  showLoading(true);
  const data = await fetchData('getTabungan', { userId: currentUser.userId });
  showLoading(false);
  if (!data) return;
  const sorted = data.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
>>>>>>> 985e157642e7e1a313b98e22a2183099d66284ad
  const saldoAkhir = sorted.length ? sorted[sorted.length - 1].saldoTotal : 0;
  document.getElementById('tabungan-saldo').textContent = formatRupiah(saldoAkhir);

  const ctx = document.getElementById('chart-tabungan');
  if (chartTabungan) chartTabungan.destroy();
<<<<<<< HEAD
  chartTabungan = buatChart(ctx, {
=======
  chartTabungan = new Chart(ctx, {
>>>>>>> 985e157642e7e1a313b98e22a2183099d66284ad
    type: 'line',
    data: { labels: sorted.map(s => formatTanggal(s.tanggal)), datasets: [{ label: 'Saldo Tabungan', data: sorted.map(s => s.saldoTotal), borderColor: '#003228', backgroundColor: 'rgba(0,50,40,0.08)', fill: true, tension: .3 }] },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  const list = document.getElementById('list-tabungan');
  const recent = [...sorted].reverse();
  list.innerHTML = recent.length ? recent.map(s => `
    <div class="transaksi-item">
      <div class="transaksi-info"><strong>${escapeHtml(s.keterangan || 'Setoran Tabungan')}</strong><span>${formatTanggal(s.tanggal)} · Saldo: ${formatRupiah(s.saldoTotal)}</span></div>
      <span class="transaksi-amount amount-positive">+${formatRupiah(s.nominalSetor)}</span>
    </div>`).join('') : '<p>Belum ada setoran tabungan.</p>';
}

// ============================================================
// LAPORAN BULANAN
// ============================================================
<<<<<<< HEAD
// Palet warna kartu kategori (senada dengan infografis budget bulanan)
// Sengaja tanpa nuansa merah: merah dipakai khusus untuk penanda jebol budget,
// supaya kartu sehat tidak terlihat seperti peringatan.
const LAP_WARNA = ['#e8702a', '#00b074', '#2e8bc0', '#9b5de5', '#2a9d8f',
                   '#f4a261', '#457b9d', '#8ab17d', '#c77dff', '#06d6a0',
                   '#3a86ff', '#b5179e'];

async function loadLaporan() {
  const userId = currentUser.userId;
  const { month, year } = getFilterPeriod();
  await muatSWR(
    [['getLaporan', { userId, month, year }], ['getAlokasi', { userId }]],
    ([data, alokasi]) => renderLaporan(data, alokasi)
  );
}

function renderLaporan(data, alokasi) {
  if (!data) return;
  const { month, year } = getFilterPeriod();
  const pengeluaran = data.pengeluaran || [];
  const daftarAlokasi = alokasi || [];

  document.getElementById('lap-judul').textContent = `Laporan ${monthNames[month - 1]} ${year}`;
  document.getElementById('lap-sub').textContent =
    `Pengeluaran ${monthNames[month - 1]} ${year} dikelompokkan menurut alokasi dana Anda.`;

  // ---- Kelompokkan pengeluaran ke dalam kategori alokasi ----
  const grup = {};
  const ambilGrup = nama => {
    const k = String(nama || '').trim().toLowerCase();
    if (!grup[k]) grup[k] = { nama: String(nama || 'Tanpa Kategori').trim(), budget: 0, adaBudget: false, items: [], total: 0 };
    return grup[k];
  };
  daftarAlokasi.forEach(a => {
    const g = ambilGrup(a.kategori);
    g.budget = Number(a.nominalAlokasi) || 0;
    g.adaBudget = true;
  });
  pengeluaran.forEach(p => {
    const g = ambilGrup(p.kategori);
    const n = Number(p.nominal) || 0;
    g.items.push({ tanggal: p.tanggal, deskripsi: p.deskripsi, nominal: n });
    g.total += n;
  });

  const grups = Object.values(grup).sort((a, b) => b.total - a.total || b.budget - a.budget);
  const totalBudget = grups.reduce((s, g) => s + g.budget, 0);
  const totalPakai  = grups.reduce((s, g) => s + g.total, 0);

  document.getElementById('lap-total-budget').textContent = formatRupiah(totalBudget);
  document.getElementById('lap-total-pakai').textContent =
    `Terpakai ${formatRupiah(totalPakai)}` +
    (totalBudget > 0 ? ` · ${Math.round((totalPakai / totalBudget) * 100)}% dari budget` : '');

  // ---- Ringkasan KPI ----
  const r = data.ringkasan || {};
  document.getElementById('laporan-summary').innerHTML = `
    <div class="kpi-card kpi-primary"><div class="kpi-top"><span>Total Pemasukan</span><span class="kpi-icon">↑</span></div><div class="kpi-value">${formatRupiah(r.totalPemasukan)}</div></div>
    <div class="kpi-card"><div class="kpi-top"><span>Total Pengeluaran</span><span class="kpi-icon kpi-icon-red">↓</span></div><div class="kpi-value">${formatRupiah(r.totalPengeluaran)}</div></div>
    <div class="kpi-card"><div class="kpi-top"><span>Arus Kas Bersih</span><span class="kpi-icon kpi-icon-green">≈</span></div><div class="kpi-value">${formatRupiah(r.arusKasBersih)}</div></div>
  `;

  // ---- Peringatan evaluasi: kategori yang jebol budget ----
  const over = grups.filter(g => g.adaBudget && g.budget > 0 && g.total > g.budget);
  const kotak = document.getElementById('lap-alert');
  if (over.length) {
    kotak.className = 'lap-alert';
    kotak.style.display = 'block';
    kotak.innerHTML = `
      <strong>⚠️ ${over.length} kategori melebihi budget bulan ini</strong>
      <ul>${over.map(g => `<li><b>${escapeHtml(g.nama)}</b> — lebih ${formatRupiah(g.total - g.budget)} dari budget ${formatRupiah(g.budget)}</li>`).join('')}</ul>`;
  } else if (totalBudget > 0) {
    kotak.className = 'lap-alert ok';
    kotak.style.display = 'block';
    kotak.innerHTML = '<strong>✅ Semua kategori masih di dalam budget bulan ini.</strong>';
  } else {
    kotak.style.display = 'none';
  }

  // ---- Kartu per kategori ----
  document.getElementById('lap-kategori').innerHTML = grups.length ? grups.map((g, i) => {
    const warna  = LAP_WARNA[i % LAP_WARNA.length];
    const persen = g.budget > 0 ? Math.round((g.total / g.budget) * 100) : null;
    const lebih  = g.budget > 0 && g.total > g.budget;
    const cls = persen === null ? 'nobudget' : lebih ? 'over' : persen >= 90 ? 'danger' : persen >= 70 ? 'warn' : 'ok';
    const items = g.items.slice().sort((a, b) => b.nominal - a.nominal);
    return `
    <div class="lap-cat ${cls}" style="--c:${warna}">
      <div class="lap-cat-head">
        <span class="lap-no">${String(i + 1).padStart(2, '0')}</span>
        <span class="lap-ic">${iconKategori(g.nama)}</span>
      </div>
      <h4>${escapeHtml(g.nama)}</h4>
      <div class="lap-cat-amount">${formatRupiah(g.total)}</div>
      <div class="lap-cat-budget">${g.budget > 0 ? 'dari budget ' + formatRupiah(g.budget) : 'di luar alokasi dana'}</div>
      ${g.budget > 0 ? `<div class="progress-bar"><div class="progress-fill ${cls}" style="width:${Math.min(persen, 100)}%"></div></div>` : ''}
      <div class="lap-cat-meta">
        <span>${persen !== null ? persen + '% terpakai' : 'tanpa budget'}</span>
        ${g.budget > 0
          ? (lebih ? `<span class="badge-over">Lebih ${formatRupiah(g.total - g.budget)}</span>`
                   : `<span class="badge-ok">Sisa ${formatRupiah(g.budget - g.total)}</span>`)
          : ''}
      </div>
      ${items.length
        ? `<ul class="lap-items">${items.map(it => `
            <li><span>${escapeHtml(it.deskripsi || 'Tanpa keterangan')}<em>${formatTanggal(it.tanggal)}</em></span><strong>${formatRupiah(it.nominal)}</strong></li>`).join('')}</ul>`
        : '<p class="lap-kosong">Belum ada pengeluaran di kategori ini.</p>'}
    </div>`;
  }).join('') : '<p>Belum ada alokasi dana maupun pengeluaran untuk bulan ini.</p>';

  // ---- Ringkasan total budget ----
  document.getElementById('lap-ringkas').innerHTML =
    grups.map((g, i) => ({ g, i })).filter(x => x.g.adaBudget).map(({ g, i }) => {
      const lebih = g.budget > 0 && g.total > g.budget;
      return `
      <div class="lap-ring-row">
        <span class="lap-dot" style="background:${LAP_WARNA[i % LAP_WARNA.length]}"></span>
        <span class="lap-ring-nama">${escapeHtml(g.nama)}</span>
        <span class="lap-ring-nilai ${lebih ? 'over' : ''}">${formatRupiah(g.total)} <em>/ ${formatRupiah(g.budget)}</em></span>
      </div>`;
    }).join('') +
    `<div class="lap-ring-total"><span>TOTAL BUDGET</span><strong>${formatRupiah(totalPakai)} <em>/ ${formatRupiah(totalBudget)}</em></strong></div>`;

  // ---- Donat persentase ----
  const pie = grups.map((g, i) => ({ g, i })).filter(x => x.g.total > 0);
  const ctx = document.getElementById('chart-laporan-pie');
  if (chartLaporanPie) chartLaporanPie.destroy();
  if (pie.length) {
    chartLaporanPie = buatChart(ctx, {
      type: 'doughnut',
      data: {
        labels: pie.map(x => x.g.nama),
        datasets: [{ data: pie.map(x => x.g.total), backgroundColor: pie.map(x => LAP_WARNA[x.i % LAP_WARNA.length]) }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
  }

  // ---- Tabel pemasukan & tabungan ----
  document.getElementById('laporan-pemasukan').innerHTML = (data.pemasukan || []).length
    ? data.pemasukan.map(p => `<tr><td>${formatTanggal(p.tanggal)}</td><td>${escapeHtml(p.sumber)}</td><td>${escapeHtml(p.keterangan || '-')}</td><td>${formatRupiah(p.nominal)}</td></tr>`).join('')
    : '<tr><td colspan="4">Tidak ada data.</td></tr>';

  document.getElementById('laporan-tabungan').innerHTML = (data.tabungan || []).length
=======
async function loadLaporan() {
  showLoading(true);
  const { month, year } = getFilterPeriod();
  const data = await fetchData('getLaporan', { userId: currentUser.userId, month, year });
  showLoading(false);
  if (!data) return;

  document.getElementById('laporan-summary').innerHTML = `
    <div class="kpi-card"><div class="kpi-top"><span>Total Pemasukan</span></div><div class="kpi-value">${formatRupiah(data.ringkasan.totalPemasukan)}</div></div>
    <div class="kpi-card"><div class="kpi-top"><span>Total Pengeluaran</span></div><div class="kpi-value">${formatRupiah(data.ringkasan.totalPengeluaran)}</div></div>
    <div class="kpi-card"><div class="kpi-top"><span>Arus Kas Bersih</span></div><div class="kpi-value">${formatRupiah(data.ringkasan.arusKasBersih)}</div></div>
  `;

  document.getElementById('laporan-pemasukan').innerHTML = data.pemasukan.length
    ? data.pemasukan.map(p => `<tr><td>${formatTanggal(p.tanggal)}</td><td>${escapeHtml(p.sumber)}</td><td>${escapeHtml(p.keterangan || '-')}</td><td>${formatRupiah(p.nominal)}</td></tr>`).join('')
    : '<tr><td colspan="4">Tidak ada data.</td></tr>';

  document.getElementById('laporan-pengeluaran').innerHTML = data.pengeluaran.length
    ? data.pengeluaran.map(p => `<tr><td>${formatTanggal(p.tanggal)}</td><td>${escapeHtml(p.kategori)}</td><td>${escapeHtml(p.deskripsi || '-')}</td><td>${formatRupiah(p.nominal)}</td></tr>`).join('')
    : '<tr><td colspan="4">Tidak ada data.</td></tr>';

  document.getElementById('laporan-tabungan').innerHTML = data.tabungan.length
>>>>>>> 985e157642e7e1a313b98e22a2183099d66284ad
    ? data.tabungan.map(s => `<tr><td>${formatTanggal(s.tanggal)}</td><td>${formatRupiah(s.nominalSetor)}</td><td>${formatRupiah(s.saldoTotal)}</td><td>${escapeHtml(s.keterangan || '-')}</td></tr>`).join('')
    : '<tr><td colspan="4">Tidak ada data.</td></tr>';
}

document.getElementById('btn-download-pdf').addEventListener('click', async () => {
<<<<<<< HEAD
  if (!window.jspdf || typeof html2canvas === 'undefined') {
    showNotif('Komponen PDF belum selesai dimuat. Coba lagi sebentar lagi.', 'error');
    return;
  }
=======
>>>>>>> 985e157642e7e1a313b98e22a2183099d66284ad
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const { month, year } = getFilterPeriod();
  doc.setFontSize(14); doc.text('Laporan Keuangan Bulanan', 14, 16);
  doc.setFontSize(10); doc.text(`${currentUser.nama} — ${monthNames[month-1]} ${year}`, 14, 23);
  const canvas = await html2canvas(document.getElementById('laporan-content'), { backgroundColor: '#ffffff', scale: 1.3 });
  const imgData = canvas.toDataURL('image/jpeg', 0.9);
  const pageWidth = doc.internal.pageSize.getWidth() - 20;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;
  doc.addImage(imgData, 'JPEG', 10, 30, pageWidth, imgHeight);
  doc.save(`Laporan_${currentUser.nama}_${monthNames[month-1]}_${year}.pdf`);
});

// ============================================================
// FORM BINDINGS
// ============================================================
function bindForms() {
  document.getElementById('form-pemasukan').addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('pemasukan-id').value;
    const payload = {
      userId: currentUser.userId,
      tanggal: document.getElementById('pemasukan-tanggal').value,
      sumber: document.getElementById('pemasukan-sumber').value,
      nominal: document.getElementById('pemasukan-nominal').value,
      keterangan: document.getElementById('pemasukan-keterangan').value
    };
    showLoading(true);
    const result = await postData(id ? 'updatePemasukan' : 'addPemasukan', id ? { ...payload, id } : payload);
    showLoading(false);
    showNotif(result.message, result.success ? 'success' : 'error');
    if (result.success) { e.target.reset(); document.getElementById('pemasukan-id').value = ''; syncSumberChips(); loadPemasukan(); }
  });

  document.getElementById('form-alokasi').addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      userId: currentUser.userId,
      kategori: document.getElementById('alokasi-kategori').value,
      nominal: document.getElementById('alokasi-nominal').value,
      tanggal: document.getElementById('alokasi-tanggal').value
    };
    showLoading(true);
    const idA = document.getElementById('alokasi-id').value;
    const result = await postData(idA ? 'updateAlokasi' : 'addAlokasi', idA ? { ...payload, id: idA } : payload);
    showLoading(false);
    showNotif(result.message, result.success ? 'success' : 'error');
    if (result.success) { resetAlokasiForm(); loadAlokasi(); }
  });

  document.getElementById('form-pengeluaran').addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('pengeluaran-id').value;
    const payload = {
      userId: currentUser.userId,
      kategori: document.getElementById('pengeluaran-kategori').value,
      tanggal: document.getElementById('pengeluaran-tanggal').value,
      nominal: document.getElementById('pengeluaran-nominal').value,
      deskripsi: document.getElementById('pengeluaran-deskripsi').value,
      metode: document.getElementById('pengeluaran-metode').value
    };
    if (!payload.kategori) { showNotif('Buat kategori alokasi terlebih dahulu.', 'error'); return; }
    showLoading(true);
    const result = await postData(id ? 'updatePengeluaran' : 'addPengeluaran', id ? { ...payload, id } : payload);
    showLoading(false);
    showNotif(result.message, result.success ? 'success' : 'error');
    if (result.success) { e.target.reset(); document.getElementById('pengeluaran-id').value = ''; loadPengeluaran(); }
  });

  document.getElementById('form-target').addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      userId: currentUser.userId,
      namaBarang: document.getElementById('target-nama').value,
      hargaTarget: document.getElementById('target-harga').value,
      cicilanBulan: document.getElementById('target-cicilan').value,
      targetSelesai: document.getElementById('target-selesai').value,
      keterangan: document.getElementById('target-keterangan').value
    };
    showLoading(true);
    const idT = document.getElementById('target-id').value;
    const result = await postData(idT ? 'updateTarget' : 'addTarget', idT ? { ...payload, id: idT } : payload);
    showLoading(false);
    showNotif(result.message, result.success ? 'success' : 'error');
    if (result.success) { resetTargetForm(); loadTarget(); }
  });

  document.getElementById('form-tabungan').addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      userId: currentUser.userId,
      tanggal: document.getElementById('tabungan-tanggal').value,
      nominal: document.getElementById('tabungan-nominal').value,
      keterangan: document.getElementById('tabungan-keterangan').value
    };
    showLoading(true);
    const result = await postData('addTabungan', payload);
    showLoading(false);
    showNotif(result.message, result.success ? 'success' : 'error');
    if (result.success) { e.target.reset(); document.getElementById('card-tabungan-form').style.display = 'none'; loadTabungan(); }
  });

  // Tombol batal edit (Alokasi & Target)
  $('btn-cancel-alokasi').addEventListener('click', resetAlokasiForm);
  $('btn-cancel-target').addEventListener('click', resetTargetForm);

  // Chip sumber pemasukan (tampilan HP)
  document.querySelectorAll('#sumber-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const input = $('pemasukan-sumber');
      const label = input.closest('label');
      document.querySelectorAll('#sumber-chips .chip').forEach(c => c.classList.toggle('active', c === chip));
      if (chip.dataset.sumber === '__lain') {
        input.value = '';
        label.classList.add('custom-visible');
        input.focus();
      } else {
        input.value = chip.dataset.sumber;
        label.classList.remove('custom-visible');
      }
    });
  });
  syncSumberChips();
  window.matchMedia('(max-width: 900px)').addEventListener('change', syncSumberChips);
}

// ============================================================
// UTIL
// ============================================================
<<<<<<< HEAD
// REVISI 3 — Chart.js diambil dari CDN. Bila gagal dimuat (sinyal HP jelek,
// offline, CDN diblok), pembuatan grafik TIDAK boleh menjatuhkan seluruh
// halaman: dulu error di sini membuat tabel di bawahnya tidak pernah terisi.
function buatChart(canvas, config) {
  try {
    if (!canvas || typeof Chart === 'undefined') return null;
    return new Chart(canvas, config);
  } catch (e) {
    console.warn('Grafik tidak bisa digambar:', e);
    return null;
  }
}

=======
>>>>>>> 985e157642e7e1a313b98e22a2183099d66284ad
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
function toDateInput(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt)) return '';
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${dt.getFullYear()}-${mm}-${dd}`;
}

// ============================================================
// HELPER REVISI 1 (tampilan HP, riwayat cicilan)
// ============================================================
function isMobile() { return window.matchMedia('(max-width: 900px)').matches; }

function formatWaktu(w) {
  if (!w) return '-';
  const d = new Date(w);
  if (isNaN(d)) return '-';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
         d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function iconKategori(k) {
  const s = String(k || '').toLowerCase();
<<<<<<< HEAD
  if (/jajan|snack|camilan/.test(s)) return '🍪';
  if (/pokok|sembako|dapur|groceri/.test(s)) return '🛒';
  if (/makan|kuliner|food/.test(s)) return '🍽️';
  if (/rumah tangga|rumah|kebersihan/.test(s)) return '🏠';
  if (/pendidikan|sekolah|kuliah|les |anak/.test(s)) return '🎒';
  if (/transport|ojek|bensin|kendaraan|parkir|tol/.test(s)) return '🚗';
  if (/sehat|obat|dokter|bpjs|vitamin/.test(s)) return '🩺';
  if (/pribadi|perawatan|skincare|salon/.test(s)) return '🧴';
  if (/komunikasi|internet|pulsa|kuota|telepon/.test(s)) return '📱';
  if (/tabung|investasi|saham|emas/.test(s)) return '💰';
  if (/darurat|cadangan/.test(s)) return '🛟';
  if (/zakat|sedekah|infaq|infak|donasi/.test(s)) return '🤲';
  if (/tagihan|utilitas|listrik|air|gas|pdam/.test(s)) return '⚡';
  if (/hibur|rekreasi|lifestyle|liburan|jalan/.test(s)) return '🎬';
  if (/belanja|shop|pakaian|baju/.test(s)) return '🛍️';
=======
  if (/makan|kuliner|food/.test(s)) return '🍽️';
  if (/transport|ojek|bensin/.test(s)) return '🚗';
  if (/belanja|shop/.test(s)) return '🛍️';
  if (/tagihan|utilitas|listrik/.test(s)) return '⚡';
  if (/hibur|rekreasi|lifestyle/.test(s)) return '🎬';
>>>>>>> 985e157642e7e1a313b98e22a2183099d66284ad
  return '🏷️';
}

function iconSumber(s) {
  const v = String(s || '').toLowerCase();
  if (/gaji/.test(v)) return '💵';
  if (/freelance|proyek/.test(v)) return '💻';
  if (/invest|dividen|saham/.test(v)) return '📈';
  return '🎁';
}

function renderMobileTarget(t) {
  const box = $('mobile-target');
  if (!t) { box.classList.add('is-empty'); return; }
  box.classList.remove('is-empty');
  const persen = t.hargaTarget > 0 ? Math.min(100, Math.round((t.terkumpul / t.hargaTarget) * 100)) : 0;
  box.innerHTML = `
    <div class="mt-top"><span class="mt-ic">🎯</span>
      <div class="mt-info"><strong>${escapeHtml(t.namaBarang)}</strong><span>Target: ${formatRupiah(t.hargaTarget)}</span></div>
      <span class="mt-pct">${persen}%</span></div>
    <div class="progress-bar"><div class="progress-fill" style="width:${persen}%"></div></div>`;
}

function renderMobileRecent(list) {
  $('mobile-recent-list').innerHTML = list.length ? list.map(t => {
    const masuk = t.jenis === 'pemasukan';
    return `
    <div class="transaksi-item">
      <span class="t-icon ${masuk ? '' : 'out'}">${masuk ? iconSumber(t.judul) : iconKategori(t.kategori)}</span>
      <div class="transaksi-info"><strong>${escapeHtml(t.judul)}</strong><span>${formatTanggal(t.tanggal)} • ${masuk ? 'Pemasukan' : 'Pengeluaran'}</span></div>
      <span class="transaksi-amount ${masuk ? 'amount-positive' : 'amount-negative'}">${masuk ? '+' : '-'}${formatRupiah(t.nominal)}</span>
    </div>`;
  }).join('') : '<p>Belum ada transaksi.</p>';
}

function renderPemasukanSummary(list) {
  const { month, year } = getFilterPeriod();
  const m = Number(month), y = Number(year);
  const totalOf = (mm, yy) => list.reduce((s, p) => {
    const d = new Date(p.tanggal);
    return (d.getFullYear() === yy && d.getMonth() + 1 === mm) ? s + Number(p.nominal) : s;
  }, 0);
  const cur = totalOf(m, y);
  const prev = totalOf(m === 1 ? 12 : m - 1, m === 1 ? y - 1 : y);
  $('pemasukan-bulan-total').textContent = formatRupiah(cur);
  if (prev > 0) {
    const pct = Math.round(((cur - prev) / prev) * 100);
    $('pemasukan-bulan-growth').textContent = `${pct >= 0 ? '+' : ''}${pct}% dari bulan lalu`;
  } else {
    $('pemasukan-bulan-growth').textContent = 'Belum ada data bulan lalu';
  }
  $('pemasukan-bulan-bar').style.width = (prev > 0 ? Math.min(100, Math.round((cur / prev) * 100)) : (cur > 0 ? 100 : 0)) + '%';
}

function syncSumberChips() {
  const input = $('pemasukan-sumber');
  const label = input.closest('label');
  if (!input.value && isMobile()) input.value = 'Gaji Utama';
  const v = input.value;
  const known = ['Gaji Utama', 'Freelance', 'Investasi'];
  const custom = !!v && !known.includes(v);
  document.querySelectorAll('#sumber-chips .chip').forEach(c => {
    c.classList.toggle('active', c.dataset.sumber === v || (c.dataset.sumber === '__lain' && custom));
  });
  label.classList.toggle('custom-visible', custom);
}

function renderKategoriChips() {
  const box = $('kategori-chips');
  box.innerHTML = '';
  if (!alokasiCache.length) {
    box.innerHTML = '<p class="chips-empty">Belum ada alokasi — buat dulu di menu Alokasi Dana.</p>';
    return;
  }
  alokasiCache.forEach(a => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.dataset.kategori = a.kategori;
    b.innerHTML = `<span class="chip-ic">${iconKategori(a.kategori)}</span>${escapeHtml(a.kategori)}`;
    b.addEventListener('click', () => { $('pengeluaran-kategori').value = a.kategori; syncKategoriChips(); });
    box.appendChild(b);
  });
  syncKategoriChips();
}

function syncKategoriChips() {
  const v = $('pengeluaran-kategori').value;
  document.querySelectorAll('#kategori-chips .chip').forEach(c => c.classList.toggle('active', c.dataset.kategori === v));
}

function renderPengeluaranMobile(list) {
  $('list-pengeluaran-m').innerHTML = list.length ? list.map(p => `
    <div class="transaksi-item">
      <span class="t-icon out">${iconKategori(p.kategori)}</span>
      <div class="transaksi-info"><strong>${escapeHtml(p.deskripsi || p.kategori)}</strong><span>${escapeHtml(p.metode || '-')} • ${formatTanggal(p.tanggal)}</span></div>
      <div class="item-actions">
        <span class="transaksi-amount amount-negative">-${formatRupiah(p.nominal)}</span>
        <button class="btn-icon" onclick='editPengeluaran(${JSON.stringify(p)})'>✏️</button>
        <button class="btn-icon" onclick="deletePengeluaran('${p.id}')">🗑️</button>
      </div>
    </div>`).join('') : '<p>Belum ada catatan pengeluaran.</p>';
}
<<<<<<< HEAD

// ============================================================
// REVISI 2 — PWA: service worker (caching/kecepatan) + instal ke layar utama
// ============================================================

// Daftarkan service worker (hanya berjalan di https/GitHub Pages, aman di-skip saat file://)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('Service worker gagal didaftarkan:', err));
  });
}

function isStandaloneDisplay() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// Android/Chrome: tangkap event instal asli -> tombol "Instal" memicu dialog instal PWA sungguhan (WebAPK)
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  if (!isStandaloneDisplay() && !localStorage.getItem('ckp_install_dismissed')) {
    $('install-banner').style.display = 'flex';
  }
});

window.addEventListener('appinstalled', () => {
  $('install-banner').style.display = 'none';
  deferredInstallPrompt = null;
});

document.getElementById('btn-install-app').addEventListener('click', async () => {
  $('install-banner').style.display = 'none';
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
});

document.getElementById('btn-install-dismiss').addEventListener('click', () => {
  $('install-banner').style.display = 'none';
  localStorage.setItem('ckp_install_dismissed', '1');
});

// iOS Safari tidak punya beforeinstallprompt -> tampilkan tip manual sekali saja
function isIosDevice() { return /iphone|ipad|ipod/i.test(navigator.userAgent); }
if (isIosDevice() && !isStandaloneDisplay() && !localStorage.getItem('ckp_ios_tip_dismissed')) {
  document.getElementById('ios-install-tip').style.display = 'flex';
}
document.getElementById('btn-ios-dismiss').addEventListener('click', () => {
  $('ios-install-tip').style.display = 'none';
  localStorage.setItem('ckp_ios_tip_dismissed', '1');
});
=======
>>>>>>> 985e157642e7e1a313b98e22a2183099d66284ad
