// ============================================================
// STATE
// ============================================================
let currentUser = JSON.parse(localStorage.getItem('ckp_user') || 'null');
let alokasiCache = [];
let chartYearly, chartPie, chartDaily, chartTabungan;
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
  loadPage('dashboard');
}

// ============================================================
// NAVIGATION
// ============================================================
function bindNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      loadPage(item.dataset.page);
      document.querySelector('.sidebar').classList.remove('open');
    });
  });
  document.getElementById('btn-menu-mobile').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('open');
  });
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
  showLoading(true);
  const { month, year } = getFilterPeriod();
  const data = await fetchData('getDashboard', { userId: currentUser.userId, month, year });
  showLoading(false);
  if (!data) return;

  document.getElementById('kpi-pemasukan').textContent = formatRupiah(data.totalPemasukanBulan);
  document.getElementById('kpi-pengeluaran').textContent = formatRupiah(data.totalPengeluaranBulan);
  document.getElementById('kpi-tabungan').textContent = formatRupiah(data.totalTabunganBulan);

  const ctxY = document.getElementById('chart-yearly');
  if (chartYearly) chartYearly.destroy();
  chartYearly = new Chart(ctxY, {
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
  chartPie = new Chart(ctxP, {
    type: 'doughnut',
    data: {
      labels: data.pieByCategory.map(p => p.kategori),
      datasets: [{ data: data.pieByCategory.map(p => p.total), backgroundColor: ['#00b074','#006c46','#6ff8b5','#94a3a0','#003228','#ba1a1a'] }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  });

  const ctxD = document.getElementById('chart-daily');
  if (chartDaily) chartDaily.destroy();
  chartDaily = new Chart(ctxD, {
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
  showLoading(true);
  const data = await fetchData('getPemasukan', { userId: currentUser.userId });
  showLoading(false);
  if (!data) return;
  const sorted = data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  const container = document.getElementById('list-pemasukan');
  container.innerHTML = sorted.length ? sorted.map(p => `
    <div class="transaksi-item">
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
      <div class="alokasi-item-top"><strong>${escapeHtml(a.kategori)}</strong><span>${persen}%</span></div>
      <div class="progress-bar"><div class="progress-fill ${cls}" style="width:${Math.min(persen,100)}%"></div></div>
      <div class="alokasi-meta">
        <span>${formatRupiah(a.nominalAlokasi - a.saldoSaatIni)} dari ${formatRupiah(a.nominalAlokasi)}</span>
        <span>Sisa ${formatRupiah(a.saldoSaatIni)}</span>
      </div>
    </div>`;
  }).join('') : '<p>Belum ada kategori alokasi.</p>';
}

// ============================================================
// PENGELUARAN
// ============================================================
async function loadPengeluaran() {
  showLoading(true);
  const [alokasi, data] = await Promise.all([
    fetchData('getAlokasi', { userId: currentUser.userId }),
    fetchData('getPengeluaran', { userId: currentUser.userId })
  ]);
  showLoading(false);
  if (alokasi) {
    alokasiCache = alokasi;
    const sel = document.getElementById('pengeluaran-kategori');
    sel.innerHTML = alokasi.length
      ? alokasi.map(a => `<option value="${escapeHtml(a.kategori)}">${escapeHtml(a.kategori)}</option>`).join('')
      : '<option value="">Belum ada alokasi — buat dulu di menu Alokasi Dana</option>';
  }
  if (!data) return;
  const sorted = data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
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
  card.style.display = card.style.display === 'none' ? 'block' : 'none';
});

async function loadTarget() {
  showLoading(true);
  const data = await fetchData('getTarget', { userId: currentUser.userId });
  showLoading(false);
  if (!data) return;
  const container = document.getElementById('list-target');
  container.innerHTML = data.length ? data.map(t => {
    const persen = t.hargaTarget > 0 ? Math.round((t.terkumpul / t.hargaTarget) * 100) : 0;
    const isDone = t.status === 'Done';
    return `
    <div class="target-card">
      <div class="target-card-top"><h3 style="margin:0">${escapeHtml(t.namaBarang)}</h3><span class="badge ${isDone ? 'done' : ''}">${isDone ? 'Selesai' : 'Aktif'}</span></div>
      <p>${escapeHtml(t.keterangan || '')}</p>
      <div class="target-meta"><span>Terkumpul</span><strong>${formatRupiah(t.terkumpul)}</strong></div>
      <div class="target-meta"><span>Target Harga</span><strong>${formatRupiah(t.hargaTarget)}</strong></div>
      <div class="target-meta"><span>Cicilan/Bulan</span><strong>${formatRupiah(t.cicilanBulan)}</strong></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(persen,100)}%"></div></div>
      <div class="target-meta"><span>Progress</span><strong>${persen}%</strong></div>
      ${!isDone ? `<button class="btn-secondary btn-block" style="margin-top:10px" onclick="promptCicilan('${t.id}')">+ Tambah Cicilan</button>` : `<button class="btn-secondary btn-block" style="margin-top:10px" disabled>✓ Target Tercapai</button>`}
    </div>`;
  }).join('') : '<p>Belum ada target impian. Buat target baru untuk mulai menabung.</p>';
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
  showLoading(true);
  const data = await fetchData('getTabungan', { userId: currentUser.userId });
  showLoading(false);
  if (!data) return;
  const sorted = data.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
  const saldoAkhir = sorted.length ? sorted[sorted.length - 1].saldoTotal : 0;
  document.getElementById('tabungan-saldo').textContent = formatRupiah(saldoAkhir);

  const ctx = document.getElementById('chart-tabungan');
  if (chartTabungan) chartTabungan.destroy();
  chartTabungan = new Chart(ctx, {
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
    ? data.tabungan.map(s => `<tr><td>${formatTanggal(s.tanggal)}</td><td>${formatRupiah(s.nominalSetor)}</td><td>${formatRupiah(s.saldoTotal)}</td><td>${escapeHtml(s.keterangan || '-')}</td></tr>`).join('')
    : '<tr><td colspan="4">Tidak ada data.</td></tr>';
}

document.getElementById('btn-download-pdf').addEventListener('click', async () => {
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
    if (result.success) { e.target.reset(); document.getElementById('pemasukan-id').value = ''; loadPemasukan(); }
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
    const result = await postData('addAlokasi', payload);
    showLoading(false);
    showNotif(result.message, result.success ? 'success' : 'error');
    if (result.success) { e.target.reset(); loadAlokasi(); }
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
    const result = await postData('addTarget', payload);
    showLoading(false);
    showNotif(result.message, result.success ? 'success' : 'error');
    if (result.success) { e.target.reset(); document.getElementById('card-target-form').style.display = 'none'; loadTarget(); }
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
}

// ============================================================
// UTIL
// ============================================================
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
function toDateInput(d) {
  const dt = new Date(d);
  return dt.toISOString().split('T')[0];
}
