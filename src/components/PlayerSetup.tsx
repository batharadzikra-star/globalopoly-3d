import React, { useState } from 'react';
import { ArrowLeft, Bot, Play, User, Users } from 'lucide-react';
import { PAWN_SKINS } from '../data/boardConfig';
import { GameConfig, Player } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface PlayerDraft {
  name: string;
  pawnId: string;
  isBot: boolean;
}

interface PlayerSetupProps {
  config: GameConfig;
  onUpdateConfig: (next: GameConfig) => void;
  onBack: () => void;
  onStartGame: (players: Player[]) => void;
}

const DEFAULT_DRAFTS: PlayerDraft[] = [
  { name: 'Penjelajah 1', pawnId: 'arka_blue', isBot: false },
  { name: 'Penjelajah 2', pawnId: 'nara_purple', isBot: false },
  { name: 'Penjelajah 3', pawnId: 'saga_green', isBot: false },
  { name: 'Penjelajah 4', pawnId: 'surya_amber', isBot: true },
];

export const PlayerSetup: React.FC<PlayerSetupProps> = ({
  config,
  onUpdateConfig,
  onBack,
  onStartGame,
}) => {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(4);
  const [drafts, setDrafts] = useState<PlayerDraft[]>(DEFAULT_DRAFTS);

  const handleCountChange = (count: 2 | 3 | 4) => {
    soundEngine.playSfx('buttonClick');
    setPlayerCount(count);
  };

  const updateDraft = (index: number, patch: Partial<PlayerDraft>) => {
    setDrafts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const handleBegin = () => {
    soundEngine.playSfx('buttonClick');
    const activePlayers: Player[] = drafts.slice(0, playerCount).map((d, idx) => {
      const skin = PAWN_SKINS.find((s) => s.id === d.pawnId) || PAWN_SKINS[idx];
      return {
        id: `p_${idx + 1}`,
        name: d.name.trim() || `Penjelajah ${idx + 1}`,
        isBot: d.isBot,
        pawnId: skin.id,
        color: skin.color,
        secondaryColor: skin.secondaryColor,
        position: 0,
        coins: config.startingCoins,
        learningPoints: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        challengesCompleted: 0,
        ownedCountries: [],
        facilities: {},
        inJail: false,
        jailTurns: 0,
        jailFreeCards: 0,
        bankrupt: false,
        lapsCompleted: 0,
      };
    });
    onStartGame(activePlayers);
  };

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col p-5 lg:p-8 overflow-y-auto">
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col justify-between gap-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('buttonClick');
                onBack();
              }}
              className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer"
              aria-label="Kembali ke Menu"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">
                Pengaturan Ekspedisi & Pemain
              </h1>
              <p className="text-xs text-slate-400">
                Atur jumlah pemain (disarankan 3–4 pemain), pilih pion karakter, dan tentukan target kemenangan.
              </p>
            </div>
          </div>

          {/* Player Count Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="px-2.5 text-xs text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Pemain:
            </span>
            {([2, 3, 4] as const).map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => handleCountChange(cnt)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  playerCount === cnt
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {cnt} Pemain
              </button>
            ))}
          </div>
        </div>

        {/* Landscape Grid: Player Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 lg:gap-4">
          {drafts.slice(0, playerCount).map((draft, idx) => {
            const selectedSkin = PAWN_SKINS.find((s) => s.id === draft.pawnId) || PAWN_SKINS[idx];
            return (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: selectedSkin.color }}
                    />
                    <span className="font-display font-bold text-sm text-white">
                      Pemain {idx + 1}
                    </span>
                  </div>

                  {/* Human / Bot toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playSfx('buttonClick');
                      updateDraft(idx, { isBot: !draft.isBot });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      draft.isBot
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {draft.isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    {draft.isBot ? 'Bot AI' : 'Manusia'}
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nama Pemain</label>
                  <input
                    type="text"
                    maxLength={18}
                    value={draft.name}
                    onChange={(e) => updateDraft(idx, { name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-400"
                    placeholder={`Penjelajah ${idx + 1}`}
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Warna & Pion 3D</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAWN_SKINS.map((skin) => {
                      const usedByOther = drafts
                        .slice(0, playerCount)
                        .some((other, oIdx) => oIdx !== idx && other.pawnId === skin.id);
                      const isSelected = draft.pawnId === skin.id;
                      return (
                        <button
                          key={skin.id}
                          type="button"
                          disabled={usedByOther}
                          onClick={() => {
                            soundEngine.playSfx('buttonClick');
                            updateDraft(idx, { pawnId: skin.id });
                          }}
                          className={`px-2.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 border transition-colors text-left ${
                            isSelected
                              ? 'bg-slate-800 border-sky-400 text-white cursor-pointer'
                              : usedByOther
                                ? 'bg-slate-950/50 border-slate-800/50 text-slate-600 cursor-not-allowed'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600 cursor-pointer'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: skin.color }}
                          />
                          <span className="truncate">{skin.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                  <span>Modal Awal</span>
                  <span className="font-mono-num font-semibold text-amber-300">
                    {config.startingCoins.toLocaleString('id-ID')} GC
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Match Rules Bar & Launch */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Durasi / Batas Putaran</label>
              <div className="flex items-center gap-1.5">
                {[
                  { label: '8 Putaran', val: 8 },
                  { label: '12 Putaran', val: 12 },
                  { label: '20 Putaran', val: 20 },
                  { label: 'Bebas', val: 0 },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => {
                      soundEngine.playSfx('buttonClick');
                      onUpdateConfig({ ...config, maxRounds: opt.val });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      config.maxRounds === opt.val
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Target Kekayaan (Opsional)</label>
              <div className="flex items-center gap-1.5">
                {[
                  { label: 'Tanpa Target', val: 0 },
                  { label: '2.500 GC', val: 2500 },
                  { label: '3.500 GC', val: 3500 },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => {
                      soundEngine.playSfx('buttonClick');
                      onUpdateConfig({ ...config, targetWealth: opt.val });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      config.targetWealth === opt.val
                        ? 'bg-emerald-400 text-slate-950'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBegin}
            className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 text-sm shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            Tentukan Giliran & Mulai Ekspedisi
          </button>
        </div>
      </div>
    </div>
  );
};
