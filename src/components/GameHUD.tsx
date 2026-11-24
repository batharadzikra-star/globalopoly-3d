import React, { useState } from 'react';
import {
  BookOpen,
  Camera,
  ChevronDown,
  ChevronUp,
  Coins,
  Dices,
  Flag,
  HelpCircle,
  Home,
  Lock,
  Maximize2,
  Music,
  Pause,
  Play,
  Settings,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BOARD_TILES, calculateCountryAssetValue } from '../data/boardConfig';
import { NPCS } from '../data/characters';
import { WorldSkyTheme } from '../three/landmarks';
import {
  AudioSettings,
  CameraPreset,
  GameConfig,
  NPCDialogueState,
  Player,
} from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface GameHUDProps {
  players: Player[];
  activePlayerIndex: number;
  roundNumber: number;
  config: GameConfig;
  lastDiceValue: number | null;
  canRoll: boolean;
  isAnimating: boolean;
  npcDialogue: NPCDialogueState;
  actionLog: string[];
  cameraPreset: CameraPreset;
  skyTheme: WorldSkyTheme;
  audio: AudioSettings;
  onRollDice: () => void;
  onSelectCamera: (preset: CameraPreset) => void;
  onSelectSkyTheme: (theme: WorldSkyTheme) => void;
  onRequestLandscapeFullscreen: () => void;
  onToggleMusic: () => void;
  onToggleMusicPause: () => void;
  onToggleSfx: () => void;
  onOpenGuide: () => void;
  onOpenLearning: () => void;
  onOpenSettings: () => void;
  onFinishGameEarly: () => void;
  onExitToMenu: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  players,
  activePlayerIndex,
  roundNumber,
  config,
  lastDiceValue,
  canRoll,
  isAnimating,
  npcDialogue,
  actionLog,
  cameraPreset,
  skyTheme,
  audio,
  onRollDice,
  onSelectCamera,
  onSelectSkyTheme,
  onRequestLandscapeFullscreen,
  onToggleMusic,
  onToggleMusicPause,
  onToggleSfx,
  onOpenGuide,
  onOpenLearning,
  onOpenSettings,
  onFinishGameEarly,
  onExitToMenu,
}) => {
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
  const [portraitBannerDismissed, setPortraitBannerDismissed] = useState(false);

  const activePlayer = players[activePlayerIndex] || players[0];
  const npc = NPCS[npcDialogue.npc];
  const currentTile = BOARD_TILES[activePlayer.position];

  const getPlayerTotalWealth = (p: Player) => {
    const assetsVal = p.ownedCountries.reduce((sum, tid) => {
      const t = BOARD_TILES.find((bt) => bt.id === tid);
      if (!t) return sum;
      return sum + calculateCountryAssetValue(t, p.facilities[tid] || []);
    }, 0);
    return p.coins + assetsVal;
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-3 lg:p-4">
      {/* Landscape suggestion banner only if screen is narrow portrait */}
      {!portraitBannerDismissed && (
        <div className="sm:hidden pointer-events-auto mb-2 bg-amber-950/95 border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-amber-200 flex items-center justify-between gap-2">
          <span>Putar perangkat ke mode Landscape agar papan 3D dan panel pemain tampil optimal.</span>
          <button
            type="button"
            onClick={() => setPortraitBannerDismissed(true)}
            className="px-2 py-0.5 bg-amber-500/20 rounded text-amber-100 shrink-0"
          >
            OK
          </button>
        </div>
      )}

      {/* Top Compact Bar */}
      <header className="pointer-events-auto w-full flex items-center justify-between gap-4 bg-slate-900/95 border border-slate-800 rounded-xl px-4 py-2.5 shadow-lg">
        <div className="flex items-center gap-4 min-w-0">
          <span className="font-display font-extrabold text-sm lg:text-base text-white whitespace-nowrap shrink-0">
            GLOBALOPOLY
          </span>
          <span className="hidden md:inline text-xs text-slate-400 whitespace-nowrap">
            Putaran{' '}
            <strong className="font-mono-num text-sky-400">
              {roundNumber}
              {config.maxRounds > 0 ? ` / ${config.maxRounds}` : ''}
            </strong>
            {config.targetWealth > 0 && (
              <>
                {' '}
                · Target{' '}
                <strong className="font-mono-num text-amber-300">
                  {config.targetWealth.toLocaleString('id-ID')} GC
                </strong>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx('buttonClick');
              onOpenGuide();
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Panduan</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx('buttonClick');
              onOpenLearning();
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Materi</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx('buttonClick');
              onOpenSettings();
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Settings className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Pengaturan</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx('buttonClick');
              onFinishGameEarly();
            }}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-semibold text-amber-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Flag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Akhiri & Skor</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx('buttonClick');
              onExitToMenu();
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Menu</span>
          </button>
        </div>
      </header>

      {/* Middle Landscape Rails (Left Players + Open Center 3D + Right Turn & NPC) */}
      {!dockCollapsed && (
        <div className="flex-1 flex items-center justify-between gap-4 my-2 min-h-0">
          {/* Left Rail: 3-4 Player Roster */}
          <aside className="pointer-events-auto w-60 lg:w-64 max-h-full overflow-y-auto space-y-2 pr-1">
            {players.map((p, idx) => {
              const isTurn = idx === activePlayerIndex && !p.bankrupt;
              const tile = BOARD_TILES[p.position];
              const isExpanded = expandedPlayerId === p.id;
              const accuracy =
                p.totalAnswers > 0 ? Math.round((p.correctAnswers / p.totalAnswers) * 100) : 0;

              return (
                <div
                  key={p.id}
                  className={`rounded-xl p-3 border transition-colors ${
                    p.bankrupt
                      ? 'bg-slate-950/75 border-slate-800 opacity-60'
                      : isTurn
                        ? 'bg-slate-900/95 border-amber-400 shadow-lg'
                        : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="font-display font-bold text-xs lg:text-sm text-white truncate">
                        {p.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                      {p.bankrupt
                        ? 'Bangkrut'
                        : p.inJail
                          ? 'Ditahan'
                          : isTurn
                            ? 'Giliran'
                            : p.isBot
                              ? 'Bot'
                              : 'Siap'}
                    </span>
                  </div>

                  {/* Coins & Learning Points */}
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-mono-num">
                    <div className="bg-slate-950/80 rounded-lg px-2 py-1 flex items-center justify-between">
                      <span className="text-slate-400">GC</span>
                      <span className="font-bold text-amber-300">
                        {p.coins.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="bg-slate-950/80 rounded-lg px-2 py-1 flex items-center justify-between">
                      <span className="text-slate-400">Poin</span>
                      <span className="font-bold text-emerald-300">{p.learningPoints}</span>
                    </div>
                  </div>

                  {/* Position + Expand Assets */}
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate">
                      Petak: <strong className="text-slate-200">{tile?.name}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedPlayerId(isExpanded ? null : p.id)}
                      className="text-sky-400 hover:text-sky-300 font-semibold shrink-0 ml-2 cursor-pointer"
                    >
                      {p.ownedCountries.length} Negara {isExpanded ? '▴' : '▾'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-slate-800 space-y-1 text-[11px] text-slate-300">
                      <div className="flex justify-between font-mono-num">
                        <span className="text-slate-400">Total Kekayaan:</span>
                        <span className="text-amber-300 font-bold">
                          {getPlayerTotalWealth(p).toLocaleString('id-ID')} GC
                        </span>
                      </div>
                      <div className="flex justify-between font-mono-num">
                        <span className="text-slate-400">Kuis Benar:</span>
                        <span>
                          {p.correctAnswers}/{p.totalAnswers} ({accuracy}%)
                        </span>
                      </div>
                      <div className="text-slate-400 pt-0.5">
                        Aset:{' '}
                        <span className="text-slate-200">
                          {p.ownedCountries.length > 0
                            ? p.ownedCountries
                                .map((tid) => BOARD_TILES.find((t) => t.id === tid)?.name)
                                .join(', ')
                            : 'Belum ada'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </aside>

          {/* Center stays 100% open for the 3D Board */}
          <div className="flex-1" />

          {/* Right Rail: Active Turn Action + NPC Dialogue + Expedition Feed */}
          <aside className="pointer-events-auto w-64 lg:w-72 max-h-full overflow-y-auto space-y-2.5 pl-1">
            {/* Active Turn Card */}
            <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3.5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Giliran Aktif</div>
                  <div className="font-display font-bold text-base text-white flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: activePlayer.color }}
                    />
                    <span className="truncate">{activePlayer.name}</span>
                  </div>
                </div>
                {lastDiceValue !== null && (
                  <div className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-center">
                    <div className="text-[10px] text-slate-400">Dadu</div>
                    <div className="font-mono-num font-bold text-base text-amber-300">
                      {lastDiceValue}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-300 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 flex items-center justify-between">
                <span>Posisi: {currentTile.name}</span>
                {activePlayer.inJail && (
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Ditahan
                  </span>
                )}
              </div>

              <button
                type="button"
                disabled={!canRoll || isAnimating || activePlayer.isBot}
                onClick={onRollDice}
                className={`w-full py-3 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                  canRoll && !isAnimating && !activePlayer.isBot
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer shadow-md'
                    : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Dices className="w-5 h-5" />
                {activePlayer.isBot
                  ? 'Bot AI Sedang Berjalan...'
                  : isAnimating
                    ? 'Pion Bergerak...'
                    : 'LEMPAR DADU'}
              </button>
            </div>

            {/* Dynamic NPC Dialogue Panel */}
            <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={npc.image}
                  alt={npc.name}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-lg object-cover shrink-0 bg-slate-800"
                />
                <div className="min-w-0">
                  <div className="font-display font-bold text-sm text-white">{npc.name}</div>
                  <div className="text-[11px] text-sky-400 truncate">{npc.role}</div>
                </div>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">“{npcDialogue.message}”</p>
            </div>

            {/* Compact Expedition Log */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Catatan Ekspedisi
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto text-[11px] text-slate-300">
                {actionLog.slice(0, 5).map((entry, idx) => (
                  <div key={idx} className="leading-snug text-slate-300">
                    • {entry}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Bottom Collapsible Control Dock */}
      <div className="w-full flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            soundEngine.playSfx('buttonClick');
            setDockCollapsed((c) => !c);
          }}
          className="pointer-events-auto px-3 py-1 bg-slate-900/95 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Tampilkan Panel Pemain
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              Sembunyikan Panel (Lihat Papan 3D)
            </>
          )}
        </button>

        <div className="pointer-events-auto bg-slate-900/95 border border-slate-800 rounded-xl px-4 py-2 flex flex-wrap items-center justify-center gap-3 text-xs shadow-lg">
          <div className="flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400 hidden sm:inline">Kamera:</span>
            {(
              [
                { id: 'isometric', label: 'Isometrik' },
                { id: 'top', label: 'Tampak Atas' },
                { id: 'follow', label: 'Ikuti Pion' },
              ] as const
            ).map((cam) => (
              <button
                key={cam.id}
                type="button"
                onClick={() => {
                  soundEngine.playSfx('buttonClick');
                  onSelectCamera(cam.id);
                }}
                className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                  cameraPreset === cam.id
                    ? 'bg-sky-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {cam.label}
              </button>
            ))}
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 hidden md:inline">Latar:</span>
            {(
              [
                { id: 'daylight', label: 'Siang' },
                { id: 'sunset', label: 'Senja' },
                { id: 'night', label: 'Malam' },
              ] as const
            ).map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => {
                  soundEngine.playSfx('buttonClick');
                  onSelectSkyTheme(th.id);
                }}
                className={`px-2 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                  skyTheme === th.id
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {th.label}
              </button>
            ))}
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('buttonClick');
                onToggleMusic();
              }}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 cursor-pointer ${
                audio.musicEnabled
                  ? 'bg-slate-800 text-sky-300'
                  : 'bg-slate-950 text-slate-500'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              Musik {audio.musicEnabled ? 'ON' : 'OFF'}
            </button>
            {audio.musicEnabled && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx('buttonClick');
                  onToggleMusicPause();
                }}
                className="px-2 py-1 rounded-md font-semibold flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
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
              onClick={() => {
                onToggleSfx();
              }}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 cursor-pointer ${
                audio.sfxEnabled
                  ? 'bg-slate-800 text-emerald-300'
                  : 'bg-slate-950 text-slate-500'
              }`}
            >
              {audio.sfxEnabled ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
              SFX {audio.sfxEnabled ? 'ON' : 'OFF'}
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('buttonClick');
                onRequestLandscapeFullscreen();
              }}
              className="px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
              title="Layar Penuh Landscape"
            >
              <Maximize2 className="w-3.5 h-3.5 text-sky-300" />
              <span className="hidden lg:inline">Layar Penuh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
