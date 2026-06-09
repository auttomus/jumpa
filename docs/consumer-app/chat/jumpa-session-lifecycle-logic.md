### Dokumen 1: Spesifikasi Alur Logika "Jumpa Session Lifecycle"

**1. Fase Inisiasi (Idle ➔ Initiated)**

- **Kondisi Awal:** Obrolan grup dalam keadaan bebas (Idle).
- **Pemicu:** Pengguna mana pun (selanjutnya disebut "Inisiator") menekan tombol "Mulai Sesi Jumpa".
- **Aturan Kunci:** Hanya boleh ada satu sesi pertemuan aktif per ruang obrolan. Tombol inisiasi akan dinonaktifkan secara global untuk semua pengguna lain di grup tersebut sampai sesi saat ini selesai dibubarkan atau telah tuntas. Inisiator secara otomatis memegang kendali eksekusi pencarian.

**2. Fase RSVP, Pemilihan Lokasi & Negosiasi Kondisi (Hydration & Negotiation Phase)**

- **Proses:** Sistem mengirimkan kartu interaktif ke dalam _chat_ . Setiap anggota grup harus memilih status: `Ikut` (Join) atau `Tidak Ikut` (Decline).
- **Input Data:** Pengguna yang memilih `Ikut` diwajibkan memasukkan parameter berikut:
  1. Titik lokasi awal (Otomatis dari GPS atau pilih manual).
  2. Pilihan moda transportasi (Motor, Mobil, Transportasi Umum, Jalan Kaki).
- **Klaim Kendala:** Anggota dapat memilih opsi tambahan jika mengalami hambatan (misal: "Terjebak Macet", "Hujan Lebat").
- **Transparansi Visual (Lobby Status Board):** Antarmuka memunculkan panel status di atas ruang obrolan yang menampilkan siapa saja yang berpartisipasi dan moda transportasi mereka. **Aturan Privasi:** Koordinat absolut disembunyikan. Jika anggota melakukan klaim kendala atau memilih moda transportasi lambat, sistem memunculkan label **"⭐ Prioritas Jarak"** pada profil mereka di _board_ . Secara sistem, ini akan meningkatkan bobot penarikan lokasi mereka pada algoritma pencarian.
- **Batas Waktu (Timeout):** Sistem menerapkan penghitung waktu mundur (contoh: 10 menit). Anggota yang tidak merespons hingga batas waktu habis otomatis didaftarkan sebagai `Tidak Ikut`.

**3. Fase Penguncian & Eksekusi Prompt (Locked & Execution Phase)**

- **Paralelisasi Antarmuka:** Sejak Fase 2 dimulai, Inisiator sudah diberikan akses untuk mulai mengetik _prompt_ kriteria tempat (contoh: "Kafe outdoor") tanpa harus menunggu orang lain selesai memilih lokasi.
- **Pemicu Eksekusi:** Tombol "Cari Lokasi" milik Inisiator awalnya dinonaktifkan. Tombol ini baru aktif menyala setelah seluruh anggota grup telah memberikan keputusan RSVP.
- **Hak Veto Inisiator:** Selama tombol pencarian belum ditekan, Inisiator umemiliki hak mutlak untuk membatalkan seluruh rencana pertemuan secara sepihak.

**4. Fase Voting & Konsensus (The Map Reveal)**

- **Proses:** _Spatial Engine_ memproses data dan mengembalikan maksimal 5 kandidat lokasi pertemuan paling optimal.
- **Transisi Layar:** Antarmuka obrolan mengecil dan menyingkap peta layar penuh ( _full screen_ ) yang berisi node/pin kandidat lokasi.
- **Pemungutan Suara:** Para partisipan menekan node di peta untuk melihat detail tempat, lalu menekan tombol _Vote_ .
- **Aturan Konsensus:** Tempat pertama yang mendapatkan suara mayoritas (>50%), atau tempat dengan suara terbanyak saat batas waktu _voting_ (misal: 5 menit) habis, akan ditetapkan sebagai titik temu final.

**5. Fase Perjalanan & Pembatalan Parsial (Resolution & En Route)**

- **Status Destinasi (Kaku/Immutable):** Setelah hasil _voting_ keluar, titik tujuan dikunci. Node tempat yang kalah akan dihapus dari peta.
- **Aksi Partisipan:** Pengguna memulai rute perjalanan mereka masing-masing. Di layar akan muncul tombol untuk menandakan tiba, atau opsi untuk keluar dari pertemuan di tengah jalan.
- **Pembatalan Parsial (Drop-out):** Jika ada pengguna yang tidak bisa melanjutkan perjalanan (misal: motor mogok), mereka dapat menekan `Keluar dari Pertemuan`. Pelacakan lokasi untuk pengguna tersebut dihentikan. Titik tujuan _tidak akan dikalkulasi ulang_ untuk peserta yang tersisa demi menjaga keselamatan berkendara.

**6. Fase Terminasi Sinkron & Asinkron (Completion / Auto-Resolve)**

Sistem menutup ruang pertemuan secara permanen dan menyimpan data ke basis riwayat ( _Jumpa History_ ) melalui dua mekanisme:

- **Terminasi Sinkron (Manual & GPS):** Sesi dinyatakan selesai ketika seluruh partisipan aktif telah berstatus `Tiba`. Status ini didapat jika pengguna menekan tombol selesai secara manual, atau otomatis berubah jika GPS perangkat mendeteksi pengguna masuk ke dalam radius 50 meter dari titik tujuan.
- **Terminasi Asinkron (Fail-safe):** Untuk mencegah sesi menggantung, jika waktu perjalanan telah melampaui "Estimasi Waktu Tiba Maksimal + Margin 80%", sistem akan menutup sesi secara paksa dan semua sisa peserta otomatis dianggap telah berstatus `Tiba`.
