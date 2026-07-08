# Dokumentasi Kebutuhan dan Spesifikasi Teknis (Requirements) - BI-BEGR Culture Dashboard (KONSOL BEGR)

Dokumen ini merangkum seluruh persyaratan teknis, pustaka/library yang digunakan, skema database Google Sheets, arsitektur data, skema warna, dan spesifikasi fungsionalitas cerdas pada proyek **BI-BEGR Culture Dashboard (KONSOL BEGR)**.

---

## 1. Arsitektur & Bahasa Pemrograman
- **Bahasa Utama:** TypeScript (TSX/TS)
- **Framework Antarmuka:** React 19 (Functional Components & Hooks)
- **Lingkungan Eksekusi Dasar:** Javascript Engine Browser (Client-side rendering)
- **Integrasi Backend:** Panggilan asinkronus dengan Google Apps Script (`google.script.run`) untuk Sinkronisasi Lembar Kerja (Spreadsheet) secara *real-time*. Seluruh sistem mendukung baca (GZIP base64 parser di *Web Worker*) dan tulis/hapus via transaksi atomik `Code.gs`.
- **Konfigurasi Dinamis (PENGATURAN UMUM):** Nama pengelola budaya kerja (admin) dan Judul Aplikasi ditarik secara dinamis dari ketetapan sheet `"PENGATURAN UMUM"`.
- **Bundler & Build Tool:** Vite (berjalan untuk menggabungkan seluruh hasil React ke dalam satu file HTML tunggal `Dashboard-for-Spreadsheet.html` yang siap di-hosting murni di Google Apps Script).

---

## 2. Struktur Database Google Sheets (`Code.gs` & `dataUtils.ts`)
Aplikasi mengelola 2 tabel/sheet utama dengan skema kolom terstruktur:

1. **`KONSOL BEGR` (Pangkalan Data Terkonsolidasi - 94 Kolom)**
   - Kolom No 1 - 6 (Data Master): `No`, `Kelompok Budker`, `Jenis`, `Kategori`, `RUBRIK`, `Satker Lengkap`
   - Kolom 7: `CULTURE MATURITY LEVEL` (Kalkulasi Rata-rata EVP K-L-M-N)
   - Kolom 8: `EVP KEPEMIMPINAN` (Rata-rata Sub-EVP K dan L)
   - Kolom 9: `EVP KELUARGA` (Sub-EVP M)
   - Kolom 10: `EVP KESEJAHTERAAN` (Sub-EVP N)
   - Kolom 11 - 14: Sub Indicator EVP Kepemimpinan P1 (K), P2 (L), Keluarga P1 (M), Kesejahteraan P1 (N)
   - Dampak Budaya & Kreativitas Pilar Kerja: `BI PRESTASI (AA)`, `BI DIGITAL (AM)`, `BI INOVASI (AZ)`, `BI SPIRITUAL P1 (BM)`, `BI SPIRITUAL P2 (BZ)` (Rata-rata BM & BZ = BI Spiritual)
   - Nilai Nilai Strategis (NNS) Keterlibatan, Kesesuaian EVP, dan Kesesuaian Bidang pada Program Budaya Kerja Bank Indonesia:
     - **SESPIOK X KPPTOP (BI Prestasi):** Keterlibatan (AD), Kesesuaian EVP (AE), Kesesuaian Pilar (AF), Average NNS (AQ)
     - **AKUKEREN X BTSYUK (BI Digital):** Keterlibatan (AN), Kesesuaian EVP (AO), Kesesuaian Pilar (AP), Average NNS (AQ)
     - **OBF (BI Inovasi):** Keterlibatan (BC), Kesesuaian EVP (BD), Kesesuaian Pilar (BE), NNS OBF (BF)
     - **3H X KEJORA (BI Spiritual P1):** Keterlibatan (BQ), Kesesuaian EVP (BR), Kesesuaian Pilar (BS), Skor Akhir (BN), Deep Dive Ind 1 (BO), Deep Dive Ind 2 (BP)
     - **PINTER X PASKEUN (BI Spiritual P2):** Keterlibatan (BT), Kesesuaian EVP (BU), Kesesuaian Pilar (BV), NNS 3H (BW)
   - Dampak Nilai-Nilai Strategis (NNS Core Values): `TRUST & INTEGRITY (CL)`, `PROFESSIONALISM (CM)`, `EXCELLENCE (CN)`, `PUBLIC INTEREST (CO)`, `COORDINATION & TEAMWORK (CP)`.

2. **`PENGATURAN UMUM` (Konfigurasi pengelola)**
   - `["Kunci", "Nilai", "Keterangan"]` mencakup Judul Aplikasi, Admin Budker, dan Target Maturity level.

---

### 3. Fitur Utama & Logika Bisnis (Core Business Logic)

### A. Modular Data Master Panel & Tabel Analitis
- **Bento Grid Telemetry (Tremor-Style)**: Menampilkan 4 panel rangkuman telemetri data satker terfilter secara langsung (jumlah satker, rata-rata skor CML, total memenuhi target, total bimbingan) menggunakan format visual Tremor yang konsisten dengan panah variansi tren.
- **Komponen Fungsional**: Pencarian multi-dimensi (Satker, Kelompok, Rubrik) dipadukan dengan filter dropdown HSL premium.
- **Visualisasi Progress Bar**: Penyajian skor Kematangan (CML) dan sub-EVP dilengkapi dengan grafik progress bar mini horizontal untuk memudahkan peninjauan.
- **Pengeditan 360-Derajat**: Modal intuitif untuk mengedit seluruh parameter satker dengan presisi slider bertingkat skala 1.00 - 4.00 lengkap dengan anotasi tingkat validasi.
- **Ekspor & Cetak**: Dukungan ekspor data ke Excel (xlsx), CSV, TXT, serta cetak langsung polosan kertas ramah tinta.

### B. Ringkasan Utama (Overview Executive Dashboard)
- **Overview KPI Cards (Tremor-Style)**: Menyoroti rata-rata tingkat kematangan CML di 3 lingkup strategis (BI Wide, Kantor Pusat, Perwakilan) serta target kelulusan minimum acuan, lengkap dengan indikator panah deviasi variansi (+/- vs target) dan metrik kepatuhan kelulusan unit (Compliance Rate).
- **Distribusi Kematangan CML**: Menyajikan chart batang bertumpuk (stacked bar chart) yang menggambarkan sebaran satker berdasarkan level kematangan: Aligned (Rose-Red), Engaged (Amber-Yellow), Enable (Green), dan Empower (Blue).
- **EVP & Pilar Budaya**: Visualisasi bar chart agregasi 3 dimensi EVP dan 4 pilar Kebijakan Budaya Kerja BI.
- **Top & Bottom Performers**: Daftar real-time Satker berkinerja tertinggi (Top 3) dan butuh akselerasi (Bottom 3).

### C. Sub-Dashboard Analisis Komparatif (Ranking Dashboard)
- **Filter Fleksibel**: Menyediakan filter cakupan (BI Wide, KP Wide, KPw Wide), Kelompok Budker, serta Dimensi Pemeringkatan (CML, EVP, Pilar Budaya).
- **Pemeringkatan Otomatis**: Tabel yang meng-rank Satuan Kerja secara dinamis berdasarkan parameter terpilih lengkap dengan indikator highlight Top 5 (Emerald) dan Bottom 5 (Rose).
- **Aksi Cepat**: Dilengkapi fitur cetak langsung (Print Layout) dan ekspor data CSV ber-index dinamis.

### D. Sub-Dashboard Analisis Detail Per-Satker (Deep-Dive Dashboard)
- **Dropdown Searchable**: Mempermudah memilih satu di antara puluhan Satker untuk diulas secara komparatif 360-derajat.
- **Speedometer Kematangan**: Visualisasi radial ring progresif skor CML lengkap dengan badge tingkat kelulusan dinamis (merah/kuning/hijau/biru).
- **Komparasi Nasional & Peer**: Menunjukkan penyimpangan (deviasi di atas/di bawah) skor Satker aktif dibandingkan dengan rata-rata nasional BI Wide dan rata-rata satker sejenis (peer group).
- **Radar Program Dinamis**: Peta radar yang merefleksikan pergerakan atau dinamika skor di 4 sesi program strategis: SESPIOK, AKUKEREN, OBF, dan 3H X KEJORA.
- **NNS Core Values Impact:** Bar horizontal dampak nilai strategis (Trust & Integrity, Professionalism, Excellence, Public Interest, Coordination) selaras warna CML.

### E. Konfigurasi Pengaturan Sistem (Settings)
- **Preferensi Utama**: Mengubah Judul Aplikasi dan Admin Budker (Divisi Pembina) secara dinamis. Input visual "Batas Kelulusan Target (Target Maturity)" ditiadakan dari UI untuk menyederhanakan halaman pengaturan, namun variabelnya tetap digunakan sebagai filter dan pembanding latar belakang dengan nilai statis default `4.00`.
- **Database Reinitializer**: Tombol untuk membangun ulang pangkalan data (sheet spreadsheet `"KONSOL BEGR"` dan `"PENGATURAN UMUM"`) ke bentuk awal yang bersih dengan sample data.

### F. Halaman Laporan KPI Konsolidasi (Executive Report)
- **Executive KPI Cards**: Menyediakan 4 kartu indikator makro utama:
  1. *Average Maturity Level (CML)*: Rata-rata kematangan budaya yang dibandingkan secara otomatis terhadap ambang batas kelayakan nasional.
  2. *Compliance Rate (% Target)*: Persentase keandalan satker yang sukses melampaui batas target maturity level.
  3. *Average Engagement Score*: Skor rata-rata indeks keterlibatan atau partisipasi budaya dari satker terpilih.
  4. *Average NNS Impact*: Rata-rata skor indeks dampak Nilai-Nilai Strategis (NNS) yang merefleksikan kontribusi budaya kerja.
