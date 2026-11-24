import React, { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Cpu,
  Globe2,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  RotateCw,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  X,
  XCircle,
} from 'lucide-react';
import { NPCS } from '../data/characters';
import {
  LEARNING_SUMMARY,
  LEARNING_TOPICS,
  LearningTopic,
  TOPIC_SECTION_KEYS,
  TopicSectionKey,
  getLearningLevel,
} from '../data/learningModules';
import { LearningProgressState } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface LearningModalProps {
  initialTab: 'guide' | 'learning';
  progress: LearningProgressState;
  onUpdateProgress: React.Dispatch<React.SetStateAction<LearningProgressState>>;
  onClose: () => void;
}

const SECTION_LABELS: Record<TopicSectionKey, string> = {
  pengantar: '2. Pengantar Topik',
  materi: '3. Materi Inti, Diagram & Tabel',
  poin: '4. Poin Penting',
  contoh: '5. Contoh Penerapan dalam Kehidupan',
  fakta: '6. Fakta Menarik',
  dialog: '7. Dialog Karakter Pemandu',
  flashcards: 'Kartu Flashcard Interaktif (Klik untuk Balik)',
};

const TOPIC_ICONS = [Cpu, Globe2, ShieldAlert, TrendingUp, Target];

export const LearningModal: React.FC<LearningModalProps> = ({
  initialTab,
  progress,
  onUpdateProgress,
  onClose,
}) => {
  const [tab, setTab] = useState<'guide' | 'learning'>(initialTab);
  const [learningView, setLearningView] = useState<'catalog' | 'topic'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeTopicId, setActiveTopicId] = useState<string>(LEARNING_TOPICS[0].id);

  // Accordion open state per topic reader
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    pengantar: true,
    materi: true,
    poin: false,
    contoh: false,
    fakta: false,
    dialog: false,
    flashcards: false,
    mini_challenge: true,
  });

  // Flippable flashcards state
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  // Interactive Mini Challenge answers per topicId -> questionId -> selectedIndex
  const [challengeAnswers, setChallengeAnswers] = useState<
    Record<string, Record<string, number>>
  >({});
  // Topics whose mini challenge has been passed 100%
  const [passedChallenges, setPassedChallenges] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    progress.completedTopics.forEach((tid) => {
      init[tid] = true;
    });
    return init;
  });

  // Animated +20 EXP reward banner
  const [expBanner, setExpBanner] = useState<{ topicTitle: string; exp: number } | null>(null);

  const activeTopic: LearningTopic =
    LEARNING_TOPICS.find((t) => t.id === activeTopicId) || LEARNING_TOPICS[0];

  const levelInfo = getLearningLevel(progress.exp);
  const completedCount = progress.completedTopics.length;
  const totalTopics = LEARNING_TOPICS.length;
  const unlearnedCount = totalTopics - completedCount;
  const completionPct = Math.round((completedCount / totalTopics) * 100);

  const markSectionsOpened = (topicId: string, keys: TopicSectionKey[]) => {
    onUpdateProgress((prev) => {
      const existing = prev.openedSections[topicId] || [];
      const merged = Array.from(new Set([...existing, ...keys]));
      if (merged.length === existing.length) return prev;
      return {
        ...prev,
        openedSections: {
          ...prev.openedSections,
          [topicId]: merged,
        },
      };
    });
  };

  // Auto-mark initially visible sections when entering a topic
  useEffect(() => {
    if (tab !== 'learning' || learningView !== 'topic') return;
    const initiallyOpen = (Object.keys(expandedSections) as string[]).filter(
      (k) =>
        expandedSections[k] &&
        (TOPIC_SECTION_KEYS as readonly string[]).includes(k),
    ) as TopicSectionKey[];
    if (initiallyOpen.length > 0) {
      markSectionsOpened(activeTopic.id, initiallyOpen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, learningView, activeTopic.id]);

  // Check if topic earns +20 EXP whenever openedSections or passedChallenges changes
  useEffect(() => {
    const opened = progress.openedSections[activeTopic.id] || [];
    const allSectionsOpened = TOPIC_SECTION_KEYS.every((k) => opened.includes(k));
    const challengePassed =
      passedChallenges[activeTopic.id] ||
      progress.completedTopics.includes(activeTopic.id);

    if (
      allSectionsOpened &&
      challengePassed &&
      !progress.completedTopics.includes(activeTopic.id)
    ) {
      soundEngine.playSfx('correct');
      onUpdateProgress((prev) => {
        if (prev.completedTopics.includes(activeTopic.id)) return prev;
        return {
          ...prev,
          exp: prev.exp + 20,
          completedTopics: [...prev.completedTopics, activeTopic.id],
        };
      });
      setExpBanner({ topicTitle: activeTopic.title, exp: 20 });
    }
  }, [
    activeTopic.id,
    activeTopic.title,
    passedChallenges,
    progress.completedTopics,
    progress.openedSections,
    onUpdateProgress,
  ]);

  const getTopicStatus = (topicId: string): 'Belum dipelajari' | 'Sedang dipelajari' | 'Selesai dipelajari' => {
    if (progress.completedTopics.includes(topicId)) return 'Selesai dipelajari';
    const opened = progress.openedSections[topicId] || [];
    const ans = challengeAnswers[topicId] || {};
    if (opened.length > 0 || Object.keys(ans).length > 0) return 'Sedang dipelajari';
    return 'Belum dipelajari';
  };

  const openTopicReader = (topicId: string) => {
    soundEngine.playSfx('buttonClick');
    setActiveTopicId(topicId);
    setLearningView('topic');
    setExpBanner(null);
    setExpandedSections({
      pengantar: true,
      materi: true,
      poin: false,
      contoh: false,
      fakta: false,
      dialog: false,
      flashcards: false,
      mini_challenge: true,
    });
  };

  const toggleSection = (key: string) => {
    soundEngine.playSfx('buttonClick');
    setExpandedSections((prev) => {
      const nextVal = !prev[key];
      if (nextVal && (TOPIC_SECTION_KEYS as readonly string[]).includes(key)) {
        markSectionsOpened(activeTopic.id, [key as TopicSectionKey]);
      }
      return { ...prev, [key]: nextVal };
    });
  };

  const openAllTopicSections = () => {
    soundEngine.playSfx('buttonClick');
    setExpandedSections({
      pengantar: true,
      materi: true,
      poin: true,
      contoh: true,
      fakta: true,
      dialog: true,
      flashcards: true,
      mini_challenge: true,
    });
    markSectionsOpened(activeTopic.id, [...TOPIC_SECTION_KEYS]);
  };

  const handleSelectChallengeOption = (
    topic: LearningTopic,
    questionId: string,
    optionIdx: number,
    correctIndex: number,
  ) => {
    const isCorrect = optionIdx === correctIndex;
    soundEngine.playSfx(isCorrect ? 'correct' : 'wrong');

    setChallengeAnswers((prev) => {
      const topicAns = { ...(prev[topic.id] || {}), [questionId]: optionIdx };
      const allAnsweredCorrect = topic.miniChallenge.every(
        (q) => topicAns[q.id] === q.correctIndex,
      );
      if (allAnsweredCorrect) {
        setPassedChallenges((p) => ({ ...p, [topic.id]: true }));
      }
      return { ...prev, [topic.id]: topicAns };
    });
  };

  const handleRetryWrongQuestions = (topic: LearningTopic) => {
    soundEngine.playSfx('buttonClick');
    setChallengeAnswers((prev) => {
      const current = prev[topic.id] || {};
      const kept: Record<string, number> = {};
      topic.miniChallenge.forEach((q) => {
        if (current[q.id] === q.correctIndex) {
          kept[q.id] = current[q.id];
        }
      });
      return { ...prev, [topic.id]: kept };
    });
  };

  const openedForActive = progress.openedSections[activeTopic.id] || [];
  const allSectionsOpenedForActive = TOPIC_SECTION_KEYS.every((k) =>
    openedForActive.includes(k),
  );
  const currentChallengeAns = challengeAnswers[activeTopic.id] || {};
  const isChallengePassedForActive =
    passedChallenges[activeTopic.id] ||
    progress.completedTopics.includes(activeTopic.id);
  const allChallengeAnswered = activeTopic.miniChallenge.every(
    (q) => currentChallengeAns[q.id] !== undefined,
  );
  const hasWrongChallengeAnswer = activeTopic.miniChallenge.some(
    (q) =>
      currentChallengeAns[q.id] !== undefined &&
      currentChallengeAns[q.id] !== q.correctIndex,
  );

  const categories = [
    'Semua',
    ...LEARNING_TOPICS.map((t) => t.category),
    'Rangkuman & Kesimpulan',
  ];

  const filteredTopics =
    selectedCategory === 'Semua'
      ? LEARNING_TOPICS
      : LEARNING_TOPICS.filter((t) => t.category === selectedCategory);

  const nextUnfinishedTopic =
    LEARNING_TOPICS.find((t) => !progress.completedTopics.includes(t.id)) ||
    LEARNING_TOPICS[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-3 lg:p-6">
      <div className="w-full max-w-6xl h-[92vh] bg-slate-900 border border-slate-700 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('buttonClick');
                setTab('guide');
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                tab === 'guide'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Panduan Bermain
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('buttonClick');
                setTab('learning');
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                tab === 'learning'
                  ? 'bg-sky-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              MODE BELAJAR (Ensiklopedia)
            </button>
          </div>

          <div className="flex items-center gap-3">
            {tab === 'learning' && (
              <div className="hidden sm:flex items-center gap-3 text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-1.5">
                <span className="text-amber-300 font-mono-num font-bold">
                  {progress.exp} EXP
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-sky-300 font-semibold">
                  Level {levelInfo.level} — {levelInfo.title}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('buttonClick');
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              aria-label="Kembali ke Menu Utama"
            >
              <X className="w-4 h-4" />
              <span>KEMBALI KE MENU UTAMA</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-6">
          {tab === 'guide' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <h3 className="font-display font-bold text-base text-sky-400">
                  1. Persiapan & Urutan Giliran
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Permainan mendukung 2–4 pemain (disarankan 3–4 pemain dalam mode landscape). Setiap pemain memulai dari petak <strong>START</strong> dengan modal awal <strong>1.000 Global Coins</strong>. Di awal laga, semua pemain melempar dadu untuk menentukan urutan giliran tertinggi.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <h3 className="font-display font-bold text-base text-emerald-400">
                  2. Membeli & Mengembangkan Negara
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Saat mendarat di negara yang belum dimiliki, pemain harus menjawab <strong>1 pertanyaan edukatif</strong> dengan benar untuk membuka hak membeli negara tersebut. Negara milik sendiri dapat dikembangkan dengan <em>Pusat Inovasi Teknologi</em>, <em>Pabrik Pintar</em>, dan <em>Pusat Pendidikan Digital</em> untuk menaikkan biaya sewa.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <h3 className="font-display font-bold text-base text-amber-400">
                  3. Petak Sudut & Kartu Ekspedisi
                </h3>
                <ul className="text-sm text-slate-300 space-y-1.5 list-disc pl-4">
                  <li><strong>START:</strong> +200 Global Coins setiap melintas atau berhenti tepat di sini.</li>
                  <li><strong>FREE PARKING:</strong> Zona istirahat aman tanpa biaya atau hukuman.</li>
                  <li><strong>JAIL:</strong> Status <em>Hanya Berkunjung</em> bila mendarat biasa; <em>Ditahan</em> bila dikirim dari <strong>GO TO JAIL</strong> (keluar dengan denda 100 GC, kartu bebas penjara, atau dadu 5–6).</li>
                  <li><strong>Chance & Community Chest:</strong> Mengambil kartu acak berisi bonus koin, perpindahan petak, atau tantangan studi kasus.</li>
                </ul>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <h3 className="font-display font-bold text-base text-violet-400">
                  4. Global Coins vs EXP Mode Belajar vs Poin Laga
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  <strong>Global Coins</strong> adalah mata uang transaksi permainan, <strong>Poin Pembelajaran</strong> mengukur skor kuis saat laga berlangsung, sedangkan <strong>EXP Mode Belajar</strong> (+20 EXP per topik selesai) menaikkan level penguasaan materi di ensiklopedia digital dan terpisah perhitungannya dari Global Coins.
                </p>
              </div>
            </div>
          ) : learningView === 'catalog' ? (
            <div className="space-y-5">
              {/* MODE BELAJAR Hero & Progress Dashboard */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                <div className="lg:col-span-7 space-y-2.5">
                  <div className="text-xs font-semibold tracking-wider text-sky-400 uppercase">
                    Ensiklopedia Digital Interaktif · SMA Kelas XII
                  </div>
                  <h1 className="font-display text-2xl lg:text-3xl font-extrabold text-white">
                    MODE BELAJAR
                  </h1>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Pelajari materi Revolusi Industri 1.0–4.0, Era Digital, Tantangan Global, Dampak Teknologi, hingga Strategi Masa Depan melalui tab interaktif, infografis, flashcard, dialog Arka–Nara–Saga, dan Mini Challenge berhadiah EXP.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => openTopicReader(nextUnfinishedTopic.id)}
                      className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      MULAI BELAJAR
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playSfx('buttonClick');
                        onClose();
                      }}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl cursor-pointer"
                    >
                      KEMBALI KE MENU UTAMA
                    </button>
                  </div>
                </div>

                {/* EXP, Level & Progress Indicator */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" />
                      <div>
                        <div className="text-[11px] text-slate-400">Level Pembelajaran</div>
                        <div className="font-display font-bold text-sm text-white">
                          Level {levelInfo.level} — {levelInfo.title}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono-num">
                      <div className="text-lg font-extrabold text-amber-300">
                        {progress.exp} EXP
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {levelInfo.nextExp
                          ? `Menuju Level ${levelInfo.level + 1}: ${levelInfo.nextExp} EXP`
                          : 'Level Maksimal Tercapai'}
                      </div>
                    </div>
                  </div>

                  {/* Level Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-amber-400 transition-all duration-300"
                      style={{ width: `${levelInfo.progressPct}%` }}
                    />
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="bg-slate-950 rounded-lg p-2 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Selesai</div>
                      <div className="font-mono-num font-bold text-emerald-300">
                        {completedCount} Topik
                      </div>
                    </div>
                    <div className="bg-slate-950 rounded-lg p-2 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Belum</div>
                      <div className="font-mono-num font-bold text-slate-200">
                        {unlearnedCount} Topik
                      </div>
                    </div>
                    <div className="bg-slate-950 rounded-lg p-2 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Progres</div>
                      <div className="font-mono-num font-bold text-sky-300">
                        {completionPct}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Category Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      soundEngine.playSfx('buttonClick');
                      setSelectedCategory(cat);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                      selectedCategory === cat
                        ? 'bg-sky-500 border-sky-400 text-slate-950'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Topic Cards Grid */}
              {selectedCategory !== 'Rangkuman & Kesimpulan' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTopics.map((topic) => {
                    const status = getTopicStatus(topic.id);
                    const npc = NPCS[topic.npc];
                    const openedCount = (progress.openedSections[topic.id] || []).length;
                    const Icon = TOPIC_ICONS[(topic.order - 1) % TOPIC_ICONS.length];

                    return (
                      <div
                        key={topic.id}
                        className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between gap-4 transition-colors"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${topic.accentColor}22`, color: topic.accentColor }}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${
                                status === 'Selesai dipelajari'
                                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                                  : status === 'Sedang dipelajari'
                                    ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                                    : 'bg-slate-900 border-slate-700 text-slate-400'
                              }`}
                            >
                              {status}
                            </span>
                          </div>

                          <div>
                            <div className="text-[11px] font-semibold text-sky-400">
                              {topic.category}
                            </div>
                            <h3 className="font-display font-bold text-base text-white mt-0.5 leading-snug">
                              {topic.title}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              {topic.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-slate-800/80">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Pemandu: {npc.name}</span>
                            <span className="font-mono-num">
                              Bagian {openedCount}/{TOPIC_SECTION_KEYS.length} · +20 EXP
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => openTopicReader(topic.id)}
                            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                              status === 'Selesai dipelajari'
                                ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300'
                                : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                            }`}
                          >
                            <span>
                              {status === 'Selesai dipelajari'
                                ? 'Buka Kembali Materi'
                                : status === 'Sedang dipelajari'
                                  ? 'Lanjut Belajar'
                                  : 'MULAI BELAJAR'}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Rangkuman Pembelajaran & Kesimpulan (Hal. 14 PDF) */}
              {(selectedCategory === 'Semua' ||
                selectedCategory === 'Rangkuman & Kesimpulan') && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h2 className="font-display font-bold text-lg text-white">
                      Rangkuman Pembelajaran & Kesimpulan
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {LEARNING_SUMMARY.items.map((item) => (
                      <div
                        key={item.label}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1"
                      >
                        <div className="text-[11px] font-bold text-sky-400">{item.label}</div>
                        <p className="text-xs text-slate-200 leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                    <div className="text-xs font-bold text-emerald-300 mb-1">Kesimpulan Utama</div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {LEARNING_SUMMARY.conclusion}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TOPIC READER VIEW */
            <div className="space-y-4">
              {/* Topic Navigation Ribbon */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playSfx('buttonClick');
                      setLearningView('catalog');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
                  >
                    ← Daftar Topik
                  </button>
                  {LEARNING_TOPICS.map((t) => {
                    const done = progress.completedTopics.includes(t.id);
                    const isCurrent = t.id === activeTopic.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => openTopicReader(t.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border ${
                          isCurrent
                            ? 'bg-sky-500 border-sky-400 text-slate-950'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        <span>Bab {t.order}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={openAllTopicSections}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-300 cursor-pointer"
                >
                  Buka Semua Bagian ({openedForActive.length}/{TOPIC_SECTION_KEYS.length})
                </button>
              </div>

              {/* Animated +20 EXP Celebration Banner */}
              {expBanner && (
                <div className="bg-emerald-950/80 border border-emerald-400 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center font-extrabold">
                      +{expBanner.exp}
                    </div>
                    <div>
                      <div className="font-display font-extrabold text-sm sm:text-base text-emerald-300">
                        +20 EXP! TOPIK BERHASIL DIPELAJARI!
                      </div>
                      <div className="text-xs text-emerald-100">
                        {expBanner.topicTitle} selesai dipelajari. Total EXP kamu sekarang {progress.exp} EXP ({levelInfo.title}).
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpBanner(null)}
                    className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 text-xs cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              )}

              {/* 1. Judul Topik */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-sky-400">
                    1. Judul Topik · {activeTopic.category}
                  </div>
                  <h2 className="font-display text-xl lg:text-2xl font-extrabold text-white">
                    {activeTopic.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300">{activeTopic.subtitle}</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">Status Topik:</span>
                    <span className="font-bold text-amber-300">
                      {getTopicStatus(activeTopic.id)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 font-mono-num">
                    <span className="text-slate-400">Bagian Dibuka:</span>
                    <span className={allSectionsOpenedForActive ? 'text-emerald-300 font-bold' : 'text-slate-200'}>
                      {openedForActive.length} / {TOPIC_SECTION_KEYS.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">Mini Challenge:</span>
                    <span className={isChallengePassedForActive ? 'text-emerald-300 font-bold' : 'text-slate-200'}>
                      {isChallengePassedForActive ? 'Lulus (100%)' : 'Belum Selesai'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Pengantar */}
              <CollapsibleSection
                title={SECTION_LABELS.pengantar}
                isOpen={!!expandedSections.pengantar}
                isOpenedEver={openedForActive.includes('pengantar')}
                onToggle={() => toggleSection('pengantar')}
              >
                <div className="space-y-2.5 text-sm text-slate-200 leading-relaxed">
                  {activeTopic.pengantar.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </CollapsibleSection>

              {/* 3. Materi Inti + Timeline + Tabel Visual */}
              <CollapsibleSection
                title={SECTION_LABELS.materi}
                isOpen={!!expandedSections.materi}
                isOpenedEver={openedForActive.includes('materi')}
                onToggle={() => toggleSection('materi')}
              >
                <div className="space-y-5">
                  {activeTopic.materiInti.timeline && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                        Timeline Visual Perkembangan Revolusi Industri
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {activeTopic.materiInti.timeline.map((item, idx) => (
                          <div
                            key={item.stage}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-display font-bold text-sm text-amber-300">
                                {item.stage}
                              </span>
                              <span className="font-mono-num text-[11px] text-slate-400">
                                #{idx + 1} · {item.era}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-sky-300">{item.tech}</div>
                            <div className="text-xs text-slate-200">{item.change}</div>
                            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                              Contoh: {item.example}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {activeTopic.materiInti.subsections.map((sub, i) => (
                      <div
                        key={i}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5"
                      >
                        <h4 className="font-display font-bold text-sm sm:text-base text-white">
                          {sub.heading}
                        </h4>
                        {sub.paragraphs?.map((para, pi) => (
                          <p key={pi} className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            {para}
                          </p>
                        ))}
                        {sub.bullets && (
                          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-200 list-disc pl-5">
                            {sub.bullets.map((b, bi) => (
                              <li key={bi} className="leading-relaxed">
                                {b}
                              </li>
                            ))}
                          </ul>
                        )}
                        {sub.example && (
                          <div className="text-xs bg-sky-950/40 border border-sky-500/30 rounded-lg p-2.5 text-sky-200">
                            <strong>Contoh penerapan:</strong> {sub.example}
                          </div>
                        )}
                        {sub.impact && (
                          <div className="text-xs bg-amber-950/40 border border-amber-500/30 rounded-lg p-2.5 text-amber-200">
                            <strong>Dampak:</strong> {sub.impact}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {activeTopic.materiInti.table && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs font-bold text-emerald-300">
                        {activeTopic.materiInti.table.caption}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                            <tr>
                              {activeTopic.materiInti.table.headers.map((h) => (
                                <th key={h} className="px-4 py-2.5 font-semibold">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {activeTopic.materiInti.table.rows.map((row, ri) => (
                              <tr key={ri} className="hover:bg-slate-800/40">
                                {row.map((cell, ci) => (
                                  <td
                                    key={ci}
                                    className={`px-4 py-2.5 ${
                                      ci === 0 ? 'font-semibold text-white' : 'text-slate-200'
                                    }`}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleSection>

              {/* 4. Poin Penting */}
              <CollapsibleSection
                title={SECTION_LABELS.poin}
                isOpen={!!expandedSections.poin}
                isOpenedEver={openedForActive.includes('poin')}
                onToggle={() => toggleSection('poin')}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeTopic.poinPenting.map((pt, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-start gap-2.5 text-xs sm:text-sm text-slate-200"
                    >
                      <span className="font-mono-num font-bold text-sky-400 shrink-0">
                        0{idx + 1}
                      </span>
                      <span className="leading-relaxed">{pt}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              {/* 5. Contoh Penerapan */}
              <CollapsibleSection
                title={SECTION_LABELS.contoh}
                isOpen={!!expandedSections.contoh}
                isOpenedEver={openedForActive.includes('contoh')}
                onToggle={() => toggleSection('contoh')}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {activeTopic.contohPenerapan.map((ex, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1.5"
                    >
                      <div className="font-display font-bold text-xs sm:text-sm text-emerald-300">
                        {ex.title}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{ex.detail}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              {/* 6. Fakta Menarik */}
              <CollapsibleSection
                title={SECTION_LABELS.fakta}
                isOpen={!!expandedSections.fakta}
                isOpenedEver={openedForActive.includes('fakta')}
                onToggle={() => toggleSection('fakta')}
              >
                <div className="space-y-2.5">
                  {activeTopic.faktaMenarik.map((fact, idx) => (
                    <div
                      key={idx}
                      className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3 text-xs sm:text-sm text-amber-100"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{fact}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              {/* 7. Dialog Karakter */}
              <CollapsibleSection
                title={SECTION_LABELS.dialog}
                isOpen={!!expandedSections.dialog}
                isOpenedEver={openedForActive.includes('dialog')}
                onToggle={() => toggleSection('dialog')}
              >
                <div className="space-y-3">
                  {(() => {
                    const mainNpc = NPCS[activeTopic.dialogKarakter.npc];
                    const secNpc = activeTopic.dialogKarakter.secondaryNpc
                      ? NPCS[activeTopic.dialogKarakter.secondaryNpc]
                      : null;
                    return (
                      <>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3.5">
                          <img
                            src={mainNpc.image}
                            alt={mainNpc.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover shrink-0"
                          />
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-display font-bold text-sm text-white">
                                {mainNpc.name}
                              </span>
                              <span className="text-xs text-sky-400">{mainNpc.role}</span>
                              <span className="text-[11px] text-slate-400">
                                · Ekspresi: {activeTopic.dialogKarakter.expression}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                              “{activeTopic.dialogKarakter.quote}”
                            </p>
                          </div>
                        </div>

                        {secNpc && activeTopic.dialogKarakter.secondaryQuote && (
                          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
                            <img
                              src={secNpc.image}
                              alt={secNpc.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                            <div className="space-y-0.5">
                              <div className="text-xs font-bold text-slate-200">
                                {secNpc.name}{' '}
                                <span className="font-normal text-slate-400">({secNpc.role})</span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                “{activeTopic.dialogKarakter.secondaryQuote}”
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </CollapsibleSection>

              {/* Flashcard Interaktif */}
              <CollapsibleSection
                title={SECTION_LABELS.flashcards}
                isOpen={!!expandedSections.flashcards}
                isOpenedEver={openedForActive.includes('flashcards')}
                onToggle={() => toggleSection('flashcards')}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {activeTopic.flashcards.map((fc) => {
                    const isFlipped = !!flippedCards[fc.id];
                    return (
                      <button
                        key={fc.id}
                        type="button"
                        onClick={() => {
                          soundEngine.playSfx('cardDraw');
                          setFlippedCards((prev) => ({
                            ...prev,
                            [fc.id]: !prev[fc.id],
                          }));
                        }}
                        className={`text-left rounded-xl p-4 border min-h-[132px] flex flex-col justify-between transition-colors cursor-pointer ${
                          isFlipped
                            ? 'bg-sky-950/60 border-sky-400'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="font-semibold text-amber-300">{fc.tag}</span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <RotateCw className="w-3 h-3" />
                            {isFlipped ? 'Penjelasan' : 'Klik untuk balik'}
                          </span>
                        </div>
                        <div className="py-2">
                          {isFlipped ? (
                            <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
                              {fc.back}
                            </p>
                          ) : (
                            <p className="font-display font-bold text-sm sm:text-base text-white">
                              {fc.front}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CollapsibleSection>

              {/* 8. Mini Challenge */}
              <CollapsibleSection
                title="8. Mini Challenge (Uji Pemahaman +20 EXP)"
                isOpen={!!expandedSections.mini_challenge}
                isOpenedEver={isChallengePassedForActive}
                onToggle={() => toggleSection('mini_challenge')}
              >
                <div className="space-y-4">
                  <div className="text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                    <span>
                      Jawab seluruh pertanyaan dengan benar dan buka seluruh bagian materi untuk memperoleh <strong>+20 EXP</strong>.
                    </span>
                    {!allSectionsOpenedForActive && (
                      <span className="text-amber-300 font-semibold">
                        Masih ada bagian materi yang belum dibuka ({openedForActive.length}/{TOPIC_SECTION_KEYS.length})
                      </span>
                    )}
                  </div>

                  {activeTopic.miniChallenge.map((q, qIdx) => {
                    const chosen = currentChallengeAns[q.id];
                    const hasAnswered = chosen !== undefined;
                    const isRight = chosen === q.correctIndex;
                    const qNpc = NPCS[q.npc];

                    return (
                      <div
                        key={q.id}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>
                            Pertanyaan {qIdx + 1} ·{' '}
                            {q.type === 'true_false' ? 'Benar / Salah' : 'Pilihan Ganda'}
                          </span>
                          {hasAnswered && (
                            <span
                              className={`font-bold ${
                                isRight ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {isRight ? 'Jawaban Benar' : 'Perlu Dicoba Ulang'}
                            </span>
                          )}
                        </div>

                        <h4 className="font-display font-semibold text-sm sm:text-base text-white">
                          {q.prompt}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => {
                            const selectedThis = chosen === oIdx;
                            const rightThis = oIdx === q.correctIndex;
                            let style =
                              'bg-slate-950 border-slate-800 hover:border-sky-400 text-slate-200 cursor-pointer';
                            if (hasAnswered) {
                              if (rightThis) {
                                style = 'bg-emerald-950/70 border-emerald-500 text-emerald-100';
                              } else if (selectedThis) {
                                style = 'bg-rose-950/70 border-rose-500 text-rose-100';
                              } else {
                                style = 'bg-slate-950/50 border-slate-800/60 text-slate-500';
                              }
                            }
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                disabled={hasAnswered}
                                onClick={() =>
                                  handleSelectChallengeOption(
                                    activeTopic,
                                    q.id,
                                    oIdx,
                                    q.correctIndex,
                                  )
                                }
                                className={`text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-colors ${style}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {hasAnswered && (
                          <div
                            className={`rounded-xl p-3 border text-xs space-y-2 ${
                              isRight
                                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                                : 'bg-rose-950/40 border-rose-500/40 text-rose-100'
                            }`}
                          >
                            <div className="flex items-center gap-2 font-bold">
                              {isRight ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  <span>Hasil: Benar!</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 text-rose-400" />
                                  <span>
                                    Hasil: Salah — Jawaban benar: {q.options[q.correctIndex]}
                                  </span>
                                </>
                              )}
                            </div>
                            <p className="text-slate-200">
                              <strong>Penjelasan:</strong> {q.explanation}
                            </p>
                            <div className="flex items-center gap-2 pt-1.5 border-t border-slate-800/60 text-slate-300">
                              <MessageSquare className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                              <span>
                                <strong>{qNpc.name}:</strong>{' '}
                                {isRight ? q.npcCommentCorrect : q.npcCommentWrong}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {allChallengeAnswered && hasWrongChallengeAnswer && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRetryWrongQuestions(activeTopic)}
                        className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Coba Kembali Pertanyaan yang Salah
                      </button>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  isOpenedEver: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  isOpen,
  isOpenedEver,
  onToggle,
  children,
}) => {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-900/60 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {isOpenedEver ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <span className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
          )}
          <span className="font-display font-bold text-sm sm:text-base text-white">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
          <span className="hidden sm:inline">
            {isOpen ? 'Tutup bagian' : 'Buka bagian'}
          </span>
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
      </button>
      {isOpen && <div className="px-5 pb-5 pt-2 border-t border-slate-800/80">{children}</div>}
    </div>
  );
};
