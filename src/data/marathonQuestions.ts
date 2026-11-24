import { NPCId, Question } from '../types/game';

interface RawMarathonEntry {
  id: string;
  deckTag: 'chance' | 'community_chest';
  category: Question['category'];
  difficulty: Question['difficulty'];
  scenario?: string;
  text: string;
  options: [string, string, string, string];
  rawCorrect: 0 | 1 | 2 | 3;
  explanation: string;
  npc: NPCId;
}

/**
 * Merotasi posisi opsi jawaban secara deterministik agar kunci jawaban benar
 * tersebar merata di posisi A (0), B (1), C (2), dan D (3) tanpa mengubah akurasi isi.
 */
function rotateQuestion(entry: RawMarathonEntry, shift: number): Question {
  const s = ((shift % 4) + 4) % 4;
  const rotated: [string, string, string, string] = [
    entry.options[(4 - s) % 4],
    entry.options[(5 - s) % 4],
    entry.options[(6 - s) % 4],
    entry.options[(7 - s) % 4],
  ];
  const newCorrect = ((entry.rawCorrect + s) % 4) as 0 | 1 | 2 | 3;

  return {
    id: entry.id,
    deckTag: entry.deckTag,
    category: entry.category,
    difficulty: entry.difficulty,
    scenario: entry.scenario,
    text: entry.text,
    options: rotated,
    correctIndex: newCorrect,
    explanation: entry.explanation,
    npc: entry.npc,
  };
}