- **Matriks Dimensi Strategis (EVP vs Pilar)**: Grafik batang (Bar Chart) terintegrasi yang membandingkan performa rata-rata 3 sub-EVP dan 4 pilar budaya kerja Bank Indonesia secara berdampingan untuk analisis komprehensif, dilengkapi dengan Reference Line target acuan horizontal. Dilengkapi segmented control interaktif ("Semua Dimensi", "Hanya EVP", "Hanya Pilar"), gradien bar kustom (warm gold untuk EVP & corporate indigo untuk Pilar), indikator garis batas target kelulusan yang dipertegas, serta ringkasan analisis cerdas 3-kolom otomatis (Dimensi Terkuat, Area Prioritas Pendampingan, dan Deviasi vs Target) di bawah grafik.
- **Komposisi Klasifikasi Kematangan**: Visualisasi ringkas diagram progress bar horizontal yang merangkum persentase sebaran satker pada 4 klasifikasi kematangan (*Aligned*, *Engaged*, *Enable*, *Empower*).
- **Performa Championship Program**: Tabel ringkasan yang merekapitulasi performa 5 program andalan (SESPIOK, AKUKEREN, OBF, 3H, PINTER) dalam bentuk skor pencapaian rata-rata dan rasio partisipasi.
- **Sorotan Eksekutif Kinerja Satker (Top & Bottom 3)**: Daftar dinamis yang menyajikan Top 3 Satker berkinerja terbaik sebagai teladan (*Culture Champions*) dan Bottom 3 Satker sebagai unit prioritas pendampingan budaya kerja.
- **Penyaring Cakupan (Interactive Scope Filter)**: Tombol pemilih cakupan (BI Wide, Kantor Pusat, Kantor Perwakilan) yang secara instan merender ulang data dan analisis pada halaman laporan secara asinkron.

---

## 4. Struktur Navigasi & Tata Letak Premium (Top-Navbar Architecture)
Aplikasi mengadopsi tata letak modern **Horizontal Top-Navbar 2-Baris** yang meluas (Full-Width Viewport) tanpa Sidebar samping:
- **Baris 1 (Header Panel Utama):** Menampung Brand Identity (Logo + Judul Aplikasi dinamis ditarik dari "PENGATURAN UMUM"), Nama Satker aktif yang informatif, kolom pencarian cepat instan, tombol sinkronisasi spreadsheet manual dengan status log waktu sinkronisasi terakhir, serta sakelar mode tema terintegrasi.
- **Baris 2 (Segmented Sub-Navbar):** Penampilan horizontal menu tab berbasis kategori yang estetik:
  1. **Ringkasan Utama** (`overview`)
  2. **Data Master KONSOL** (`data-begr`)
  3. **Konfigurasi Pengaturan** (`settings`)
- **Dropdown Ekspor/Impor Terpusat:** Menawarkan pilihan format asinkron (Excel, CSV, TXT) yang secara otomatis mengekstrak data dari tab halaman aktif pasca-build.

---

## 5. Sistem Warna & Desain UI (Color System)
Desain mengadopsi estetika maskulin, tenang, berkontras tinggi khas perkantoran modern (*Swiss Functional*):
- **Mode Terang (Light Mode):** Mempergunakan latar belakang putih salju (`#f8fafc`), dipadukan dengan tipografi slate gelap pekat untuk keterbacaan yang kokoh.
- **Mode Gelap (Dark Mode):** Desain beralih murni menggunakan nuansa elegan slate gelap (`slate-950`), beraksen border abu tipis, layout kartu dalam rona solid (`slate-900`), dan visualisasi charts Recharts yang kontras.
- **Tipografi Konsisten:** Penggunaan font `"Plus Jakarta Sans"` sebagai prioritas utama (`--font-sans`) di seluruh dashboard, memastikan penyeragaman visual yang senada antara judul dashboard, navigasi, tabel data master, dan legenda/label grafik.

---

