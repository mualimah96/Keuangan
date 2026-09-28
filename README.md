# Catatan Keuangan Personal — Frontend

Frontend statis (HTML/CSS/JS vanilla) untuk aplikasi Catatan Keuangan Personal.
Backend: Google Apps Script REST API (lihat `Kode.gs` terpisah).

## Sebelum deploy
Edit `js/config.js`, isi `GAS_URL` dengan URL `/exec` hasil deploy Google Apps Script Anda.

## Struktur
```
index.html
css/style.css
js/config.js   ← isi GAS_URL di sini
js/api.js
js/app.js
```

Lihat `PANDUAN-INSTALASI.md` untuk panduan lengkap deploy ke GitHub Pages.
