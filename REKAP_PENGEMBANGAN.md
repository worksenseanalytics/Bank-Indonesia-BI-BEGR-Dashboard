# REKAP PENGEMBANGAN - JUNI 2026

Dokumen ini mencatat kronologis rekayasa dan pembaruan arsitektur Dasbor Pemantauan Budaya KONSOL BEGR Bank Indonesia.

## 1. Pembaruan Juni 2026: Arsitektur Murni Read-Only
- **Transformasi BeforeTripView**: Mengubah antarmuka Data Master Konsol (`BeforeTripView.tsx`) menjadi murni *Read-Only*. Menghapus seluruh tombol sunting, tambah, hapus, serta modal editor untuk memusatkan integritas data eksklusif pada spreadsheet.
- **Pulsating Badge Status**: Menambahkan badge status melayang pulsating formal berwarna slate (`bg-slate-100`) dengan detak warna indigo di sudut kanan atas judul tabel sebagai penanda status pemantauan waktu-nyata yang formal.
- **Executive KPI Cards**: Menyediakan 4 kartu ringkasan kpi di bagian atas tabel untuk menyajikan total satker, rerata kematangan, satker lulus target, dan satker butuh akselerasi secara ringkas ala Tremor.

## 2. Struktur Modul Dasbor Utama
- **OverviewView (Ringkasan Utama)**: 
  - Menyajikan tabulasi sebaran level kematangan CML (Wide, KP, KPw).
  - Visualisasi grafik batang EVP & Pilar Budaya dengan Reference Line target acuan.
  - Grafik batang Championship Program nasional.
  - Radar chart 5 dimensi Nilai-Nilai Strategis (NNS).
  - Daftar Top 3 Satker Kematangan dan Butuh Akselerasi (Bottom 3) dengan watermark besar berestetika Swiss Functional.
- **RankingView (Pemeringkatan)**: Papan peringkat dinamis (leaderboard) yang dapat diurutkan menaik/menurun lengkap dengan pencarian dan filter kelompok budker.
- **SatkerDetailView (Analisis 360°)**: Deep dive analitis per satuan kerja yang menyandingkan grafik batang capaian EVP/Pilar, Radar NNS Satker, dan rincian sub-skor 5 Championship Program.
- **SettingsView (Pengaturan)**: Form konfigurasi Judul Aplikasi, Unit Admin Budker, dan Batas Target Acuan yang tersinkronisasi dua arah langsung ke Google Sheets.

## 3. Pangkalan Data & Utilitas singlefile
- **Penyelarasan 94 Kolom**: `dataUtils.ts` diprogram presisi untuk memetakan seluruh 94 kolom data master spreadsheet murni tanpa kehilangan indeks formula.
- **Cetak Laporan**: Terintegrasi fungsi landscape print pintar (`printHelper.ts`) yang otomatis menonaktifkan dark mode sementara selama proses pencetakan untuk menjamin cetakan PDF formal berkualitas tinggi.

## 4. Pembaruan Organisasi Berkas & Konteks Filter (Juni 2026)
- **Migrasi `FilterContext.tsx`**: Memindahkan berkas penanganan filter global dari `src/components/ui/` ke folder khusus arsitektural `/src/contexts/` guna memisahkan logic filter global (state management) dari pustaka komponen presentasional UI.
- **Penyempurnaan Jalur Impor `Layout.tsx`**: Menyesuaikan jalur impor komponen tata letak utama (`Layout`) pada `src/App.tsx` agar merujuk ke lokasi barunya secara presisi di `src/components/layout/Layout.tsx`, menjamin integritas fungsional 100% bebas dari galat kompilasi TypeScript (`tsc`).

## 5. Kompilasi & Pembaruan Single-File Bundle (Juni 2026)
- **Kompilasi Otomatis via Vite**: Memproses file `index.html` di root melalui Vite build engine ke dalam folder `/dist/index.html`.
- **Sinkronisasi Kode Deployment**: Sesuai dengan instruksi sistem, hasil kompilasi terbaru di `/dist/index.html` secara otomatis disalin dan disinkronkan ke dalam berkas `Dashboard-for-Spreadsheet.html` dan `Dashboard-for-Spreadsheet.txt` melalui script `postbuild.mjs` untuk keperluan integrasi langsung ke Google Apps Script (GAS).