## 6. Penanganan Error & Stabilitas Antarmuka (Pembaruan Juni 2026)
- **Import Validasi Ikon Lucide:** Seluruh ikon navigasi dan ornamen SVG diimpor secara eksplisit dari `lucide-react` (termasuk ikon `Target` untuk visualisasi penanda target kelulusan) guna mencegah kegagalan interpretasi variabel global (`ReferenceError: Target is not defined`) pada lingkungan *production build* browser lawas.
- **Penyelarasan Skala Header:** Pembesaran ukuran teks judul dasbor (`appTitle`) dan administrator program (`adminUser`) di layout utama menggunakan kelas font dinamis (`text-lg sm:text-2xl` & `text-xs sm:text-sm`) serta peningkatan fleksibilitas penampung (`max-w-xs sm:max-w-md`) untuk menjamin visualisasi teks yang lengkap dan nyaman dilihat.
- **Penyelarasan Skala Ikon Navbar:** Pembesaran ukuran ikon navigasi (`w-4.5 h-4.5`) dan utilitas (`w-4.5 h-4.5` / `w-4 h-4`) untuk mengimbangi skala tipografi tajuk utama dasbor.
- **Penyelarasan Tipografi Angka KPI:** Seluruh angka statistik dan indikator deviasi pada kartu KPI disinkronkan dengan tumpukan font utama `"Plus Jakarta Sans"` dengan mengubah kelas `font-mono` menjadi `font-sans` di seluruh modul dasbor.
- **Spesifikasi Palet Mode Gelap Premium:** Mengganti warna mode gelap ungu cerah menjadi skema Slate-Oceanic bertaraf korporat dengan background karbon pekat (`#050811`), kartu navy gelap (`#0a0f1d`), border slate muted (`#162032`), dan teks putih abu dingin (`#f1f5f9`).
- **Standardisasi Format Judul Visualisasi:** Seluruh tajuk visualisasi grafik/bagan diubah menjadi format **Proper Case** dengan bobot ketebalan **`font-bold`** (bold), serta melucuti seluruh ornamen ikon dekoratif di samping judul demi tampilan yang bersih (*flat-minimalist*).
- **Spesifikasi Bayangan Kontainer Visual:** Penguatan bayangan kontainer visual (`shadow-xs` hingga `shadow-lg`) secara global untuk efek melayang (*floating card*), serta pembubuhan bayangan opasitas tinggi (hingga 90%) khusus di bawah pemilih `.dark` guna mengimbangi intensitas kegelapan latar belakang halaman.
- **Spesifikasi Desain Peringkat Top 3 & Bottom 3 Minimalis:** Desain kartu peringkat Top 3 Satker Kematangan dan Bottom 3 Satker (Butuh Akselerasi Budbud) diubah sepenuhnya dengan pendekatan tipografi modern ber-watermark indeks angka besar (`01`, `02`, `03`) beropasitas rendah, label penanda formal (`PERINGKAT I (UTAMA)`, `PERINGKAT II`, `PERINGKAT III` / `PRIORITAS I (KRITIS)`, `PRIORITAS II`, `PRIORITAS III`), serta memelihara kesederhanaan visual dengan meniadakan komponen progress bar pencapaian, serta tanpa menyertakan ikon medali, piala, atau lingkaran nomor sirkular tebal.
- **Spesifikasi Optimasi Radar Dampak NNS:** Mengubah skema dimensi box agar setara dengan modul Top/Bottom 3 (simetris), menyederhanakan gridline dengan opasitas stroke rendah, mengaplikasikan warna stroke amber solid `#f59e0b` dengan opasitas pengisian 12% pada area radar, serta mengimplementasikan panel tooltip gelap kustom dengan pembatas tipis.
- **Spesifikasi Desain Sebaran Distribusi CML Tabular:** Mengimplementasikan visualisasi tabular berbasis status tab aktif (BI Wide, Kantor Pusat, Kantor Perwakilan). Tombol tab merangkap sebagai ringkasan telemetri unit lulus, merender diagram batang minimalis tersegregasi per level kematangan (Aligned, Engaged, Enable, Empower) dengan spektrum warna yang konsisten, dan melampirkan daftar proporsi numerik dan persentase di bawahnya.
- **Spesifikasi Desain Rata-Rata EVP & Pilar Berpembanding:** Menambahkan fitur Switch/Toggle interaktif di bagian bawah kartu untuk mengaktifkan visualisasi komparasi berdampingan (*side-by-side*) antara pencapaian aktual (Skor Aktual) dan target kelulusan (Target Acuan) pada diagram batang. Ketika dinonaktifkan, chart merender satu batang skor aktual dengan garis batas acuan target horizontal (Reference Line) pada sumbu Y.
- **Spesifikasi Ukuran Font Visualisasi:** Menaikkan ukuran font parameter grafik secara merata (sumbu X/Y, label sumbu, legenda, tooltip) sebesar 1.5 - 2px di seluruh komponen visualisasi utama (`OverviewView.tsx` dan `SatkerDetailView.tsx`) untuk memastikan keterbacaan data yang tinggi dan ramah pengguna.
- **Spesifikasi Skala Font Subtitle, Teks Biasa & Tata Letak Radar NNS (Pembaruan Juni 2026):** Ukuran font subtitle/deskripsi kartu ditingkatkan secara global menjadi `text-[13px]`, font deskripsi mini menjadi `text-xs` (12px), judul kartu menjadi `text-base font-extrabold text-slate-855`, serta teks footer Quick Redirect menjadi `text-[15px]` untuk keterbacaan optimal. Penataan grid bawah menggunakan layout 2-kolom (`grid-cols-1 lg:grid-cols-2 gap-6`) yang menyandingkan **Top 3 Satker** dan **Butuh Akselerasi Budbud** secara berdampingan di baris paling bawah demi ruang horizontal ekstra luas guna meminimalkan pemotongan nama unit.
- **Spesifikasi Penjajaran Simetris Grid Analitik (Pembaruan Juni 2026):** Penataan visualisasi analitik makro dibagi menjadi dua baris grid horizontal mandiri (`grid-cols-1 lg:grid-cols-2 gap-6`) di dalam kontainer induk. Baris pertama menyandingkan **Sebaran Distribusi Level Kematangan CML** dengan **Rata-Rata EVP & Pilar Budaya Kerja**. Baris kedua menyandingkan **Radar Dampak NNS** secara sejajar horizontal dengan **Komparasi Kematangan KP vs KPw**. Penjajaran ini mengeliminasi perbedaan tinggi akumulatif kartu sehingga menjamin garis batas atas kedua bagan di baris kedua berada pada posisi yang sejajar secara presisi dan estetis (McKinsey/BCG standard).
- **Spesifikasi Redesain Model Tremor Komparasi Kematangan (Pembaruan Juni 2026):** Visualisasi **Komparasi Kematangan KP vs KPw** diredesain menyerupai komponen premium Tremor UI. Kartu menyematkan ringkasan metrik statistik horizontal yang menampilkan nama kategori (Kantor Pusat/Kantor Perwakilan), total unit (Satker), serta badge persentase kelulusan target acuan secara dinamis di atas bagan batang. Legenda internal Recharts dinonaktifkan demi meningkatkan rasio data-ink.
- **Spesifikasi Redesain Footer Quick Redirect (Pembaruan Juni 2026):** Panel pengarah navigasi cepat pada footer halaman Beranda diredesain dengan meniadakan warna amber kuning pekat dan ikon bohlam berkedip. Layout baru menggunakan gradasi Slate tipis (`bg-gradient-to-r from-slate-50 to-slate-100/70`), ikon `Compass` statis berwarna indigo, teks instruksi navigasi formal, serta meniadakan seluruh karakter pembungkus markdown literal (`**`) dalam string JSX dengan tag HTML `<strong>` kustom untuk mengoptimalkan impresi profesionalitas bertaraf eksekutif.
- **Spesifikasi Pemadatan Dimensi Kartu KPI (Pembaruan Juni 2026):** Kartu-kartu KPI utama pada baris atas Beranda dirampingkan dimensinya. Padding kartu dikurangi dari `p-5` menjadi `py-4 px-4.5`, ukuran font statis angka utama diturunkan dari `text-3xl` menjadi `text-2xl`, serta mempersempit margin vertikal internal menjadi `mt-1` dan `mt-3` guna menghemat ruang layar dan menciptakan visualisasi yang lebih padat (*compact*).
- **Spesifikasi Redesain Panel Penyaringan Peringkat (Pembaruan Juni 2026):** Panel filter di halaman Peringkat Satker diredesain untuk menyuguhkan antarmuka yang bersih dan teratur. Meliputi penambahan garis pembatas judul tipis (`border-b border-slate-100`), penataan ulang jarak vertikal yang proporsional untuk mencegah penumpukan teks dengan elemen filter, serta menyeragamkan warna aktif seluruh tombol slicer (Scope Wilayah dan Kategori Penilaian) menjadi **Amber pekat (`bg-amber-500`)** guna mencapai konsistensi visual identitas dasbor utama.
- **Spesifikasi Dropdown Kustom Sub-Group Organisasi (Pembaruan Juni 2026):** Mengganti select box Sub-Group Organisasi bawaan yang kaku dengan komponen React Dropdown Kustom. Tombol pemicu dilengkapi ikon chevron yang berputar dinamis saat menu dibuka, overlay penutup klik-luar (`fixed inset-0`), dan list menu absolute melayang dengan style rounded-xl, bayangan dalam (`shadow-lg`), serta aksen hover/selected amber (`bg-amber-500/10`) demi estetika premium.
- **Spesifikasi Cetak Laporan Berkualitas Tinggi (Pembaruan Juni 2026):** Mengganti mekanisme cetak langsung bawaan browser (`window.print()`) dengan teknik capture layar resolusi tinggi menggunakan pustaka `html2canvas` pada skala `2.5x`. Dasbor secara otomatis menyembunyikan navbar, tombol navigasi, menu pengaturan, status sinkronisasi, dan elemen interaktif lainnya (non-konten) saat tombol Cetak Laporan diklik. Elemen konten utama (`#main-content`) ditangkap sebagai gambar PNG beresolusi tinggi, kemudian dimuat secara dinamis ke dalam cetakan iframe landscape A4 tanpa batas margin (0 margin), sehingga menghasilkan dokumen PDF/Cetak yang rapi, tajam, dan bebas dari distorsi CSS print layout browser.
- **Spesifikasi Optimalisasi Siklus Hidup React & Pengalaman Pembaruan Asinkron (Pembaruan Juni 2026):** Menangani masalah kelemahan refresh *real-time* dengan memicu pemasangan ulang (*re-mounting*) view menggunakan implementasi `key={tick}` dinamis. Hal ini memaksa perenderan ulang antarmuka (UI Re-render) seketika setelah sinkronisasi data *backend* berhasil terambil tanpa perlu navigasi keluar halaman.
- **Spesifikasi Transisi Pemrosesan (Loading State) di Halaman Beranda (Pembaruan Juni 2026):** Menghilangkan kemunculan prematur layar peringatan "Database Kosong" saat sistem dalam fase asinkron inisialisasi awal, digantikan dengan animasi indikator progres melingkar ("*Memuat Database...*") demi menjaga profesionalitas tampilan (Standar UI Enterprise).
- **Spesifikasi Penyelarasan Nama Tabel Induk (Pembaruan Juni 2026):** Mengubah *hard-coded reference* di dalam parameter evaluasi (`Code.gs`) yang sebelumnya merujuk pada format *snake_case* `"KONSOL_BEGR"` menjadi spasi nominal murni `"KONSOL BEGR"`. Hal ini mencegah kegagalan *parsing* indeks baris akibat ketidakselarasan string kueri dan skema data.
- **Spesifikasi Modus Monitoring Analitik - Read-Only (Pembaruan Juni 2026):** Mentransformasi antarmuka Data Master Konsol (`BeforeTripView.tsx`) dengan membedah lepas arsitektur penyuntingan dua arah (Tombol Edit, Tombol Tambah, Modal Form Input, Fungsi Simpan). Aplikasi diproklamirkan murni sebagai *Read-Only Monitoring Dashboard*. Segala interaksi penyuntingan disentralisasi eksklusif ke lembar kerja (spreadsheet), mendongkrak durabilitas dan mencegah bentrok kueri pada formula berlapis.
- **Spesifikasi Proteksi Penyelarasan Baris & Perhitungan Fallback Otomatis (Pembaruan Juni 2026):** Melindungi data dashboard dari pembacaan baris header literal dan baris kosong di bagian atas spreadsheet dengan menyematkan sistem filter defensive di `dataUtils.ts` (mengabaikan baris dengan ID non-numerik atau nama satker kosong/header). Selain itu, diintegrasikan pula kalkulasi fallback client-side otomatis yang menghitung nilai EVP dan CML langsung dari data pilar mentah jika kolom-kolom formula di dalam Google Sheets dibaca dalam keadaan kosong.
- **Spesifikasi Arah Pengurutan Tabel Peringkat (Pembaruan Juni 2026):** Mengintegrasikan selektor arah urutan (*slicer sortOrder*) interaktif (Ascending/Descending) pada panel filter `RankingView.tsx` dengan membagi kisi layout filter menjadi 4-kolom. Agar semantik data tetap presisi, visualisasi warna penanda performa (*isTop5* sebagai emerald dan *isBottom5* sebagai rose) serta kartu eksekutif KPI utama dihitung menggunakan pemeringkatan skor absolut tanpa terpengaruh oleh arah pengurutan tampilan tabel.
- **Spesifikasi Penempatan Filter Arah Urutan Skor di Kontainer Tabel (Pembaruan Juni 2026):** Memindahkan segmented control arah urutan skor (Tertinggi ke Terendah / Terendah ke Tertinggi) dari panel penyaringan atas langsung ke dalam header kontainer tabel peringkat utama (`RankingView.tsx`), bersandingan dengan tombol "Cetak" dan "Ekspor CSV". Panel filter atas diselaraskan kembali menjadi grid 3-kolom yang lebih lapang, sementara pengguna mendapatkan pengalaman interaktif yang lebih ergonomis karena filter arah urutan letaknya bersebelahan langsung dengan data tabel yang diurutkan.
- **Spesifikasi Interaktivitas Sumbu Y Dinamis Grafik Rata-Rata EVP & Pilar (Pembaruan Juni 2026):** Visualisasi *Rata-Rata EVP & Pilar Budaya Kerja* (`OverviewView.tsx`) dilengkapi dengan opsi sumbu Y yang dinamis (*Auto Fit*). Sumbu Y tidak lagi terikat kaku pada angka `0-5`, melainkan dapat dizoning secara dinamis melalui formula `[dataMin - 0.2, dataMax + 0.2]` dengan batas aman minimal `0`. Pilihan ini dioperasikan secara interaktif via switch toggle *"Skala Sumbu Y Dinamis (Auto Fit)"* pada footer kartu visualisasi, membantu analis mengevaluasi variansi data berskor kecil dengan visual yang tajam tanpa kehilangan opsi perbandingan absolut target acuan.
- **Spesifikasi Redesain Premium Baris Tabel Peringkat Satker (Pembaruan Juni 2026):** Modifikasi visual pada baris tabel peringkat satker (`RankingView.tsx`) untuk mencapai estetika *Swiss Functional* modern:
  - **Badge Jenis Semi-Transparan:** Badge penunjuk jenis satuan kerja menggunakan skema warna semi-transparan dengan border yang sangat halus. Jenis `KP` menggunakan tema indigo (`bg-indigo-50/70 text-indigo-600 border-indigo-100/40`), sedangkan jenis non-KP/KPw menggunakan tema amber (`bg-amber-50/70 text-amber-600 border-amber-100/40`).
  - **Nested Progress Bar Bergradien:** Mengganti bar satu warna sederhana dengan sistem *nested progress bar* yang presisi (kontainer luar `bg-slate-100/70 p-[1px] border border-slate-200/50` yang membungkus bar indikator di dalamnya). Warna indikator diisi dengan gradien warna modern (`bg-gradient-to-r`) seperti emerald-ke-teal (Top 5 Performer) dan rose-ke-orange (Bottom 5 Performer).
  - **Tipografi Skor Premium:** Digit skor aktif menggunakan font utama `font-sans` dengan ketebalan `font-extrabold`, perataan numerik `tabular-nums`, serta perampingan spasi huruf `tracking-tight` untuk kesan kokoh dan formal.
