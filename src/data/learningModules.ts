import { NPCId } from '../types/game';

export interface LearningTable {
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface TimelineStage {
  stage: string;
  era: string;
  tech: string;
  change: string;
  example: string;
}

export interface MateriSubsection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  example?: string;
  impact?: string;
}

export interface FlashcardItem {
  id: string;
  tag: string;
  front: string;
  back: string;
}

export interface MiniChallengeQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false';
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  npc: NPCId;
  npcCommentCorrect: string;
  npcCommentWrong: string;
}

export interface LearningTopic {
  id: string;
  order: number;
  category: string;
  title: string;
  subtitle: string;
  npc: NPCId;
  accentColor: string;
  pengantar: string[];
  materiInti: {
    subsections: MateriSubsection[];
    timeline?: TimelineStage[];
    table?: LearningTable;
  };
  poinPenting: string[];
  contohPenerapan: { title: string; detail: string }[];
  faktaMenarik: string[];
  dialogKarakter: {
    npc: NPCId;
    expression: string;
    quote: string;
    secondaryNpc?: NPCId;
    secondaryQuote?: string;
  };
  flashcards: FlashcardItem[];
  miniChallenge: MiniChallengeQuestion[];
}

export const TOPIC_SECTION_KEYS = [
  'pengantar',
  'materi',
  'poin',
  'contoh',
  'fakta',
  'dialog',
  'flashcards',
] as const;

export type TopicSectionKey = (typeof TOPIC_SECTION_KEYS)[number];

export interface LearningLevelInfo {
  level: number;
  title: string;
  minExp: number;
  nextExp: number | null;
  progressPct: number;
}

export const LEARNING_LEVELS = [
  { level: 1, title: 'Penjelajah Pemula', minExp: 0 },
  { level: 2, title: 'Penjelajah Pengetahuan', minExp: 20 },
  { level: 3, title: 'Pengamat Dunia', minExp: 40 },
  { level: 4, title: 'Ahli Teknologi', minExp: 60 },
  { level: 5, title: 'Master Global', minExp: 80 },
] as const;

export function getLearningLevel(exp: number): LearningLevelInfo {
  let currentIdx = 0;
  for (let i = LEARNING_LEVELS.length - 1; i >= 0; i--) {
    if (exp >= LEARNING_LEVELS[i].minExp) {
      currentIdx = i;
      break;
    }
  }
  const current = LEARNING_LEVELS[currentIdx];
  const next = LEARNING_LEVELS[currentIdx + 1];
  const nextExp = next ? next.minExp : 100;
  const span = Math.max(1, nextExp - current.minExp);
  const progressPct = next
    ? Math.min(100, Math.round(((exp - current.minExp) / span) * 100))
    : Math.min(100, Math.round((exp / 100) * 100));

  return {
    level: current.level,
    title: current.title,
    minExp: current.minExp,
    nextExp: next ? next.minExp : null,
    progressPct,
  };
}

export const LEARNING_SUMMARY = {
  items: [
    {
      label: 'PERKEMBANGAN ZAMAN',
      text: 'Revolusi Industri 1.0 hingga 4.0 dan Era Digital.',
    },
    {
      label: 'KEMAJUAN TEKNOLOGI',
      text: 'Mesin, listrik, komputer, AI, dan internet.',
    },
    {
      label: 'TANTANGAN GLOBAL',
      text: 'Pekerjaan, ekonomi, lingkungan, dan keamanan digital.',
    },
    {
      label: 'DAMPAK PERKEMBANGAN',
      text: 'Peluang dan risiko bagi kehidupan manusia.',
    },
    {
      label: 'STRATEGI MENGHADAPI MASA DEPAN',
      text: 'Adaptasi, literasi digital, kreativitas, dan kerja sama.',
    },
  ],
  conclusion:
    'Perkembangan teknologi dari Revolusi Industri hingga Era Digital telah membawa perubahan besar dalam kehidupan manusia. Setiap kemajuan menciptakan peluang sekaligus tantangan. Oleh karena itu, manusia perlu terus belajar, mengembangkan keterampilan, dan memanfaatkan teknologi secara bijak agar mampu menghadapi perubahan zaman.',
};