## 6. Pembaruan Juni 2026: Halaman Khusus Laporan KPI Konsolidasi (Executive Report Page)
- **Pembuatan `ReportView.tsx`**: Membangun modul halaman khusus untuk laporan eksekutif interaktif yang menyajikan ringkasan KPI tingkat tinggi yang bersumber secara asinkron dari data pangkalan KONSOL BEGR.
- **Bento Grid Executive Telemetry**: Menampilkan indikator makro utama meliputi Average Maturity Level (CML) berpembanding dinamis, Compliance Rate (% kelulusan unit), Average Engagement Score, dan Average NNS Impact dalam bentuk visualisasi yang elegan, responsif, dan padat.
- **Penyelarasan Desain KPI**: Menyelaraskan tata letak kartu KPI pada halaman Laporan agar identik dengan halaman Overview, termasuk penggunaan warna border kiri penanda kategori, penempatan ikon visual, lencana pencapaian (positif/negatif/netral), dan subteks penjelasan perbandingan.
- **Matriks Dimensi Strategis (EVP vs Pilar)**: Menyajikan grafik batang Recharts komparatif yang membandingkan performa rata-rata 3 dimensi EVP dan 4 pilar Kebijakan Budaya Kerja BI, lengkap dengan garis target acuan horizontal.
- **Komposisi Klasifikasi Kematangan**: Menvisualisasikan proporsi sebaran jumlah satuan kerja berdasarkan kategori kematangan budaya (*Aligned*, *Engaged*, *Enable*, *Empower*) dalam format progress bar horizontal yang selaras warna standar.
- **Matriks Program Kebudayaan**: Menyuguhkan ringkasan detail performa 5 program kebudayaan aktif (SESPIOK, AKUKEREN, OBF, 3H, PINTER) meliputi skor pencapaian rata-rata dan tingkat partisipasi di masing-masing program.
- **Sorotan Kinerja Satker (Top & Bottom Performers)**: Menampilkan 3 unit berkinerja tertinggi (*Culture Champions*) dan 3 unit prioritas pendampingan (*Below Benchmark*) untuk membantu pengambilan keputusan strategis oleh pengelola program.
- **Integrasi Filter Cakupan Eksekutif**: Menyediakan penapis cakupan tingkat tinggi (BI Wide, Kantor Pusat, Kantor Perwakilan) yang secara reaktif menyinkronkan seluruh perhitungan data pada dashboard laporan.
- **Pendaftaran Rute & Navigasi**: Mendaftarkan tab `"report"` (Laporan KPI Konsolidasi) di dalam router utama `src/App.tsx`, serta mengintegrasikannya ke menu navigasi sidebar melayang kiri pada `Layout.tsx` lengkap dengan sinkronisasi penamaan file PDF cetak kustom.
- **Redesain Premium Matriks Dimensi Strategis (EVP vs Pilar)**: Melakukan perombakan visual dan fungsional total pada visualisasi perbandingan EVP vs Pilar Budaya. Menghadirkan segmented control interaktif ("Semua Dimensi", "Hanya EVP", "Hanya Pilar"), gradien bar kustom (warm gold untuk EVP & corporate indigo untuk Pilar), indikator garis batas target kelulusan yang dipertegas, serta ringkasan analisis cerdas 3-kolom otomatis (Dimensi Terkuat, Area Prioritas Pendampingan, dan Deviasi vs Target) di bawah grafik.

## 7. Pembaruan Juni 2026: Pembersihan Ornamen Dekoratif (Swiss-Style Premium Minimalism)
- **Eliminasi Visual Clutter**: Menghapus seluruh ikon dekoratif berlatar warna kontras (`p-1.5 rounded-lg bg-...`) dari semua kartu KPI di seluruh halaman (Overview, Report, Ranking, dan Data Master/Setup) untuk melahirkan antarmuka yang sangat bersih, profesional, berfokus penuh pada kekuatan tipografi (Swiss-Style).
- **Penghapusan Lencana Non-Standar**: Menghilangkan lencana "Analisis Mendalam" pada header grafik dimensi strategis demi menjaga kesederhanaan visual yang jujur tanpa ornamen artifisial ("AI slop").
- **Kompilasi dan Sinkronisasi Otomatis**: Memastikan hasil build Vite terbaru (`dist/index.html`) secara instan dan tanpa eror disalin ke dalam file target integrasi Google Apps Script (`Dashboard-for-Spreadsheet.html` dan `Dashboard-for-Spreadsheet.txt`).