- **Spesifikasi Redesain Header Konsolidasi Data Master (Pembaruan Juni 2026):** Modifikasi estetika panel tajuk Data Master (`BeforeTripView.tsx`) untuk visualisasi status pemantauan yang lebih mewah:
  - **Status Badge Read-Only Pulsating:** Memindahkan teks keterangan "(Read-Only)" menjadi komponen badge melayang formal (`bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200/50`) yang dilengkapi dengan indikator titik beranimasi detak (*pulsating dot* indigo) untuk memberikan nuansa antarmuka yang hidup.
  - **Penyempurnaan Struktur Tipografi:** Peningkatan skala teks judul dengan format minimalis tight (`text-[17px] font-black tracking-tight leading-none text-slate-900`) serta restrukturisasi teks deskripsi agar terdengar formal dan sesuai standar eksekutif B2B Bank Indonesia.
- **Spesifikasi Redesain Tooltip Grafik Kustom Bergaya Tremor (Pembaruan Juni 2026):** Modifikasi pada seluruh tooltip visualisasi grafik (`custom-tooltip.tsx`) agar menyerupai standar desain Tremor UI:
  - **Struktur Bar Warna Vertikal:** Indikator kategori di dalam tooltip diwakili oleh garis warna vertikal tipis (`w-1`) di sisi kiri baris, yang diselaraskan dengan warna visual batang/radar pada grafik terkait.
  - **Tata Letak Informasi Terstruktur:** Setiap baris informasi menyajikan nama kategori dalam format huruf besar (`uppercase text-[10px] tracking-wider`) di atas nilai numerik yang tebal (`font-black text-xs text-slate-855`).
  - **Integrasi Global & Integrasi Persentase:** Diterapkan secara universal pada 7 grafik analitik di `OverviewView.tsx` dan `SatkerDetailView.tsx`. Pada bagan sebaran CML, tooltip dilengkapi dengan perhitungan persentase dinamis (`percentage`) di samping nilai jumlah satuan kerja.
- **Spesifikasi Redesain Filter Bar Bergaya Tremor Select (Pembaruan Juni 2026):** Restrukturisasi seluruh panel filter pada `BeforeTripView.tsx` dan `RankingView.tsx` agar selaras dengan desain Tremor Select:
  - **Desain Label Elegant:** Menghapus label model uppercase tracking-widest yang kaku, diganti dengan label teks formal (`text-xs font-semibold text-slate-800 dark:text-slate-100`).
  - **Desain Pemilih (Select Trigger) Premium:** Pemilih data dirancang menggunakan latar belakang solid putih/slate-900 (`bg-white dark:bg-slate-900`) dengan border tegas abu-abu (`border-slate-200 dark:border-slate-800`) dan drop-shadow mikro (`shadow-xs`), serta didukung dengan fokus pendaran warna emas/amber (`focus:ring-amber-500/20 focus:border-amber-500`).
  - **Ikon Chevron Terpadu:** Mengganti ikon filter konvensional dengan ikon penunjuk `ChevronDown` yang bersih dan selaras di sisi kanan dropdown.
- **Spesifikasi Kinerja CP Averages, Opsi Batas Ranking, dan Detail CP per Satker (Pembaruan Juni 2026):** Penambahan tiga fitur pelaporan taktis baru pada dasbor budaya KONSOL BEGR:
  - **Rata-rata CP Nasional:** Halaman `OverviewView.tsx` menyajikan grafik batang dan tabel komparasi nilai rata-rata nasional untuk 5 Championship Program kebudayaan utama (SESPI OK, AKU KEREN, OBF, 3H, PINTER).
  - **Batas Peringkat Dinamis:** Halaman `RankingView.tsx` menyediakan kontrol dinamis bagi pengguna untuk membatasi tampilan peringkat satuan kerja antara `Top 5` dan `Top 12` secara interaktif di baris header tabel.
  - **Detail Komponen CP per Satker:** Halaman `SatkerDetailView.tsx` menyediakan dropdown untuk memilih CP aktif dan memvisualisasikan seluruh dimensi internal CP terpilih (Skor Akhir, Persona, Reality Check [jika ada], Keterlibatan, EVP, Pilar, NNS) dalam format grafik batang horizontal yang interaktif.
- **Spesifikasi Pembersihan Karakter Aneh dan Spasi Kosong (Pembaruan Juni 2026):** Implementasi pembersihan defensif pada parser data teks (`dataUtils.ts` -> `cleanString`):
  - **Penyaringan Spasi & Karakter Khusus:** Data teks masukan (satkerLengkap, kelompokBudker, jenis, kategori, rubrik) dibersihkan dari spasi kosong ganda, zero-width spaces, non-breaking spaces, dan karakter aneh non-standar (hanya mempertahankan karakter standar `[a-zA-Z0-9\s.,()\-/\&@]`).
  - **Penghapusan Opsi Kosong Saringan:** Seluruh input kategori yang kosong atau tersaring menjadi string kosong (`""`) secara otomatis dieksklusi dari opsi filter dropdown (`uniqueKelompoks`, `uniqueRubriks`, `uniqueKategoris`, `uniqueSubGroups`) melalui penyaringan Boolean di React, mencegah opsi kosong yang mengganggu visual.
- **Spesifikasi Eliminasi Indikator Waktu Sinkronisasi (Pembaruan Juni 2026):** Penyederhanaan tampilan header pada `Layout.tsx` dengan menghapus visualisasi jam digital sync (`lastSync`) di sebelah tombol "Sinkronisasi" untuk menjaga kerapian tata letak bilah navigasi atas.
- **Spesifikasi Navigasi Desktop Sidebar Samping Kiri (Pembaruan Juni 2026):** Restrukturisasi tata letak navigasi utama (`Layout.tsx`) dari bar horizontal atas menjadi sidebar samping kiri pada resolusi desktop (`lg` ke atas):
  - **Desain Kontainer Melayang Tetap (Fixed Overlay Sidebar):** Sidebar didesain melayang dengan posisi tetap (`fixed left-4 top-4 bottom-4 z-30`) setinggi layar dikurangi margin 16px. Sidebar memiliki properti akselerasi hardware `will-change-[width]` dan batas potong `overflow-hidden` konstan untuk menjamin transisi lebar berjalan mulus pada 60 FPS.
  - **Mekanisme Tanpa Pergeseran Layout (No Layout Shift):**
    - Kontainer utama kanan memiliki margin kiri statis `lg:ml-24` (96px) untuk memberikan ruang bagi sidebar kolaps (`w-20` + `left-4`).
    - Saat sidebar dibuka (`w-72 xl:w-80`), lebar konten utama kanan tetap konstan (tidak menggeser dashboard), melainkan sidebar melebar secara overlay melayang di atas konten utama dengan bayangan tegas `shadow-2xl` dan border `border-white/10`. Hal ini mengeliminasi proses reflow visual dasbor dan meningkatkan performa rendering.
  - **Dimensi Lebar Dinamis:** Lebar sidebar bernilai dinamis `w-72 xl:w-80` ketika dibuka (teks label langsung terlihat) dan menyusut menjadi `w-20` ketika ditutup (hanya ikon saja yang terlihat). Sidebar tidak pernah disembunyikan sepenuhnya ke lebar `w-0` di desktop.
  - **Pemfokusan Visual Tengah (Collapsed Centering):** Ketika sidebar menyusut, letak ikon navigasi diatur secara otomatis ke posisi tengah (`justify-center px-0`) dengan keterangan melayang (*tooltip* bawaan).
  - **Toolbar Atas Multi-Fungsi:** Sisi kanan atas halaman memuat bilah menu horizontal putih/slate-900 yang menampung judul halaman aktif, kolom pencarian cepat, tombol aksi cetak/sinkronisasi/cadangan data, dan notifikasi.
