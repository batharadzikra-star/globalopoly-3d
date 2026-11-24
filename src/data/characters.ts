import { NPCId } from '../types/game';

export const HERO_BANNER_IMAGE = '/src/assets/images/globalopoly_hero_1794630614003.jpg';

export interface NPCCharacter {
  id: NPCId;
  name: string;
  role: string;
  color: string;
  bgTint: string;
  borderTint: string;
  image: string;
  personality: string;
  focusTopics: string[];
  introQuote: string;
  closingQuote: string;
}

export const NPCS: Record<NPCId, NPCCharacter> = {
  arka: {
    id: 'arka',
    name: 'Arka',
    role: 'Inovator Teknologi',
    color: '#2563EB',
    bgTint: 'rgba(37, 99, 235, 0.14)',
    borderTint: 'rgba(96, 165, 250, 0.35)',
    image: '/src/assets/images/arka_portrait_1794630613723.jpg',
    personality: 'Cerdas, antusias, optimis terhadap perkembangan teknologi, dan memiliki rasa ingin tahu tinggi.',
    focusTopics: [
      'Revolusi Industri 1.0: mekanisasi dan mesin uap.',
      'Revolusi Industri 2.0: elektrifikasi dan produksi massal.',
      'Revolusi Industri 3.0: komputerisasi dan otomatisasi.',
      'Revolusi Industri 4.0: AI, IoT, Big Data, dan teknologi digital.',
      'Teknologi utama pada Era Digital.',
    ],
    introQuote:
      'Selamat datang, penjelajah! Tahukah kamu? Perjalanan teknologi dimulai dari mesin uap hingga kecerdasan buatan. Ayo kita pelajari bagaimana teknologi mengubah dunia!',
    closingQuote:
      'Kamu telah berhasil menjelajahi perkembangan teknologi dari Revolusi Industri hingga Era Digital!',
  },
  nara: {
    id: 'nara',
    name: 'Nara',
    role: 'Pengamat Kritis',
    color: '#7C3AED',
    bgTint: 'rgba(124, 58, 237, 0.14)',
    borderTint: 'rgba(192, 132, 252, 0.35)',
    image: '/src/assets/images/nara_portrait_1794630613358.jpg',
    personality: 'Bijaksana, teliti, kritis terhadap perubahan, tegas, objektif, serta memperhatikan kondisi sosial dan lingkungan.',
    focusTopics: [
      'Perubahan lapangan pekerjaan dan kompetensi.',
      'Kesenjangan digital antarwilayah.',
      'Keamanan dan privasi data pribadi.',
      'Hoaks dan disinformasi di media sosial.',
      'Kerusakan lingkungan, persaingan ekonomi global, dan perubahan budaya.',
    ],
    introQuote:
      'Teknologi memang membawa banyak kemudahan. Namun, apakah semua orang mendapatkan kesempatan yang sama untuk menggunakannya? Mari kita analisis dampaknya!',
    closingQuote:
      'Semoga perjalanan ini membuatmu semakin kritis dalam memahami perubahan dunia.',
  },
  saga: {
    id: 'saga',
    name: 'Saga',
    role: 'Agen Adaptasi',
    color: '#059669',
    bgTint: 'rgba(5, 150, 105, 0.14)',
    borderTint: 'rgba(52, 211, 153, 0.35)',
    image: '/src/assets/images/saga_portrait_1794630614011.jpg',
    personality: 'Ramah, komunikatif, kreatif, solutif, mudah beradaptasi, dan memiliki semangat belajar tinggi.',
    focusTopics: [
      'Adaptasi terhadap perubahan zaman & Lifelong Learning.',
      'Literasi digital dan berpikir kritis.',
      'Kreativitas, komunikasi, dan kolaborasi.',
      'Penggunaan teknologi secara bijak.',
      'Pelestarian lingkungan, budaya lokal, dan kerja sama global.',
    ],
    introQuote:
      'Perubahan zaman tidak perlu ditakuti! Kita hanya perlu terus belajar, meningkatkan kemampuan, dan menggunakan teknologi secara bijak.',
    closingQuote:
      'Terus belajar dan beradaptasi. Sampai jumpa di ekspedisi berikutnya!',
  },
};

export const NPC_DIALOGUES: Record<
  NPCId,
  {
    correct: string[];
    wrong: string[];
    challengeDone: string[];
    buyCountry: string[];
    developFacility: string[];
  }