## 8. Pembaruan Juni 2026: Standarisasi Judul Visual (Premium Swiss Bold & Proper Case)
- **Konsistensi Tipografi Judul**: Menyetarakan seluruh judul visual dasbor (termasuk filter, grafik, tabel, dan sorotan metrik) agar konsisten menggunakan format **bold** (`font-bold`) dengan aturan **Proper Case** (kapitalisasi di setiap kata, contoh: *Filter Cakupan Laporan* daripada ALL CAPS).
- **Penyelarasan Font Utama**: Memastikan seluruh visual header di dalam komponen dasbor (`Overview`, `Report`, `Ranking`, `SatkerDetail`, `BeforeTrip`, `Settings`) menggunakan keluarga font yang sama dengan judul utama dasbor (`font-sans`), menghasilkan kesatuan visual yang kohesif, modern, dan sangat profesional.

## 9. Pembaruan Juni 2026: Animasi Interaktif Slider Premium & Pembersihan Lanjutan (Laporan KPI Konsolidasi)
- **Framer Motion Segmented Slider**: Mengintegrasikan `motion.div` dengan efek slider elastis (`layoutId` dan `spring transition`) pada penapis cakupan eksekutif (*Filter Cakupan Laporan*) dan filter matriks dimensi strategis (*EVP vs Pilar Budaya*), memberikan pengalaman interaksi mikro yang sangat mulus, responsif, dan bercita rasa premium.
- **Pembersihan Ikon Analisis Strategis**: Menghapus ikon dekoratif (`TrendingUp`, `AlertTriangle`, `Target`) dengan latar lingkaran/kotak kontras dari tiga kartu sorotan analisis strategis (Dimensi Terkuat, Area Prioritas Pendampingan, Deviasi Rata-Rata) untuk memaksimalkan kepatuhan terhadap standar kebersihan visual *Swiss-Style minimalism*.
- **Pembersihan Header Kartu Distribusi**: Menghapus modul header judul (*Komposisi Klasifikasi Kematangan*) dari kartu distribusi porsi satuan kerja guna memberikan estetika tampilan yang lebih mengalir, terpadu, dan bebas dari visual clutter.
- **Penyelarasan Font Metrik & Nilai (Value)**: Menyeragamkan seluruh tipe huruf untuk nilai numerik, persentase, dan label data di seluruh modul visual (`Report`, `Overview`, `Ranking`, `SatkerDetail`, `Settings`) menggunakan `font-sans` agar konsisten dengan jenis huruf yang digunakan di judul utama dasbor, menggantikan sisa-sisa penggunaan `font-mono` yang kontras.
- **Vite & GAS Sinkronisasi Instan**: Secara otomatis melakukan build ulang dan menyalin hasil bundle murni `dist/index.html` ke berkas `Dashboard-for-Spreadsheet.html` dan `Dashboard-for-Spreadsheet.txt`.

## 10. Pembaruan Juni 2026: Dinamisasi Sumbu Y Seluruh Visualisasi
- **Sumbu Y Dinamis Secara Default (Auto Fit)**: Mengaktifkan mode "Skor Sumbu Y Dinamis" secara bawaan (*default true*) pada dasbor utama untuk langsung memfokuskan visualisasi perbandingan pada variasi data aktual satuan kerja.
- **Dinamisasi Sumbu Y Grafik CP & Laporan**: Mengganti sumbu Y statis `domain={[0, 5]}` pada grafik *Rata-Rata Skor per Championship Program (CP)* dan grafik perbandingan *EVP vs Pilar Budaya* dengan domain dinamis adaptif `[dataMin - 0.2, dataMax + 0.2]` (dibatasi minimal 0 dan maksimal 5). Ini mencegah grafik tampak datar dan memberikan visualisasi perubahan tren yang jauh lebih presisi dan bermakna.

## 11. Pembaruan Juni 2026: Penghapusan Warna Sisi Kiri Setiap Kartu KPI & Ringkasan Performa
- **Pembersihan Border Sisi Kiri (Clutter Removal)**: Menghapus seluruh border tebal berwarna (`border-l-4 border-l-...` dan `border-l-2`) yang sebelumnya menempel di sisi kiri setiap kartu KPI ringkasan, kartu performa (Top vs Bottom Performer), kartu detail analisis taktis, serta baris peringkat utama. Ini menghasilkan tata letak dasbor yang benar-benar bersih, elegan, dan sejalan dengan standar desain minimalis modern.
- **Pembersihan Kartu Profil Satker**: Menghapus border-left berwarna dinamis (`borderLeft: 4px solid cmlColor`) pada kartu profil utama Satker di halaman eksplorasi detail profil satuan kerja, menyempurnakan keselarasan visual flat-edge di seluruh modul aplikasi.