- **Spesifikasi Penyelarasan Ikon & Animasi Transisi Sidebar Saat Disembunyikan (Pembaruan Juni 2026):** Ketika label navigasi pada sidebar disembunyikan (`showLabels` bernilai `false`), seluruh elemen visual di dalam sidebar diselaraskan ke posisi tengah secara simetris di desktop.
  - **Ikon Utama Database:** Menggunakan ikon `Database` berwarna amber pekat untuk melambangkan pangkalan data konsolidasi budaya kerja yang kokoh dan solid.
  - **Pensejajaran Vertikal Judul & Subtitel (Brand Identity):** Teks judul utama (`appTitle`) dan subjudul (`adminUser`) dibungkus bersama dalam satu kontainer kolom flex (`flex flex-col`) di sebelah kanan ikon `Database` untuk memastikan batas kiri teks judul dan subtitel sejajar secara vertikal.
  - **Transisi Kolaps Halus:** Kontainer teks judul/subtitel menggunakan transisi visual CSS terkelola (`transition-all duration-300`):
    - Saat dibuka: ikon `Database` (`w-5 h-5`) dan teks rata kiri secara rapi dengan gap 12px (`gap-3`).
    - Saat ditutup: ikon `Database` rata tengah secara geometris, sedangkan kontainer teks judul dan subjudul memudar (`opacity-0 max-w-0`) secara mulus.
  - **Animasi Transisi Lebar Teks Anak (Layout Isolation):** Seluruh elemen teks navigasi, grup menu, dan teks tema di footer mengoperasikan transisi lebar maksimum (`transition-all duration-300` dengan `max-w-0 overflow-hidden` saat ditutup, dan `max-w-[220px]/max-w-[150px]` saat dibuka) serta opasitas. Hal ini memastikan teks tidak memakan ruang tata letak sama sekali ketika sidebar dikolaps, menjaga ikon tetap terpusat secara geometris, dan melenyapkan scrollbar horizontal yang tidak diinginkan.
  - **Garis Pembatas Kategori Navigasi (Horizontal Divider):** Untuk memberikan pembagian spasial yang jelas antar-kategori menu navigasi dan menghindari kesan ikon "tidak rata tengah" ketika teks kategori disembunyikan, disematkan garis pembatas horizontal tipis (`border-t border-white/5 pt-4 mt-4`) di bagian atas setiap kategori menu mulai dari grup kedua (`index > 0`).
  - **Tombol Menu Tunggal Terintegrasi (Relokasi ke Sidebar):** Tombol Menu toggle (garis 3) dipindahkan sepenuhnya dari toolbar atas ke dalam header sidebar melayang kiri untuk mengeliminasi konflik tumpang tindih visual:
    - Saat dibuka (Expanded): tombol Menu diletakkan di sisi kanan atas header sidebar (`justify-between`), bersandingan secara horizontal dengan logo `Database` dan teks identitas.
    - Saat ditutup (Collapsed): teks identitas dan logo `Database` disembunyikan, menyisakan tombol Menu saja di posisi rata tengah (`justify-center`).
  - **Judul & Deskripsi Dinamis pada Header Pane:** Bagian header pane (toolbar kanan atas) tidak lagi menampilkan judul aplikasi secara statis, melainkan menyajikan informasi dinamis berikut sesuai tab halaman aktif:
    - **Judul Utama**: Menampilkan nama halaman aktif (misalnya `"Overview BI Wide"`, `"Dashboard Ranking"`, dll.).
    - **Subjudul / Deskripsi**: Menampilkan deskripsi fungsional dari halaman aktif tersebut (misalnya `"Analisis Makro Tingkat Kematangan Budaya Kerja Nasional Bank Indonesia"` saat berada di halaman Overview) untuk memberikan konteks instan bagi pengguna.
  - **Pencegahan Overflow Tombol Kanan (Responsivitas Header Pane):** Untuk mencegah tombol-tombol kanan (khususnya tombol "Cadangan") terdorong keluar dari kontainer ketika sidebar kiri dibuka di desktop, diimplementasikan optimasi responsif berikut:
    - **Search Bar Tengah Fleksibel:** Lebar kontainer search bar diatur agar menyusut secara fleksibel pada layar sedang (`max-w-[150px] lg:max-w-[200px] xl:max-w-xs 2xl:max-w-sm w-full transition-all duration-300`) disertai kelas `truncate` pada placeholder teks.
    - **Penyembunyian Teks Label Sekunder:** Teks label pada tombol sekunder ("Cetak Laporan" dan "Cadangan") serta ikon chevron dropdown disembunyikan pada layar desktop medium (`hidden xl:inline` di bawah breakpoint `xl`) sehingga hanya menampilkan ikon printer/file-down secara kompak di layar sedang, dan otomatis muncul kembali saat layar lapang.
  - **Penyelarasan Presisi Rata Tengah (Centering) Ikon:** Untuk mengeliminasi ketidakseimbangan visual di mana ikon condong ke kiri saat sidebar ditutup, diimplementasikan optimasi berikut:
    - **Padding Horizontal Konstan:** Tombol navigasi tetap menggunakan padding horizontal `px-3` secara konstan baik dibuka maupun ditutup untuk mengeliminasi loncatan visual kelas padding.
    - **Jarak Gap Kondisional:** Jarak `gap` pada tombol menu dan header logo diatur dinamis (`showLabels ? "gap-2.5" : "gap-0"`). Hal ini mencegah sisa ruang kosong gap yang dapat mendorong ikon ke kiri saat teks disembunyikan.
    - **Kontainer Switcher Tema Mulus:** Kontainer `ThemeToggle` menggunakan padding `px-3` konstan dengan transisi warna border/background gradual (`border-white/5` <-> `border-transparent` dan `bg-white/5` <-> `bg-transparent`) untuk mereduksi distorsi visual, serta menyembunyikan margin kiri teks label (`showLabels ? "ml-2" : "ml-0"`).

- **Spesifikasi Modul Pemeliharaan & Keamanan Data (Pembaruan Juni 2026):** Penerapan mekanisme keamanan ganda (Double-Confirmation) pada menu Konfigurasi Sistem untuk melindungi integritas data satker di spreadsheet:
  - **Modal Dialog Kritis Kustom:** Menolak pemakaian dialog standar browser `window.confirm`. Aksi inisiasi ulang database wajib memunculkan modal dialog kustom bertema bahaya (`bg-white` / `dark:bg-slate-900`) dengan overlay gelap transparan, pemburaman latar belakang, dan ikon peringatan segitiga merah menyala.
  - **Daftar Detail Konsekuensi:** Modal wajib memaparkan konsekuensi destruktif secara transparan (penghapusan data transaksi secara permanen, pemulihan paksa 94 kolom, penyuntikan ulang 5 record demo default).
  - **Input Teks Verifikasi Konfirmasi:** Menyediakan kolom input verifikasi di mana pengguna diwajibkan mengetik secara presisi kata kunci `"INISIASI ULANG"` (kapital, peka huruf besar-kecil) agar tombol aksi "Ya, Bangun Ulang Sekarang" aktif. Hal ini menjamin 100% data tidak akan terhapus akibat salah klik yang tidak disengaja oleh klien.

- **Spesifikasi Sumbu Grafik Dinamis (Auto-Fit Axis) (Pembaruan Juni 2026):** Untuk menolak visualisasi statis yang kaku dan memastikan grafik responsif terhadap fluktuasi skor satker secara proporsional:
  - **Auto-Fit Domain Sumbu Y/X:** Batas sumbu Y pada grafik "Skor Dimensi EVP" dan "Skor Pilar Budaya Kerja", serta sumbu X pada grafik horizontal "CP Detail" di `SatkerDetailView.tsx` dikonfigurasi secara dinamis menggunakan fungsi:
    `domain={[dataMin => Math.max(0, dataMin - 0.2), dataMax => Math.min(5, dataMax + 0.2)]}`
  - **Perilaku Skala:** Batas bawah dihitung otomatis (nilai data terendah dikurangi 0.2, minimal 0) dan batas atas dihitung otomatis (nilai data tertinggi ditambah 0.2, maksimal 5). Hal ini meniadakan batas statis hardcode `[0, 5]` dan menjaga visualisasi bar tetap proporsional dan mudah dianalisis.

- **Spesifikasi Sinkronisasi Target Acuan Dinamis (Pembaruan Juni 2026):** Untuk menolak teks hardcode statis dan memastikan kejelasan informasi KPI:
  - **Sinkronisasi Label Target KPI:** Teks label komparasi `comparisonLabel` pada visualisasi KPI card di halaman Overview (`OverviewView.tsx`) diubah dari teks statis `"vs target acuan (4.00)"` menjadi string dinamis menggunakan fungsi format desimal `formatScore(targetMaturity)`. Hal ini menjamin nilai target acuan visual yang dirender selalu cocok dengan pengaturan global dasbor secara real-time.

- **Spesifikasi Input Target & Skema Pengaman (Anti-Crash) (Pembaruan Juni 2026):** Penyediaan opsi pengaturan target kematangan budaya kerja yang fleksibel dan aman:
  - **Form Input Target Kelayakan:** Form Konfigurasi Utama Sistem di `SettingsView.tsx` menyajikan kolom input khusus untuk mengedit nilai Target Kelayakan Budker (CML Target). Input dibatasi pada tipe numerik berdesimal (`step="0.01"`, rentang `1.00 - 4.00`).
  - **Skema Validasi Anti-Crash:**
    - Pada handler form submit, input target divalidasi dengan fungsi `parseFloat()`. Jika pengguna mengosongkan kolom input, memasukkan angka di luar batas, atau menghasilkan nilai `NaN`, sistem secara otomatis mengunci dan menerapkan **fallback aman** bernilai `4.00`.
    - Di sisi backend utility (`dataUtils.ts`), fungsi `getPengaturanData()` memverifikasi data yang ditarik dari spreadsheet. Apabila terdeteksi nilai `NaN` atau tidak valid, nilai tersebut akan disaring secara paksa ke fallback `4.00`. Hal ini secara total meniadakan potensi error perhitungan visualisasi (seperti garis referensi Recharts) yang dapat menyebabkan dashboard menghilang atau blank.

  - **Sinkronisasi State Mode Pengembang (Dev-Mode Merging):** Untuk mencegah visualisasi hilang akibat inisialisasi objek kosong `appData` saat menyimpan pengaturan di lingkungan lokal (dev mode), utilitas data `getRawData()` di `dataUtils.ts` wajib menggabungkan (*merge*) `mockData` dengan `(window as any).appData` secara reaktif. Ini menjamin data transaksi sampel `"KONSOL BEGR"` tetap terpelihara utuh dan tidak terhapus ketika objek `appData` diperbarui secara lokal.

