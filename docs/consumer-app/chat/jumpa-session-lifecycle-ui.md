### Dokumen 2: Anatomi Antarmuka Berdasarkan Fase "Jumpa"

#### Fase 1: Inisiasi

_Tujuan Visual: Terlihat menonjol bagi pembuat, namun tidak mengganggu obrolan bagi yang lain._

- **Letak Tombol Pemicu:** Berada di dalam menu lampiran (ikon '+') di sebelah kolom ketik obrolan, bersanding dengan ikon Galeri dan Kamera. Nama menunya: **"📍 Sesi Jumpa"** .
- **Mekanisme _State_ (Jika dinonaktifkan):** Jika sudah ada sesi yang aktif, ikon "📍 Sesi Jumpa" **tidak dihilangkan, melainkan dihitam-putihkan (Greyed Out)** dan ditambahkan ikon gembok kecil. Jika ditekan, akan muncul notifikasi peringatan untuk menyelesaikan atau membatalkan sesi di obrolan lain terlebih dahulu. Hal ini menjaga _muscle memory_ pengguna agar tidak bingung mencari tombol yang hilang.
- **Aksi Visual:** Saat ditekan, sistem melemparkan sebuah **"Kartu Jumpa"** berukuran besar ke dalam arus obrolan.

#### Fase 2: RSVP & Negosiasi Kondisi

_Tujuan Visual: Memandu pengguna memasukkan data spasial secepat mungkin tanpa berpindah halaman._

- **Visual "Kartu Jumpa":** Kartu di obrolan ini memiliki dua tombol aksi yang sangat jelas: `Ikut` (Warna Primer/Solid) dan `Tidak Ikut` (Warna Sekunder/Garis Luar).
- **Interaksi _Bottom Sheet_ :** Saat menekan `Ikut`, layar tidak berpindah ke halaman baru. Sebuah Panel Bawah meluncur menutupi setengah ruang obrolan. Di panel ini terdapat peta mini untuk menggeser pin lokasi asal, ikon transportasi (🚗 🛵 🚶‍♂️), dan _dropdown_ "Klaim Kendala". Setelah dikonfirmasi, panel meluncur turun dan menghilang.
- **Visual "Lobby Status Board":** Muncul sebagai Kapsul Mengambang (Sticky Pill) di layar paling atas, tepat di bawah nama grup (misal: _"Menunggu: 3/5 Orang"_ ). Jika disentuh, panel memanjang ke bawah menampilkan daftar partisipan dan label **"⭐ Prioritas Jarak"** bagi yang mengklaim kendala.

#### Fase 3: Penguncian & Eksekusi Prompt

_Tujuan Visual: Memberikan ruang bagi Inisiator untuk mengetik secara paralel tanpa kehilangan konteks._

- **Letak Kolom _Prompt_ :** Khusus bagi Inisiator, area ketik obrolan normalnya berubah wujud menjadi **Composer Bar** khusus dengan tulisan _placeholder_ : `"Cari tempat yang..."`.
- **Transisi Tombol:** Tombol cari awalnya berisi indikator progres (contoh: `"2/5"`) dan berwarna abu-abu. Ketika semua RSVP terpenuhi, teks progres menghilang, tombol berubah warna menjadi _Solid Primary_ , dan memancarkan efek _Pulse_ (berdenyut halus) satu kali.
- **Visual Pembatalan:** Tombol `Batalkan Sesi` diletakkan sebagai teks kecil bergaris bawah ( _text-link_ ) di pojok kanan atas _Composer Bar_ agar tidak tertekan tanpa sengaja.

#### Fase 4: Voting (Transisi Blackhole)

_Tujuan Visual: Memberikan transisi spasial yang mulus dan imersif dari obrolan teks ke peta interaktif._

- **Animasi _Blackhole_ :** Saat hasil kandidat tempat ditemukan, antarmuka obrolan ( _chat detail_ ) tidak memicu _loading_ pindah halaman. Halaman obrolan justru mengecil dan tersedot dengan mulus layaknya animasi _window_ ke arah pojok kanan bawah layar. Animasi ini menyingkap Peta MapLibre/WebGL layar penuh yang selama ini sudah berada di latar belakang tanpa _navbar_ tambahan.
- **Laci Obrolan (Chat Drawer):** Area obrolan yang tersedot tadi berubah wujud menjadi tombol bulat mengambang (FAB) berikon _bubble chat_ di atas peta. Jika tombol ini ditekan, antarmuka obrolan akan meluncur naik kembali menutupi sebagian bawah peta. Pengguna bisa mengetik dan membaca pesan secara _seamless_ , lalu menggesernya ke bawah ( _swipe down_ ) agar tersedot kembali menjadi tombol bulat.
- **Interaksi Peta:** Peta menampilkan 5 pin kandidat. Saat pengguna menekan pin, panel detail meluncur dari bawah memunculkan nama, _rating_ , foto, dan tombol **"👍 Vote Tempat Ini"** . Indikator avatar teman akan muncul di atas pin secara _real-time_ jika mereka mem-_vote_ tempat tersebut.

#### Fase 5: Perjalanan & Drop-out

_Tujuan Visual: Memandu navigasi secara mulus di atas satu lapis peta utama._

- **Animasi Rute:** Setelah satu tempat memenangkan _voting_ , pin kandidat yang kalah dibersihkan dari layar. Peta merender garis rute perjalanan biru dari posisi pengguna menuju destinasi final.
- **Kartu Kendali Bawah:** Terdapat panel tipis di dasar layar peta yang menampilkan nama destinasi, estimasi waktu, dan tombol sekunder bertuliskan **`Keluar dari Pertemuan`** .
- **Mekanisme Tiba:** Tombol penyelesaian tidak selalu muncul untuk menjaga antarmuka tetap bersih. Begitu GPS mendeteksi pengguna masuk ke radius 50 meter dari tujuan, panel kendali tadi berubah wujud menampilkan tombol besar berwarna hijau menyala: **`✅ Selesaikan Pertemuan`** .

#### Fase 6: Terminasi

_Tujuan Visual: Penutupan yang jelas dengan mengembalikan layar ke status semula._

- **Transisi _Reverse Blackhole_ :** Saat sesi ditutup (sinkron maupun asinkron), peta menghilang, dan tombol _chat_ membesar kembali menyingkap antarmuka ruang obrolan 100% seperti sediakala.
- **Kapsul Riwayat:** Sistem menjatuhkan sebuah _Chat Bubble_ riwayat statis di dalam obrolan bertuliskan: `"✅ Sesi Jumpa telah selesai di [Nama Tempat]"`. Ikon inisiasi sesi terbuka kembali kuncinya dan siap digunakan di kemudian hari.
