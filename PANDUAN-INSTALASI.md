# 📋 Panduan Instalasi — Catatan Keuangan Personal

Aplikasi ini punya 2 bagian yang di-deploy terpisah:
- **Backend** (`Kode.gs`) → dipasang di Google Apps Script, jadi REST API
- **Frontend** (folder `frontend/`) → di-deploy ke GitHub Pages

Ikuti urutan di bawah — backend harus jalan dulu sebelum frontend diisi URL-nya.

---

## === BAGIAN 1: BACKEND (Google Apps Script) ===

1. Buka https://script.google.com → **Proyek Baru**
2. Hapus semua isi file `Code.gs` bawaan, lalu ganti nama file jadi **`Kode`** dan paste seluruh isi `Kode.gs` yang saya berikan.
3. Jalankan `setupAppEnvironment` — **HANYA SEKALI**:
   - Di dropdown pemilih fungsi (atas editor), pilih **`setupAppEnvironment`**
   - Klik tombol ▶ **Run**
   - Akan muncul permintaan izin → klik **Review permissions** → pilih akun Google Anda → **Allow** (izinkan akses Drive & Sheets)
   - Buka **Execution Log** (ikon di kiri) — pastikan muncul baris `✅ Setup selesai!`
   - Cek Google Drive Anda: folder **📁 Catatan Keuangan Personal** sudah terbuat, berisi file **🗃️ Database**
   - ⚠️ **JANGAN** jalankan `setupAppEnvironment` lebih dari sekali — kalau tidak sengaja terjalankan 2x, hapus folder & spreadsheet duplikat secara manual di Drive, lalu jalankan sekali lagi
4. **Deploy sebagai Web App:**
   - Klik **Deploy** → **New deployment**
   - Klik ikon ⚙️ di samping "Select type" → pilih **Web app**
   - Isi: **Execute as** = `Me` (akun Anda), **Who has access** = `Anyone`
   - Klik **Deploy**
   - **Copy URL** yang diakhiri `/exec` — inilah `GAS_URL` Anda

---

## === BAGIAN 2: FRONTEND (GitHub Pages) ===

### Yang perlu disiapkan
1. Ekstrak ZIP `catatankeu-frontend.zip` yang saya berikan.
2. Buka file `js/config.js` dengan text editor, ganti baris:
   ```js
   const GAS_URL = 'https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXXXXXXX/exec';
   ```
   dengan URL `/exec` hasil deploy di Bagian 1. **Simpan file.**

### Deploy ke GitHub Pages (lewat terminal)

> Saya akan memandu Anda langkah-demi-langkah secara interaktif di chat begitu Anda siap — cukup bilang "lanjut deploy ke GitHub Pages" dan saya akan pandu dari instalasi Git sampai situs online, satu langkah setiap saat.

Ringkasan alurnya:
1. Install Git (kalau belum ada) & buat akun GitHub
2. Setup identitas Git (`git config`)
3. Buat repository baru di GitHub (**Public**, tanpa centang README)
4. Masuk ke folder hasil ekstrak ZIP — **folder yang berisi `index.html` langsung di dalamnya** (bukan folder induk)
5. Verifikasi dengan `dir`/`ls` — pastikan `index.html` terlihat di baris teratas
6. `git init` → `git add .` → `git commit` → `git remote add origin <url-repo>` → `git push`
7. Aktifkan GitHub Pages di Settings → Pages (branch `main`, folder `/root`)
8. Tunggu 1-2 menit, buka `https://USERNAME.github.io/NAMA-REPO/`

⚠️ **Penting:** `index.html` HARUS berada tepat di root repository (bukan di dalam subfolder `frontend/`), jika tidak situs akan 404. Struktur ZIP ini sudah disusun agar isi ZIP = isi root repo.

---

## === TEST ===

1. Buka URL GitHub Pages Anda di browser
2. Klik **Daftar di sini** → buat akun baru
3. Setelah masuk, coba:
   - Buat **Alokasi Dana** baru (misal kategori "Makanan", Rp 1.000.000)
   - Catat **Pemasukan** (misal Gaji Rp 5.000.000)
   - Catat **Pengeluaran** dengan kategori "Makanan" → cek saldo alokasi otomatis berkurang
   - Buat **Target Impian** → tambah cicilan
   - Catat setoran **Tabungan**
   - Cek **Dashboard** — grafik & KPI harus terisi
   - Buka **Laporan Bulanan** → coba download PDF
4. Buka Chrome DevTools (F12) → tab **Network** → pastikan tidak ada error CORS berwarna merah saat memuat data

---

## Catatan Teknis / Penyimpangan dari PRD Awal

- **Autentikasi**: memakai email + password sederhana (tersimpan di sheet `Users`, password di-hash SHA-256) — bukan Google OAuth, karena frontend di-host terpisah di GitHub Pages sehingga OAuth GAS klasik tidak applicable lintas domain. Cocok untuk pemakaian personal/keluarga, bukan tingkat keamanan enterprise.
- **Struktur data**: bukan 1 sheet per user (`[UserID]_Pemasukan` dst) seperti di PRD, melainkan **1 sheet per modul + kolom `userId`** yang selalu difilter backend. Ini jauh lebih scalable untuk 100+ pengguna dan menghindari ratusan sheet.
- Semua isolasi data tetap terjaga — backend selalu memvalidasi `userId` di setiap query & mutasi.

## Troubleshooting Cepat

| Gejala | Penyebab | Solusi |
|---|---|---|
| Data tidak muncul, notif "Gagal memuat data" | `GAS_URL` di `js/config.js` belum diisi/salah | Cek ulang URL `/exec`, pastikan diakhiri `/exec` bukan `/dev` |
| Error CORS di console | Header POST bukan `text/plain` | Sudah ditangani di kode — kalau tetap error, pastikan Web App di-deploy dengan akses "Anyone" |
| Halaman tanpa styling, console 404 untuk css/js | Struktur folder rata di root repo GitHub | Pastikan folder `css/` dan `js/` ikut ter-push (lihat prosedur perbaikan di panduan GitHub Pages) |
| Login gagal padahal baru daftar | Kesalahan ketik email/password | Coba daftar ulang dengan email berbeda untuk tes |