- **Spesifikasi Modul Ekspor Laporan PDF Dinamis (Pembaruan Juni 2026):** Penyediaan fitur ekspor dokumen visualisasi langsung ke format PDF dengan unduhan otomatis:
  - **Pencegahan Dialog Cetak Manual:** Fungsi cetak tidak lagi menampilkan dialog print bawaan browser (`window.print`). Sebagai gantinya, elemen DOM dicapture menjadi gambar dan langsung dikonversi menjadi dokumen PDF secara programmatis.
  - **Integrasi jsPDF & html2canvas:** Memanfaatkan kombinasi `html2canvas` (capture elemen) dan library `jsPDF` (build PDF). Layout PDF diatur landscape pada format ukuran kertas A4 (`297mm x 210mm`) dengan padding/margin sebesar `10` mm di sekeliling halaman untuk hasil visualisasi laporan enterprise yang bersih dan profesional.
  - **Penamaan File Dinamis:** Nama file PDF yang diunduh secara otomatis disesuaikan dengan konteks halaman aktif dasbor saat tombol diklik (misalnya: `Dashboard Overview.pdf`, `Dashboard Ranking.pdf`, `Dashboard Deep Dive Satker.pdf`, `Dashboard Master Data BEGR.pdf`, atau `Dashboard Konfigurasi Sistem.pdf`).
  - **Algoritma Multi-Halaman Canvas Slicing (Pembaruan Juni 2026):** Untuk mengeliminasi artefak visual patah-patah pada batas halaman PDF, algoritma lama berbasis *masking* (menempatkan gambar utuh pada setiap halaman dan menutupi kelebihan dengan rectangle putih) digantikan sepenuhnya dengan teknik *canvas slicing*. Kanvas sumber hasil tangkapan `html2canvas` dipotong menjadi segmen per-halaman menggunakan `drawImage()` dengan parameter crop presisi. Setiap segmen dikonversi ke data URL JPEG berkualitas `0.92` secara mandiri dan ditempatkan sebagai gambar tunggal pada halaman PDF-nya. Skala penangkapan ditingkatkan dari `2.2` menjadi `2.5`. Hasil akhirnya adalah transisi antar-halaman yang mulus dan bersih tanpa artefak tumpang tindih layer.

- **Spesifikasi Netralisasi Cetak Mode Gelap & Imposisi Laporan Mode Terang (Pembaruan Juni 2026):** Untuk menjamin seluruh dokumen cetak dapat dibaca dengan jelas, menghemat penggunaan tinta printer, dan menghindari bug visual teks putih di atas latar belakang putih saat aplikasi berada dalam Mode Gelap:
  - **Deteksi Event Print Native (`beforeprint`/`afterprint`):** Sistem secara reaktif mendengarkan event print bawaan peramban (misalnya ketika pengguna menekan `Ctrl+P`). Begitu proses pencetakan dipicu, kelas `dark` pada dokumen dinonaktifkan sementara dan digantikan kelas `light`. Begitu proses cetak selesai atau dibatalkan, kelas `dark` dikembalikan secara otomatis.
  - **Imposisi Skema Warna Terang Laporan PDF (`html2canvas` Clone Modification):** Di dalam callback `onclone` pada library `html2canvas`, elemen dokumen kloning dimanipulasi secara langsung dengan membuang kelas `dark`, menyuntikkan kelas `light`, serta menerapkan warna latar belakang abu-abu terang (`#f8fafc`) dan teks gelap (`#0f172a`) secara paksa. Hal ini menjamin file PDF hasil ekspor selalu berformat skema terang dengan kontras teks yang optimal.

---

## 7. Pembaruan Rekayasa Arsitektur Mutakhir (Juni 2026)
- **Modular Layout & Resolusi Impor**: Pemulihan jalur impor di `App.tsx` diarahkan langsung ke lokasi barunya di `/src/components/layout/Layout.tsx` secara presisi guna mengakomodasi reorganisasi berkas visual.
- **Pemisahan Konteks Filter Global**: Pemindahan `FilterContext.tsx` dari folder presentasional UI ke folder arsitektural khusus `/src/contexts/` untuk menjaga keteraturan dan kejelasan domain *state-management* global dari domain visual murni.
- **Utils modular & Helper Cetak**: Memisahkan fungsionalitas ke `/src/lib/utils.ts` untuk penanganan gabungan kelas CSS Tailwind dinamis, serta `/src/lib/printHelper.ts` untuk ekspor cetak PDF landscape.
- **Pembersihan Modul Non-Fungsional**: Melakukan pembersihan file filter saringan yang tak kompatibel (`filters.tsx`) guna memusatkan fungsionalitas filter mandiri (self-contained) per-view dan menjamin 100% tingkat kelulusan linter TypeScript (`tsc --noEmit`).
- **Kompilasi Otomatis & Sinkronisasi Single-File Bundle**: Memproses `index.html` dari root workspace menggunakan bundler Vite untuk menghasilkan single-file bundle di `/dist/index.html`. File output ini secara otomatis disalin dan disinkronkan ke dalam file `Dashboard-for-Spreadsheet.html` dan `Dashboard-for-Spreadsheet.txt` melalui script `postbuild.mjs` untuk penyebaran murni pada Google Apps Script (GAS).

---

## 8. Spesifikasi Desain Minimalis Premium (Swiss-Style Minimalism) (Pembaruan Juni 2026)
- **Penghapusan Ikon Dekoratif (Visual Clutter)**: Menghapus seluruh ikon dekoratif berlatar belakang warna bulat/kotak di bagian kanan atas kartu KPI/metrik pada seluruh halaman/view (Overview, Report, Ranking, Data Master) untuk melahirkan estetika modern yang fokus pada tipografi murni, data, dan kemudahan membaca.
- **Kesederhanaan Header & Informasi**: Menghilangkan lencana "Analisis Mendalam" pada header grafik perbandingan EVP vs Pilar Budaya guna menjunjung arsitektur visual yang jujur tanpa hiasan kosmetik artifisial.
- **Kompilasi & Pemutakhiran GAS Instan**: Setiap modifikasi visual secara reaktif dikompilasi ulang oleh bundler Vite ke `dist/index.html` dan disinkronkan langsung ke file `Dashboard-for-Spreadsheet.html` dan `Dashboard-for-Spreadsheet.txt`.

---

## 9. Spesifikasi Tipografi & Standarisasi Judul Visual (Pembaruan Juni 2026)
- **Aturan Proper Case (Anti ALL-CAPS)**: Seluruh judul visual, sub-panel, filter, dan label kartu utama wajib menggunakan format **Proper Case** (Kapital di Awal Kata) dengan ketebalan **Bold** (`font-bold`), menggantikan pemakaian format huruf besar penuh (ALL CAPS) yang terkesan kaku.
- **Keselarasan Font Utama (`font-sans`)**: Seluruh judul visual di seluruh halaman dasbor diselaraskan secara penuh menggunakan keluarga font yang sama dengan judul utama dasbor, yaitu `"Plus Jakarta Sans"` (`font-sans`), untuk memastikan estetika visual yang terintegrasi, koheren, dan elegan.

---

## 10. Spesifikasi Animasi Kontrol Segmented & Pembersihan Ornamen Lanjutan (Pembaruan Juni 2026)
- **Fluid Spring Pill Slider**: Seluruh komponen segmented control pada halaman laporan KPI konsolidasi diimplementasikan dengan transisi pill slider dinamis menggunakan `motion.div` dari library `"motion/react"`. Desain ini menjamin transisi perpindahan filter yang sangat lancar dan dinamis dengan responsivitas pegas ideal (`stiffness: 380, damping: 30`).
- **Eliminasi Ikon Analisis Strategis**: Kartu analisis taktis di bawah grafik perbandingan (Dimensi Terkuat, Area Prioritas Pendampingan, Deviasi Rata-Rata) dibersihkan dari ikon Lucide dan wadah warna kontras (`bg-.../10 text-...`), selaras dengan panduan eliminasi visual clutter (anti-kosmetik berlebih) demi menciptakan kesan *editorial Swiss-Style murni*.
- **Pembersihan Judul Komposisi Distribusi**: Menghapus judul/header *Komposisi Klasifikasi Kematangan* dari kartu presentasi proporsi satuan kerja guna menjaga tampilan dasbor tetap ringkas, bersih, dan menyatu sempurna dengan grid program di sebelahnya.
- **Normalisasi Font Data & Nilai (Value)**: Seluruh presentasi nilai numerik, persentase, ranking, dan badge ringkasan statistik wajib menggunakan `font-sans` (mengikuti tipografi utama halaman) daripada `font-mono`. Ini memberikan kesan visual yang lebih hangat, seimbang, dan menyatu alami dengan struktur konten dasbor eksekutif.
- **Sinkronisasi Kode & Bundle**: Setiap rincian penyempurnaan desain visual atau interaksi otomatis dicerminkan ke dalam single-file bundle GAS murni.

---

## 11. Spesifikasi Dinamisasi Sumbu Y Seluruh Visualisasi (Pembaruan Juni 2026)
- **Auto Fit Sumbu Y Bawaan**: Dasbor utama dikonfigurasi untuk langsung menyajikan sumbu Y dinamis (*isYAxisDynamic* aktif secara *default*) demi menonjolkan perbedaan skor antar dimensi yang relatif berhimpitan di kisaran nilai 3.5 hingga 4.8.
- **Formulasi Sumbu Y Dinamis Adaptif**: Seluruh visualisasi grafik kolom (BarChart) yang memetakan skor kematangan (Championship Program, EVP, Pilar Budaya) dilarang menggunakan batas statis kaku `[0, 5]` jika datanya bervariasi secara sempit. Batas sumbu Y wajib menggunakan fungsi komputasi dinamis:
  - Batas Bawah: `dataMin => Math.max(0, parseFloat((dataMin - 0.2).toFixed(2)))`
  - Batas Atas: `dataMax => Math.min(5, parseFloat((dataMax + 0.2).toFixed(2)))`
  Hal ini menjamin tampilan grafik selalu responsif, adaptif, dan memberikan ruang visual (padding atas-bawah) yang proporsional pada grafik Recharts.

---

## 12. Spesifikasi Desain Elemen KPI & Kartu Performa Tanpa Border Kiri Berwarna (Pembaruan Juni 2026)
- **Desain Minimalis Murni (Flat-Edge Style)**: Seluruh kartu ringkasan eksekutif (KPI utama di modul Overview dan Laporan), kartu performa (Top vs Bottom Performer di halaman Peringkat), kartu taktis, dan panel detail satker wajib membersihkan ornamen border kiri tebal (`border-l-4` atau `border-l-2`). Hal ini juga berlaku untuk kartu identitas/profil Satuan Kerja di modul eksplorasi profil detail satker, di mana border-left inline style dinamis (`borderLeft: 4px solid cmlColor`) telah dihapus sepenuhnya.
- **Pembersihan Visual Clutter**: Semua elemen kartu di atas mengandalkan bayangan halus (`shadow-sm` / `shadow-xs`) dan border tipis merata (`border border-slate-200`) yang simetris di keempat sisinya tanpa ada garis tepi tebal sebelah kiri yang kontras, menjaga tampilan tetap seimbang, minimalis khas *Swiss-Style*, dan profesional.