## 12. Pembaruan Juni 2026: Dropdown Standar Terkategori & Pencegahan Clipping Nama Kategori Panjang
- **Dropdown Custom Searchable Terkategori Satker**: Menggantikan kembali select box HTML standar dengan Custom Searchable Dropdown yang super responsif dan modern. Modul ini menyaring Satuan Kerja secara real-time berdasarkan input teks pencarian pengguna.
- **Penyempurnaan Struktur Pengelompokan & Overflow-Visible**: Opsi satuan kerja tetap disajikan dalam pengelompokan yang sangat rapi berdasarkan "Kelompok Budker" (misal: *KP A*, *KP B*, dll.). Menghilangkan tag `overflow-hidden` pada kontainer induk utama dan membungkus elemen dekoratif radial blur secara terpisah untuk memastikan daftar opsi melayang di atas semua komponen (z-index tinggi) dan terbebas dari isu pemotongan/clipping visual baik di layar desktop, mobile, maupun iframe.
- **Dropdown Custom Championship Program (CP)**: Menggantikan select box bawaan browser pada menu pemilihan program evaluasi detail komponen dengan Custom Floating Dropdown yang elegan, dilengkapi transisi micro-animation halus, ikon Chevron dinamis, dan backdrop penutup transparan. Ini mengoptimalkan estetika visual dan kegunaan interaksi tanpa merusak tata letak grafik.
- **Pencegahan Potong Label Sumbu Y Recharts**: Meluaskan lebar (`width={180}`) sumbu Y pada grafik detail komponen Championship Program (CP) untuk memastikan nama parameter evaluasi panjang (seperti *"NNS: Coordination & Teamwork"*) tertayang lengkap, presisi, dan proporsional.
- **Membatasi Desimal Panjang pada Sumbu Nilai (Y-Axis/X-Axis)**: Menambahkan `tickFormatter` pada sumbu nilai numerik (baik sumbu Y pada chart vertikal maupun sumbu X pada chart horizontal) di seluruh modul visualisasi (Overview, Detail Satker, dan Laporan). Trik ini secara dinamis membatasi angka desimal panjang menjadi maksimal 2 angka di belakang koma (misalnya `3.3333333` menjadi `3.33`), menjaga estetika visual sumbu tetap presisi, bersih, dan rapi.
- **Reduksi Radius Bayangan Sidebar (Softer Shadow)**: Mengurangi kepekatan dan radius bayangan pada komponen Sidebar (`aside`) dari `shadow-2xl` menjadi `shadow-md` (saat diperluas) dan dari `shadow-lg` menjadi `shadow-sm` (saat diringkas) untuk menghadirkan kontras visual yang lebih lembut, flat, dan elegan sesuai dengan filosofi desain modern.
- **Scroll Vertikal Grafik Detail CP**: Membungkus ResponsiveContainer barchart Detail CP ke dalam container `overflow-y-auto scrollbar-thin` setinggi `h-64`, serta menskalakan tinggi grafik secara dinamis (misal: `Math.max(240, length * 30)`). Solusi ini menghadirkan scrollbar tipis yang super halus ketika jumlah komponen sangat banyak, mencegah tabrakan/pemampatan visual antar baris grafik.
- **Fitur Ekspansi Tampilan Penuh (Fullscreen Popup Modal)**: Menyediakan tombol ikon `Maximize2` (Expand) di samping judul panel Detail CP yang memicu modal overlay berukuran penuh (`max-w-4xl max-h-[90vh]`) dengan z-index tinggi dan efek backdrop buram. Di dalam modal ini, grafik digambar ulang secara lega dengan tinggi dinamis yang longgar, lengkap dengan tombol penutup (`X`) dan backdrop penutup interaktif, sehingga memudahkan analisis komprehensif tanpa pemotongan label sumbu.
- **Pembersihan & Penghapusan Visual Radar Chart**: Menghapus grafik radar "Radar Dinamika 4 Tahap Penilaian Program" sesuai instruksi guna menyederhanakan antarmuka dan memfokuskan analisis.
- **Penyelarasan Tata Letak Kartu Dampak NNS**: Menata ulang komponen "Dampak Nilai-Nilai Strategis (NNS)" menjadi lebar penuh (`w-full`) dengan tata letak grid 2 kolom pada layar desktop (`grid-cols-1 md:grid-cols-2`) sehingga visualisasi bar diagram kematangan perilaku kerja ini tetap berimbang, rapi, dan memaksimalkan ruang secara elegan.
- **Pembaruan Juni 2026: Optimasi Tampilan Responsif Tablet & Mobile**:
  - **Penyusutan Margin Kanan & Kiri Dinamis**: Mengubah margin kiri pada pembungkus konten utama (`lg:ml-24`) menjadi responsif dinamis (`showLabels ? "lg:ml-[304px] xl:ml-[336px]" : "lg:ml-24"`) untuk mencegah tabrakan/tumpang tindih visual antara Sidebar desktop dengan konten halaman ketika menu sidebar diperluas.
  - **Auto-Hide Teks Tombol Sinkronisasi**: Menyembunyikan teks label tombol "Sinkronisasi" (`hidden xl:inline`) pada resolusi tablet/mobile, menyisakan ikon petir (`Zap`/`Loader2`) yang sangat ringkas dan manis guna menghemat ruang horizontal secara masif.
  - **Penyembunyian Quick Search di Bawah Desktop**: Menggeser visibilitas komponen pencarian cepat di header utama dari `hidden md:flex` menjadi `hidden lg:flex` untuk memberi ruang lega bagi nama instansi/judul halaman yang panjang pada layar tablet berukuran sedang.
  - **Skalabilitas Teks Judul & Subtitle**: Menyesuaikan skala font judul halaman (`text-sm sm:text-base md:text-lg lg:text-xl`) dan batasan pemotongan teks subtitle (`max-w-[130px]`) agar tetap proporsional dan tidak pernah keluar dari batas grid/kontainer navbar.
  - **Dukungan Rotasi & Orientasi Tablet (Portrait & Landscape)**:
    - **Detail Satker Grid**: Mengubah tata letak unit identity dan ring chart pada `SatkerDetailView.tsx` menjadi `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`, sehingga ketika tablet diputar (mode landscape maupun portrait), kartu informasi identitas dan ring chart kematangan CML akan berdiri sejajar di baris pertama, sedangkan grafik komponen CP mengambil porsi `md:col-span-2 lg:col-span-2` di baris berikutnya untuk keseimbangan visual yang sempurna.
    - **Overview CP Grid**: Memodifikasi container CP Averages pada `OverviewView.tsx` dari `lg:grid-cols-5` menjadi `md:grid-cols-5` dengan pembagian kolom `md:col-span-3` dan `md:col-span-2`. Penataan ini memungkinkan visualisasi grafik batang program CP serta tabel rangkumannya bersanding secara horizontal pada resolusi tablet (baik portrait maupun landscape), menghindarkan susunan bertumpuk yang memakan terlalu banyak ruang vertikal.
  - **Pencegahan Teks Pecah (Text Wrapping) Saat Sidebar Dibuka**:
    - **Tombol Header**: Menambahkan kelas `whitespace-nowrap` pada seluruh tombol aksi utama di header ("Sinkronisasi", "Cetak Laporan", "Cadangan") serta teks label di dalamnya. Hal ini menjamin teks tidak akan pernah terbelah menjadi dua baris atau terpotong vertikal.
    - **Skalabilitas Teks Kondisional**: Menyesuaikan logika visibilitas teks tombol secara dinamis berdasarkan status ekspansi sidebar (`showLabels`). Saat sidebar dalam kondisi terbuka/ekspansi (mengambil ruang horizontal yang besar), teks tombol dikonfigurasi menggunakan `showLabels ? "2xl:inline" : "xl:inline"` sehingga pada layar laptop standar atau tablet landscape, label teks disembunyikan dengan mulus (menyisakan ikon fungsional yang ramping) untuk menghindari kepadatan horizontal.