> = {
  arka: {
    correct: [
      'Hebat! Kamu berhasil memahami materi teknologi dengan tepat!',
      'Brilian! Pengetahuanmu tentang sejarah industri dan Era Digital sangat kuat.',
      'Tepat sekali! Inovasi memang lahir dari pemahaman yang kokoh seperti itu.',
    ],
    wrong: [
      'Sepertinya belum tepat. Coba ingat kembali materi yang sudah kita pelajari.',
      'Hampir benar! Yuk simak pembahasannya agar makin paham konsep teknologinya.',
      'Tidak apa-apa, setiap penemu hebat belajar dari percobaan. Perhatikan kuncinya ya!',
    ],
    challengeDone: [
      'Kamu berhasil melewati tantangan teknologi!',
      'Luar biasa! Satu langkah lebih dekat menjadi Inovator Globalopoly.',
    ],
    buyCountry: [
      'Keren! Negara ini sekarang terhubung dalam jaringan inovasi ekspedisimu.',
      'Investasi cerdas! Siap mengembangkan pusat teknologi di sini?',
    ],
    developFacility: [
      'Fasilitas baru aktif! Efisiensi teknologi di negara ini meningkat pesat.',
    ],
  },
  nara: {
    correct: [
      'Jawabanmu menunjukkan bahwa kamu mampu menganalisis permasalahan dengan baik.',
      'Tepat! Analisis kritis sangat dibutuhkan menghadapi tantangan dunia modern.',
      'Bagus! Kamu berhasil melihat dampak sosial dan teknologi secara objektif.',
    ],
    wrong: [
      'Jangan terburu-buru mengambil keputusan. Perhatikan kembali informasi dalam pertanyaan.',
      'Kurang tepat. Mari kita bedah dampaknya lebih teliti lewat pembahasan berikut.',
      'Perhatikan sudut pandang sosial dan keamanannya ya. Ayo pelajari jawabannya!',
    ],
    challengeDone: [
      'Bagus! Kamu semakin memahami berbagai perubahan dan tantangan dunia modern.',
      'Analisis yang tajam! Teruskan ketelitianmu di petak berikutnya.',
    ],
    buyCountry: [
      'Penguasaan negara ini membawa tanggung jawab besar terhadap keberlanjutan.',
      'Aset strategis bertambah. Pastikan dampaknya tetap positif bagi masyarakat.',
    ],
    developFacility: [
      'Pengembangan selesai! Nilai aset dan kontribusi edukasinya semakin tinggi.',
    ],
  },
  saga: {
    correct: [
      'Kerja bagus! Terus pertahankan kemampuanmu!',
      'Mantap! Kemampuan adaptasi dan literasi digitalmu patut diacungi jempol.',
      'Benar sekali! Solusi kreatif seperti inilah yang dibutuhkan di Era Digital.',
    ],
    wrong: [
      'Tidak masalah! Kesalahan adalah bagian dari proses belajar. Yuk, pahami pembahasannya!',
      'Tetap semangat! Terus belajar adalah kunci menghadapi perubahan zaman.',
      'Belum tepat kali ini, tapi kamu pasti bisa menjawab tantangan berikutnya!',
    ],
    challengeDone: [
      'Satu misi berhasil diselesaikan! Ayo lanjutkan ekspedisi!',
      'Hebat! Semangat belajar sepanjang hayatmu membuahkan hasil!',
    ],
    buyCountry: [
      'Selamat datang di negara baru! Kolaborasi global kita semakin luas!',
      'Langkah mantap! Mari bangun fasilitas bermanfaat di negara ini.',
    ],
    developFacility: [
      'Kolaborasi sukses! Fasilitas modern ini siap melayani masyarakat.',
    ],
  },
};

export function pickNPCDialogue(
  npc: NPCId,
  situation: 'correct' | 'wrong' | 'challengeDone' | 'buyCountry' | 'developFacility',
): string {
  const pool = NPC_DIALOGUES[npc][situation];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getAchievementTitle(points: number): {
  title: string;
  rangeLabel: string;
  badgeColor: string;
} {
  if (points >= 91) {
    return {
      title: 'Master Globalopoly',
      rangeLabel: '91 poin ke atas',
      badgeColor: '#F59E0B',
    };
  }
  if (points >= 61) {
    return {
      title: 'Ahli Dunia Modern',
      rangeLabel: '61–90 poin',
      badgeColor: '#10B981',
    };
  }
  if (points >= 31) {
    return {
      title: 'Penjelajah Berpengalaman',
      rangeLabel: '31–60 poin',
      badgeColor: '#3B82F6',
    };
  }
  return {
    title: 'Penjelajah Pemula',
    rangeLabel: '0–30 poin',
    badgeColor: '#94A3B8',
  };
}