---

## 13. Spesifikasi Dropdown Custom Searchable Terkategori & Anti-Clipping Elemen Panjang (Pembaruan Juni 2026)
- **Desain Pemilihan Satker Berbasis Dropdown Custom Searchable**: Elemen pemilihan Satuan Kerja di modul eksplorasi per-satker menggunakan komponen Custom Dropdown berkemampuan pencarian teks real-time dengan tombol pemicu setinggi minimal `52px` untuk mendukung pembungkusan teks nama satker secara penuh (`whitespace-normal break-words`).
- **Pengelompokan & Bebas Clipping**: Seluruh opsi satuan kerja harus dikelompokkan secara visual menggunakan header berlabel "Kelompok: <Nama Kelompok>". Kontainer induk wajib memiliki `overflow-visible` untuk memastikan menu dropdown dengan z-index tinggi melayang dengan sempurna di atas komponen lain tanpa terpotong (clipping), baik di layar desktop, mobile, maupun iframe.
- **Dropdown Custom Championship Program (CP)**: Elemen pemilihan program evaluasi pada grafik detail komponen di modul eksplorasi per-satker harus menggunakan Custom Floating Dropdown yang elegan dengan menu opsi melayang (z-index tinggi), transisi micro-animation, dan standard backdrop click-to-close. Pilihan nama program wajib membungkus secara penuh (`whitespace-normal break-words`).
- **Anti-Clipping Sumbu Grafik**: Sumbu Y visualisasi detail program pada grafik kolom horizontal dipatok dengan lebar statis yang aman (`width={180}`) dengan penyesuaian margin kiri yang minimalis (`margin.left=10`). Format label nama parameter harus menggunakan text wrapping bawaan atau toleransi lebar yang cukup agar nama kategori panjang tidak pernah ter-clip or terpotong pada semua resolusi layar.
- **Format Label Numerik Sumbu Nilai**: Seluruh sumbu nilai numerik (baik sumbu Y pada chart vertikal, sumbu X pada chart horizontal, maupun penanda skala lainnya) wajib menerapkan pembatasan angka desimal panjang secara dinamis menggunakan `tickFormatter` agar menghasilkan nilai dengan maksimal 2 angka di belakang koma (contoh format: `parseFloat(val.toFixed(2)).toString()`). Hal ini wajib diterapkan secara konsisten di modul Overview, Detail Satker, dan Report.
- **Reduksi Radius Bayangan Sidebar**: Untuk menjaga konsistensi flat-edge dan modernitas visual, bayangan pada container menu Sidebar kiri (`aside`) harus dikurangi dari `shadow-2xl` / `shadow-lg` ke tingkat yang lebih subtle seperti `shadow-md` ketika dalam keadaan ekspansi (terbuka) dan `shadow-sm` ketika diringkas. Hal ini meniadakan polusi visual bayangan hitam pekat yang mengganggu keindahan latar belakang dasbor.
- **Scrollable & Ekspansi Grafik Komponen CP**: Grafik horizontal barchart untuk "Detail Komponen Championship Program (CP)" wajib mendukung scroll vertikal (`overflow-y-auto`) di dalam kontainer aslinya jika jumlah data indikator sangat padat (menggunakan penskalaan tinggi dinamis `length * 30`px). Grafik ini juga wajib dilengkapi dengan tombol pemicu ekspansi (`Maximize2`) untuk memunculkan modal overlay berukuran penuh (`max-w-4xl max-h-[90vh]`, z-index 50) dengan visualisasi yang lebih lega dan longgar agar pembacaan nama indikator panjang menjadi nyaman dan optimal.
- **Pembersihan Modul Visual (Radar Chart)**: Visualisasi "Radar Dinamika 4 Tahap Penilaian Program" harus ditiadakan sepenuhnya untuk meminimalisasi noise informasi pada tampilan Detail Satker.
- **Struktur Kolom Dampak NNS**: Komponen "Dampak Nilai-Nilai Strategis (NNS)" harus dikonfigurasi sebagai container lebar penuh (`w-full`), di mana daftar indikatornya dipecah menjadi grid 2-kolom pada layar desktop demi menjaga keseimbangan proporsi ruang visual dashboard pasca penghapusan Radar Chart.
- **Spesifikasi Responsivitas Tablet & Mobile Header**:
  - **Dinamis Grid Margin Kiri**: Margin kiri kontainer utama wajib beralih secara dinamis berdasarkan ekspansi sidebar (`showLabels`) dengan detail: `showLabels ? "lg:ml-[304px] xl:ml-[336px]" : "lg:ml-24"`. Hal ini menjamin tidak terjadi tumpang tindih visual (tumpang tindih) antara sidebar dengan header di resolusi `lg` ke atas.
  - **Teks Tombol Responsif (Auto-Collapse)**: Teks label pada tombol penting seperti "Sinkronisasi" wajib disembunyikan menggunakan `hidden xl:inline` agar pada resolusi tablet/mobile, tombol ini hanya menyisakan ikon fungsional (`Zap`/`Loader2`) yang ringkas untuk mencegah luapan horizontal (`overflow-x`).
  - **Pencarian Cepat Responsif**: Kolom pencarian cepat di header utama wajib dideklarasikan menggunakan `hidden lg:flex` untuk mencegah pemotongan ruang baca judul halaman pada resolusi layar tablet.
  - **Skalabilitas Teks Judul**: Judul navigasi utama di header wajib menyesuaikan ukuran secara bertahap (`text-sm sm:text-base md:text-lg lg:text-xl`) dengan pembatasan lebar subtitle (`max-w-[130px]`) agar tidak mencuat keluar dari batas grid navbar.
  - **Adaptasi Orientasi & Rotasi Layar Tablet**:
    - **Tata Letak Grid Profil Detail**: Tampilan profil identitas satker dan ring chart CML wajib menerapkan grid fleksibel `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` untuk memanfaatkan ruang horizontal tablet secara efektif saat diputar ke mode landscape maupun portrait.
    - **Penyelarasan Horizontal Chart & Tabel CP**: Grafik rata-rata CP dan tabel ringkasannya wajib bersandingan secara horizontal pada resolusi tablet (`md:grid-cols-5`) dengan pembagian lebar proporsional 3:2 guna menjamin keterbacaan yang maksimal tanpa luapan konten vertikal yang berlebihan.
  - **Pencegahan Teks Pecah (Text Wrapping) Saat Sidebar Dibuka**:
    - **No-Wrap Pada Tombol Aksi**: Tombol utama di header ("Sinkronisasi", "Cetak Laporan", "Cadangan") serta seluruh elemen teks label di dalamnya wajib dibungkus dengan kelas `whitespace-nowrap` guna mematikan pembungkusan baris baru otomatis oleh browser.
    - **Teks Skala Dinamis (Adaptive Collapse)**: Label teks pada tombol aksi wajib beralih secara cerdas berdasarkan lebar area baca dan status menu sidebar (`showLabels`). Saat sidebar terbuka lebar (mengonsumsi ruang lateral), teks label wajib menggunakan konfigurasi `showLabels ? "2xl:inline" : "xl:inline"`, yang secara otomatis melipat label teks menjadi bentuk ikon minimalis di layar tablet landscape atau laptop beresolusi sedang untuk mencegah tabrakan/tumpang tindih visual.

---

## 14. Spesifikasi Rebranding & Kolom Komparatif Pada Dashboard Ranking (Pembaruan Juli 2026)
- **Rebranding Teks & Label**:
  - Subtitle Dashboard Ranking diselaraskan menjadi **Pemeringkatan Culture Maturity Level Satuan Kerja**.
  - Pilihan wilayah saringan pada tombol slicer diselaraskan menjadi **KP** (Kantor Pusat) dan **KPw** (Kantor Perwakilan).
  - Judul kartu performa terendah diperbaharui menjadi **Perlu Perhatian Khusus** (dari semula "Butuh Perhatian Lebih").
- **Kolom Keterangan CML**:
  - Tabel pemeringkatan utama wajib menyertakan kolom **Keterangan CML** yang disematkan di sebelah kanan kolom Level CML.
  - Kolom ini menyajikan label evaluasi dinamis berdasarkan perbandingan langsung skor `cultureMaturityLevel` unit aktif terhadap rata-rata skor CML keseluruhan (BI-Wide):
    - Jika `score >= averageBiWide` -> Menampilkan lencana hijau semi-transparan `Above Average` (`bg-emerald-500/10 text-emerald-600 border border-emerald-500/10`).
    - Jika `score < averageBiWide` -> Menampilkan lencana merah semi-transparan `Below Average` (`bg-rose-500/10 text-rose-600 border border-rose-500/10`).
  - Kolom keterangan komparatif ini juga wajib diekspor secara utuh ke dalam dokumen CSV ketika aksi "Ekspor CSV" dijalankan oleh pengguna.

---

## 15. Spesifikasi Restrukturisasi Urutan Visual Dashboard Per-Satker (Pembaruan Juli 2026)
- **Urutan Visual Sekuensial Utama**: Tata letak visual pada halaman Eksplorasi Detail Per-Satker (`SatkerDetailView.tsx`) diatur ulang secara berurutan dan terstruktur guna mengalirkan prioritas informasi secara logis dan terpadu:
  1. **CML (Culture Maturity Level)** (Urutan 1): Menempati posisi paling atas menggunakan Grid 2 Kolom pada desktop, bersandingan antara kartu identitas/kategori kematangan Satker aktif dengan diagram cincin (ring chart) CML.
  2. **Pilar Budker** (Urutan 2): Menampilkan visualisasi perbandingan "Skor Pilar Budaya Kerja Bank Indonesia" (4 Pilar utama) sebagai grafik kolom pertama pada baris tengah (sisi kiri).
  3. **EVP** (Urutan 3): Menampilkan visualisasi perbandingan "Skor Dimensi Employee Value Proposition (EVP)" (3 dimensi utama) sebagai grafik kolom kedua pada baris tengah (sisi kanan), berpasangan horizontal secara simetris dengan grafik Pilar Budker.
  4. **Championship Program & NNS** (Urutan 4): Menampilkan grafik "Detail Komponen Championship Program (CP)" pada sisi kiri, dipasangkan secara horizontal dengan visualisasi horizontal bars "Dampak Nilai-Nilai Strategis (NNS)" pada sisi kanan di baris terbawah.