## 13. Pembaruan Juli 2026: Standardisasi Skala Penilaian 1-4 dan Revisi Penamaan Label BI-Wide
- **Penyelarasan Skala Maksimal 4**: Menyesuaikan seluruh label visual penunjuk skala di dalam dasbor overview dan halaman laporan dari semula "skala 5.00" menjadi murni "skala 4.00" untuk konsistensi penilaian 1-4 tanpa opsi kustom skala 5.
- **Pembaruan Konfigurasi Settings**: Membatasi validasi input Target Kelayakan Budker (CML Target) di `SettingsView.tsx` dengan batas minimum `1.00` dan batas maksimum `4.00` serta memperbarui penjelasan instruksi agar sesuai dengan rentang skala 1-4.
- **Rebranding & Penyelarasan Nama Istilah**:
  - `CML PERWAKILAN (KPW)` diubah secara visual menjadi **CML Kantor Perwakilan**.
  - `TARGET KELAYAKAN BUDKER` diubah secara visual menjadi **Rata-rata CML BI-Wide**.
  - `ACUAN BATAS MINIMUM KELULUSAN` diubah secara visual menjadi **Acuan Rata-rata CML**.
  - `AMBANG BATAS KELAYAKAN NASIONAL` diubah secara visual menjadi **Rata-rata CML BI-Wide**.
  - `% UNIT MEMENUHI TARGET` diubah secara visual menjadi **% SATKER DI ATAS RATA-RATA**.
  - Seluruh referensi kata `LULUS` atau `MEMENUHI TARGET` diubah secara formal menjadi **di atas rata-rata** di seluruh modul representasi dasbor (`OverviewView`, `ReportView`, dan `BeforeTripView`).

