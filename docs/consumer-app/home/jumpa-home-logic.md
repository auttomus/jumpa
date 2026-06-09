### Spesifikasi Alur Logika: "Jumpa Home & Discovery Engine"

Halaman Beranda pada aplikasi Jumpa dirancang bukan sekadar sebagai peta statis, melainkan sebagai mesin penemuan ( _Discovery Engine_ ) yang menghubungkan lokasi fisik, mitra bisnis (B2B), dan inisiasi sosial secara mulus.

Alur ini terbagi menjadi empat tahapan utama: Eksplorasi, Pencarian, Serah Terima Sosial, dan Eksekusi Sesi Ekspres.

#### 1. Fase Eksplorasi Pasif (Idle & Discovery State)

Fase ini terjadi seketika saat pengguna membuka aplikasi tanpa ada niat spesifik atau sesi yang sedang berjalan.

- **Render Peta Terkurasi:** Peta layar penuh tidak akan menampilkan semua tempat secara acak. Sistem akan menarik data dari _cache_ Redis berdasarkan _geohash_ area pengguna (misalnya, area Abiansemal atau sekitarnya). Peta hanya akan memunculkan _pinpoint_ eksklusif untuk tempat-tempat dari Mitra Bisnis yang sedang melakukan promosi, atau tempat dengan _rating_ algoritma tertinggi minggu ini.
- **Panel Inspirasi (Discovery Bottom Sheet):** Di bagian bawah layar, terdapat panel berisi daftar kartu rekomendasi tempat nongkrong bergaya _feed_ visual. Pengguna dapat menggulir kartu-kartu ini untuk melihat foto, nama tempat, dan tagar suasana (misal: "Cocok buat nugas", "Buka 24 Jam").
- **Interaksi Detail:** Jika pengguna menekan salah satu pin di peta atau kartu di panel inspirasi, sistem akan memunculkan lembar detail profil tempat tersebut, lengkap dengan ulasan, jam buka, dan foto galeri.

#### 2. Fase Pencarian Spasial-Tekstual (Active Search)

Ketika pengguna memiliki intensi spesifik dan menggunakan bilah pencarian ( _Search Bar_ ) yang melayang di atas peta.

- **Input Pengguna:** Pengguna mengetikkan kata kunci (contoh: "Kopi susu") atau nama tempat spesifik.
- **Kalkulasi Latar Belakang:** Sistem (melalui _API Gateway_ Rust) tidak hanya mencari kecocokan teks. Sistem membangun kotak batas radius spasial di sekitar titik GPS pengguna saat ini. Pencarian teks kemudian disilangkan dengan kedekatan jarak ( _PostGIS_ ) dan bobot prioritas kemitraan bisnis.
- **Penyajian Hasil:** Layar peta akan bergeser otomatis ( _auto-pan_ ) untuk menyorot hasil-hasil paling relevan dalam radius tersebut, dan panel inspirasi di bawah akan diperbarui secara instan untuk menampilkan rincian dari hasil pencarian tersebut.

#### 3. Fase Serah Terima Sosial (The Social Handoff)

Ini adalah jembatan yang menghubungkan layar penemuan tempat individual dengan aktivitas grup.

- **Pemicu Undangan:** Di setiap kartu detail tempat (baik dari eksplorasi maupun pencarian), terdapat satu tombol aksi utama yang sangat menonjol, misalnya **"Ajak Grup ke Sini"** .
- **Pemilihan Ruang Obrolan:** Saat ditekan, layar akan memunculkan daftar _overlay_ berisi riwayat obrolan grup maupun personal. Pengguna (sebagai Inisiator) memilih satu grup yang dituju.
- **Transisi Layar:** Antarmuka secara otomatis memindahkan pengguna dari halaman Beranda masuk ke dalam halaman ruang obrolan grup yang dipilih tersebut. Bersamaan dengan itu, sistem menembakkan sebuah **Kartu Undangan Destinasi** ke dalam arus _chat_ grup.

#### 4. Fase Sesi Ekspres (Direct Destination Session)

Sesi ini mengesampingkan kalkulasi algoritma titik tengah (`geom-median`) karena destinasi akhir sudah dikunci sejak awal oleh sang Inisiator dari halaman Beranda. Sesi ini memodifikasi siklus hidup sesi standar menjadi jalur cepat ( _Bypass_ ).

- **RSVP Wajib:** Meskipun tempat sudah ditentukan, kartu undangan di dalam _chat_ tetap mengharuskan semua anggota grup untuk memilih `Ikut` atau `Tidak Ikut`. Anggota yang ikut wajib memberikan titik awal lokasi mereka dan moda transportasi. Hal ini mutlak diperlukan sistem untuk menghitung batas waktu otomatis (ETA) dan merender garis panduan navigasi di tahap akhir.
- **Transparansi Lobi:** Panel indikator _Lobby Status Board_ tetap muncul di atas obrolan untuk memberikan informasi jumlah peserta yang sudah siap.
- **Mekanisme Veto yang Halus (Counter-Offer):** Untuk menghindari kediktatoran lokasi, anggota grup yang tidak setuju dengan tempat yang dipilih Inisiator memiliki opsi selain sekadar tombol `Tidak Ikut`. Terdapat opsi sekunder bertuliskan **"Cari Alternatif Lain"** .
  - Jika opsi ini ditekan oleh salah satu anggota, sistem akan secara otomatis membatalkan destinasi yang terkunci tersebut dan **mengubah Sesi Ekspres ini kembali menjadi Sesi Standar** .
  - Sistem kemudian akan meminta parameter _prompt_ dari Inisiator dan menjalankan algoritma pencarian titik tengah secara adil bagi semua orang.
- **Transisi Perjalanan (The Blackhole):** Jika tidak ada yang menggunakan hak veto dan semua anggota telah mengonfirmasi kehadiran, antarmuka obrolan akan langsung tersedot mengecil menjadi tombol bulat, menyingkap layar peta navigasi secara utuh. Sistem merender rute dari lokasi masing-masing anggota langsung menuju titik kafe yang disepakati, dan alur dilanjutkan ke pemantauan perjalanan hingga semua orang tiba di lokasi.