- **Simetrisasi & Penghematan Ruang**: Penyusunan ulang ini menyelaraskan seluruh elemen visual ke dalam 3 baris grid simetris 2-kolom (`grid-cols-1 lg:grid-cols-2`), yang menghemat ruang vertikal, mereduksi keharusan menggulung (scroll) layar berlebihan pada resolusi tablet/landscape, serta menghasilkan estetika bento-grid yang seimbang dan profesional.

---

## 16. Spesifikasi Komponen Detail Championship Program (CP) (Pembaruan Juli 2026)
- **Komponen Penilaian CP Utama**: Grafik batang horizontal untuk detail komponen Championship Program (`SatkerDetailView.tsx`) menyajikan parameter mikro secara lengkap dengan label yang intuitif dan sekuensial:
  1. **Skor Akhir CP** (Skor agregat CP)
  2. **Deep Dive Culture** (Menggantikan parameter lama, diisi oleh data historis analisis kualitatif unit)
  3. **Persona Walkthrough** (Tingkat asimilasi perilaku persona)
  4. **Reality Check** (Bersifat kondisional, hanya ditampilkan apabila unit mengikuti program *AKUKEREN x BTSYUK*, *OBF*, atau *3H X KEJORA*)
  5. **Kesesuaian EVP** (Tingkat keselarasan Employee Value Proposition)
  6. **Kesesuaian Pilar Budker** (Tingkat keselarasan pilar budaya kerja BI)
  7. **Trust & Integrity** (Dampak NNS nilai integritas)
  8. **Professionalism** (Dampak NNS profesionalisme)
  9. **Excellence** (Dampak NNS keunggulan)
  10. **Public Interest** (Dampak NNS orientasi publik)
  11. **Coordination & Teamwork** (Dampak NNS kolaborasi antartim)
- **Kondisionalitas & Keamanan Data**: Untuk program seperti *SESPIOK* dan *PINTER*, parameter *Reality Check* disembunyikan secara otomatis dari daftar data grafik guna memastikan tidak adanya visualisasi data kosong atau bernilai anomali.
- **Interaktivitas & Pengurutan (Sorting)**:
  - Menyediakan kontrol segmentasi pengurutan interaktif ("Asli", "Terendah", "Tertinggi") yang intuitif di atas grafik batang horizontal detail CP.
  - **Asli**: Menyajikan urutan standar (default) sesuai prioritas evaluasi sekuensial.
  - **Terendah (Ascending)**: Mengurutkan komponen secara dinamis berdasarkan nilai skor dari yang terendah ke tertinggi.
  - **Tertinggi (Descending)**: Mengurutkan komponen secara dinamis berdasarkan nilai skor dari yang tertinggi ke terendah.
  - **Konsistensi Fullscreen**: Fitur pengurutan ini disinkronisasikan secara langsung (real-time) antara tampilan kartu utama (dashboard bento-grid) dan tampilan perluasan (popup fullscreen modal), sehingga pengalaman analisis pengguna tetap mulus dan koheren.
- **Penyelarasan Layout Responsif Tanpa Gap**:
  - Mengubah perilaku pembungkus kontrol menjadi susunan bertumpuk vertikal yang rapat (`flex flex-col items-start sm:items-end gap-2 shrink-0`).
  - **Posisi Atas-Bawah (Vertical Stacking)**: Menempatkan filter pengurutan (`[Asli, Terendah, Tertinggi]`) secara presisi tepat di atas dropdown kategori program budaya.
  - Pada layar lebar (desktop/tablet), kontrol ini menempel rapi dan pas ke sisi kanan atas kartu secara asimetris, menghilangkan celah kosong besar di pojok kanan atas kartu secara tuntas.
  - Pada layar ponsel pintar, perataan beralih ke kiri (`items-start`) secara dinamis demi menjaga responsivitas dan kerapian visual tanpa terpotong.
- **Penyelarasan Spasi & Peningkatan Dimensi Tinggi Grafik**:
  - Mengurangi gap vertikal putih antara subtitle teks dan baris grafik teratas dengan menyesuaikan jarak spasi antar elemen kartu utama (`space-y-1.5`).
  - Meningkatkan tinggi wadah kontainer grafik horizontal dari semula `h-64` (`256px`) menjadi `h-[400px]` (`400px`) secara responsif.
  - Mengubah batas tinggi minimal grafik di dalam scrollable area menjadi `380px` (atau proporsional terhadap jumlah item data) untuk mencegah tumpang-tindih label atau pemotongan visual label teks "Coordination & Teamwork" di bagian paling atas.
  - Memperlebar batas atas margin grafik (`top: 2` di `BarChart` Recharts) untuk menjamin penempatan teks nama parameter baris pertama selalu seimbang dan presisi tanpa risiko terpotong tepi atas wadah.

- **Integrasi Radar Dinamika Capaian CP**:
  - Menyandingkan detail komponen CP secara horizontal dengan grafik "Radar Dinamika Capaian CP" beresolusi tinggi pada Block 4.
  - Radar chart ini menggunakan pangkalan data dinamis `programDynamicsData` yang memuat skor dari 5 program budaya aktif: SESPI OK, AKU KEREN, OBF, 3H X KEJORA, dan PINTER X PASKEUN.
  - Tampilan visual radar menggunakan stroke amber pekat `#f59e0b` dengan ketebalan 2px dan pengisian area translusen sebesar 12%, dipadukan dengan tooltip kustom bergaya Tremor UI.

- **Integrasi Komparasi Dampak NNS per Championship Program**:
  - Halaman eksplorasi detail satker menyertakan Block 5 di baris terbawah yang berisi visualisasi baru berupa clustered bar chart "Komparasi Dampak NNS per Championship Program".
  - Grafik ini menyajikan nilai perbandingan masing-masing dari 5 NNS (Trust & Integrity, Professionalism, Excellence, Public Interest, Coordination & Teamwork) di seluruh 5 program kebudayaan aktif (SESPI OK, AKU KEREN, OBF, 3H, PINTER) secara berdampingan.
  - Setiap program direpresentasikan oleh warna bar yang khas dan kontras (SESPI OK: Indigo, AKU KEREN: Cyan, OBF: Emerald, 3H: Amber, PINTER: Pink) untuk analisis lintas-program yang intuitif.

- **Fitur Laporan KPI Konsolidasi Interaktif**:
  - **Ekspor & Cetak PDF Eksekutif**: Penempatan tombol cetak di sudut kanan atas header laporan yang secara dinamis memanggil pustaka `captureAndPrint("main-content")` untuk menghasilkan cetakan PDF murni yang rapi dan bebas dari clutter filter.
  - **Visualisasi Donut Chart Proporsi CML (CML Share)**: Menyediakan visualisasi lingkaran (*Donut Chart*) Recharts yang dinamis menampilkan persentase pembagian kelompok budaya (*Aligned, Engaged, Enable, Empower*) berdampingan dengan penjelasan deskripsi kualitatif per pilar, lengkap dengan penulisan jumlah total Satker di poros pusat lingkaran.
  - **Tabel Analisis Data Konsolidasi**: Tabel data tabular interaktif yang memuat informasi terperinci dari seluruh Satuan Kerja aktif:
    - **Pencarian Kata Kunci**: Input teks pencarian cerdas yang memfilter baris berdasarkan nama Satker, jenis (KP/KPw), kelompok budker, atau rubrik secara real-time.
    - **Penyaringan Kategori (Category Filter)**: Filter dropdown kategori kematangan CML untuk kemudahan pengelompokan analisis eksekutif.
    - **Penyalinan Google Sheets (Copy to Clipboard)**: Tombol salin khusus yang mengubah hasil penyaringan data saat itu ke format tabulasi TSV ramah spreadsheet untuk penempelan langsung yang lancar.
    - **Pengurutan Kolom (Sorting)**: Fitur klik-untuk-urutkan pada header kolom Satuan Kerja, nilai CML, serta ke-5 program Championship (*SESPI OK, AKU KEREN, OBF, 3H, PINTER*).
    - **Paginasi Teratur (Pagination)**: Sistem pembagian halaman dengan dropdown pemilihan baris per halaman (10, 25, 50, 100) dan penunjuk navigasi halaman terkomputasi.

- **Standar & Penguncian Target CML**:
  - Pengguna dilarang mengubah target secara kustom pada halaman antarmuka pengaturan demi validitas komparasi data.
  - Nilai Target Kelayakan Budker (CML Target) diatur secara otomatis ke batas maksimal absolut yaitu **4.00** pada skala 1.00 - 4.00. Opsi input kustom Target CML di halaman Pengaturan Sistem telah dihilangkan secara permanen.

- **Ketahanan Antarmuka & Kunci Posisi Header**:
  - Header panel harus responsif sepenuhnya pada berbagai ukuran viewport desktop dan tablet.
  - Ketika menu navigasi lateral (sidebar) dibuka atau ditutup, seluruh elemen di dalam kontainer `<header>` (nama halaman, pencarian, dan tombol aksi sinkronisasi, cetak, cadangan, serta notifikasi) tidak boleh bergeser lambat atau meleset keluar kontainer putih.
  - Posisi ujung kanan kontainer aksi harus tetap terkunci presisi menggunakan properti flex-shrink pencegah deformasi (`shrink-0`) dan pemutus sinkronisasi transisi lebar dinamis (`transition-colors` sebagai pengganti `transition-all`).