## 14. Pembaruan Juli 2026: Dashboard Ranking, Slicing Label KP/KPw, dan Penambahan Keterangan CML
- **Rebranding Header Ranking**: Mengubah teks deskripsi dan subtitle pada penjelas Dashboard Ranking dari semula "Pemeringkatan Kinerja Kematangan Budaya Kerja per Satuan Kerja" menjadi **Pemeringkatan Culture Maturity Level Satuan Kerja** di tata letak `Layout.tsx`.
- **Standardisasi Filter Wilayah (KP/KPw)**: Menggantikan label filter scope wilayah "Pusat" menjadi **KP** dan "Daerah" menjadi **KPw** pada `RankingView.tsx`.
- **Rebranding Card Kinerja Rendah**: Mengubah label judul kartu statistika performa terendah dari semula "Butuh Perhatian Lebih" menjadi **Perlu Perhatian Khusus** pada `RankingView.tsx`.
- **Kolom Perbandingan Rata-Rata CML**: Menambahkan kolom baru bernama **Keterangan CML** di dalam tabel pemeringkatan utama yang secara cerdas membandingkan skor `cultureMaturityLevel` satuan kerja dengan rerata CML BI-Wide secara real-time, menyajikan lencana premium **Above Average** (Hijau) jika skor berada di atas atau sama dengan rata-rata, and **Below Average** (Merah) jika di bawah rata-rata. Kolom keterangan ini juga otomatis terintegrasi ke dalam ekspor dokumen CSV.
- **Penyelarasan Tipografi Championship Program**: Mengubah jenis huruf dari monospaced (`font-mono`) menjadi sans-serif (`font-sans`) pada nilai numerik perbandingan Championship Program agar selaras dan konsisten secara visual dengan bagian dasbor utama lainnya.

## 15. Pembaruan Juli 2026: Restrukturisasi Urutan Visual Dashboard Per-Satker
- **Penataan Ulang Layout**: Mengatur ulang struktur tata letak (visual layout sequence) pada halaman Eksplorasi Detail Per-Satker (`SatkerDetailView.tsx`) agar mengikuti hirarki penyajian informasi yang paling diprioritaskan:
  - Baris 1: **CML (Culture Maturity Level)** (Unit Identity dan Speedometer Ring Chart CML bersandingan dalam grid 2-kolom).
  - Baris 2: **Pilar Budker** (Skor Pilar Budaya Kerja Bank Indonesia, kiri) dan **EVP** (Skor Dimensi Employee Value Proposition, kanan) bersandingan sejajar secara horizontal dalam grid 2-kolom.
  - Baris 3: **Championship Program (CP)** (Detail Komponen Championship Program, kiri) dan **Dampak NNS** (Dampak Nilai-Nilai Strategis dengan visual progress bars 1-kolom, kanan) bersandingan sejajar di baris paling bawah.
- **Hasil Visual**: Menciptakan estetika bento-grid yang simetris, rapi, dan seimbang dengan proporsi lebar 50-50 yang konsisten di layar lebar, mempercepat pembacaan data secara intuitif.

## 16. Pembaruan Juli 2026: Restrukturisasi Komponen Detail Championship Program (CP)
- **Detail Komponen Baru**: Melakukan pemetaan ulang (remapping) indikator mikro Championship Program pada baris horizontal chart per-satuan kerja agar memuat tepat 11 komponen utama:
  1. **Skor Akhir CP** (Indikator agregat pencapaian program)
  2. **Deep Dive Culture** (Melakukan visualisasi skor analisis kualitatif internal)
  3. **Persona Walkthrough** (Tingkat pembiasaan perilaku kerja)
  4. **Reality Check** (Bersifat dinamis, hanya muncul pada program *AKUKEREN*, *OBF*, dan *3H*)
  5. **Kesesuaian EVP** (Tingkat asimilasi Employee Value Proposition)
  6. **Kesesuaian Pilar Budker** (Tingkat relevansi pilar budaya Bank Indonesia)
  7. **Trust & Integrity** (Penilaian dampak nilai amanah)
  8. **Professionalism** (Penilaian dampak nilai kompeten)
  9. **Excellence** (Penilaian dampak nilai berorientasi pelayanan)
  10. **Public Interest** (Penilaian dampak nilai loyal)
  11. **Coordination & Teamwork** (Penilaian dampak nilai harmonis & kolaboratif)
