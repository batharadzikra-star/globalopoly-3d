import React from 'react';
import {
  BookOpen,
  Compass,
  HelpCircle,
  Play,
  Pause,
  Music,
  Settings,
  LogOut,
} from 'lucide-react';
import { HERO_BANNER_IMAGE, NPCS } from '../data/characters';
import { getLearningLevel } from '../data/learningModules';
import { AudioSettings, LearningProgressState } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface MainMenuProps {
  audio: AudioSettings;
  learningProgress: LearningProgressState;
  onToggleMusicPause: () => void;
  onToggleMusic: () => void;
  onStartSetup: () => void;
  onOpenGuide: () => void;
  onOpenLearning: () => void;
  onOpenSettings: () => void;
  onResetConfirm?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  audio,
  learningProgress,
  onToggleMusicPause,
  onToggleMusic,
  onStartSetup,
  onOpenGuide,
  onOpenLearning,
  onOpenSettings,
}) => {
  const [exitNotice, setExitNotice] = React.useState(false);
  const levelInfo = getLearningLevel(learningProgress.exp);

  const handleAction = (fn: () => void) => {
    soundEngine.playSfx('buttonClick');
    fn();
  };

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col justify-between p-5 lg:p-8 overflow-y-auto">
      {/* Top 3-zone bar */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between gap-6 pb-4 border-b border-slate-800/80 shrink-0">
        <span className="font-display text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0">
          GLOBALOPOLY
        </span>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={() => handleAction(onOpenGuide)}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Panduan Bermain
          </button>
          <button
            type="button"
            onClick={() => handleAction(onOpenLearning)}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Mode Belajar ({learningProgress.exp} EXP · Lv.{levelInfo.level})
          </button>
          <button
            type="button"
            onClick={() => handleAction(onOpenSettings)}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Pengaturan
          </button>
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleAction(onToggleMusic)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              audio.musicEnabled
                ? 'bg-slate-900 border-slate-700 text-sky-300 hover:bg-slate-800'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
            title="Musik ON/OFF"
          >
            <Music className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{audio.musicEnabled ? 'Musik' : 'Mati'}</span>
          </button>
          {audio.musicEnabled && (
            <button
              type="button"
              onClick={() => handleAction(onToggleMusicPause)}
              className="px-2.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer"
              title={audio.musicPaused ? 'Putar Musik' : 'Jeda Musik'}
            >
              {audio.musicPaused ? (
                <Play className="w-3.5 h-3.5 text-amber-300 fill-current" />
              ) : (
                <Pause className="w-3.5 h-3.5 text-sky-300" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => handleAction(onStartSetup)}
            className="px-5 py-2.5 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            Mulai Permainan
          </button>
        </div>
      </header>

      {/* Main Landscape 2-Column Split */}
      <main className="w-full max-w-7xl mx-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-8 items-center py-3 min-h-0">
        {/* Left: Game Identity & Menu Actions */}
        <div className="md:col-span-5 flex flex-col justify-center space-y-4">
          <div className="space-y-2.5">
            <p className="text-xs font-semibold tracking-wider text-sky-400 uppercase">
              Game Edukasi Board Game 3D · 3–4 Pemain Landscape
            </p>
            <h1 className="font-display text-3xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight text-balance">
              GLOBALOPOLY: Ekspedisi Lintas Benua
            </h1>
            <p className="text-sm lg:text-base text-slate-300 leading-relaxed max-w-xl">
              Melempar dadu melintasi peta dunia, menguasai negara, membangun fasilitas cerdas, dan menghadapi tantangan dari era Revolusi Industri hingga Era Digital.
            </p>
          </div>

          {/* Primary Menu Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleAction(onStartSetup)}
              className="sm:col-span-2 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer text-base shadow-lg shadow-sky-500/20"
            >
              <Compass className="w-5 h-5" />
              Mulai Permainan (3–4 Pemain)
            </button>

            <button
              type="button"
              onClick={() => handleAction(onOpenGuide)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-100 font-semibold rounded-xl transition-colors cursor-pointer text-sm"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              Panduan Bermain
            </button>

            <button
              type="button"
              onClick={() => handleAction(onOpenLearning)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-100 font-semibold rounded-xl transition-colors cursor-pointer text-sm"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Mode Belajar
            </button>

            <button
              type="button"
              onClick={() => handleAction(onOpenSettings)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-100 font-semibold rounded-xl transition-colors cursor-pointer text-sm"
            >
              <Settings className="w-4 h-4 text-sky-400" />
              Pengaturan
            </button>

            <button
              type="button"
              onClick={() => handleAction(() => setExitNotice(true))}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl transition-colors cursor-pointer text-sm"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              Keluar
            </button>
          </div>

          {exitNotice && (
            <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 flex items-center justify-between gap-3">
              <span>
                Anda berada di Menu Utama peramban. Anda dapat menutup tab peramban jika ingin mengakhiri sesi.
              </span>
              <button
                type="button"
                onClick={() => setExitNotice(false)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-md shrink-0 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}
        </div>

        {/* Right: Hero Visual + 3 Companion NPCs */}
        <div className="md:col-span-7 flex flex-col gap-3.5">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-video max-h-[320px] w-full">
            <img
              src={HERO_BANNER_IMAGE}
              alt="Ilustrasi Dunia Globalopoly Ekspedisi Lintas Benua"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end p-5">
              <div className="space-y-1">
                <p className="text-xs font-medium text-amber-300">
                  Misi Ekspedisi Dunia Modern · Target SMA Kelas XII
                </p>
                <p className="text-sm text-slate-200 max-w-xl">
                  Jelajahi 12 negara di 4 benua, kumpulkan Global Coins, dan raih gelar Master Globalopoly.
                </p>
              </div>
            </div>
          </div>

          {/* 3 NPC Companion Cards */}
          <div className="grid grid-cols-3 gap-3">
            {(['arka', 'nara', 'saga'] as const).map((npcId) => {
              const npc = NPCS[npcId];
              return (
                <div
                  key={npc.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3"
                >
                  <img
                    src={npc.image}
                    alt={`${npc.name} - ${npc.role}`}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-lg object-cover shrink-0 bg-slate-800"
                  />
                  <div className="min-w-0">
                    <div className="font-display font-bold text-sm text-white truncate">
                      {npc.name}
                    </div>
                    <div className="text-xs text-slate-400 truncate">{npc.role}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="w-full max-w-7xl mx-auto pt-3 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
        <span>GLOBALOPOLY: Ekspedisi Lintas Benua · Pembelajaran Interaktif SMA Kelas XII</span>
        <span>Eropa · Asia · Amerika · Afrika & Oseania</span>
      </footer>
    </div>
  );
};