export const LEARNING_TOPICS: LearningTopic[] = [
  {
    id: 'bab1',
    order: 1,
    category: 'Revolusi Industri 1.0–4.0',
    title: 'Bab 1. Perkembangan Revolusi Industri',
    subtitle: 'Dari mekanisasi mesin uap abad ke-18 hingga industri cerdas 4.0',
    npc: 'arka',
    accentColor: '#38BDF8',
    pengantar: [
      'Revolusi Industri merupakan perubahan besar dalam bidang industri yang ditandai dengan perkembangan teknologi, penggunaan mesin, dan perubahan sistem produksi. Perubahan ini menyebabkan cara manusia bekerja yang sebelumnya banyak mengandalkan tenaga fisik mulai beralih menggunakan bantuan mesin dan teknologi.',
      'Revolusi Industri pertama kali berkembang di Inggris pada abad ke-18, kemudian menyebar ke berbagai negara. Sebelum Revolusi Industri, sebagian besar barang diproduksi secara manual dengan tenaga manusia atau alat sederhana. Setelah Revolusi Industri berkembang, proses produksi menggunakan mesin sehingga barang dapat dihasilkan dalam jumlah lebih banyak dan waktu yang lebih singkat.',
    ],
    materiInti: {
      subsections: [
        {
          heading: '1.2 Latar Belakang Terjadinya Revolusi Industri',
          paragraphs: [
            'Revolusi Industri tidak terjadi secara tiba-tiba. Ada lima faktor utama yang mendorong perkembangannya:',
          ],
          bullets: [
            'Kemajuan ilmu pengetahuan: berkembangnya penelitian dan penemuan baru mendorong terciptanya teknologi yang membantu pekerjaan manusia.',
            'Ketersediaan sumber daya alam: batu bara dan bijih besi menjadi bahan penting untuk mendukung perkembangan mesin dan industri.',
            'Pertumbuhan penduduk: meningkatnya jumlah penduduk menyebabkan kebutuhan terhadap barang dan jasa semakin besar.',
            'Perkembangan perdagangan: aktivitas perdagangan yang semakin luas mendorong industri untuk meningkatkan jumlah produksi.',
            'Ketersediaan modal: adanya investasi memungkinkan pembangunan pabrik dan pengembangan teknologi baru.',
          ],
        },
        {
          heading: '1.3 A. Revolusi Industri 1.0 – Mekanisasi (Abad ke-18)',
          paragraphs: [
            'Revolusi Industri 1.0 dimulai ketika manusia mulai memanfaatkan mesin untuk membantu kegiatan produksi. Perubahan ini ditandai dengan penggunaan mesin uap yang dikembangkan melalui berbagai penyempurnaan, salah satunya oleh James Watt.',
            'Sebelumnya, kegiatan produksi sangat bergantung pada tenaga manusia, hewan, dan sumber tenaga alam. Dengan adanya mesin uap, proses produksi dapat dilakukan dengan lebih cepat dan dalam jumlah yang lebih besar.',
          ],
          bullets: [
            'Penggunaan mesin uap sebagai sumber tenaga.',
            'Berkembangnya industri tekstil.',
            'Munculnya pabrik-pabrik dengan sistem produksi mekanis.',
            'Perkembangan transportasi menggunakan tenaga uap.',
          ],
          example:
            'Mesin uap digunakan untuk menggerakkan mesin produksi di pabrik tekstil dan lokomotif uap untuk transportasi.',
          impact:
            'Produksi semakin meningkat dan kegiatan industri berkembang. Namun, muncul perubahan besar dalam kehidupan pekerja, termasuk perpindahan penduduk dari desa menuju kota industri.',
        },
        {
          heading: '1.3 B. Revolusi Industri 2.0 – Elektrifikasi (Akhir abad ke-19 – awal abad ke-20)',
          paragraphs: [
            'Revolusi Industri 2.0 ditandai dengan penggunaan energi listrik dalam kegiatan industri. Listrik memungkinkan mesin bekerja lebih efisien dan mendukung berkembangnya sistem produksi massal.',
            'Salah satu perkembangan penting pada masa ini adalah sistem jalur perakitan (assembly line), yang memungkinkan proses pembuatan barang dibagi menjadi beberapa tahapan pekerjaan.',
          ],
          bullets: [
            'Penggunaan listrik sebagai sumber energi industri.',
            'Berkembangnya produksi massal.',
            'Penggunaan jalur perakitan (assembly line).',
            'Kemajuan dalam bidang transportasi dan komunikasi.',
          ],
          example:
            'Industri mobil menggunakan sistem jalur perakitan untuk menghasilkan kendaraan dalam jumlah besar. Henry Ford dikenal karena memopulerkan penerapan sistem tersebut dalam industri otomotif.',
          impact:
            'Barang dapat diproduksi lebih cepat dan biaya produksi dapat ditekan. Namun, persaingan industri semakin meningkat dan pekerjaan mulai terbagi berdasarkan spesialisasi.',
        },
        {
          heading: '1.3 C. Revolusi Industri 3.0 – Otomatisasi (Sekitar tahun 1970-an)',
          paragraphs: [
            'Revolusi Industri 3.0 ditandai dengan perkembangan komputer, elektronik, dan teknologi informasi. Teknologi tersebut mulai digunakan untuk mengendalikan mesin dan menjalankan proses produksi secara otomatis.',
            'Jika sebelumnya mesin banyak dioperasikan langsung oleh manusia, pada tahap ini sebagian proses pekerjaan dapat dikendalikan melalui program komputer.',
          ],
          bullets: [
            'Penggunaan komputer dan mikroprosesor.',
            'Berkembangnya teknologi elektronik.',
            'Penggunaan robot dalam industri.',
            'Meningkatnya otomatisasi proses produksi.',
          ],
          example:
            'Mesin produksi yang dapat mengatur jumlah, ukuran, dan proses pembuatan barang berdasarkan program komputer.',
          impact:
            'Pekerjaan menjadi lebih efisien, tingkat ketelitian meningkat, dan kebutuhan tenaga kerja dengan keterampilan teknologi semakin besar.',
        },
        {
          heading: '1.3 D. Revolusi Industri 4.0 – Digitalisasi dan Konektivitas (Awal abad ke-21)',
          paragraphs: [
            'Revolusi Industri 4.0 merupakan tahap perkembangan industri yang mengintegrasikan teknologi digital, internet, dan sistem cerdas ke dalam proses produksi. Pada tahap ini, berbagai mesin dan perangkat dapat saling terhubung serta bertukar informasi.',
          ],
          bullets: [
            'Artificial Intelligence (AI).',
            'Internet of Things (IoT).',
            'Big Data.',
            'Cloud Computing.',
            'Robotika dan sistem otomatis yang saling terhubung.',
          ],
          example:
            'Pabrik pintar (smart factory) yang menggunakan sensor untuk memantau kondisi mesin dan sistem AI untuk membantu mengidentifikasi kemungkinan gangguan produksi.',
          impact:
            'Industri menjadi lebih efisien, cepat, dan terintegrasi. Namun, muncul tantangan berupa keamanan data, kebutuhan keterampilan baru, dan perubahan jenis pekerjaan.',
        },
      ],
      timeline: [
        {
          stage: 'Industri 1.0',
          era: 'Abad ke-18',
          tech: 'Mesin uap',
          change: 'Mekanisasi produksi',
          example: 'Pabrik tekstil & lokomotif uap',
        },
        {
          stage: 'Industri 2.0',
          era: 'Akhir Abad ke-19',
          tech: 'Listrik',
          change: 'Produksi massal',
          example: 'Jalur perakitan mobil Henry Ford',
        },
        {
          stage: 'Industri 3.0',
          era: '1970-an',
          tech: 'Komputer & elektronik',
          change: 'Otomatisasi',
          example: 'Mesin terprogram & robot pabrik',
        },
        {
          stage: 'Industri 4.0',
          era: 'Abad ke-21',
          tech: 'AI, IoT, Big Data',
          change: 'Industri cerdas & terhubung',
          example: 'Smart factory dengan sensor & AI',
        },
      ],
      table: {
        caption: '1.4 Perbedaan Keempat Revolusi Industri',
        headers: ['Tahapan', 'Teknologi utama', 'Perubahan utama'],
        rows: [
          ['1.0', 'Mesin uap', 'Mekanisasi produksi'],
          ['2.0', 'Listrik', 'Produksi massal'],
          ['3.0', 'Komputer dan elektronik', 'Otomatisasi'],
          ['4.0', 'AI, IoT, Big Data', 'Industri cerdas dan terhubung'],
        ],
      },
    },
    poinPenting: [
      'Revolusi Industri mengubah cara kerja manusia dari tenaga fisik manual menjadi sistem mesin dan teknologi.',
      'Lima pendorong Revolusi Industri: ilmu pengetahuan, sumber daya alam (batu bara & bijih besi), pertumbuhan penduduk, perdagangan, dan modal.',
      'Perbedaan utama keempat revolusi industri terletak pada teknologi yang digunakan dan cara manusia menjalankan proses produksi.',
      'Setiap tahap Revolusi Industri merupakan perkembangan berkesinambungan dari tahap sebelumnya.',
    ],
    contohPenerapan: [
      {
        title: 'Tekstil & Lokomotif Uap (1.0)',
        detail:
          'Mesin uap James Watt menggantikan tenaga manusia/hewan di pabrik tekstil dan transportasi kereta api.',
      },
      {
        title: 'Assembly Line Otomotif (2.0)',
        detail:
          'Henry Ford membagi perakitan mobil ke beberapa pos jalur perakitan bertenaga listrik sehingga biaya turun.',
      },
      {
        title: 'Otomatisasi Terprogram (3.0) & Smart Factory (4.0)',
        detail:
          'Dari mesin yang dikendalikan program komputer hingga pabrik pintar dengan sensor IoT dan AI pendeteksi gangguan mesin.',
      },
    ],
    faktaMenarik: [
      'Inggris menjadi tempat lahirnya Revolusi Industri 1.0 karena didukung cadangan batu bara dan bijih besi yang melimpah serta stabilitas perdagangan.',
      'Penerapan jalur perakitan (assembly line) di awal abad ke-20 memangkas waktu perakitan mobil dari belasan jam menjadi jauh lebih singkat dan mendorong lahirnya produksi massal.',
    ],
    dialogKarakter: {
      npc: 'arka',
      expression: 'Antusias & Analitis',
      quote:
        'Perhatikan garis waktunya! Setiap lompatan dari mesin uap (1.0), listrik (2.0), komputer (3.0), hingga AI dan IoT (4.0) selalu mengubah cara produksi sekaligus keahlian yang dibutuhkan manusia.',
      secondaryNpc: 'nara',
      secondaryQuote:
        'Jangan lupa, sejak 1.0 sudah ada dampak sosial seperti perpindahan penduduk ke kota industri, hingga di 4.0 muncul tantangan keamanan data.',
    },
    flashcards: [
      {
        id: 'fc-1-1',
        tag: 'Tokoh & Penemuan (1.0)',
        front: 'James Watt & Revolusi Industri 1.0',
        back: 'Penyempurna mesin uap pada abad ke-18 di Inggris. Mengubah produksi manual menjadi mekanisasi pabrik tekstil dan transportasi lokomotif uap.',
      },
      {
        id: 'fc-1-2',
        tag: 'Konsep Produksi (2.0)',
        front: 'Assembly Line (Jalur Perakitan) & Henry Ford',
        back: 'Sistem produksi massal bertenaga listrik pada akhir abad ke-19 hingga awal abad ke-20 yang membagi pembuatan barang menjadi beberapa tahapan kerja cepat.',
      },
      {
        id: 'fc-1-3',
        tag: 'Karakteristik (3.0)',
        front: 'Otomatisasi Berbasis Komputer (1970-an)',
        back: 'Menggunakan komputer, mikroprosesor, elektronik, dan robot industri agar proses produksi berjalan otomatis dengan ketelitian tinggi.',
      },
      {
        id: 'fc-1-4',
        tag: 'Karakteristik (4.0)',
        front: 'Smart Factory & Konektivitas 4.0',
        back: 'Mengintegrasikan AI, IoT, Big Data, dan Cloud Computing sehingga sensor dan mesin saling bertukar data secara real-time.',
      },
    ],
    miniChallenge: [
      {
        id: 'mc-1-1',
        type: 'multiple_choice',
        prompt:
          'Perubahan sistem produksi dari tenaga listrik dan jalur perakitan massal (assembly line) menjadi ciri utama dari tahapan...',
        options: [
          'Revolusi Industri 1.0',
          'Revolusi Industri 2.0',
          'Revolusi Industri 3.0',
          'Revolusi Industri 4.0',
        ],
        correctIndex: 1,
        explanation:
          'Revolusi Industri 2.0 (akhir abad ke-19) ditandai dengan elektrifikasi, produksi massal, dan jalur perakitan yang dipopulerkan oleh Henry Ford.',
        npc: 'arka',
        npcCommentCorrect: 'Tepat! Elektrifikasi dan jalur perakitan adalah kunci Industri 2.0.',
        npcCommentWrong: 'Belum tepat. Ingat: 1.0 = mesin uap, 2.0 = listrik & assembly line.',
      },
      {
        id: 'mc-1-2',
        type: 'true_false',
        prompt:
          'Benar atau Salah: Faktor pendorong Revolusi Industri di Inggris mencakup ketersediaan batu bara, bijih besi, modal investasi, serta pertumbuhan penduduk.',
        options: ['Benar', 'Salah'],
        correctIndex: 0,
        explanation:
          'Benar! Lima latar belakang Revolusi Industri meliputi kemajuan ilmu pengetahuan, SDA (batu bara & bijih besi), pertumbuhan penduduk, perkembangan perdagangan, dan ketersediaan modal.',
        npc: 'arka',
        npcCommentCorrect: 'Benar sekali! Kelima faktor itu saling melengkapi munculnya industrialisasi.',
        npcCommentWrong: 'Pernyataan tersebut benar—kelima faktor itu tercatat pada Subbab 1.2.',
      },
      {
        id: 'mc-1-3',
        type: 'multiple_choice',
        prompt:
          'Sebuah pabrik menggunakan sensor pada mesin yang mengirim data ke AI untuk mendeteksi potensi kerusakan sebelum terjadi. Contoh ini merupakan penerapan...',
        options: [
          'Mekanisasi 1.0',
          'Elektrifikasi 2.0',
          'Otomatisasi 3.0',
          'Industri Cerdas 4.0 (Smart Factory)',
        ],
        correctIndex: 3,
        explanation:
          'Penggunaan sensor terhubung (IoT) dan AI untuk memantau kondisi produksi adalah ciri khas Smart Factory pada Revolusi Industri 4.0.',
        npc: 'arka',
        npcCommentCorrect: 'Luar biasa! Kamu memahami konektivitas cerdas di Industri 4.0.',
        npcCommentWrong: 'Perhatikan penggunaan sensor dan AI yang saling terhubung—itu ciri Industri 4.0.',
      },
    ],
  },
  {
    id: 'bab2',
    order: 2,
    category: 'Era Digital & Teknologi',
    title: 'Bab 2. Perkembangan Era Digital',
    subtitle: 'Lima teknologi utama, perubahan 6 bidang kehidupan, dan kaitan dengan Industri 4.0',
    npc: 'arka',
    accentColor: '#34D399',
    pengantar: [
      'Era Digital merupakan masa ketika teknologi informasi dan komunikasi berkembang pesat serta menjadi bagian penting dalam kehidupan manusia. Pada era ini, berbagai aktivitas dapat dilakukan dengan bantuan perangkat digital dan jaringan internet.',
      'Perkembangan Era Digital tidak hanya memengaruhi kegiatan industri, tetapi juga pendidikan, ekonomi, komunikasi, kesehatan, pemerintahan, dan kehidupan sosial. Contohnya, dahulu seseorang harus datang langsung ke bank untuk melakukan transaksi, sedangkan sekarang transaksi dapat dilakukan melalui aplikasi perbankan digital menggunakan smartphone.',
    ],
    materiInti: {
      subsections: [
        {
          heading: '2.2 Teknologi Utama pada Era Digital (1–5)',
          paragraphs: [
            'Terdapat lima pilar teknologi utama yang menggerakkan berbagai layanan pada Era Digital:',
          ],
          bullets: [
            '1. Artificial Intelligence (AI): Kecerdasan buatan yang memungkinkan komputer/mesin mengenali pola, memahami bahasa, mengolah informasi, dan memberi rekomendasi. Contoh: asisten virtual, penerjemah otomatis, sistem rekomendasi video.',
            '2. Internet of Things (IoT): Menghubungkan perangkat fisik melalui internet agar dapat mengirim dan menerima data. Contoh: lampu pintar yang dikendalikan smartphone, sensor suhu, pemantau lingkungan.',
            '3. Big Data: Kumpulan data sangat besar, beragam, dan terus bertambah yang dianalisis untuk menemukan pola kebutuhan masyarakat dan membantu pengambilan keputusan. Contoh: analisis kebiasaan belanja konsumen.',
            '4. Cloud Computing: Penyimpanan, pengolahan, dan pengaksesan data melalui internet sehingga dokumen bisa dibuka dari berbagai perangkat. Contoh: Google Drive dan layanan penyimpanan awan lainnya.',
            '5. Robotika dan Otomatisasi: Robotika merancang dan menggunakan robot; otomatisasi menggunakan sistem untuk bekerja dengan sedikit atau tanpa campur tangan manusia langsung. Contoh: robot perakitan kendaraan dan mesin pengemasan otomatis.',
          ],
        },
        {
          heading: '2.4 Hubungan Revolusi Industri 4.0 dengan Era Digital',
          paragraphs: [
            'Revolusi Industri 4.0 dan Era Digital memiliki hubungan yang erat karena keduanya memanfaatkan perkembangan teknologi informasi dan komunikasi. Namun, keduanya mempunyai cakupan yang berbeda:',
          ],
          bullets: [
            'Revolusi Industri 4.0 lebih berfokus pada penerapan teknologi digital dalam kegiatan industri dan proses produksi.',
            'Era Digital memiliki cakupan lebih luas karena teknologi digital digunakan dalam hampir seluruh aspek kehidupan manusia.',
          ],
          example:
            'Penggunaan AI untuk mengatur mesin di pabrik merupakan penerapan Revolusi Industri 4.0. Sementara itu, penggunaan aplikasi pembelajaran dan media sosial merupakan bagian dari kehidupan di Era Digital.',
        },
      ],
      table: {
        caption: '2.3 Perubahan Kehidupan Manusia di Era Digital (6 Bidang)',
        headers: ['Bidang', 'Perkembangan dan contoh'],
        rows: [
          ['Pendidikan', 'Pembelajaran daring, kelas virtual, dan sumber belajar digital.'],
          ['Ekonomi', 'E-commerce, pembayaran digital, dan bisnis online.'],
          ['Komunikasi', 'Pesan instan, media sosial, dan panggilan video.'],
          ['Kesehatan', 'Konsultasi jarak jauh dan rekam medis elektronik.'],
          ['Transportasi', 'Navigasi digital dan pemesanan kendaraan online.'],
          ['Industri', 'Robot, sensor, dan sistem produksi pintar.'],
        ],
      },
    },
    poinPenting: [
      'Era Digital memengaruhi hampir seluruh sendi kehidupan: pendidikan, ekonomi, komunikasi, kesehatan, transportasi, dan industri.',
      '5 Teknologi Utama Era Digital: AI, Internet of Things (IoT), Big Data, Cloud Computing, serta Robotika & Otomatisasi.',
      'Revolusi Industri 4.0 berfokus pada proses industri dan produksi, sedangkan Era Digital mencakup seluruh aspek kehidupan manusia.',
    ],
    contohPenerapan: [
      {
        title: 'Layanan Perbankan & E-Commerce',
        detail:
          'Transaksi perbankan yang dulunya harus datang ke bank kini cukup lewat smartphone; perdagangan beralih ke bisnis online dan pembayaran digital.',
      },
      {
        title: 'Pendidikan & Kesehatan Daring',
        detail:
          'Siswa mengakses kelas virtual dan sumber belajar digital; pasien memanfaatkan konsultasi jarak jauh serta rekam medis elektronik.',
      },
      {
        title: 'Cloud & Perangkat Pintar di Rumah',
        detail:
          'Dokumen tersimpan di Google Drive agar dapat dibuka lintas perangkat, sementara lampu pintar dikendalikan lewat smartphone.',
      },
    ],
    faktaMenarik: [
      'Saat kamu menonton video pembelajaran dan platform memberi saran topik lanjutan, itu adalah gabungan kerja Big Data (mencatat pola minat) dan AI (memberikan rekomendasi).',
      'Satu perangkat smartphone masa kini menggabungkan fungsi komunikasi, navigasi digital, pembayaran, hingga pengendali perangkat IoT.',
    ],
    dialogKarakter: {
      npc: 'arka',
      expression: 'Fokus & Jelas',
      quote:
        'Ingat perbedaan cakupannya: Industri 4.0 fokus di pabrik dan sistem produksi cerdas, sedangkan Era Digital meluas ke kelas virtual, rekam medis, e-commerce, dan komunikasi harian kita.',
      secondaryNpc: 'saga',
      secondaryQuote:
        'Mengenal lima teknologi utama seperti AI, IoT, Big Data, Cloud, dan Robotika membantu kita memanfaatkannya untuk berkarya dan belajar lebih efektif.',
    },
    flashcards: [
      {
        id: 'fc-2-1',
        tag: 'Teknologi Utama #1 & #2',
        front: 'Apa perbedaan AI dan IoT?',
        back: 'AI adalah kecerdasan buatan untuk mengenali pola, bahasa, dan memberi rekomendasi. IoT adalah teknologi yang menghubungkan perangkat fisik (lampu pintar, sensor suhu) melalui internet untuk bertukar data.',
      },
      {
        id: 'fc-2-2',
        tag: 'Teknologi Utama #3 & #4',
        front: 'Peran Big Data vs Cloud Computing',
        back: 'Big Data menganalisis kumpulan data sangat besar untuk membaca pola kebutuhan dan keputusan. Cloud Computing memungkinkan penyimpanan dan akses data lewat internet (seperti Google Drive) dari berbagai perangkat.',
      },
      {
        id: 'fc-2-3',
        tag: 'Teknologi Utama #5',
        front: 'Robotika dan Otomatisasi',
        back: 'Robotika berkaitan dengan perancangan dan penggunaan robot, sedangkan otomatisasi menjalankan sistem dengan sedikit atau tanpa campur tangan manusia langsung (misalnya mesin pengemasan otomatis).',
      },
      {
        id: 'fc-2-4',
        tag: 'Konsep Kunci',
        front: 'Industri 4.0 vs Era Digital',
        back: 'Industri 4.0 berfokus pada teknologi digital di kegiatan industri/produksi (mis. AI pengatur mesin pabrik), sedangkan Era Digital mencakup seluruh aspek kehidupan manusia (belajar daring, media sosial, dll).',
      },
    ],
    miniChallenge: [
      {
        id: 'mc-2-1',
        type: 'multiple_choice',
        prompt:
          'Seorang siswa menyimpan tugas makalah di Google Drive agar dapat dibuka dari laptop sekolah maupun ponselnya di rumah. Teknologi yang digunakan adalah...',
        options: ['Internet of Things', 'Cloud Computing', 'Robotika', 'Assembly Line'],
        correctIndex: 1,
        explanation:
          'Cloud Computing memungkinkan penyimpanan, pengolahan, dan pengaksesan data melalui internet lintas perangkat, seperti Google Drive.',
        npc: 'arka',
        npcCommentCorrect: 'Benar! Cloud Computing membebaskan data dari ketergantungan pada satu perangkat.',
        npcCommentWrong: 'Coba ingat lagi: Google Drive adalah contoh utama layanan Cloud Computing.',
      },
      {
        id: 'mc-2-2',
        type: 'multiple_choice',
        prompt:
          'Manakah pernyataan yang paling tepat menjelaskan perbedaan Revolusi Industri 4.0 dan Era Digital?',
        options: [
          'Era Digital hanya berlaku di pabrik otomotif',
          'Industri 4.0 tidak menggunakan jaringan internet',
          'Industri 4.0 berfokus pada produksi/industri, sedangkan Era Digital mencakup hampir seluruh aspek kehidupan',
          'Era Digital terjadi sebelum Revolusi Industri 1.0',
        ],
        correctIndex: 2,
        explanation:
          'Industri 4.0 berfokus pada proses industri dan produksi, sementara Era Digital memiliki cakupan lebih luas meliputi pendidikan, ekonomi, kesehatan, komunikasi, transportasi, dan sosial.',
        npc: 'arka',
        npcCommentCorrect: 'Tepat sekali! Kamu membedakan cakupan keduanya dengan akurat.',
        npcCommentWrong: 'Ingat: Industri 4.0 fokus di ranah industri/produksi, sedangkan Era Digital jauh lebih luas.',
      },
      {
        id: 'mc-2-3',
        type: 'true_false',
        prompt:
          'Benar atau Salah: Konsultasi medis jarak jauh dan rekam medis elektronik adalah bentuk perubahan di bidang Kesehatan pada Era Digital.',
        options: ['Benar', 'Salah'],
        correctIndex: 0,
        explanation:
          'Benar! Berdasarkan tabel perubahan kehidupan di Era Digital (Subbab 2.3), bidang kesehatan berkembang melalui konsultasi jarak jauh dan rekam medis elektronik.',
        npc: 'saga',
        npcCommentCorrect: 'Benar! Layanan kesehatan menjadi lebih mudah diakses berkat teknologi digital.',
        npcCommentWrong: 'Pernyataan tersebut benar sesuai tabel perubahan bidang Kesehatan di Subbab 2.3.',
      },
    ],
  },
  {
    id: 'bab3',
    order: 3,
    category: 'Tantangan Global',
    title: 'Bab 3. Tantangan Global di Era Modern',
    subtitle: 'Tujuh tantangan global dunia modern serta matriks upaya mengatasinya',
    npc: 'nara',
    accentColor: '#F59E0B',
    pengantar: [
      'Tantangan global merupakan berbagai permasalahan yang muncul akibat perubahan dunia dan perkembangan zaman serta dapat memengaruhi kehidupan masyarakat di berbagai negara.',
      'Kemajuan teknologi, globalisasi, dan perkembangan industri memang memberikan banyak kemudahan. Namun, perubahan tersebut juga menimbulkan tantangan baru yang tidak hanya berkaitan dengan teknologi, tetapi juga mencakup ekonomi, ketenagakerjaan, lingkungan, pendidikan, serta kehidupan sosial dan budaya.',
    ],
    materiInti: {
      subsections: [
        {
          heading: '3.2 Tujuh Jenis Tantangan Global (Bagian 1–4)',
          bullets: [
            '1. Tantangan Ketenagakerjaan: Mesin, robot, dan AI dapat mengambil alih pekerjaan berulang (seperti administrasi manual sederhana yang kini dibantu perangkat lunak) sehingga manusia harus terus meningkatkan keterampilan.',
            '2. Kesenjangan Digital (Digital Divide): Perbedaan akses perangkat, jaringan internet, dan pendidikan teknologi antara masyarakat, misalnya pelajar di wilayah terpencil yang kesulitan mengikuti belajar daring.',
            '3. Keamanan dan Privasi Digital: Risiko pencurian data pribadi, penipuan internet, peretasan akun, dan penyalahgunaan identitas digital—seperti pesan palsu yang meminta kode verifikasi (OTP) mengatasnamakan layanan resmi.',
            '4. Penyebaran Hoaks dan Disinformasi: Berita palsu atau informasi menyesatkan menyebar cepat tanpa sumber terpercaya dan dapat memicu kesalahpahaman, kepanikan, hingga konflik sosial.',
          ],
        },
        {
          heading: '3.2 Tujuh Jenis Tantangan Global (Bagian 5–7)',
          bullets: [
            '5. Kerusakan Lingkungan: Peningkatan industri menimbulkan pencemaran udara, pencemaran air, penumpukan limbah elektronik (e-waste), dan perubahan iklim apabila limbah tidak dikelola dengan baik.',
            '6. Persaingan Ekonomi Global: Perdagangan antarnegara membuka pasar luas sekaligus memperketat persaingan, misalnya produk UMKM lokal yang harus bersaing dengan produk impor di platform e-commerce.',
            '7. Perubahan Sosial dan Budaya: Arus informasi global memudahkan pertukaran wawasan, namun tanpa sikap bijak generasi muda bisa lebih mengenal budaya luar negeri dibanding kesenian daerahnya sendiri.',
          ],
        },
      ],
      table: {
        caption: '3.3 Contoh Tantangan dan Solusinya',
        headers: ['Tantangan', 'Upaya mengatasi'],
        rows: [
          ['Perubahan lapangan kerja', 'Meningkatkan keterampilan dan kompetensi'],
          ['Kesenjangan digital', 'Memperluas akses internet dan pendidikan teknologi'],
          ['Kejahatan siber', 'Meningkatkan keamanan akun dan literasi digital'],
          ['Hoaks', 'Memeriksa fakta dan sumber informasi'],
          ['Kerusakan lingkungan', 'Menerapkan teknologi ramah lingkungan'],
          ['Persaingan global', 'Meningkatkan kualitas dan inovasi produk'],
          ['Lunturnya budaya lokal', 'Melestarikan dan memperkenalkan budaya daerah'],
        ],
      },
    },
    poinPenting: [
      'Tantangan global mencakup 7 aspek: ketenagakerjaan, digital divide, keamanan & privasi digital, hoaks, kerusakan lingkungan, persaingan ekonomi global, serta perubahan sosial budaya.',
      'Kesenjangan digital terjadi saat akses internet, perangkat, dan literasi teknologi tidak merata.',
      'Setiap tantangan global memiliki solusi nyata: mulai dari cek fakta, keamanan akun, inovasi UMKM, hingga teknologi ramah lingkungan.',
    ],
    contohPenerapan: [
      {
        title: 'Pesan Palsu Meminta Kode Verifikasi',
        detail:
          'Modus kejahatan siber mengatasnamakan layanan resmi untuk meretas akun—harus dicegah dengan tidak membagikan kode OTP dan menjaga keamanan akun.',
      },
      {
        title: 'UMKM Lokal vs Produk Impor Daring',
        detail:
          'Pelaku UMKM menjawab persaingan ekonomi global dengan meningkatkan kualitas, kemasan, inovasi produk, serta pemasaran digital.',
      },
      {
        title: 'Pelajar di Daerah Terpencil',
        detail:
          'Kesenjangan jaringan internet diatasi dengan perluasan infrastruktur akses internet dan pemerataan pendidikan teknologi.',
      },
    ],
    faktaMenarik: [
      'Limbah elektronik (e-waste) seperti ponsel rusak, baterai, dan komponen komputer mengandung zat berbahaya jika dibuang sembarangan tanpa daur ulang khusus.',
      'Dalam persaingan global, identitas budaya lokal yang dikemas kreatif melalui media digital justru bisa menjadi keunggulan unik produk Indonesia di pasar dunia.',
    ],
    dialogKarakter: {
      npc: 'nara',
      expression: 'Kritis & Waspada',
      quote:
        'Kemudahan digital punya sisi risiko yang wajib kita cermati: mulai dari kebocoran OTP, hoaks yang memicu kepanikan, sampai ketimpangan akses internet di daerah terpencil.',
      secondaryNpc: 'saga',
      secondaryQuote:
        'Kuncinya ada pada solusi terukur: periksa sumber berita sebelum berbagi, perkuat kata sandi, dan dukung produk serta budaya daerah agar tetap berdaya saing.',
    },
    flashcards: [
      {
        id: 'fc-3-1',
        tag: 'Istilah Penting',
        front: 'Kesenjangan Digital (Digital Divide)',
        back: 'Perbedaan akses dan kemampuan masyarakat dalam memperoleh perangkat, jaringan internet, serta pendidikan teknologi (misalnya pelajar di wilayah terpencil kesulitan belajar daring).',
      },
      {
        id: 'fc-3-2',
        tag: 'Keamanan Siber',
        front: '4 Masalah Keamanan & Privasi Digital',
        back: 'Pencurian data pribadi, penipuan melalui internet, peretasan akun, dan penyalahgunaan identitas digital. Jangan pernah memberi kode verifikasi kepada pihak tak dikenal.',
      },
      {
        id: 'fc-3-3',
        tag: 'Tantangan Ekonomi',
        front: 'Cara UMKM Menghadapi Persaingan Global',
        back: 'Meningkatkan kualitas dan inovasi produk agar produk lokal mampu bersaing dengan produk impor di platform perdagangan elektronik.',
      },
      {
        id: 'fc-3-4',
        tag: 'Lingkungan & Sosial',
        front: 'Solusi Kerusakan Lingkungan & Budaya Lokal',
        back: 'Terapkan teknologi ramah lingkungan untuk menekan polusi dan e-waste, serta aktif melestarikan dan memperkenalkan kesenian/budaya daerah lewat media digital.',
      },
    ],
    miniChallenge: [
      {
        id: 'mc-3-1',
        type: 'multiple_choice',
        prompt:
          'Kamu menerima pesan mencurigakan yang mengaku dari layanan resmi dan meminta kode verifikasi akunmu. Ancaman ini termasuk tantangan...',
        options: [
          'Kesenjangan digital',
          'Keamanan dan privasi digital',
          'Persaingan ekonomi global',
          'Perubahan sosial budaya',
        ],
        correctIndex: 1,
        explanation:
          'Pesan palsu yang meminta kode verifikasi akun adalah contoh kejahatan siber dalam tantangan Keamanan dan Privasi Digital.',
        npc: 'nara',
        npcCommentCorrect: 'Waspada dan tepat! Jangan pernah bagikan kode verifikasi atau OTP ke siapa pun.',
        npcCommentWrong: 'Perhatikan modusnya: meminta kode verifikasi akun berkaitan langsung dengan Keamanan dan Privasi Digital.',
      },
      {
        id: 'mc-3-2',
        type: 'multiple_choice',
        prompt:
          'Berdasarkan tabel solusi tantangan global, upaya paling tepat untuk mengatasi masalah perubahan lapangan kerja akibat otomatisasi adalah...',
        options: [
          'Menghentikan seluruh akses internet',
          'Meningkatkan keterampilan dan kompetensi',
          'Melarang penggunaan komputer di kantor',
          'Menutup perdagangan daring',
        ],
        correctIndex: 1,
        explanation:
          'Sesuai Subbab 3.3, tantangan perubahan lapangan kerja diatasi dengan meningkatkan keterampilan dan kompetensi agar selaras dengan kebutuhan dunia kerja.',
        npc: 'saga',
        npcCommentCorrect: 'Tepat! Meningkatkan keterampilan membuat kita siap beradaptasi di dunia kerja modern.',
        npcCommentWrong: 'Menolak teknologi bukan solusi—solusinya adalah meningkatkan keterampilan dan kompetensi.',
      },
      {
        id: 'mc-3-3',
        type: 'true_false',
        prompt:
          'Benar atau Salah: Kesenjangan digital (Digital Divide) hanya disebabkan oleh harga komputer, bukan oleh perbedaan jaringan internet atau pendidikan teknologi.',
        options: ['Benar', 'Salah'],
        correctIndex: 1,
        explanation:
          'Salah! Kesenjangan digital mencakup perbedaan akses perangkat, jaringan internet, sekaligus kemampuan/pendidikan teknologi di masyarakat.',
        npc: 'nara',
        npcCommentCorrect: 'Benar! Kamu jeli melihat bahwa kesenjangan digital meliputi perangkat, jaringan, dan literasi.',
        npcCommentWrong: 'Pernyataan itu salah karena Digital Divide mencakup perangkat, jaringan internet, dan kemampuan teknologi.',
      },
    ],
  },
  {
    id: 'bab4',
    order: 4,
    category: 'Dampak Teknologi',
    title: 'Bab 4. Dampak Perkembangan Teknologi terhadap Kehidupan',
    subtitle: 'Menyeimbangkan 5 dampak positif, 5 dampak negatif, dan peran generasi muda',
    npc: 'nara',
    accentColor: '#A78BFA',
    pengantar: [
      'Perkembangan teknologi membawa perubahan besar dalam kehidupan manusia. Perubahan tersebut dapat memberikan manfaat besar, tetapi juga menimbulkan risiko apabila tidak digunakan secara tepat.',
      'Memahami perbandingan dampak positif dan negatif membantu kita—terutama generasi muda—mengambil keputusan yang aktif, kritis, kreatif, dan bertanggung jawab di era digital.',
    ],
    materiInti: {
      subsections: [
        {
          heading: '4.1 Lima Dampak Positif Teknologi',
          bullets: [
            '1. Meningkatkan Efisiensi dan Produktivitas: Mesin dan teknologi otomatis membuat pekerjaan selesai lebih cepat, teratur, serta mengurangi kesalahan.',
            '2. Mempermudah Komunikasi: Internet memungkinkan pertukaran informasi secara singkat lintas negara tanpa harus bertemu langsung.',
            '3. Memperluas Akses Pendidikan dan Informasi: Masyarakat memperoleh buku elektronik, video pembelajaran, jurnal, dan kelas daring dengan mudah.',
            '4. Menciptakan Peluang Ekonomi Baru: Membuka peluang usaha online, pemasaran digital, dan jangkauan konsumen lintas wilayah.',
            '5. Mendorong Inovasi dan Kreativitas: Memberikan sarana bagi manusia menghasilkan ide, karya, dan penemuan baru pemecah masalah.',
          ],
        },
        {
          heading: '4.2 Lima Dampak Negatif Teknologi',
          bullets: [
            '1. Pergeseran Lapangan Pekerjaan: Mesin dan otomatisasi mengurangi kebutuhan tenaga manusia pada pekerjaan tertentu sehingga pekerja wajib menyesuaikan keterampilan.',
            '2. Ketergantungan terhadap Teknologi: Penggunaan perangkat digital berlebihan mengganggu konsentrasi, produktivitas, waktu istirahat, dan interaksi sosial langsung.',
            '3. Meningkatnya Kejahatan Digital: Internet disalahgunakan untuk penipuan, pencurian data, dan peretasan.',
            '4. Kesenjangan Sosial dan Ekonomi: Pemilik akses teknologi dan keterampilan lebih baik memperoleh peluang jauh lebih besar dibanding kelompok dengan akses terbatas.',
            '5. Pencemaran Lingkungan: Kegiatan industri dan peningkatan perangkat elektronik menghasilkan polusi serta limbah elektronik yang membutuhkan pengelolaan khusus.',
          ],
        },
        {
          heading: '4.4 Pengaruh terhadap Generasi Muda',
          paragraphs: [
            'Generasi muda merupakan kelompok yang paling banyak berinteraksi dengan teknologi digital. Perkembangan ini membuka kesempatan luas untuk belajar, berkreasi, dan mengembangkan kemampuan.',
            'Namun, generasi muda perlu memiliki kesadaran dalam menggunakan teknologi—terutama dalam menerima informasi, menjaga privasi, mengatur waktu, dan berinteraksi di dunia maya. Oleh karena itu, generasi muda perlu menjadi pengguna teknologi yang aktif, kritis, kreatif, dan bertanggung jawab.',
          ],
        },
      ],
      table: {
        caption: '4.3 Perbandingan Dampak Positif dan Negatif (6 Bidang)',
        headers: ['Bidang', 'Positif', 'Negatif'],
        rows: [
          ['Ekonomi', 'Peluang bisnis meningkat', 'Persaingan semakin ketat'],
          ['Pendidikan', 'Informasi mudah diperoleh', 'Kesenjangan akses'],
          ['Sosial', 'Komunikasi lebih mudah', 'Interaksi langsung berkurang'],
          ['Industri', 'Produksi lebih efisien', 'Beberapa pekerjaan tergantikan'],
          ['Lingkungan', 'Teknologi ramah lingkungan', 'Pencemaran dan limbah'],
          ['Informasi', 'Akses informasi semakin luas', 'Hoaks dan disinformasi'],
        ],
      },
    },
    poinPenting: [
      'Teknologi adalah pedang bermata dua: meningkatkan efisiensi, komunikasi, pendidikan, ekonomi, dan kreativitas, sekaligus memicu pergeseran kerja, ketergantungan, kejahatan siber, kesenjangan, dan limbah.',
      'Di bidang sosial, komunikasi jarak jauh makin mudah tetapi interaksi tatap muka langsung berisiko berkurang.',
      'Generasi muda harus menjadi pengguna teknologi yang aktif, kritis, kreatif, dan bertanggung jawab.',
    ],
    contohPenerapan: [
      {
        title: 'Mengatur Waktu Layar & Interaksi Sosial',
        detail:
          'Menggunakan gawai untuk mencari jurnal/video pembelajaran secara terjadwal, lalu tetap menjaga komunikasi tatap muka dan waktu istirahat.',
      },
      {
        title: 'Peluang Usaha Online Pelajar',
        detail:
          'Memanfaatkan media digital untuk menjual karya desain atau kerajinan lokal sambil terus berinovasi agar unggul dalam persaingan pasar.',
      },
    ],
    faktaMenarik: [
      'Di sektor lingkungan, teknologi punya dua wajah sekaligus: di satu sisi menyumbang limbah elektronik, di sisi lain melahirkan teknologi energi bersih dan pemantau kualitas udara ramah lingkungan.',
      'Keseimbangan digital (digital wellbeing) membantu pelajar mempertahankan konsentrasi belajar sekaligus menjaga kesehatan fisik dan hubungan sosial.',
    ],
    dialogKarakter: {
      npc: 'nara',
      expression: 'Reflektif',
      quote:
        'Coba bandingkan tabel dampak di setiap bidang: saat ekonomi membuka peluang bisnis baru, persaingan ikut mengetat; saat akses informasi meluas, hoaks ikut menyebar.',
      secondaryNpc: 'arka',
      secondaryQuote:
        'Karena itulah siswa kelas XII perlu kritis menyaring informasi, menjaga privasi, dan mengatur waktu penggunaan gawai.',
    },
    flashcards: [
      {
        id: 'fc-4-1',
        tag: 'Perbandingan Bidang Sosial',
        front: 'Dampak Positif vs Negatif di Bidang Sosial',
        back: 'Positif: Komunikasi menjadi lebih mudah dan cepat lintas jarak. Negatif: Interaksi tatap muka langsung berkurang dan muncul ketergantungan perangkat digital.',
      },
      {
        id: 'fc-4-2',
        tag: 'Perbandingan Bidang Industri',
        front: 'Dampak Positif vs Negatif di Bidang Industri',
        back: 'Positif: Produksi jauh lebih efisien dan akurat. Negatif: Beberapa jenis pekerjaan rutin tergantikan mesin atau otomatisasi.',
      },
      {
        id: 'fc-4-3',
        tag: 'Perbandingan Bidang Informasi',
        front: 'Dampak Positif vs Negatif di Bidang Informasi',
        back: 'Positif: Akses pengetahuan, buku elektronik, dan jurnal semakin luas. Negatif: Maraknya penyebaran hoaks dan disinformasi.',
      },
      {
        id: 'fc-4-4',
        tag: 'Karakter Generasi Muda',
        front: '4 Sikap Ideal Generasi Muda di Era Digital',
        back: 'Menjadi pengguna teknologi yang Aktif, Kritis (menyaring informasi), Kreatif (berkarya), dan Bertanggung Jawab (menjaga privasi & mengatur waktu).',
      },
    ],
    miniChallenge: [
      {
        id: 'mc-4-1',
        type: 'multiple_choice',
        prompt:
          'Penggunaan perangkat digital secara berlebihan hingga mengganggu jam tidur, konsentrasi belajar, dan komunikasi tatap muka langsung termasuk dampak negatif berupa...',
        options: [
          'Kesenjangan sosial',
          'Ketergantungan terhadap teknologi',
          'Pencemaran lingkungan',
          'Peluang ekonomi baru',
        ],
        correctIndex: 1,
        explanation:
          'Ketergantungan terhadap teknologi terjadi ketika pemakaian gawai berlebihan mengganggu konsentrasi, produktivitas, waktu istirahat, dan interaksi sosial langsung.',
        npc: 'nara',
        npcCommentCorrect: 'Benar! Mengatur waktu layar sangat penting untuk menghindari ketergantungan teknologi.',
        npcCommentWrong: 'Gejala gangguan istirahat, konsentrasi, dan kurang interaksi langsung menandakan ketergantungan teknologi.',
      },
      {
        id: 'mc-4-2',
        type: 'multiple_choice',
        prompt:
          'Dalam tabel perbandingan dampak teknologi pada bidang Pendidikan, sisi positif dan sisi negatifnya adalah...',
        options: [
          'Positif: Peluang bisnis meningkat · Negatif: Hoaks',
          'Positif: Informasi mudah diperoleh · Negatif: Kesenjangan akses',
          'Positif: Produksi efisien · Negatif: Pencemaran limbah',
          'Positif: Komunikasi mudah · Negatif: Persaingan ketat',
        ],
        correctIndex: 1,
        explanation:
          'Di bidang Pendidikan, dampak positifnya adalah informasi dan sumber belajar mudah diperoleh, sementara dampak negatifnya adalah kesenjangan akses.',
        npc: 'arka',
        npcCommentCorrect: 'Tepat! Pendidikan daring mempermudah akses ilmu, namun pemerataan akses tetap harus diperjuangkan.',
        npcCommentWrong: 'Lihat kembali kolom Pendidikan pada Tabel 4.3: mudahnya informasi vs kesenjangan akses.',
      },
      {
        id: 'mc-4-3',
        type: 'true_false',
        prompt:
          'Benar atau Salah: Generasi muda cukup menjadi pengguna teknologi yang pasif selama mereka memiliki gawai terbaru.',
        options: ['Benar', 'Salah'],
        correctIndex: 1,
        explanation:
          'Salah! Pada Subbab 4.4 ditegaskan bahwa generasi muda perlu menjadi pengguna teknologi yang aktif, kritis, kreatif, dan bertanggung jawab.',
        npc: 'saga',
        npcCommentCorrect: 'Tepat! Generasi muda harus aktif, kritis, kreatif, dan bertanggung jawab—bukan pengguna pasif.',
        npcCommentWrong: 'Pernyataan tersebut salah; pengguna teknologi ideal harus aktif, kritis, kreatif, dan bertanggung jawab.',
      },
    ],
  },
  {
    id: 'bab5',
    order: 5,
    category: 'Strategi Masa Depan',
    title: 'Bab 5. Strategi Menghadapi Tantangan Masa Depan & Rangkuman',
    subtitle: 'Adaptasi, 6 keterampilan era digital, langkah harian, dan kerja sama global',
    npc: 'saga',
    accentColor: '#38BDF8',
    pengantar: [
      'Dalam menghadapi Revolusi Industri dan Era Digital, manusia tidak cukup hanya mengetahui perkembangan teknologi, tetapi juga harus mampu mempelajari, beradaptasi, dan memanfaatkannya secara bijak.',
      'Bab ini merangkum enam keterampilan utama abad digital, langkah konkret dalam kehidupan sehari-hari, bentuk kerja sama global antarnegara, sekaligus rangkuman menyeluruh seluruh modul pembelajaran.',
    ],
    materiInti: {
      subsections: [
        {
          heading: '5.1 Pentingnya Adaptasi terhadap Perubahan Zaman',
          paragraphs: [
            'Adaptasi merupakan kemampuan seseorang atau kelompok untuk menyesuaikan diri terhadap perubahan lingkungan dan perkembangan zaman. Kemampuan beradaptasi menjadi penting karena perkembangan teknologi dapat mengubah kebutuhan keterampilan, pola pekerjaan, dan kehidupan masyarakat.',
          ],
          example:
            'Seseorang yang sebelumnya melakukan pekerjaan administrasi secara manual perlu mempelajari penggunaan perangkat lunak pengolah data agar mampu mengikuti perubahan sistem kerja.',
        },
        {
          heading: '5.2 Enam Keterampilan yang Dibutuhkan pada Era Digital',
          bullets: [
            '1. Literasi Digital: Kemampuan menggunakan, memahami, mengevaluasi, dan memanfaatkan teknologi digital secara tepat dan bertanggung jawab.',
            '2. Berpikir Kritis (Critical Thinking): Kemampuan menilai informasi, mengidentifikasi masalah, serta menentukan keputusan berdasarkan alasan dan bukti yang tepat.',
            '3. Kreativitas (Creativity): Kemampuan menghasilkan ide dan gagasan baru untuk menciptakan inovasi dan menyelesaikan permasalahan.',
            '4. Komunikasi (Communication): Kemampuan menyampaikan informasi, pendapat, dan gagasan secara jelas serta efektif, baik langsung maupun melalui media digital.',
            '5. Kolaborasi (Collaboration): Kemampuan bekerja sama, berbagi ide, dan menyelesaikan pekerjaan bersama orang lain.',
            '6. Kemampuan Belajar Sepanjang Hayat (Lifelong Learning): Kemauan untuk terus mempelajari pengetahuan dan keterampilan baru sesuai perkembangan zaman.',
          ],
        },
        {
          heading: '5.3 Cara Menghadapi Tantangan Era Digital dalam Kehidupan Sehari-hari',
          bullets: [
            'Meningkatkan kemampuan teknologi: mempelajari penggunaan komputer, aplikasi, dan perangkat digital.',
            'Memeriksa kebenaran informasi: tidak langsung mempercayai atau menyebarkan berita sebelum memeriksa sumbernya.',
            'Menjaga keamanan data pribadi: menggunakan kata sandi yang kuat dan tidak membagikan informasi rahasia kepada pihak lain.',
            'Menggunakan teknologi secara bijak: memanfaatkan teknologi untuk kegiatan produktif dan menghindari penggunaan berlebihan.',
            'Mengembangkan kreativitas: menggunakan teknologi untuk menghasilkan karya dan inovasi.',
            'Melestarikan lingkungan: mengurangi limbah elektronik dan mendukung penggunaan teknologi ramah lingkungan.',
            'Mempertahankan budaya lokal: memanfaatkan media digital untuk memperkenalkan budaya Indonesia kepada masyarakat luas.',
          ],
        },
        {
          heading: '5.4 Kerja Sama Global dalam Menghadapi Tantangan',
          paragraphs: [
            'Tidak semua tantangan dapat diselesaikan oleh satu individu atau satu negara. Permasalahan seperti perubahan iklim, kejahatan siber, dan kesenjangan teknologi membutuhkan kerja sama berbagai pihak antarnegara:',
          ],
          bullets: [
            'Kerja sama penelitian dan pengembangan teknologi.',
            'Pertukaran ilmu pengetahuan dan pendidikan.',
            'Perdagangan internasional.',
            'Penanganan perubahan iklim.',
            'Pengembangan teknologi kesehatan.',
            'Kerja sama dalam menjaga keamanan digital.',
          ],
        },
      ],
      table: {
        caption: 'Rangkuman Pembelajaran Lintas Bab (Modul Globalopoly)',
        headers: ['Aspek Utama', 'Inti Pembelajaran'],
        rows: [
          ['Perkembangan Zaman', 'Revolusi Industri 1.0 hingga 4.0 dan Era Digital.'],
          ['Kemajuan Teknologi', 'Mesin, listrik, komputer, AI, dan internet.'],
          ['Tantangan Global', 'Pekerjaan, ekonomi, lingkungan, dan keamanan digital.'],
          ['Dampak Perkembangan', 'Peluang dan risiko bagi kehidupan manusia.'],
          ['Strategi Masa Depan', 'Adaptasi, literasi digital, kreativitas, dan kerja sama.'],
        ],
      },
    },
    poinPenting: [
      'Adaptasi menuntut kita bukan hanya tahu teknologi, tetapi juga terampil memanfaatkannya.',
      '6 Keterampilan Era Digital: Literasi Digital, Critical Thinking, Creativity, Communication, Collaboration, dan Lifelong Learning.',
      'Kebiasaan harian yang wajib dijaga: cek fakta, sandi kuat, bijak memakai gawai, dukung teknologi hijau, dan promosikan budaya lokal.',
      'Isu global seperti iklim, keamanan digital, dan riset membutuhkan kolaborasi antarnegara.',
    ],
    contohPenerapan: [
      {
        title: 'Memperkenalkan Budaya Nusantara via Digital',
        detail:
          'Pelajar membuat konten edukatif tentang batik, tari daerah, atau kuliner Nusantara agar dikenal masyarakat luas di kancah global.',
      },
      {
        title: 'Kebersihan Digital & Lingkungan',
        detail:
          'Memakai sandi unik yang kuat di akun belajar serta menyalurkan perangkat elektronik rusak ke pusat daur ulang untuk mengurangi e-waste.',
      },
    ],
    faktaMenarik: [
      'Konsep Lifelong Learning (belajar sepanjang hayat) menjadi kunci bertahan di era ketika keterampilan kerja berubah setiap beberapa tahun sekali.',
      'Pertukaran ilmu pengetahuan internasional membantu penemuan di bidang kesehatan, iklim, dan keamanan siber berlangsung jauh lebih cepat dibanding jika tiap negara bekerja sendiri.',
    ],
    dialogKarakter: {
      npc: 'saga',
      expression: 'Optimis & Solutif',
      quote:
        'Masa depan bukan untuk ditakuti, melainkan dipersiapkan! Bekali dirimu dengan 6 keterampilan era digital, jaga keamanan data dan lingkungan, serta bangun kolaborasi global.',
      secondaryNpc: 'arka',
      secondaryQuote:
        'Selamat telah mempelajari seluruh Bab 1–5! Sekarang pengetahuanmu siap diuji di papan GLOBALOPOLY!',
    },
    flashcards: [
      {
        id: 'fc-5-1',
        tag: '6 Keterampilan Digital',
        front: 'Apa saja 6 Keterampilan Era Digital (Subbab 5.2)?',
        back: '1) Literasi Digital, 2) Berpikir Kritis, 3) Kreativitas, 4) Komunikasi, 5) Kolaborasi, dan 6) Belajar Sepanjang Hayat (Lifelong Learning).',
      },
      {
        id: 'fc-5-2',
        tag: 'Keterampilan Kunci',
        front: 'Lifelong Learning (Belajar Sepanjang Hayat)',
        back: 'Kemauan untuk terus mempelajari pengetahuan dan keterampilan baru secara berkelanjutan sesuai perkembangan zaman.',
      },
      {
        id: 'fc-5-3',
        tag: 'Aksi Sehari-hari',
        front: 'Melestarikan Budaya & Lingkungan di Era Digital',
        back: 'Mengurangi limbah elektronik (e-waste), mendukung teknologi ramah lingkungan, serta memanfaatkan media digital untuk memperkenalkan budaya Indonesia.',
      },
      {
        id: 'fc-5-4',
        tag: 'Kolaborasi Dunia',
        front: 'Mengapa Kerja Sama Global Diperlukan?',
        back: 'Masalah seperti perubahan iklim, kejahatan siber, riset kesehatan, dan kesenjangan teknologi melampaui batas satu negara sehingga butuh pertukaran ilmu dan kerja sama internasional.',
      },
    ],
    miniChallenge: [
      {
        id: 'mc-5-1',
        type: 'multiple_choice',
        prompt:
          'Kemampuan menilai informasi, mengidentifikasi masalah, dan menentukan keputusan berdasarkan alasan serta bukti yang tepat disebut...',
        options: [
          'Kreativitas',
          'Berpikir Kritis (Critical Thinking)',
          'Otomatisasi',
          'Produksi Massal',
        ],
        correctIndex: 1,
        explanation:
          'Berpikir Kritis adalah kemampuan menilai informasi, mengidentifikasi masalah, dan mengambil keputusan berdasarkan alasan serta bukti yang tepat.',
        npc: 'saga',
        npcCommentCorrect: 'Tepat sekali! Berpikir kritis adalah perisai utama melawan hoaks.',
        npcCommentWrong: 'Menilai bukti dan alasan sebelum mengambil keputusan merupakan definisi Berpikir Kritis.',
      },
      {
        id: 'mc-5-2',
        type: 'multiple_choice',
        prompt:
          'Langkah yang tepat untuk mempertahankan budaya lokal sekaligus menghadapi era digital adalah...',
        options: [
          'Menolak seluruh penggunaan media digital',
          'Memanfaatkan media digital untuk memperkenalkan budaya Indonesia kepada masyarakat luas',
          'Mengganti seluruh tradisi daerah dengan tren luar negeri',
          'Membagikan berita tanpa memeriksa sumber',
        ],
        correctIndex: 1,
        explanation:
          'Subbab 5.3 menekankan pemanfaatan media digital secara positif untuk melestarikan dan memperkenalkan budaya Indonesia ke masyarakat luas.',
        npc: 'saga',
        npcCommentCorrect: 'Keren! Media digital bisa menjadi panggung dunia bagi budaya Nusantara.',
        npcCommentWrong: 'Media digital justru bisa dimanfaatkan untuk memperkenalkan budaya lokal Indonesia.',
      },
      {
        id: 'mc-5-3',
        type: 'true_false',
        prompt:
          'Benar atau Salah: Permasalahan seperti kejahatan siber dan perubahan iklim dapat diselesaikan sepenuhnya oleh satu negara tanpa kerja sama global.',
        options: ['Benar', 'Salah'],
        correctIndex: 1,
        explanation:
          'Salah! Pada Subbab 5.4 dijelaskan bahwa perubahan iklim, kejahatan siber, dan kesenjangan teknologi membutuhkan kerja sama global antarnegara.',
        npc: 'nara',
        npcCommentCorrect: 'Benar! Tantangan lintas batas menuntut kolaborasi global antarnegara.',
        npcCommentWrong: 'Pernyataan itu salah karena isu iklim dan keamanan siber membutuhkan kerja sama global.',
      },
    ],
  },
];