- **Pembersihan Parameter**: Parameter lama `Keterlibatan` dan `NNS: ` prefixes dihapus serta digantikan dengan label sekuensial yang bersih dan presisi sesuai instruksi pengguna demi konsistensi penulisan nama komponen.
- **Fitur Baru - Pengurutan CP (Sorting)**: Menambahkan fungsionalitas pengurutan asendens (terendah) dan desendens (tertinggi) serta default (asli) secara responsif melalui segmented control yang estetik. Sistem menyinkronkan status pengurutan ini antara visualisasi bento-grid standar dan perluasan popup fullscreen modal secara dinamis.
- **Penyelarasan Layout Responsif Tanpa Gap**: Memperbaiki pembungkus kontrol agar menggunakan susunan bertumpuk vertikal (`flex flex-col items-start sm:items-end gap-2 shrink-0`). Fungsionalitas pengurutan `[Asli, Terendah, Tertinggi]` kini diposisikan secara presisi tegak lurus di atas dropdown kategori program budaya. Hal ini menjaga kontrol tetap nempel rapi ke sisi kanan atas tanpa ada gap putih kosong yang besar, serta menjaga kompatibilitas responsif di perangkat mobile (mengalir ke kiri secara aman).
- **Pengurangan Gap & Peningkatan Tinggi Kontainer Grafik**: Mengurangi top margin/padding space-y pada wadah utama (`space-y-1.5`) untuk mempersempit celah kosong putih dari subtitle ke grafik bar. Memperbesar ukuran tinggi kotak kontainer bar (`h-[400px]`) dan tinggi SVG grafik (`380px`) serta menaikkan margin atas Recharts (`margin top: 2`) untuk memastikan teks parameter teratas ("Coordination & Teamwork") selalu tampil penuh tanpa terpotong atau tersembunyi.

## 17. Pembaruan Juli 2026 (Checkpoint 3): Integrasi Radar Dinamika dan Komparasi Dampak NNS per CP
- **Visualisasi Radar Dinamika Capaian CP**: Menambahkan komponen Radar Chart ("Radar Dinamika Capaian CP") di sebelah kanan detail komponen CP dalam bento-grid Block 4. Radar chart ini menyajikan performa dinamis skor akhir di 5 program kebudayaan aktif secara proporsional menggunakan spektrum warna amber emas yang premium, lengkap dengan tooltip kustom bergaya Tremor.
- **Penyelarasan Layout Samping Kanan Atas Tanpa Gap**: Menata ulang pembungkus kontrol selektor pengurutan dan dropdown kategori CP agar senantiasa nempel rapi ke sudut kanan atas kontainer bento-grid, melenyapkan sisa gap putih besar secara total baik pada perangkat desktop, tablet, maupun mobile.
- **Komparasi Dampak NNS per Championship Program**: Menambahkan visualisasi baru berupa grouped bar chart ("Komparasi Dampak NNS per Championship Program") pada Block 5 yang menyandingkan nilai 5 NNS (Trust & Integrity, Professionalism, Excellence, Public Interest, Coordination & Teamwork) di seluruh 5 program kebudayaan aktif (SESPI OK, AKU KEREN, OBF, 3H, PINTER) secara komparatif untuk analisis lintas-program.
- **Vite & GAS Sinkronisasi Instan**: Secara otomatis melakukan build ulang dan menyalin hasil bundle murni `dist/index.html` ke berkas `Dashboard-for-Spreadsheet.html` dan `Dashboard-for-Spreadsheet.txt`.