const RAW_MARATHON_ENTRIES: RawMarathonEntry[] = [
  // =========================================================================
  // KATEGORI 1: KARTU KESEMPATAN — LEVEL 1 (PUTARAN 1–5) — 15 SOAL DASAR
  // =========================================================================
  {
    id: 'm_ch_1',
    deckTag: 'chance',
    category: 'Revolusi Industri',
    difficulty: 'Dasar',
    text: 'Negara manakah yang menjadi tempat lahirnya Revolusi Industri pertama kali pada abad ke-18 sebelum menyebar ke seluruh dunia?',
    options: ['Amerika Serikat', 'Inggris', 'Jerman', 'Jepang'],
    rawCorrect: 1,
    explanation:
      'Revolusi Industri 1.0 pertama kali berkembang di Inggris pada abad ke-18 berkat dukungan sumber daya batu bara, bijih besi, modal, dan ilmu pengetahuan.',
    npc: 'arka',
  },
  {
    id: 'm_ch_2',
    deckTag: 'chance',
    category: 'Revolusi Industri',
    difficulty: 'Dasar',
    text: 'Siapakah tokoh penemu dan insinyur yang dikenal luas menyempurnakan mesin uap sehingga menjadi penggerak utama pabrik dan lokomotif pada Revolusi Industri 1.0?',
    options: ['James Watt', 'Henry Ford', 'Nikola Tesla', 'Guglielmo Marconi'],
    rawCorrect: 0,
    explanation:
      'James Watt menyempurnakan mesin uap agar jauh lebih efisien sehingga dapat menggerakkan mesin-mesin industri tekstil dan transportasi kereta.',
    npc: 'arka',
  },
  {
    id: 'm_ch_3',
    deckTag: 'chance',
    category: 'Revolusi Industri',
    difficulty: 'Dasar',
    text: 'Dua sumber daya alam utama yang melimpah di Inggris dan berperan vital dalam pembuatan mesin serta bahan bakar pabrik pada abad ke-18 adalah...',
    options: [
      'Batu bara dan bijih besi',
      'Minyak bumi dan uranium',
      'Tembaga dan timah putih',
      'Gas alam dan nikel',
    ],
    rawCorrect: 0,
    explanation:
      'Batu bara digunakan sebagai sumber energi panas mesin uap, sedangkan bijih besi diolah menjadi rangka mesin pabrik dan rel kereta.',
    npc: 'arka',
  },
  {
    id: 'm_ch_4',
    deckTag: 'chance',
    category: 'Revolusi Industri',
    difficulty: 'Dasar',
    text: 'Peralihan sumber tenaga pabrik dari mesin uap ke energi listrik serta penerapan sistem jalur perakitan (assembly line) menandai dimulainya...',
    options: [
      'Revolusi Industri 1.0',
      'Revolusi Industri 2.0',
      'Revolusi Industri 3.0',
      'Revolusi Industri 4.0',
    ],
    rawCorrect: 1,
    explanation:
      'Revolusi Industri 2.0 (akhir abad ke-19 hingga awal abad ke-20) ditandai dengan elektrifikasi dan jalur perakitan untuk produksi massal.',
    npc: 'arka',
  },
  {
    id: 'm_ch_5',
    deckTag: 'chance',
    category: 'Revolusi Industri',
    difficulty: 'Dasar',
    text: 'Sistem jalur perakitan bergerak (moving assembly line) yang mempercepat produksi mobil secara massal dan menekan harga jual dipopulerkan oleh...',
    options: ['Henry Ford', 'James Watt', 'Alan Turing', 'Tim Berners-Lee'],
    rawCorrect: 0,
    explanation:
      'Henry Ford menerapkan jalur perakitan pada awal abad ke-20 dalam produksi mobil sehingga barang dapat dibuat jauh lebih cepat dan murah.',
    npc: 'arka',
  },
  {
    id: 'm_ch_6',
    deckTag: 'chance',
    category: 'Revolusi Industri',
    difficulty: 'Dasar',
    text: 'Pada dekade 1970-an, proses manufaktur mulai menggunakan komputer, mikroprosesor, dan robot terprogram. Tahapan ini dikenal sebagai era...',
    options: [
      'Mekanisasi uap',
      'Elektrifikasi massal',
      'Otomatisasi berbasis komputer',
      'Konektivitas cerdas IoT',
    ],
    rawCorrect: 2,
    explanation:
      'Revolusi Industri 3.0 ditandai oleh hadirnya komputer, mikroprosesor, dan robot industri yang mengotomatisasi proses produksi.',
    npc: 'arka',
  },
  {
    id: 'm_ch_7',
    deckTag: 'chance',
    category: 'Era Digital',
    difficulty: 'Dasar',
    text: 'Revolusi Industri 4.0 menitikberatkan pada penggabungan teknologi otomatisasi dengan pertukaran data melalui internet, kecerdasan buatan (AI), dan...',
    options: [
      'Internet of Things (IoT)',
      'Mesin tenun tangan',
      'Lokomotif batu bara',
      'Telegraf mekanik',
    ],
    rawCorrect: 0,
    explanation:
      'Revolusi Industri 4.0 mengintegrasikan sistem fisik dan digital melalui Internet of Things (IoT), AI, Big Data, dan komputasi awan.',
    npc: 'arka',
  },
  {
    id: 'm_ch_8',
    deckTag: 'chance',
    category: 'Era Digital',
    difficulty: 'Dasar',
    text: 'Konsep teknologi yang memungkinkan benda-benda fisik di sekitar kita terhubung ke internet sehingga dapat mengumpulkan dan bertukar data secara otomatis disebut...',
    options: [
      'Internet of Things (IoT)',
      'Jalur perakitan linier',
      'Mekanisasi tekstil',
      'Mesin uap tertutup',
    ],
    rawCorrect: 0,
    explanation:
      'IoT menghubungkan perangkat fisik seperti sensor suhu, kamera pengawas, dan mesin pabrik ke jaringan internet untuk komunikasi data real-time.',
    npc: 'arka',
  },
  {
    id: 'm_ch_9',
    deckTag: 'chance',
    category: 'Era Digital',
    difficulty: 'Dasar',
    text: 'Teknologi yang memungkinkan penyimpanan data, pengelolaan berkas, dan akses perangkat lunak melalui jaringan internet tanpa harus tersimpan di hard disk lokal disebut...',
    options: [
      'Cloud Computing (komputasi awan)',
      'Robotika perakitan berat',
      'Elektrifikasi jaringan listrik',
      'Penyimpanan arsip kertas',
    ],
    rawCorrect: 0,
    explanation:
      'Cloud Computing menyediakan layanan komputasi dan penyimpanan berbasis internet yang dapat diakses fleksibel dari berbagai perangkat.',
    npc: 'arka',
  },
  {
    id: 'm_ch_10',
    deckTag: 'chance',
    category: 'Era Digital',
    difficulty: 'Dasar',
    text: 'Kumpulan data digital dalam volume sangat besar, berkecepatan tinggi, dan beragam jenisnya yang dianalisis untuk menemukan pola tersembunyi disebut...',
    options: ['Big Data', 'Mikroprosesor tunggal', 'Mesin cetak manual', 'Sensor mekanis'],
    rawCorrect: 0,
    explanation:
      'Big Data adalah himpunan data raksasa yang diolah untuk memahami tren perilaku masyarakat maupun kinerja sistem.',
    npc: 'arka',
  },
  {
    id: 'm_ch_11',
    deckTag: 'chance',
    category: 'Era Digital',
    difficulty: 'Dasar',
    text: 'Kecerdasan buatan (Artificial Intelligence) dirancang agar sistem komputer mampu meniru kemampuan kognitif manusia, seperti...',
    options: [
      'Mengenali pola, memahami bahasa, dan mengambil keputusan berbasis data',
      'Menghasilkan uap air bertekanan tinggi dari pembakaran kayu',
      'Menggantikan aliran listrik pada kabel tembaga',
      'Mencetak dokumen fisik tanpa menggunakan tinta',
    ],
    rawCorrect: 0,
    explanation:
      'AI memampukan mesin belajar dari data, mengenali pola suara/gambar, memahami bahasa alami, dan memberikan rekomendasi cerdas.',
    npc: 'arka',
  },
  {
    id: 'm_ch_12',
    deckTag: 'chance',
    category: 'Era Digital',
    difficulty: 'Dasar',
    text: 'Periode perkembangan peradaban manusia ketika informasi dikelola, disimpan, dan disebarkan dalam format digital berbasis komputer serta jaringan internet disebut...',
    options: [
      'Era Digital',
      'Era Agraris Tradisional',
      'Era Mekanisasi Uap',
      'Era Perdagangan Barter',
    ],
    rawCorrect: 0,
    explanation:
      'Era Digital ditandai dengan pemanfaatan teknologi informasi, komputer, dan internet dalam hampir seluruh aktivitas kehidupan manusia.',
    npc: 'arka',
  },
  {
    id: 'm_ch_13',
    deckTag: 'chance',
    category: 'Revolusi Industri',
    difficulty: 'Dasar',
    text: 'Selain penggunaan listrik di pabrik, perkembangan komunikasi jarak jauh pada masa Revolusi Industri 2.0 didukung oleh penemuan...',
    options: [
      'Telegraf dan telepon',
      'Media sosial berbasis AI',
      'Satelit internet orbit rendah',
      'Aplikasi pesan instan terenkripsi',
    ],
    rawCorrect: 0,
    explanation:
      'Pada masa Revolusi Industri 2.0, komunikasi lintas jarak mulai dipercepat dengan hadirnya jaringan telegraf dan telepon kabel.',
    npc: 'arka',
  },
  {
    id: 'm_ch_14',
    deckTag: 'chance',
    category: 'Era Digital',
    difficulty: 'Dasar',
    text: 'Manakah di bawah ini yang merupakan contoh penerapan teknologi Internet of Things (IoT) dalam kehidupan rumah tangga sehari-hari?',
    options: [
      'Lampu dan pendingin ruangan pintar yang dapat dikendalikan jarak jauh melalui aplikasi ponsel',
      'Kompor minyak tanah tradisional yang dinyalakan secara manual',
      'Mesin jahit kayuh bertenaga kaki',
      'Jam dinding mekanik yang diputar pegasnya setiap minggu',
    ],
    rawCorrect: 0,
    explanation:
      'Perangkat rumah pintar (smart home) terhubung ke internet sehingga dapat dipantau dan dikendalikan pengguna dari mana saja.',
    npc: 'arka',
  },
  {
    id: 'm_ch_15',
    deckTag: 'chance',
    category: 'Era Digital',
    difficulty: 'Dasar',
    text: 'Kegiatan jual beli barang dan jasa yang dilakukan secara elektronik melalui situs web atau aplikasi jaringan internet dikenal sebagai...',
    options: [
      'E-Commerce (perdagangan elektronik)',
      'Sistem barter tradisional',
      'Produksi kerajinan tangan',
      'Jalur perakitan pabrik',
    ],
    rawCorrect: 0,
    explanation:
      'E-commerce merupakan salah satu wujud nyata transformasi ekonomi di Era Digital yang mempertemukan penjual dan pembeli secara daring.',
    npc: 'saga',
  },

  // =========================================================================
  // KATEGORI 1: KARTU KESEMPATAN — LEVEL 2 (PUTARAN 6–10) — 15 SOAL MENENGAH
  // =========================================================================
  {
    id: 'm_ch_16',
    deckTag: 'chance',
    category: 'Dampak Teknologi',
    difficulty: 'Menengah',
    scenario:
      'Pada awal Revolusi Industri di Inggris, berdirinya pabrik-pabrik tekstil besar di kota menyebabkan banyak petani meninggalkan lahan pertanian di desa untuk bekerja sebagai buruh pabrik.',
    text: 'Dampak sosiologis paling nyata dari perpindahan penduduk tersebut terhadap struktur kota adalah...',
    options: [
      'Terjadinya urbanisasi pesat yang memicu pertumbuhan pemukiman padat di sekitar kawasan industri',
      'Berkurangnya jumlah penduduk kota secara drastis',
      'Hilangnya perbedaan antara wilayah desa dan kawasan pabrik',
      'Kembalinya sistem produksi barang ke rumah-rumah penduduk',
    ],
    rawCorrect: 0,
    explanation:
      'Industrialisasi menarik tenaga kerja desa menuju kota (urbanisasi), yang kemudian mengubah struktur sosial dan tata ruang perkotaan.',
    npc: 'nara',
  },
  {
    id: 'm_ch_17',
    deckTag: 'chance',
    category: 'Revolusi Industri',
    difficulty: 'Menengah',
    scenario:
      'Sebelum diterapkan sistem jalur perakitan (assembly line), mobil hanya mampu dibeli kalangan sangat kaya karena dirakit satu per satu secara lambat.',
    text: 'Bagaimana inovasi Revolusi Industri 2.0 mengubah akses masyarakat terhadap barang-barang industri?',
    options: [
      'Produksi massal menurunkan biaya pembuatan per unit sehingga barang menjadi lebih terjangkau oleh masyarakat luas',
      'Harga barang menjadi semakin mahal karena membutuhkan lebih banyak listrik',
      'Jumlah barang yang diproduksi dibatasi hanya untuk kalangan bangsawan',
      'Waktu perakitan satu unit kendaraan bertambah menjadi beberapa tahun',
    ],
    rawCorrect: 0,
    explanation:
      'Elektrifikasi dan jalur perakitan mempercepat produksi dalam jumlah besar sehingga biaya produksi turun dan barang lebih terjangkau.',
    npc: 'arka',
  },
  {
    id: 'm_ch_18',
    deckTag: 'chance',
    category: 'Revolusi Industri',
    difficulty: 'Menengah',
    scenario:
      'Sebuah perusahaan elektronik mengganti penyolderan komponen papan sirkuit manual oleh pekerja dengan lengan robot terprogram komputer.',
    text: 'Keunggulan teknis utama dari penerapan teknologi Revolusi Industri 3.0 tersebut adalah...',
    options: [
      'Tingkat ketelitian dan konsistensi hasil produksi meningkat tinggi serta meminimalkan cacat produk',
      'Pabrik tidak lagi membutuhkan tenaga ahli pemrograman komputer',
      'Proses produksi menjadi bergantung pada tenaga uap air',
      'Kecepatan perakitan menurun drastis dibanding kerja tangan',
    ],
    rawCorrect: 0,
    explanation:
      'Komputerisasi dan robotika pada Industri 3.0 meningkatkan presisi, efisiensi, dan konsistensi kualitas dalam manufaktur.',
    npc: 'arka',
  },
  {
    id: 'm_ch_19',
    deckTag: 'chance',
    category: 'Era Digital',
    difficulty: 'Menengah',
    scenario:
      'Aplikasi pemutar musik dan film digital mampu menyusun daftar putar otomatis yang sangat sesuai dengan selera pengguna berdasarkan lagu yang sering diputar dan dilewati.',
    text: 'Bagaimana cara kerja teknologi Era Digital di balik fitur personalisasi tersebut?',
    options: [
      'Sistem mengumpulkan riwayat aktivitas pengguna sebagai Big Data lalu algoritma AI menganalisis pola preferensinya',
      'Petugas operator memilihkan lagu secara manual satu per satu untuk jutaan pengguna',
      'Aplikasi memutar lagu secara acak tanpa menyimpan data pengguna',
      'Perangkat menggunakan sensor suhu ruangan untuk menentukan jenis musik',
    ],
    rawCorrect: 0,
    explanation:
      'Kombinasi Big Data dan AI memungkinkan platform digital mempelajari kebiasaan pengguna dan menyajikan konten yang dipersonalisasi.',
    npc: 'arka',
  },
  {
    id: 'm_ch_20',
    deckTag: 'chance',
    category: 'Era Digital',
    difficulty: 'Menengah',
    scenario:
      'Sebuah universitas menyelenggarakan wisuda virtual dan kuliah daring lintas negara, sementara perusahaan logistik memakai gudang otomatis berbasis robot AI.',
    text: 'Manakah analisis klasifikasi yang paling tepat mengenai kedua fenomena tersebut?',
    options: [
      'Gudang otomatis mencerminkan penerapan Revolusi Industri 4.0, sedangkan kuliah daring merupakan bagian dari transformasi luas Era Digital',
      'Kuliah daring termasuk Revolusi Industri 1.0, sedangkan gudang otomatis termasuk Revolusi Industri 2.0',
      'Keduanya hanya dapat berjalan apabila menggunakan mesin uap',
      'Era Digital hanya mencakup kegiatan di dalam pabrik manufaktur',
    ],
    rawCorrect: 0,
    explanation:
      'Revolusi Industri 4.0 berfokus pada digitalisasi sistem industri/produksi, sedangkan Era Digital melingkupi seluruh sektor kehidupan sosial, pendidikan, dan layanan.',
    npc: 'arka',
  },
  {
    id: 'm_ch_21',
    deckTag: 'chance',
    category: 'Dampak Teknologi',
    difficulty: 'Menengah',
    scenario:
      'Pedagang kaki lima di pusat kuliner kini menyediakan kode QR digital sehingga pembeli cukup memindai lewat ponsel tanpa perlu uang kembalian tunai.',
    text: 'Perubahan pola interaksi ekonomi yang tercermin dari adopsi teknologi tersebut adalah...',
    options: [
      'Digitalisasi keuangan mempermudah pencatatan transaksi dan mempercepat pembayaran hingga ke pelaku usaha mikro',
      'Masyarakat dilarang menyimpan uang dalam bentuk tabungan bank',
      'Transaksi jual beli hanya dapat dilakukan oleh perusahaan besar',
      'Penggunaan smartphone menurunkan minat masyarakat untuk berbelanja',
    ],
    rawCorrect: 0,
    explanation:
      'Teknologi pembayaran digital memperluas inklusi keuangan dan mempermudah transaksi ekonomi bagi pedagang kecil maupun konsumen.',
    npc: 'saga',
  },
  {
    id: 'm_ch_22',
    deckTag: 'chance',
    category: 'Era Digital',
    difficulty: 'Menengah',
    scenario:
      'Truk pengangkut vaksin dan bahan makanan segar dilengkapi sensor suhu IoT yang mengirimkan laporan langsung ke pusat pemantauan jika suhu ruang pendingin naik.',
    text: 'Manfaat strategis penerapan IoT dalam rantai distribusi tersebut adalah...',
    options: [
      'Mencegah kerusakan barang sensitif melalui pemantauan kondisi secara real-time selama perjalanan',
      'Menggantikan fungsi bahan bakar kendaraan dengan tenaga uap',
      'Menghapus kebutuhan akan pengemudi dan petugas kesehatan',
      'Menyimpan seluruh vaksin di dalam server komputasi awan',
    ],
    rawCorrect: 0,
    explanation:
      'Sensor IoT memungkinkan pemantauan kondisi fisik secara real-time sehingga kerusakan kualitas produk selama distribusi dapat dicegah.',
    npc: 'arka',
  },
  {
    id: 'm_ch_23',
    deckTag: 'chance',
    category: 'Dampak Teknologi',
    difficulty: 'Menengah',
    scenario:
      'Pasien di daerah kepulauan kini dapat berkonsultasi dengan dokter spesialis di ibu kota melalui panggilan video medis dan menerima resep elektronik.',
    text: 'Bagaimana peran Era Digital dalam mengatasi hambatan geografis pada kasus tersebut?',
    options: [
      'Teknologi informasi memangkas jarak fisik sehingga layanan konsultasi kesehatan lebih cepat dijangkau masyarakat',
      'Layanan dokter spesialis digantikan sepenuhnya oleh mesin uap',
      'Rumah sakit fisik di seluruh kota ditutup karena tidak lagi diperlukan',
      'Pasien tidak perlu lagi menjaga kesehatan tubuhnya',
    ],
    rawCorrect: 0,
    explanation:
      'Di Era Digital, layanan kesehatan berkembang melalui telemedisin yang memperluas jangkauan konsultasi medis lintas wilayah.',
    npc: 'saga',
  },
  {
    id: 'm_ch_24',
    deckTag: 'chance',
    category: 'Era Digital',
    difficulty: 'Menengah',
    scenario:
      'Perusahaan arsitektur di Indonesia bekerja sama dengan insinyur struktur di Jepang menyunting cetak biru bangunan 3D secara bersamaan melalui server awan.',
    text: 'Keunggulan utama Cloud Computing yang mendukung efisiensi proyek internasional tersebut adalah...',
    options: [
      'Sinkronisasi data secara real-time yang memungkinkan tim lintas negara bekerja pada satu sumber dokumen yang sama',
      'Penghapusan seluruh perangkat komputer di kantor arsitektur',
      'Pengiriman cetak biru kertas menggunakan kapal uap lintas samudra',
      'Pembatasan akses file hanya pada jam kerja lokal satu negara',
    ],
    rawCorrect: 0,
    explanation:
      'Cloud Computing memfasilitasi kolaborasi global dengan menyediakan akses terpusat dan pembaruan dokumen secara langsung melalui internet.',
    npc: 'arka',
  },
  {
    id: 'm_ch_25',
    deckTag: 'chance',
    category: 'Tantangan Global',
    difficulty: 'Menengah',
    scenario:
      'Sebuah pabrik otomotif modern mengurangi lowongan operator perakitan manual, tetapi membuka banyak lowongan untuk teknisi pemeliharaan robot dan analis data produksi.',
    text: 'Fenomena ketenagakerjaan yang tampak pada rekrutmen pabrik tersebut menunjukkan bahwa...',
    options: [
      'Kemajuan teknologi tidak menghilangkan seluruh pekerjaan, melainkan menggeser kebutuhan menuju keahlian teknis digital yang lebih tinggi',
      'Pabrik modern tidak lagi membutuhkan manusia dalam operasionalnya',
      'Keterampilan mengoperasikan komputer tidak memiliki nilai di dunia industri',
      'Proses perakitan mobil kembali dilakukan secara manual seperti abad ke-19',
    ],
    rawCorrect: 0,
    explanation:
      'Otomatisasi mengurangi pekerjaan fisik rutin namun menciptakan permintaan baru bagi tenaga kerja berketerampilan teknologi dan analisis data.',
    npc: 'nara',
  },
  {
    id: 'm_ch_26',
    deckTag: 'chance',
    category: 'Revolusi Industri',
    difficulty: 'Menengah',
    scenario:
      'Perusahaan listrik menerapkan jaringan listrik pintar (smart grid) berbasis sensor IoT untuk mendeteksi gangguan kabel secara otomatis dan mengatur distribusi daya sesuai beban pemakaian.',
    text: 'Inovasi ini merupakan penggabungan antara pencapaian Revolusi Industri 2.0 dan Revolusi Industri 4.0 karena...',
    options: [
      'Memadukan infrastruktur energi listrik (Industri 2.0) dengan kendali sensor digital dan analisis data cerdas (Industri 4.0)',
      'Mengganti pembangkit listrik modern dengan tungku pembakaran batu bara manual',
      'Menghapus jaringan kabel listrik di seluruh kawasan perkotaan',
      'Menggunakan tenaga manusia untuk memutar turbin pembangkit listrik',
    ],
    rawCorrect: 0,
    explanation:
      'Smart grid mengintegrasikan sistem kelistrikan (warisan Industri 2.0) dengan teknologi sensor dan otomatisasi digital khas Industri 4.0.',
    npc: 'arka',
  },
  {
    id: 'm_ch_27',
    deckTag: 'chance',
    category: 'Dampak Teknologi',
    difficulty: 'Menengah',
    scenario:
      'Pemerintah daerah mengubah layanan pengurusan dokumen kependudukan dari loket berkas fisik menjadi portal layanan daring terpadu.',
    text: 'Dampak positif transformasi digital pada sektor pelayanan publik tersebut adalah...',
    options: [
      'Meningkatkan transparansi, mempercepat waktu pengurusan, dan mengurangi antrean fisik masyarakat',
      'Mempersulit warga dalam mengakses hak administrasi kependudukan',
      'Meningkatkan penggunaan kertas secara besar-besaran di kantor kelurahan',
      'Membatasi layanan publik hanya bagi warga yang tinggal di sebelah kantor pemerintahan',
    ],
    rawCorrect: 0,
    explanation:
      'Digitalisasi pelayanan publik mempermudah akses masyarakat, menghemat waktu, serta meningkatkan efisiensi administrasi.',
    npc: 'saga',
  },
  {
    id: 'm_ch_28',
    deckTag: 'chance',
    category: 'Era Digital',
    difficulty: 'Menengah',
    scenario:
      'Sistem kecerdasan buatan dilatih menggunakan ratusan ribu citra rontgen medis untuk membantu dokter mendeteksi tanda awal kelainan paru-paru secara lebih cepat.',
    text: 'Peran strategis AI dalam studi kasus medis tersebut adalah...',
    options: [
      'Sebagai alat bantu analisis pola citra yang meningkatkan kecepatan dan ketepatan diagnosis dokter',
      'Menggantikan seluruh peran empati dan tanggung jawab etis dokter terhadap pasien',
      'Menghapus kebutuhan terhadap peralatan pemeriksaan medis di rumah sakit',
      'Menyimpan obat-obatan fisik di dalam jaringan internet',
    ],
    rawCorrect: 0,
    explanation:
      'AI berperan membantu tenaga profesional mengenali pola kompleks dalam data medis secara cepat guna mendukung keputusan yang lebih akurat.',
    npc: 'arka',
  },
  {
    id: 'm_ch_29',
    deckTag: 'chance',
    category: 'Dampak Teknologi',
    difficulty: 'Menengah',
    scenario:
      'Masyarakat kini lebih banyak mengakses berita melalui portal daring, podcast, dan media sosial dibandingkan surat kabar cetak konvensional.',
    text: 'Perubahan karakter penyebaran informasi di Era Digital yang terlihat dari fenomena ini adalah...',
    options: [
      'Informasi tersebar secara instan, interaktif, dan dapat diakses kapan saja melalui perangkat terhubung internet',
      'Berita hanya dapat dibaca satu kali sehari pada pagi hari',
      'Masyarakat tidak lagi membutuhkan informasi mengenai peristiwa terkini',
      'Biaya pencetakan koran kertas menjadi semakin murah dan mendominasi pasar',
    ],
    rawCorrect: 0,
    explanation:
      'Era Digital mengubah distribusi informasi menjadi jauh lebih cepat, mudah diakses lintas perangkat, dan bersifat dua arah.',
    npc: 'nara',
  },
  {
    id: 'm_ch_30',
    deckTag: 'chance',
    category: 'Revolusi Industri',
    difficulty: 'Menengah',
    scenario:
      'Pusat distribusi perusahaan ritel raksasa menggunakan ribuan robot otonom yang bergerak mengikuti kode batang di lantai untuk menyortir ratusan ribu paket per jam.',
    text: 'Mengapa penerapan teknologi tersebut menjadi krusial dalam ekosistem perdagangan digital modern?',
    options: [
      'Karena lonjakan transaksi belanja daring menuntut kecepatan dan ketepatan logistik yang melampaui kapasitas sortir manual',
      'Karena perusahaan ingin memperlambat pengiriman barang kepada konsumen',
      'Karena robot otonom digerakkan menggunakan tenaga uap air',
      'Karena sistem perdagangan daring melarang keterlibatan kurir pengantar barang',
    ],
    rawCorrect: 0,
    explanation:
      'Pertumbuhan e-commerce berskala masif membutuhkan dukungan otomatisasi logistik cerdas agar pengiriman barang tetap cepat dan akurat.',
    npc: 'arka',
  },

  // =========================================================================
  // KATEGORI 1: KARTU KESEMPATAN — LEVEL 3 (PUTARAN 11–15+) — 15 SOAL LANJUT
  // =========================================================================
  {
    id: 'm_ch_31',
    deckTag: 'chance',
    category: 'Tantangan Global',
    difficulty: 'Lanjut',
    scenario:
      'Pabrik pintar (smart factory) berbasis AI dan IoT meningkatkan produktivitas hingga 300% dan menekan cacat produksi mendekati nol, namun memicu pemangkasan tenaga kerja operator rutin secara besar-besaran.',
    text: 'Evaluasi sosiologis manakah yang paling tepat menggambarkan dilema struktural dari kemajuan tersebut?',
    options: [
      'Efisiensi ekonomi meningkat pesat, tetapi menimbulkan dislokasi tenaga kerja dan berisiko memperlebar ketimpangan antara pekerja berkeahlian tinggi dan rendah',
      'Kualitas produk industri menurun drastis karena mesin bekerja tanpa henti',
      'Penggunaan teknologi cerdas menghilangkan seluruh kebutuhan akan energi listrik',
      'Masyarakat menjadi semakin mudah mendapatkan pekerjaan kasar tanpa keterampilan',
    ],
    rawCorrect: 0,
    explanation:
      'Industri 4.0 menghadirkan efisiensi luar biasa sekaligus tantangan sosial berupa pergeseran lapangan kerja dan ketimpangan keterampilan.',
    npc: 'nara',
  },
  {
    id: 'm_ch_32',
    deckTag: 'chance',
    category: 'Tantangan Global',
    difficulty: 'Lanjut',
    scenario:
      'Akses gratis terhadap kursus daring terbuka (MOOC), perpustakaan digital, dan video edukasi memperluas peluang belajar mandiri bagi pelajar di seluruh dunia.',
    text: 'Mengapa demokratisasi informasi pendidikan tersebut belum otomatis menghapus ketimpangan kualitas sumber daya manusia antarwilayah?',
    options: [
      'Karena pemanfaatan sumber belajar digital masih terhambat oleh kesenjangan infrastruktur internet, kepemilikan gawai, serta perbedaan literasi digital',
      'Karena materi pembelajaran di internet tidak memiliki nilai ilmiah yang dapat dipertanggungjawabkan',
      'Karena pelajar di wilayah perkotaan dilarang mengakses perpustakaan digital',
      'Karena kemajuan teknologi membuat proses belajar menjadi tidak lagi penting',
    ],
    rawCorrect: 0,
    explanation:
      'Kesenjangan digital (digital divide) membuat kelompok dengan keterbatasan jaringan dan perangkat belum dapat menikmati peluang pendidikan digital secara setara.',
    npc: 'nara',
  },
  {
    id: 'm_ch_33',
    deckTag: 'chance',
    category: 'Tantangan Global',
    difficulty: 'Lanjut',
    scenario:
      'Sebuah kota metropolitan mengintegrasikan kendali lampu lalu lintas, distribusi air bersih, jaringan listrik, dan rekam medis rumah sakit dalam satu platform Cloud dan IoT terpadu.',
    text: 'Risiko sistemik paling kritis apakah yang harus diantisipasi oleh perancang tata kelola kota pintar tersebut?',
    options: [
      'Serangan siber terkoordinasi yang dapat melumpuhkan berbagai layanan vital publik sekaligus membocorkan data pribadi jutaan penduduk',
      'Kelangkaan pasokan batu bara untuk menggerakkan lampu lalu lintas kota',
      'Berkurangnya jumlah data sensor yang masuk ke dalam sistem penyimpanan awan',
      'Kembalinya sistem transportasi kota ke kereta api bertenaga uap',
    ],
    rawCorrect: 0,
    explanation:
      'Semakin tinggi tingkat keterhubungan infrastruktur digital, semakin besar pula dampak kerusakan apabila terjadi peretasan atau kegagalan keamanan siber.',
    npc: 'nara',
  },
  {
    id: 'm_ch_34',
    deckTag: 'chance',
    category: 'Revolusi Industri',
    difficulty: 'Lanjut',
    scenario:
      'Beberapa pengamat teknologi menyebut Revolusi Industri 4.0 sebagai pemutus total sejarah industri masa lalu karena seluruh proses kini berbasis perangkat lunak.',
    text: 'Berdasarkan analisis evolusi teknologi dalam modul, mengapa pandangan tersebut kurang tepat?',
    options: [
      'Karena Revolusi Industri 4.0 merupakan akumulasi penyempurnaan dari mekanisasi mesin (1.0), elektrifikasi produksi (2.0), dan otomatisasi komputer (3.0) yang kini dihubungkan secara cerdas',
      'Karena Revolusi Industri 4.0 sebenarnya sama persis dengan penggunaan mesin uap pada abad ke-18',
      'Karena listrik dan komputer baru ditemukan setelah teknologi kecerdasan buatan berkembang',
      'Karena setiap tahapan revolusi industri terjadi pada abad yang sama secara bersamaan',
    ],
    rawCorrect: 0,
    explanation:
      'Setiap revolusi industri dibangun di atas fondasi teknologi era sebelumnya dan menyempurnakannya ke tingkat efisiensi serta konektivitas yang lebih tinggi.',
    npc: 'arka',
  },
  {
    id: 'm_ch_35',
    deckTag: 'chance',
    category: 'Strategi Masa Depan',
    difficulty: 'Lanjut',
    scenario:
      'Perusahaan global mulai menarik kembali fasilitas produksinya dari negara berupah buruh rendah karena pabrik otomatis berbasis robot di negara asal terbukti lebih hemat biaya.',
    text: 'Kesimpulan strategis paling tajam bagi negara berkembang dalam merespons tren relokasi industri (reshoring) tersebut adalah...',
    options: [
      'Keunggulan upah tenaga kerja murah tidak lagi relevan di era otomatisasi, sehingga negara harus berinvestasi pada pendidikan teknologi, riset, dan peningkatan keterampilan SDM',
      'Negara berkembang harus menurunkan upah pekerja serendah mungkin agar tetap dipilih perusahaan asing',
      'Negara harus melarang penggunaan robot dan komputer di seluruh kawasan industri',
      'Perdagangan internasional akan segera berakhir dan digantikan ekonomi tertutup',
    ],
    rawCorrect: 0,
    explanation:
      'Otomatisasi menggeser daya saing ekonomi dari tenaga kerja murah menuju penguasaan teknologi, inovasi, dan kualitas sumber daya manusia.',
    npc: 'saga',
  },
  {
    id: 'm_ch_36',
    deckTag: 'chance',
    category: 'Dampak Teknologi',
    difficulty: 'Lanjut',
    scenario:
      'Sebuah sistem AI perekrutan karyawan dilatih menggunakan data historis perusahaan selama 20 tahun terakhir, yang ternyata secara tidak sadar membuat sistem menolak pelamar dari kelompok demografis tertentu.',
    text: 'Pelajaran kritis apakah yang dapat ditarik mengenai penggunaan Big Data dan AI dalam pengambilan keputusan sosial?',
    options: [
      'Algoritma AI tidak selalu netral karena kualitas keputusannya sangat bergantung pada objektivitas data latih dan pengawasan etis manusia',
      'Keputusan mesin AI selalu 100% adil dan tidak pernah boleh dievaluasi oleh manusia',
      'Penggunaan Big Data harus dihapuskan dari seluruh kegiatan administrasi modern',
      'Kesalahan algoritma disebabkan oleh kurangnya tenaga listrik pada komputer',
    ],
    rawCorrect: 0,
    explanation:
      'Big Data dan AI adalah alat bantu analisis; manusia tetap harus menerapkan berpikir kritis dan pengawasan etis agar teknologi tidak melanggengkan ketimpangan.',
    npc: 'nara',
  },
  {
    id: 'm_ch_37',
    deckTag: 'chance',
    category: 'Dampak Teknologi',
    difficulty: 'Lanjut',
    scenario:
      'Media sosial menghubungkan miliaran manusia lintas benua dalam hitungan detik, tetapi berbagai survei menunjukkan meningkatnya rasa kesepian dan terasing di kalangan pengguna aktif.',
    text: 'Bagaimana sosiologi menjelaskan paradoks komunikasi di Era Digital tersebut?',
    options: [
      'Interaksi daring yang dangkal dan ketergantungan pada layar sering kali menggantikan kedalaman hubungan empatik dalam interaksi sosial tatap muka',
      'Media sosial melarang penggunanya berkomunikasi dengan teman dan keluarga',
      'Masyarakat modern tidak lagi memiliki keinginan untuk berinteraksi dengan sesama',
      'Jaringan internet membuat komunikasi jarak jauh menjadi lebih lambat daripada surat pos',
    ],
    rawCorrect: 0,
    explanation:
      'Ketergantungan pada perangkat digital dapat menurunkan kualitas interaksi sosial langsung yang dibutuhkan manusia untuk membangun ikatan sosial yang bermakna.',
    npc: 'nara',
  },
  {
    id: 'm_ch_38',
    deckTag: 'chance',
    category: 'Tantangan Global',
    difficulty: 'Lanjut',
    scenario:
      'Banyak institusi strategis menyimpan data penting masyarakat pada layanan Cloud Computing yang server fisiknya dikelola perusahaan multinasional di luar negeri.',
    text: 'Aspek strategis apakah yang menjadi perhatian utama negara terkait tata kelola data lintas batas tersebut?',
    options: [
      'Perlindungan privasi warga negara, keamanan siber nasional, serta regulasi tata kelola data agar tidak disalahgunakan pihak asing',
      'Kebutuhan untuk memindahkan seluruh server cloud ke dalam lokomotif uap',
      'Pelarangan penggunaan internet bagi seluruh lembaga pendidikan dan penelitian',
      'Pengurangan kapasitas penyimpanan data digital secara nasional',
    ],
    rawCorrect: 0,
    explanation:
      'Keamanan dan privasi digital menjadi isu krusial di Era Digital sehingga dibutuhkan perlindungan sistem, literasi pengguna, dan kerja sama keamanan digital.',
    npc: 'nara',
  },
  {
    id: 'm_ch_39',
    deckTag: 'chance',
    category: 'Strategi Masa Depan',
    difficulty: 'Lanjut',
    scenario:
      'Transisi dari Revolusi Industri 1.0 ke 2.0 memakan waktu lebih dari satu abad, sedangkan transisi dari Industri 3.0 ke 4.0 dan perkembangan AI terjadi hanya dalam hitungan dekade.',
    text: 'Konsekuensi utama dari percepatan eksponensial perubahan teknologi tersebut terhadap pola pendidikan manusia adalah...',
    options: [
      'Pendidikan tidak lagi cukup berhenti saat lulus sekolah atau kuliah, melainkan harus berlangsung sepanjang hayat (lifelong learning) untuk memperbarui keterampilan',
      'Kurikulum pendidikan sebaiknya hanya mengajarkan sejarah mesin uap tanpa materi teknologi baru',
      'Keterampilan yang dipelajari pada usia remaja akan tetap relevan tanpa perubahan hingga masa pensiun',
      'Peran lembaga pendidikan menjadi tidak diperlukan karena mesin dapat belajar sendiri',
    ],
    rawCorrect: 0,
    explanation:
      'Perubahan teknologi yang sangat cepat menuntut kemampuan adaptasi dan kemauan belajar sepanjang hayat agar kompetensi manusia tidak usang.',
    npc: 'saga',
  },
  {
    id: 'm_ch_40',
    deckTag: 'chance',
    category: 'Dampak Teknologi',
    difficulty: 'Lanjut',
    scenario:
      'Meskipun layanan digital sering dianggap ramah lingkungan karena mengurangi pemakaian kertas, pusat data (data center) raksasa untuk AI dan Cloud membutuhkan energi listrik dan air pendingin dalam jumlah masif.',
    text: 'Evaluasi ekologis yang paling komprehensif terhadap perkembangan infrastruktur Era Digital adalah...',
    options: [
      'Digitalisasi tetap memiliki jejak ekologis berupa konsumsi energi tinggi dan limbah elektronik (e-waste), sehingga membutuhkan inovasi teknologi hijau yang berkelanjutan',
      'Penggunaan internet sama sekali tidak berdampak terhadap konsumsi energi maupun lingkungan',
      'Masyarakat harus menghentikan seluruh penggunaan komputer dan kembali ke mesin ketik manual',
      'Limbah perangkat elektronik dapat terurai secara alami di dalam tanah dalam waktu singkat',
    ],
    rawCorrect: 0,
    explanation:
      'Kemajuan teknologi dan industri membawa tantangan kerusakan lingkungan dan limbah elektronik yang harus diatasi melalui teknologi ramah lingkungan.',
    npc: 'nara',
  },
  {
    id: 'm_ch_41',
    deckTag: 'chance',
    category: 'Strategi Masa Depan',
    difficulty: 'Lanjut',
    scenario:
      'Dalam ekonomi platform digital, sejumlah kecil perusahaan teknologi global menguasai pasar perdagangan dan data, sementara jutaan pelaku usaha kecil bergantung pada algoritma platform tersebut.',
    text: 'Strategi pemberdayaan apakah yang diperlukan agar pelaku usaha lokal tidak sekadar menjadi objek pasif dalam ekosistem ekonomi digital?',
    options: [
      'Menguasai literasi pemasaran digital, membangun inovasi keunikan produk lokal, serta memperkuat kolaborasi antar-UMKM agar memiliki daya tawar',
      'Menutup akses penjualan daring dan hanya melayani pembeli di sekitar rumah',
      'Meniru secara identik produk pabrik massal luar negeri dengan kualitas rendah',
      'Menghindari penggunaan pencatatan keuangan maupun promosi digital',
    ],
    rawCorrect: 0,
    explanation:
      'Pelaku usaha lokal perlu mengoptimalkan teknologi digital, meningkatkan inovasi, dan menjaga kualitas agar mampu bersaing di pasar global.',
    npc: 'saga',
  },
  {
    id: 'm_ch_42',
    deckTag: 'chance',
    category: 'Tantangan Global',
    difficulty: 'Lanjut',
    scenario:
      'Ruang digital memungkinkan setiap warga negara menyuarakan pendapat secara bebas, namun sekaligus mempermudah penyebaran kampanye hitam dan disinformasi terstruktur.',
    text: 'Mengapa penguatan berpikir kritis dan literasi digital menjadi syarat mutlak bagi sehatnya kehidupan sosial di Era Digital?',
    options: [
      'Karena tanpa kemampuan verifikasi fakta dan evaluasi bukti, kebebasan informasi justru memicu polarisasi, kepanikan massa, dan konflik sosial',
      'Karena literasi digital bertujuan membatasi hak masyarakat dalam memperoleh ilmu pengetahuan',
      'Karena seluruh informasi yang beredar di media sosial sudah pasti terjamin kebenarannya',
      'Karena mesin kecerdasan buatan mampu menggantikan kesadaran moral warga negara',
    ],
    rawCorrect: 0,
    explanation:
      'Kemudahan distribusi informasi menuntut masyarakat memiliki literasi digital dan berpikir kritis agar tidak terjebak hoaks dan perpecahan.',
    npc: 'nara',
  },
  {
    id: 'm_ch_43',
    deckTag: 'chance',
    category: 'Dampak Teknologi',
    difficulty: 'Lanjut',
    scenario:
      'Teknologi konferensi video dan Cloud Computing memungkinkan banyak perusahaan menerapkan sistem kerja jarak jauh (remote working) lintas zona waktu.',
    text: 'Tantangan sosial baru apakah yang muncul bagi pekerja dalam ekosistem kerja digital tanpa batas ruang dan waktu tersebut?',
    options: [
      'Kaburnya batas antara waktu kerja dan waktu istirahat pribadi yang berisiko memicu kelelahan digital (burnout) serta berkurangnya interaksi sosial langsung',
      'Hilangnya kebutuhan terhadap koneksi internet yang stabil di rumah pekerja',
      'Meningkatnya waktu tempuh perjalanan harian pekerja menuju gedung kantor',
      'Berkurangnya penggunaan perangkat komputer dan ponsel pintar dalam pekerjaan',
    ],
    rawCorrect: 0,
    explanation:
      'Konektivitas tanpa batas waktu menuntut manajemen waktu yang bijak agar tidak mengganggu waktu istirahat, kesehatan mental, dan hubungan sosial.',
    npc: 'nara',
  },
  {
    id: 'm_ch_44',
    deckTag: 'chance',
    category: 'Strategi Masa Depan',
    difficulty: 'Lanjut',
    scenario:
      'Sejak penemuan mesin uap hingga pengembangan komputasi kuantum dan AI, kemajuan ilmu pengetahuan selalu menjadi motor penggerak utama perubahan struktur masyarakat.',
    text: 'Bagaimana peran sinergis antara lembaga riset, dunia industri, dan masyarakat dalam mengarahkan revolusi teknologi berikutnya?',
    options: [
      'Memastikan setiap inovasi ilmiah dikembangkan secara etis, inklusif, ramah lingkungan, dan berorientasi pada kesejahteraan manusia secara luas',
      'Memfokuskan riset teknologi semata-mata untuk menggantikan seluruh peran manusia dalam kehidupan',
      'Membatasi akses ilmu pengetahuan hanya untuk kelompok industri tertentu',
      'Menghentikan kerja sama penelitian antarnegara demi menjaga rahasia lokal',
    ],
    rawCorrect: 0,
    explanation:
      'Kemajuan ilmu pengetahuan dan kerja sama riset global harus diarahkan untuk menjawab tantangan manusia secara bertanggung jawab dan berkelanjutan.',
    npc: 'arka',
  },
  {
    id: 'm_ch_45',
    deckTag: 'chance',
    category: 'Strategi Masa Depan',
    difficulty: 'Lanjut',
    scenario:
      'Masyarakat modern saat ini hidup di tengah persimpangan antara otomatisasi Industri 4.0 dan konektivitas Era Digital yang menyentuh seluruh sendi kehidupan.',
    text: 'Rumusan paling komprehensif mengenai kunci keberhasilan individu dalam menghadapi dinamika peradaban digital adalah...',
    options: [
      'Memadukan penguasaan literasi teknologi dengan kemampuan berpikir kritis, kreativitas, komunikasi, kolaborasi, etika digital, dan belajar sepanjang hayat',
      'Menguasai satu keahlian teknis secara kaku tanpa perlu beradaptasi dengan perubahan zaman',
      'Menghindari seluruh perkembangan teknologi modern demi mempertahankan tradisi lama',
      'Menyerahkan sepenuhnya seluruh keputusan sosial dan ekonomi kepada sistem algoritma otomatis',
    ],
    rawCorrect: 0,
    explanation:
      'Keberhasilan di Era Digital ditentukan oleh keseimbangan antara kecakapan teknologi dan penguatan nilai serta keterampilan unik manusia.',
    npc: 'saga',
  },

  // =========================================================================
  // KATEGORI 2: KARTU DANA UMUM — LEVEL 1 (PUTARAN 1–5) — 15 SOAL DASAR
  // =========================================================================
  {
    id: 'm_cc_1',
    deckTag: 'community_chest',
    category: 'Tantangan Global',
    difficulty: 'Dasar',
    text: 'Ketimpangan kesempatan dan kemampuan antarindividu atau antarwilayah dalam mengakses perangkat teknologi dan jaringan internet disebut...',
    options: [
      'Kesenjangan digital (digital divide)',
      'Integrasi budaya global',
      'Efisiensi produksi massal',
      'Kolaborasi riset internasional',
    ],
    rawCorrect: 0,
    explanation:
      'Kesenjangan digital terjadi ketika tidak semua kelompok masyarakat memiliki akses yang sama terhadap infrastruktur internet dan pendidikan teknologi.',
    npc: 'nara',
  },
  {
    id: 'm_cc_2',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Dasar',
    text: 'Kecakapan individu dalam mengakses, memahami, mengevaluasi, serta menggunakan teknologi digital secara cerdas, aman, dan etis disebut...',
    options: ['Literasi digital', 'Mekanisasi uap', 'Elektrifikasi pabrik', 'Urbanisasi industri'],
    rawCorrect: 0,
    explanation:
      'Literasi digital membekali pengguna agar mampu memanfaatkan teknologi secara produktif sekaligus terhindar dari risiko ruang siber.',
    npc: 'saga',
  },
  {
    id: 'm_cc_3',
    deckTag: 'community_chest',
    category: 'Tantangan Global',
    difficulty: 'Dasar',
    text: 'Kode verifikasi sekali pakai (OTP) yang dikirimkan ke ponsel saat masuk ke akun perbankan atau media sosial bersifat sangat rahasia karena...',
    options: [
      'Kode tersebut merupakan kunci pengaman yang jika diberikan kepada orang lain dapat digunakan untuk membobol akun',
      'Kode tersebut berfungsi untuk mempercepat sinyal jaringan internet',
      'Kode tersebut dapat digunakan teman untuk membantu mengisi saldo',
      'Kode tersebut hanya berlaku pada perangkat mesin ketik manual',
    ],
    rawCorrect: 0,
    explanation:
      'Menjaga kerahasiaan kode OTP dan membuat kata sandi yang kuat adalah langkah dasar melindungi keamanan dan privasi digital.',
    npc: 'nara',
  },
  {
    id: 'm_cc_4',
    deckTag: 'community_chest',
    category: 'Tantangan Global',
    difficulty: 'Dasar',
    text: 'Informasi bohong atau berita palsu yang sengaja dibuat dan disebarkan melalui internet untuk menyesatkan masyarakat disebut...',
    options: ['Hoaks (disinformasi)', 'Big Data', 'Cloud Computing', 'Lifelong learning'],
    rawCorrect: 0,
    explanation:
      'Hoaks merupakan salah satu tantangan utama era digital yang dapat memicu kesalahpahaman, kepanikan, hingga konflik sosial.',
    npc: 'nara',
  },
  {
    id: 'm_cc_5',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Dasar',
    text: 'Tindakan pertama yang paling bijak saat menerima pesan berantai berisi kabar menghebohkan di grup percakapan adalah...',
    options: [
      'Memeriksa kebenaran informasi dan mengecek kredibilitas sumber resminya sebelum membagikan ulang',
      'Segera meneruskan pesan ke semua kontak agar terlihat paling cepat tahu',
      'Mempercayai isi pesan sepenuhnya jika disertai banyak tanda seru',
      'Menghapus seluruh aplikasi berita resmi di ponsel',
    ],
    rawCorrect: 0,
    explanation:
      'Verifikasi fakta dan pengecekan sumber tepercaya merupakan benteng utama mencegah penyebaran hoaks di masyarakat.',
    npc: 'nara',
  },
  {
    id: 'm_cc_6',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Dasar',
    text: 'Kemampuan seseorang untuk menyesuaikan pola pikir, sikap, dan keterampilannya terhadap perubahan teknologi serta tuntutan zaman disebut...',
    options: ['Adaptasi', 'Isolasi', 'Eksploitasi', 'Stagnasi'],
    rawCorrect: 0,
    explanation:
      'Adaptasi sangat dibutuhkan di era modern karena kemajuan teknologi terus mengubah cara manusia belajar, berkomunikasi, dan bekerja.',
    npc: 'saga',
  },
  {
    id: 'm_cc_7',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Dasar',
    text: 'Prinsip bahwa proses belajar dan pembaruan keterampilan harus terus dilakukan secara berkelanjutan sepanjang hidup seseorang dikenal sebagai...',
    options: ['Lifelong learning', 'Assembly line', 'Digital divide', 'Smart factory'],
    rawCorrect: 0,
    explanation:
      'Lifelong learning memastikan individu tetap relevan dan mampu beradaptasi dengan munculnya jenis-jenis pekerjaan baru.',
    npc: 'saga',
  },
  {
    id: 'm_cc_8',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Dasar',
    text: 'Kemampuan menganalisis informasi secara objektif, mengevaluasi bukti, dan mengambil keputusan berdasarkan alasan logis disebut...',
    options: [
      'Berpikir kritis (critical thinking)',
      'Ketergantungan teknologi',
      'Produksi massal',
      'Konsumerisme digital',
    ],
    rawCorrect: 0,
    explanation:
      'Berpikir kritis membantu individu menyaring informasi di tengah banjir data internet dan memecahkan masalah secara rasional.',
    npc: 'nara',
  },
  {
    id: 'm_cc_9',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Dasar',
    text: 'Kemampuan bekerja sama secara efektif dengan orang lain dari berbagai latar belakang dengan memanfaatkan sarana komunikasi digital disebut...',
    options: ['Kolaborasi (collaboration)', 'Individualisme', 'Otomatisasi', 'Mekanisasi'],
    rawCorrect: 0,
    explanation:
      'Kolaborasi memungkinkan pertukaran ide dan penyelesaian tugas bersama secara efisien tanpa terhalang jarak geografis.',
    npc: 'saga',
  },
  {
    id: 'm_cc_10',
    deckTag: 'community_chest',
    category: 'Dampak Teknologi',
    difficulty: 'Dasar',
    text: 'Perangkat elektronik bekas seperti ponsel rusak, baterai, dan komputer usang yang dibuang sembarangan dapat mencemari tanah dan air karena mengandung...',
    options: [
      'Zat kimia berbahaya dan logam berat yang sulit terurai',
      'Pupuk organik alami yang menyuburkan tanaman',
      'Uap air murni yang aman bagi ekosistem sungai',
      'Serat kapas alami dari industri tekstil',
    ],
    rawCorrect: 0,
    explanation:
      'Penumpukan limbah elektronik (e-waste) merupakan tantangan lingkungan serius di era digital yang memerlukan pengelolaan khusus.',
    npc: 'nara',
  },
  {
    id: 'm_cc_11',
    deckTag: 'community_chest',
    category: 'Tantangan Global',
    difficulty: 'Dasar',
    text: 'Upaya melindungi sistem komputer, jaringan internet, dan data pribadi dari ancaman pencurian, peretasan, maupun penyalahgunaan disebut...',
    options: [
      'Keamanan digital / keamanan siber',
      'Elektrifikasi industri',
      'Jalur perakitan massal',
      'Urbanisasi perkotaan',
    ],
    rawCorrect: 0,
    explanation:
      'Keamanan digital melindungi identitas dan data sensitif pengguna dari berbagai modus kejahatan siber.',
    npc: 'nara',
  },
  {
    id: 'm_cc_12',
    deckTag: 'community_chest',
    category: 'Tantangan Global',
    difficulty: 'Dasar',
    text: 'Masuknya budaya asing secara masif melalui internet dan media sosial dapat menimbulkan tantangan sosial budaya berupa...',
    options: [
      'Berkurangnya perhatian generasi muda terhadap budaya lokal dan pergeseran nilai tradisional',
      'Hilangnya seluruh sarana komunikasi antarnegara',
      'Berhentinya perkembangan kesenian dan kreativitas manusia',
      'Meningkatnya isolasi budaya antarwilayah',
    ],
    rawCorrect: 0,
    explanation:
      'Arus informasi global perlu disikapi dengan bijak agar budaya asing memperkaya wawasan tanpa menggeser jati diri budaya lokal.',
    npc: 'nara',
  },
  {
    id: 'm_cc_13',
    deckTag: 'community_chest',
    category: 'Dampak Teknologi',
    difficulty: 'Dasar',
    text: 'Menghabiskan waktu berlebihan di depan layar gawai hingga larut malam berdampak langsung pada...',
    options: [
      'Menurunnya kualitas tidur, konsentrasi belajar, dan intensitas komunikasi tatap muka',
      'Meningkatnya kebugaran fisik dan daya ingat jangka panjang',
      'Bertambahnya waktu diskusi langsung bersama keluarga',
      'Hilangnya risiko kelelahan mata dan stres',
    ],
    rawCorrect: 0,
    explanation:
      'Penggunaan teknologi yang tidak terkendali mengganggu kesehatan istirahat, produktivitas, dan interaksi sosial langsung.',
    npc: 'nara',
  },
  {
    id: 'm_cc_14',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Dasar',
    text: 'Kolaborasi antarnegara dalam bidang riset ilmu pengetahuan, pendidikan, keamanan siber, dan penanganan perubahan iklim disebut...',
    options: [
      'Kerja sama global',
      'Proteksionisme tertutup',
      'Monopoli industri',
      'Dislokasi pekerjaan',
    ],
    rawCorrect: 0,
    explanation:
      'Tantangan dunia modern bersifat lintas batas sehingga memerlukan kerja sama global untuk menemukan solusi bersama.',
    npc: 'saga',
  },
  {
    id: 'm_cc_15',
    deckTag: 'community_chest',
    category: 'Tantangan Global',
    difficulty: 'Dasar',
    text: 'Manakah contoh praktik pembuatan kata sandi (password) yang paling aman untuk melindungi akun digital?',
    options: [
      'Menggunakan kombinasi huruf besar, huruf kecil, angka, dan simbol yang unik untuk setiap akun',
      'Menggunakan tanggal lahir atau nama lengkap sendiri agar mudah diingat',
      "Menggunakan urutan angka '12345678' pada semua aplikasi",
      'Menuliskan kata sandi pada kolom komentar media sosial',
    ],
    rawCorrect: 0,
    explanation:
      'Kata sandi yang kuat dan unik mencegah peretas menebak akses akun dan membobol data pribadi pengguna.',
    npc: 'nara',
  },

  // =========================================================================
  // KATEGORI 2: KARTU DANA UMUM — LEVEL 2 (PUTARAN 6–10) — 15 SOAL MENENGAH
  // =========================================================================
  {
    id: 'm_cc_16',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Menengah',
    scenario:
      'Pengrajin tas anyaman tradisional mengalami penurunan penjualan karena konsumen lebih tertarik membeli tas impor murah dengan desain modern di aplikasi belanja daring.',
    text: 'Langkah strategis manakah yang paling tepat dilakukan pengrajin tersebut untuk memenangkan persaingan?',
    options: [
      'Memadukan motif anyaman tradisional dengan desain fungsional modern serta memasarkannya melalui media sosial dan e-commerce',
      'Menutup bengkel kerajinan dan berhenti memproduksi tas anyaman',
      'Memprotes pemerintah agar menutup seluruh akses internet di daerahnya',
      'Menjual produk dengan kualitas rendah tanpa memperhatikan kepuasan pembeli',
    ],
    rawCorrect: 0,
    explanation:
      'Inovasi desain, peningkatan kualitas, dan pemanfaatan pemasaran digital membantu UMKM bersaing di pasar global.',
    npc: 'saga',
  },
  {
    id: 'm_cc_17',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Menengah',
    scenario:
      'Sekelompok siswa SMA membuat kanal video pendek yang menampilkan tutorial tarian daerah, cerita rakyat nusantara, dan kuliner khas dengan kemasan visual menarik.',
    text: 'Peran strategis generasi muda yang tercermin dalam kegiatan tersebut adalah...',
    options: [
      'Memanfaatkan teknologi digital sebagai media pelestarian dan promosi budaya lokal ke masyarakat luas',
      'Menggantikan seluruh kesenian tradisional dengan budaya populer luar negeri',
      'Membatasi akses wisatawan asing untuk mengenal budaya Indonesia',
      'Menghapus nilai-nilai tradisional demi mengejar popularitas sesaat',
    ],
    rawCorrect: 0,
    explanation:
      'Generasi muda dapat menggunakan kreativitas digital untuk menjaga eksistensi dan memperkenalkan kekayaan budaya daerah.',
    npc: 'saga',
  },
  {
    id: 'm_cc_18',
    deckTag: 'community_chest',
    category: 'Dampak Teknologi',
    difficulty: 'Menengah',
    scenario:
      'Laboratorium komputer sekolah memiliki puluhan monitor tabung, papan ketik rusak, dan baterai bekas yang sudah tidak terpakai.',
    text: 'Tindakan pengelolaan lingkungan yang paling tepat dilakukan pihak sekolah adalah...',
    options: [
      'Menyalurkan perangkat bekas ke lembaga pengelola daur ulang limbah elektronik (e-waste) resmi agar komponen berbahaya ditangani aman',
      'Membakar seluruh perangkat plastik dan komponen elektronik di halaman belakang sekolah',
      'Membuang baterai dan komponen rusak ke tempat sampah organik',
      'Membiarkan limbah elektronik menumpuk di saluran air sekolah',
    ],
    rawCorrect: 0,
    explanation:
      'Penanganan e-waste melalui daur ulang resmi mencegah pencemaran zat beracun ke tanah dan air.',
    npc: 'nara',
  },
  {
    id: 'm_cc_19',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Menengah',
    scenario:
      'Sebuah bank mengurangi jumlah petugas teller manual karena nasabah beralih ke layanan digital, namun menawarkan program pelatihan analisis layanan keuangan digital bagi para pegawainya.',
    text: 'Konsep pengembangan diri apakah yang dijalankan oleh para pegawai yang mengikuti pelatihan tersebut?',
    options: [
      'Adaptasi dan lifelong learning untuk memperbarui keterampilan agar sesuai kebutuhan pekerjaan baru',
      'Penolakan terhadap perkembangan teknologi perbankan modern',
      'Ketergantungan pada sistem pencatatan manual masa lalu',
      'Isolasi diri dari perubahan struktur organisasi kerja',
    ],
    rawCorrect: 0,
    explanation:
      'Belajar sepanjang hayat memungkinkan pekerja beradaptasi dan beralih ke peran baru saat terjadi otomatisasi.',
    npc: 'saga',
  },
  {
    id: 'm_cc_20',
    deckTag: 'community_chest',
    category: 'Dampak Teknologi',
    difficulty: 'Menengah',
    scenario:
      'Orang tua dan anak sepakat untuk menyimpan seluruh ponsel di ruang tengah mulai pukul 19.00 hingga 21.00 agar dapat mengobrol, makan malam, dan berdiskusi bersama.',
    text: 'Dampak positif kebiasaan tersebut terhadap kualitas kehidupan sosial keluarga adalah...',
    options: [
      'Memulihkan kualitas interaksi sosial tatap muka dan mengurangi ketergantungan pada perangkat digital',
      'Membuat anggota keluarga tertinggal dari seluruh perkembangan ilmu pengetahuan',
      'Menghapus kemampuan anak dalam mengoperasikan komputer di sekolah',
      'Memicu konflik sosial antaranggota keluarga akibat kurangnya hiburan',
    ],
    rawCorrect: 0,
    explanation:
      'Mengatur batasan penggunaan gawai menjaga keseimbangan antara dunia digital dan kehangatan interaksi sosial langsung.',
    npc: 'saga',
  },
  {
    id: 'm_cc_21',
    deckTag: 'community_chest',
    category: 'Tantangan Global',
    difficulty: 'Menengah',
    scenario:
      'Seorang ibu menerima pesan WhatsApp berisi tautan formulir untuk mencairkan hadiah uang tunai dengan syarat mengisi nomor kartu ATM dan kode PIN.',
    text: 'Berdasarkan prinsip keamanan digital, mengapa pesan tersebut harus segera diabaikan dan diblokir?',
    options: [
      'Karena institusi resmi tidak pernah meminta kode rahasia perbankan (PIN/OTP) melalui tautan pesan singkat',
      'Karena hadiah uang tunai hanya dapat dicairkan menggunakan mesin uap',
      'Karena aplikasi pesan instan tidak dapat digunakan untuk berkomunikasi',
      'Karena nomor kartu ATM wajib dibagikan secara terbuka di media sosial',
    ],
    rawCorrect: 0,
    explanation:
      'Kewaspadaan terhadap permintaan data sensitif melindungi pengguna dari kejahatan pencurian identitas dan pembobolan rekening.',
    npc: 'nara',
  },
  {
    id: 'm_cc_22',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Menengah',
    scenario:
      'Beredar informasi palsu di grup warga yang mengklaim bahwa mengonsumsi ramuan tertentu tanpa takaran medis dapat menyembuhkan segala penyakit dalam satu jam.',
    text: 'Langkah berpikir kritis dan literasi digital yang tepat untuk meluruskan informasi tersebut adalah...',
    options: [
      'Membandingkan klaim tersebut dengan rujukan resmi kementerian kesehatan atau tenaga medis serta membagikan klarifikasi fakta secara santun',
      'Langsung mempraktikkan resep tersebut tanpa berkonsultasi dengan dokter',
      'Meneruskan pesan ke lebih banyak grup agar warga lain ikut mencoba',
      'Memarahi anggota grup dengan kata-kata kasar hingga memicu pertengkaran',
    ],
    rawCorrect: 0,
    explanation:
      'Berpikir kritis melatih masyarakat memeriksa bukti ilmiah dan merujuk pada otoritas resmi sebelum mempercayai informasi kesehatan.',
    npc: 'nara',
  },
  {
    id: 'm_cc_23',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Menengah',
    scenario:
      'Ilmuwan dari Indonesia, Brasil, dan Norwegia berbagi data satelit pemantauan hutan tropis melalui platform Cloud untuk mencegah kebakaran hutan dan deforestasi.',
    text: 'Bentuk solusi tantangan global yang tercermin dalam proyek lintas benua tersebut adalah...',
    options: [
      'Kerja sama global dalam riset teknologi dan pelestarian lingkungan hidup',
      'Persaingan dagang untuk memonopoli sumber daya alam hutan',
      'Isolasi data penelitian agar tidak diketahui negara lain',
      'Penghentian pemantauan satelit demi kembali ke survei manual',
    ],
    rawCorrect: 0,
    explanation:
      'Pertukaran ilmu pengetahuan dan data antarnegara memperkuat upaya bersama dalam mengatasi perubahan iklim dan kerusakan lingkungan.',
    npc: 'saga',
  },
  {
    id: 'm_cc_24',
    deckTag: 'community_chest',
    category: 'Dampak Teknologi',
    difficulty: 'Menengah',
    scenario:
      'Seorang mahasiswa membuat infografis interaktif mengenai cara mengenali tautan phishing dan membagikannya secara gratis di media sosial.',
    text: 'Kontribusi positif kegiatan tersebut terhadap ekosistem digital adalah...',
    options: [
      'Meningkatkan kesadaran literasi keamanan digital masyarakat luas melalui penyebaran informasi yang bermanfaat',
      'Mengurangi minat masyarakat untuk menggunakan layanan perbankan digital',
      'Menyebarkan kepanikan massal tanpa dasar fakta yang jelas',
      'Membatasi akses generasi muda terhadap teknologi informasi',
    ],
    rawCorrect: 0,
    explanation:
      'Menggunakan teknologi untuk menyebarkan edukasi dan informasi positif merupakan wujud tanggung jawab warga digital.',
    npc: 'saga',
  },
  {
    id: 'm_cc_25',
    deckTag: 'community_chest',
    category: 'Tantangan Global',
    difficulty: 'Menengah',
    scenario:
      'Komunitas relawan teknologi membangun titik akses internet komunitas di balai desa sekaligus mengadakan kelas pelatihan penggunaan aplikasi pembelajaran bagi pelajar setempat.',
    text: 'Mengapa pendekatan relawan tersebut efektif mengatasi masalah kesenjangan digital?',
    options: [
      'Karena menggabungkan penyediaan akses infrastruktur internet dengan peningkatan keterampilan literasi digital masyarakat',
      'Karena hanya memberikan perangkat gawai tanpa mengajarkan cara menggunakannya',
      'Karena melarang pelajar desa mengakses sumber belajar dari luar daerah',
      'Karena menggantikan seluruh guru sekolah dengan video rekaman',
    ],
    rawCorrect: 0,
    explanation:
      'Kesenjangan digital teratasi secara efektif apabila pemerataan akses jaringan diiringi dengan pendampingan pendidikan teknologi.',
    npc: 'saga',
  },
  {
    id: 'm_cc_26',
    deckTag: 'community_chest',
    category: 'Dampak Teknologi',
    difficulty: 'Menengah',
    scenario:
      'Beberapa kota besar mulai mengoperasikan armada bus listrik bertenaga surya untuk menggantikan bus berbahan bakar fosil yang menghasilkan asap polusi tebal.',
    text: 'Upaya penyelesaian tantangan global apakah yang diterapkan pemerintah kota tersebut?',
    options: [
      'Pemanfaatan teknologi ramah lingkungan untuk menekan pencemaran udara dan emisi karbon perkotaan',
      'Peningkatan penggunaan batu bara sebagai bahan bakar transportasi umum',
      'Penghapusan seluruh sarana transportasi umum di kawasan kota',
      'Percepatan produksi kendaraan bermotor berbahan bakar minyak',
    ],
    rawCorrect: 0,
    explanation:
      'Inovasi teknologi ramah lingkungan merupakan solusi penting mengurangi polusi dan dampak perubahan iklim akibat aktivitas industri dan transportasi.',
    npc: 'arka',
  },
  {
    id: 'm_cc_27',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Menengah',
    scenario:
      'Dalam forum diskusi daring kelas, terdapat perbedaan pendapat mengenai dampak kecerdasan buatan terhadap lapangan kerja.',
    text: 'Sikap komunikasi dan berpikir kritis yang tepat dalam menyikapi perbedaan pendapat tersebut adalah...',
    options: [
      'Menyampaikan argumen yang didukung data dan bukti secara santun serta menghargai sudut pandang peserta lain',
      'Menyerang pribadi peserta yang berbeda pendapat menggunakan akun anonim',
      'Menyebarkan informasi palsu agar argumen sendiri terlihat paling benar',
      'Keluar dari forum diskusi sambil menghapus seluruh materi kelas',
    ],
    rawCorrect: 0,
    explanation:
      'Komunikasi yang efektif dan berpikir kritis membangun diskusi konstruktif serta mencegah konflik di ruang digital.',
    npc: 'nara',
  },
  {
    id: 'm_cc_28',
    deckTag: 'community_chest',
    category: 'Dampak Teknologi',
    difficulty: 'Menengah',
    scenario:
      'Produsen kopi lokal memanfaatkan platform perdagangan digital internasional sehingga biji kopi nusantara dapat dipesan langsung oleh kedai kopi di Eropa dan Asia.',
    text: 'Bagaimana globalisasi dan teknologi digital memberikan manfaat positif bagi pelaku usaha pada kasus tersebut?',
    options: [
      'Membuka akses pasar global yang luas tanpa harus membuka cabang fisik di setiap negara',
      'Menghilangkan kebutuhan terhadap standar kualitas dan cita rasa produk',
      'Membatasi penjualan produk hanya di wilayah kecamatan tempat produksi',
      'Menghapus seluruh biaya pengiriman logistik antarnegara',
    ],
    rawCorrect: 0,
    explanation:
      'Teknologi digital memungkinkan pelaku usaha lokal menjangkau konsumen global dan memperluas skala perdagangan.',
    npc: 'saga',
  },
  {
    id: 'm_cc_29',
    deckTag: 'community_chest',
    category: 'Tantangan Global',
    difficulty: 'Menengah',
    scenario:
      'Setelah selesai mengerjakan tugas menggunakan komputer umum di perpustakaan kota, seorang siswa memastikan dirinya menekan tombol keluar (log out) dari akun email dan penyimpanan awannya.',
    text: 'Mengapa kebiasaan sederhana tersebut sangat krusial bagi keamanan privasi digital?',
    options: [
      'Mencegah pengguna berikutnya mengakses, menyalahgunakan, atau mencuri data pribadi yang tersimpan di dalam akun tersebut',
      'Menghemat kapasitas penyimpanan hard disk komputer perpustakaan',
      'Mempercepat proses pembaruan sistem operasi komputer',
      'Menghapus seluruh dokumen tugas yang telah disimpan di Cloud',
    ],
    rawCorrect: 0,
    explanation:
      'Keluar dari akun setelah memakai perangkat publik melindungi privasi dan mencegah pencurian identitas digital.',
    npc: 'nara',
  },
  {
    id: 'm_cc_30',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Menengah',
    scenario:
      'Sekelompok pemuda mengembangkan aplikasi digital yang menghubungkan rumah tangga dengan bank sampah terdekat untuk menjemput dan menimbang sampah daur ulang.',
    text: 'Sinergi keterampilan abad digital manakah yang tampak dalam inovasi sosial tersebut?',
    options: [
      'Kreativitas menciptakan solusi digital, literasi teknologi, dan kolaborasi komunitas untuk pelestarian lingkungan',
      'Ketergantungan gawai yang mengurangi kepedulian terhadap lingkungan sekitar',
      'Penyebaran informasi tanpa verifikasi untuk menarik pengguna aplikasi',
      'Isolasi diri dari permasalahan sosial di lingkungan masyarakat',
    ],
    rawCorrect: 0,
    explanation:
      'Kreativitas dan penguasaan teknologi digital dapat diarahkan untuk menciptakan solusi nyata bagi persoalan lingkungan.',
    npc: 'saga',
  },

  // =========================================================================
  // KATEGORI 2: KARTU DANA UMUM — LEVEL 3 (PUTARAN 11–15+) — 15 SOAL LANJUT
  // =========================================================================
  {
    id: 'm_cc_31',
    deckTag: 'community_chest',
    category: 'Tantangan Global',
    difficulty: 'Lanjut',
    scenario:
      'Kelompok peretas internasional mencuri data nasabah bank di Asia menggunakan server yang berlokasi di Eropa dan mencuci dananya melalui aset digital lintas benua.',
    text: 'Mengapa penegakan hukum yang bersifat terisolasi di satu negara tidak akan pernah cukup untuk memberantas kejahatan siber modern?',
    options: [
      'Karena infrastruktur internet bersifat lintas batas teritorial, sehingga pelacakan jejak digital dan penindakan pelaku menuntut kerja sama keamanan siber antarnegara',
      'Karena setiap negara menggunakan mesin uap dengan tekanan yang berbeda-beda',
      'Karena kejahatan siber hanya terjadi apabila pengguna mematikan koneksi internetnya',
      'Karena hukum internasional melarang pertukaran informasi keamanan antarnegara',
    ],
    rawCorrect: 0,
    explanation:
      'Kejahatan siber melampaui batas geografis negara sehingga hanya dapat ditangani secara efektif melalui kerja sama global dalam keamanan digital.',
    npc: 'nara',
  },
  {
    id: 'm_cc_32',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Lanjut',
    scenario:
      'Program internet gratis di desa terpencil ternyata belum meningkatkan pendapatan warga karena sebagian besar penduduk hanya menggunakannya untuk hiburan pasif tanpa tahu cara memanfaatkannya untuk usaha atau pendidikan.',
    text: 'Evaluasi kebijakan manakah yang paling tepat untuk menyempurnakan program pengentasan kesenjangan digital tersebut?',
    options: [
      'Pembangunan infrastruktur internet harus diintegrasikan dengan program pendidikan literasi digital, pelatihan kewirausahaan daring, dan pendampingan pemanfaatan teknologi produktif',
      'Layanan internet di desa harus segera diputus karena warga dianggap tidak mampu memanfaatkannya',
      'Masyarakat desa sebaiknya dilarang mengakses informasi ekonomi dan pendidikan dari luar',
      'Pemerintah cukup membagikan perangkat ponsel mahal tanpa perlu memberikan pelatihan',
    ],
    rawCorrect: 0,
    explanation:
      'Mengatasi digital divide membutuhkan keseimbangan antara ketersediaan akses fisik dan peningkatan kapasitas literasi masyarakat.',
    npc: 'saga',
  },
  {
    id: 'm_cc_33',
    deckTag: 'community_chest',
    category: 'Tantangan Global',
    difficulty: 'Lanjut',
    scenario:
      'Algoritma media sosial cenderung menyajikan konten yang sejalan dengan pandangan pengguna secara berulang, sehingga kelompok masyarakat mudah terbelah dan rentan percaya pada hoaks yang sesuai prasangkanya.',
    text: 'Bagaimana penerapan berpikir kritis (critical thinking) dan literasi digital mampu memutus rantai polarisasi sosial tersebut?',
    options: [
      'Dengan membiasakan individu memeriksa bukti dari berbagai sumber kredibel yang berimbang, menguji validitas fakta, dan tidak bereaksi emosional terhadap informasi viral',
      'Dengan memblokir seluruh teman yang memiliki pandangan berbeda di media sosial',
      'Dengan mempercayai setiap informasi yang mendapatkan jumlah tanda suka terbanyak',
      'Dengan menghentikan seluruh akses masyarakat terhadap berita dan ilmu pengetahuan',
    ],
    rawCorrect: 0,
    explanation:
      'Berpikir kritis melatih objektivitas berbasis bukti sehingga masyarakat mampu menyaring disinformasi dan menjaga harmoni sosial.',
    npc: 'nara',
  },
  {
    id: 'm_cc_34',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Lanjut',
    scenario:
      'Sebuah negara berkembang menghadapi dilema: mempercepat pembangunan pabrik manufaktur untuk membuka lapangan kerja, atau memperketat aturan emisi yang berpotensi memperlambat investasi.',
    text: 'Strategi pembangunan berkelanjutan manakah yang paling selaras dengan prinsip solusi tantangan global?',
    options: [
      'Mendorong investasi industri berbasis teknologi ramah lingkungan, menerapkan sistem daur ulang limbah terpadu, serta menjalin kerja sama transfer teknologi hijau antarnegara',
      'Mengabaikan seluruh kerusakan lingkungan demi mengejar pertumbuhan ekonomi jangka pendek',
      'Melarang seluruh aktivitas industri modern dan kembali ke sistem agraris tertutup',
      'Membuang limbah industri ke laut lepas agar tidak mencemari daratan nasional',
    ],
    rawCorrect: 0,
    explanation:
      'Pertumbuhan ekonomi dan kelestarian lingkungan dapat diselaraskan melalui inovasi teknologi ramah lingkungan dan kerja sama global.',
    npc: 'saga',
  },
  {
    id: 'm_cc_35',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Lanjut',
    scenario:
      'Seiring semakin canggihnya kecerdasan buatan (AI) dalam menyusun analisis data, menulis kode, dan membuat desain dasar, banyak profesi tingkat pemula mengalami otomatisasi.',
    text: 'Kompetensi unik manusia manakah yang harus menjadi fokus utama pendidikan masa depan agar manusia tetap memegang kendali atas teknologi?',
    options: [
      'Kemampuan berpikir kritis tingkat tinggi, kreativitas gagasan orisinal, kecerdasan emosional dalam komunikasi, kolaborasi lintas disiplin, serta kemauan belajar sepanjang hayat',
      'Kemampuan menghafal tabel data secara mekanis untuk mengalahkan kecepatan prosesor komputer',
      'Penguasaan satu keterampilan teknis rutin yang tidak pernah diperbarui seumur hidup',
      'Penolakan terhadap penggunaan kecerdasan buatan dalam seluruh bidang penelitian',
    ],
    rawCorrect: 0,
    explanation:
      'Di era AI, nilai tambah manusia terletak pada kreativitas, berpikir kritis, empati komunikasi, kolaborasi, dan kemampuan terus belajar.',
    npc: 'saga',
  },
  {
    id: 'm_cc_36',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Lanjut',
    scenario:
      'Upaya melestarikan kesenian tradisional dengan cara melarang total sentuhan teknologi modern sering kali membuat kesenian tersebut ditinggalkan generasi muda dan perlahan punah.',
    text: "Mengapa strategi 'glokalisasi' (memadukan nilai luhur budaya lokal dengan kemasan teknologi dan jejaring global) dinilai lebih efektif?",
    options: [
      'Karena membuat warisan budaya lokal tetap relevan dengan selera zaman, mudah diakses generasi muda, serta memiliki daya tarik di pasar kreatif global tanpa kehilangan jati dirinya',
      'Karena strategi ini menghapus seluruh nilai filosofis asli dari kesenian tradisional',
      'Karena budaya lokal dipaksa meniru sepenuhnya gaya hidup budaya asing',
      'Karena kesenian daerah hanya boleh dinikmati oleh kalangan wisatawan mancanegara',
    ],
    rawCorrect: 0,
    explanation:
      'Pemanfaatan teknologi digital secara kreatif memungkinkan budaya lokal beradaptasi dan berkembang di panggung global.',
    npc: 'saga',
  },
  {
    id: 'm_cc_37',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Lanjut',
    scenario:
      'Penyebaran penyakit menular lintas benua akibat tingginya mobilitas global membuktikan bahwa kerentanan sistem kesehatan di satu negara dapat mengancam seluruh dunia.',
    text: 'Bentuk kerja sama global strategis manakah yang paling fundamental untuk membangun ketahanan kesehatan umat manusia?',
    options: [
      'Pertukaran data epidemiologi secara transparan, riset pengembangan vaksin dan obat bersama, serta transfer teknologi kesehatan yang adil bagi negara berkembang',
      'Penimbunan seluruh teknologi medis dan paten obat hanya untuk kepentingan negara maju',
      'Penghentian seluruh pertukaran ilmuwan dan jurnal penelitian medis antarnegara',
      'Penutupan akses informasi kesehatan digital bagi masyarakat umum',
    ],
    rawCorrect: 0,
    explanation:
      'Kerja sama riset, pertukaran ilmu, dan akses teknologi yang inklusif memperkuat kapasitas dunia menghadapi krisis global.',
    npc: 'arka',
  },
  {
    id: 'm_cc_38',
    deckTag: 'community_chest',
    category: 'Dampak Teknologi',
    difficulty: 'Lanjut',
    scenario:
      'Produsen gawai kerap merilis model baru setiap tahun dengan perubahan kecil, mendorong budaya konsumtif yang mempercepat gunung limbah elektronik global.',
    text: 'Perubahan pola pikir konsumen yang paling berdampak dalam menekan laju limbah elektronik dari sisi hulu adalah...',
    options: [
      'Menerapkan konsumsi teknologi yang bijak berdasarkan kebutuhan fungsional, memperpanjang usia pakai perangkat, serta mendukung program perbaikan dan daur ulang',
      'Membeli setiap seri gawai terbaru meskipun perangkat lama masih berfungsi sangat baik',
      'Membuang perangkat elektronik lama ke sungai agar tidak menumpuk di dalam rumah',
      'Menganggap pengelolaan limbah elektronik sepenuhnya hanya urusan negara lain',
    ],
    rawCorrect: 0,
    explanation:
      'Mengurangi limbah elektronik dimulai dari kesadaran pengguna untuk memanfaatkan teknologi secara bijak dan bertanggung jawab.',
    npc: 'nara',
  },
  {
    id: 'm_cc_39',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Lanjut',
    scenario:
      'Ketika produk UMKM lokal kalah bersaing di platform e-commerce, sebagian pihak mengusulkan pemblokiran total terhadap seluruh barang impor.',
    text: 'Mengapa strategi peningkatan kualitas, inovasi produk, dan literasi pemasaran digital lebih berkelanjutan dibandingkan isolasi pasar total?',
    options: [
      'Karena isolasi memicu hambatan perdagangan balik dari negara lain dan tidak melatih daya saing UMKM, sedangkan inovasi dan penguasaan digital memampukan UMKM menembus pasar global',
      'Karena produk UMKM lokal memang tidak memiliki keunikan budaya yang dapat dijual ke luar negeri',
      'Karena pemblokiran internet akan membuat harga barang produksi dalam negeri turun drastis',
      'Karena perdagangan bebas melarang pelaku usaha lokal menggunakan teknologi komputer',
    ],
    rawCorrect: 0,
    explanation:
      'Daya saing sejati di era global dibangun melalui peningkatan kualitas, kreativitas inovasi, dan pemanfaatan teknologi digital.',
    npc: 'saga',
  },
  {
    id: 'm_cc_40',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Lanjut',
    scenario:
      'Untuk mengatasi masalah sampah plastik laut, sebuah tim lintas negara menggunakan analisis Big Data arus laut, merancang kampanye edukasi kreatif, dan menggalang kolaborasi komunitas pesisir.',
    text: 'Evaluasi paling tepat mengenai hubungan antara kemajuan teknologi dan 6 keterampilan era digital berdasarkan kasus tersebut adalah...',
    options: [
      'Teknologi digital hanya menjadi alat; keberhasilan penyelesaian masalah tetap bergantung pada sinergi literasi digital, berpikir kritis, kreativitas, komunikasi, kolaborasi, dan kemauan terus belajar',
      'Teknologi Big Data mampu membersihkan sampah di lautan secara otomatis tanpa keterlibatan manusia',
      'Keterampilan komunikasi dan kolaborasi tidak diperlukan apabila tim sudah memiliki koneksi internet cepat',
      'Permasalahan lingkungan global hanya dapat diselesaikan oleh satu disiplin ilmu saja',
    ],
    rawCorrect: 0,
    explanation:
      'Keenam keterampilan utama Era Digital saling menguatkan agar manusia mampu memanfaatkan teknologi untuk memecahkan masalah nyata.',
    npc: 'saga',
  },
  {
    id: 'm_cc_41',
    deckTag: 'community_chest',
    category: 'Tantangan Global',
    difficulty: 'Lanjut',
    scenario:
      'Digitalisasi layanan kesehatan dan pendidikan mempermudah akses masyarakat, tetapi sekaligus mengumpulkan jutaan data sensitif warga dalam satu basis data terpusat.',
    text: 'Prinsip tata kelola digital manakah yang wajib dipenuhi agar efisiensi layanan publik tidak mengorbankan hak privasi warga?',
    options: [
      'Penerapan enkripsi keamanan siber berlapis, pembatasan akses data berdasarkan kewenangan, transparansi penggunaan data, serta edukasi keamanan akun bagi warga',
      'Membuka akses seluruh data rekam medis dan nilai siswa secara bebas agar mudah dilihat siapa saja',
      'Menghentikan penggunaan sistem komputer dan kembali menyimpan seluruh data pada buku tulis',
      'Mewajibkan seluruh warga menggunakan satu kata sandi seragam untuk semua layanan publik',
    ],
    rawCorrect: 0,
    explanation:
      'Keamanan dan privasi digital membutuhkan perlindungan teknis sistem yang kuat sekaligus kesadaran menjaga kerahasiaan data.',
    npc: 'nara',
  },
  {
    id: 'm_cc_42',
    deckTag: 'community_chest',
    category: 'Dampak Teknologi',
    difficulty: 'Lanjut',
    scenario:
      'Kemudahan memenuhi seluruh kebutuhan hidup dari dalam kamar melalui aplikasi pengiriman barang dan hiburan daring berpotensi mengurangi interaksi warga di ruang publik.',
    text: 'Strategi sosiologis apakah yang diperlukan masyarakat perkotaan modern agar kemajuan teknologi tidak mengikis modal sosial dan solidaritas bertetangga?',
    options: [
      'Memanfaatkan platform digital untuk mengorganisasi kegiatan sosial tatap muka di lingkungan nyata serta menjaga keseimbangan waktu layar dengan interaksi langsung',
      'Menghapus seluruh kegiatan kerja bakti dan pertemuan warga demi efisiensi waktu individu',
      'Mewajibkan seluruh komunikasi antarwarga dilakukan melalui pesan otomatis tanpa tatap muka',
      'Melarang penggunaan teknologi informasi dalam pengelolaan kegiatan kemasyarakatan',
    ],
    rawCorrect: 0,
    explanation:
      'Teknologi seharusnya memperkuat hubungan sosial manusia, bukan menggantikan interaksi langsung yang membangun solidaritas.',
    npc: 'saga',
  },
  {
    id: 'm_cc_43',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Lanjut',
    scenario:
      'Banyak profesi populer saat ini—seperti analis data, pengembang AI, dan kreator konten edukasi—belum ada pada masa Revolusi Industri 2.0 maupun awal Revolusi Industri 3.0.',
    text: 'Implikasi filosofis dan praktis apakah yang harus dipegang pelajar SMA dalam merencanakan karier masa depannya?',
    options: [
      'Fokus membangun fondasi kemampuan berpikir kritis, literasi digital, kreativitas, dan kebiasaan belajar sepanjang hayat (lifelong learning) agar siap mengisi profesi baru yang terus bermunculan',
      'Memilih jurusan pendidikan hanya berdasarkan jenis pekerjaan tradisional yang tidak pernah berubah sejak abad ke-19',
      'Menghindari penguasaan bahasa asing dan teknologi informasi karena dianggap tidak relevan',
      'Berhenti belajar hal baru setelah memperoleh ijazah pendidikan formal',
    ],
    rawCorrect: 0,
    explanation:
      'Karena jenis pekerjaan terus berevolusi mengikuti teknologi, kemampuan belajar sepanjang hayat dan adaptasi menjadi bekal paling berharga.',
    npc: 'saga',
  },
  {
    id: 'm_cc_44',
    deckTag: 'community_chest',
    category: 'Dampak Teknologi',
    difficulty: 'Lanjut',
    scenario:
      'Sejarah mencatat bahwa kemajuan teknologi industri pernah memicu eksploitasi buruh dan kerusakan alam ketika dijalankan tanpa kendali nilai etika dan keadilan sosial.',
    text: 'Pelajaran sejarah sosiologis manakah yang paling relevan untuk memandu perkembangan Revolusi Industri 4.0 dan Era Digital saat ini?',
    options: [
      'Inovasi teknologi harus selalu diarahkan untuk memuliakan martabat manusia, pemerataan kesejahteraan, kelestarian lingkungan, serta penguatan kerja sama global',
      'Kecepatan pertumbuhan industri jauh lebih penting daripada keselamatan pekerja dan kelestarian ekosistem',
      'Kemajuan teknologi secara otomatis selalu menghasilkan keadilan sosial tanpa perlu regulasi',
      'Masyarakat harus menolak seluruh penemuan ilmiah baru agar terhindar dari risiko perubahan',
    ],
    rawCorrect: 0,
    explanation:
      'Teknologi adalah hasil karya manusia yang arah dampaknya ditentukan oleh tanggung jawab etis, kebijaksanaan, dan kerja sama umat manusia.',
    npc: 'nara',
  },
  {
    id: 'm_cc_45',
    deckTag: 'community_chest',
    category: 'Strategi Masa Depan',
    difficulty: 'Lanjut',
    scenario:
      'Sebagai pemain yang telah menempuh perjalanan panjang melintasi sejarah Revolusi Industri 1.0 hingga tantangan Era Digital modern, Anda dihadapkan pada pertanyaan puncak.',
    text: 'Manakah pernyataan sintesis yang paling tepat merangkum seluruh esensi pembelajaran globalisasi, revolusi industri, dan masa depan digital?',
    options: [
      'Era digital dan revolusi industri membawa peluang kemajuan sekaligus tantangan kompleks; manusia dapat memenangkannya melalui adaptasi, literasi digital, berpikir kritis, kreativitas, pelestarian nilai, dan kerja sama global',
      'Kemajuan teknologi modern akan menghapus kebutuhan manusia akan pendidikan, interaksi sosial, dan kerja sama antarnegara',
      'Tantangan global seperti hoaks, kesenjangan digital, dan kerusakan lingkungan hanya dapat diatasi dengan menghentikan seluruh perkembangan ilmu pengetahuan',
      'Keberhasilan di masa depan hanya ditentukan oleh penguasaan perangkat keras tanpa memerlukan etika, empati, dan kemauan belajar',
    ],
    rawCorrect: 0,
    explanation:
      'Seluruh rangkaian materi menegaskan bahwa kunci menghadapi era modern adalah kesiapan manusia untuk terus belajar, beradaptasi secara bijak, dan berkolaborasi secara global.',
    npc: 'saga',
  },
];

// Pola rotasi bervariasi (0..3) agar posisi kunci jawaban tersebar seimbang di A, B, C, dan D
export const MARATHON_QUESTIONS: Question[] = RAW_MARATHON_ENTRIES.map((entry, idx) =>
  rotateQuestion(entry, (idx * 3 + 1) % 4),
);
