// ============================================================
// API HELPERS — komunikasi ke GAS backend (fetch, bukan google.script.run)
// ============================================================

async function fetchData(action, params = {}) {
  try {
    const qs = new URLSearchParams({ action, ...params }).toString();
    const res = await fetch(`${GAS_URL}?${qs}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Gagal memuat data.');
    return json.data;
  } catch (err) {
    showNotif('Gagal memuat data: ' + err.message, 'error');
    return null;
  }
}

async function postData(action, data = {}) {
  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      // WAJIB text/plain — JSON memicu CORS preflight yang diblok GAS
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, data })
    });
    return await res.json();
  } catch (err) {
    showNotif('Gagal mengirim data: ' + err.message, 'error');
    return { success: false, message: err.message };
  }
}

function showNotif(message, type = 'success') {
  const el = document.getElementById('notif');
  el.textContent = message;
  el.className = `notif ${type} show`;
  setTimeout(() => el.classList.remove('show'), 3000);
}

function showLoading(show = true) {
  document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

function formatRupiah(n) {
  return 'Rp ' + (Number(n) || 0).toLocaleString('id-ID');
}

function formatTanggal(d) {
  if (!d) return '-';
  const dt = new Date(d);
  return dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}