## 18. Pembaruan Laporan KPI Konsolidasi (Interactive Executive Reporting Hub)
- **Ekspor PDF / Cetak Laporan Eksekutif**: Menambahkan tombol "Ekspor PDF / Cetak" premium menggunakan modular engine `captureAndPrint` untuk menangkap seluruh halaman laporan dalam format PDF beresolusi tinggi dengan stylesheet cetak yang bersih dari elemen navigasi/filter yang tidak diperlukan.
- **Proporsi Donut Chart Klasifikasi Budaya (CML Share)**: Mendesain ulang panel distribusi kematangan budaya menjadi bento-box 2 kolom. Menyematkan *Donut Chart* Recharts interaktif yang menampilkan proporsi kategori *Aligned*, *Engaged*, *Enable*, dan *Empower* lengkap dengan indikator angka pusat yang sangat estetik.
- **Tabel Konsolidasi Detail KPI Satuan Kerja**: Menyisipkan tabel analisis data eksekutif di bagian bawah laporan untuk memberikan transparansi data yang memuat:
  - Pencarian real-time berbasis kata kunci nama Satker, jenis, kelompok, atau rubrik.
  - Dropdown filter kategori benchmark kematangan CML (*Aligned, Engaged, Enable, Empower*).
  - Penyalinan instan (*Salin ke Sheets*) yang memformat seluruh baris tersaring ke dalam format *Tab-Separated Values* (TSV) agar siap ditempel langsung ke Google Sheets.
  - Fungsionalitas pengurutan kolom (*sorting*) dua arah untuk nilai CML maupun ke-5 Championship Program.
  - Paginasi data yang rapi dan teratur (10, 25, 50, atau 100 baris per halaman) demi kenyamanan pembacaan.

## 19. Penyempurnaan Parameter & Penguncian Target CML (Juli 2026)
- **Penguncian Target Kelayakan Budker (CML Target)**: Sesuai dengan instruksi pengguna, opsi pengaturan khusus (custom) untuk Target CML di halaman Pengaturan Sistem telah ditiadakan sepenuhnya dari antarmuka pengguna. Target kelayakan kematangan kini dikunci secara otomatis pada angka maksimalnya yaitu **4.00** secara permanen, sehingga menjaga standardisasi penilaian di seluruh Satuan Kerja secara konsisten dan transparan.

## 20. Perbaikan Layout & Overflow Viewport (Juli 2026)
- **Perbaikan Header & Navigasi**: Memperbaiki masalah visual di mana header panel "Konfigurasi System" dan tombol aksi di sebelah kanan (seperti sinkronisasi dan cetak laporan) terpotong/overflow keluar dari batas layar. Masalah ini diselesaikan dengan mengganti margin-left layout menjadi padding-left pada container utama, mencegah bug pergeseran elemen flexbox pada viewport desktop, serta memastikan scrollbar vertikal tampil presisi pada sisi kanan tanpa terpotong.
- **Penyelarasan Presisi Header & Penguncian Posisi Tombol**: Memperbaiki bug visual di mana tombol aksi (Sinkronisasi, Cetak, Cadangan, dan Lonceng Notifikasi) keluar/meleset dari batas kontainer putih (header) saat menu navigasi dibuka-tutup. Langkah penanganan:
  - Mengganti `transition-all` menjadi `transition-colors` pada elemen `<header>` untuk menonaktifkan transisi properti `width` bawaan browser yang tidak sinkron dengan kecepatan animasi padding parent container.
  - Menambahkan aturan `min-w-0 flex-1` pada wadah judul/deskripsi kiri agar teks deskripsi panjang memicu ellipsis (`truncate`) secara responsif saat kontainer menyusut.
  - Menambahkan aturan `shrink-0` pada kontainer aksi kanan agar tombol-tombol tetap terkunci presisi di posisi ujung kanan kontainer tanpa terlipat, bergeser, atau keluar dari batas latar belakang putih.

## 21. Penanganan Warning Ukuran Recharts ResponsiveContainer (Juli 2026)
- **Resolusi Masalah Perhitungan Dimensi Chart**: Menghilangkan error/peringatan Recharts terkait `width(-1) and height(-1) of chart should be greater than 0` yang dipicu oleh keterlambatan perhitungan lebar/tinggi elemen dalam kontainer flexbox/grid dinamis saat mounting awal atau perubahan responsif. Penanganan diselesaikan dengan:
  - Memasang properti `minWidth={0}` langsung pada seluruh elemen `<ResponsiveContainer>` di seluruh dashboard (`OverviewView`, `SatkerDetailView`, `ReportView`, dan `overview-kpi-card`).
  - Menambahkan utility class Tailwind `min-w-0` pada elemen pembungkus (wrapper `div`) dari setiap grafik untuk memicu perhitungan layout flexbox/grid modern yang presisi tanpa menyusutkan lebar kontainer menjadi 0 atau negatif.



