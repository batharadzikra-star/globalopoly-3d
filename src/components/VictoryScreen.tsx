import React, { useState } from 'react';
import { Award, Home, Music, Pause, Play, RotateCcw, Trophy } from 'lucide-react';
import { BOARD_TILES, FACILITIES, calculateCountryAssetValue } from '../data/boardConfig';
import { NPCS, getAchievementTitle } from '../data/characters';
import { AudioSettings, Player } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface VictoryScreenProps {
  players: Player[];
  audio: AudioSettings;
  onToggleMusic: () => void;
  onToggleMusicPause: () => void;
  onPlayAgain: () => void;
  onReturnMenu: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  players,
  audio,
  onToggleMusic,
  onToggleMusicPause,
  onPlayAgain,
  onReturnMenu,
}) => {
  const [showDetailedTable, setShowDetailedTable] = useState(true);

  const rankedPlayers = [...players]
    .map((p) => {
      const countryBaseValue = p.ownedCountries.reduce((sum, tid) => {
        const t = BOARD_TILES.find((bt) => bt.id === tid);
        return sum + (t?.price ?? 0);
      }, 0);

      const facilityValue = p.ownedCountries.reduce((sum, tid) => {
        const t = BOARD_TILES.find((bt) => bt.id === tid);
        if (!t) return sum;
        const total = calculateCountryAssetValue(t, p.facilities[tid] || []);
        return sum + (total - (t.price ?? 0));
      }, 0);

      const totalWealth = p.coins + countryBaseValue + facilityValue;
      const accuracy =
        p.totalAnswers > 0 ? Math.round((p.correctAnswers / p.totalAnswers) * 100) : 0;
      const achievement = getAchievementTitle(p.learningPoints);

      return {
        player: p,
        countryBaseValue,
        facilityValue,
        totalWealth,
        accuracy,
        achievement,
      };
    })
    .sort((a, b) => {
      if (b.totalWealth !== a.totalWealth) return b.totalWealth - a.totalWealth;
      return b.player.learningPoints - a.player.learningPoints;
    });

  const winner = rankedPlayers[0];

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 p-5 lg:p-8 overflow-y-auto">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Top Champion Banner */}
        <div className="bg-slate-900 border border-amber-400/50 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                Ekspedisi Selesai · Pemenang GLOBALOPOLY
              </div>
              <h1 className="font-display text-2xl lg:text-3xl font-extrabold text-white mt-0.5">
                {winner.player.name} — {winner.achievement.title}
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Total Kekayaan:{' '}
                <strong className="font-mono-num text-amber-300">
                  {winner.totalWealth.toLocaleString('id-ID')} GC
                </strong>{' '}
                · Poin Pembelajaran:{' '}
                <strong className="font-mono-num text-emerald-300">
                  {winner.player.learningPoints} Poin
                </strong>{' '}
                · Negara Dikuasai: {winner.player.ownedCountries.length}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('buttonClick');
                onToggleMusic();
              }}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border cursor-pointer ${
                audio.musicEnabled
                  ? 'bg-slate-800 border-slate-700 text-sky-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
              title="Musik Kemenangan ON/OFF"
            >
              <Music className="w-4 h-4" />
              {audio.musicEnabled ? 'Musik ON' : 'Musik OFF'}
            </button>
            {audio.musicEnabled && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx('buttonClick');
                  onToggleMusicPause();
                }}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                {audio.musicPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 text-amber-300 fill-current" />
                    Putar
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 text-sky-300" />
                    Jeda
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('buttonClick');
                setShowDetailedTable((s) => !s);
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl cursor-pointer"
            >
              {showDetailedTable ? 'Ringkas Hasil' : 'Lihat Hasil Lengkap'}
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('buttonClick');
                onPlayAgain();
              }}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Main Lagi
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('buttonClick');
                onReturnMenu();
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <Home className="w-4 h-4" />
              Kembali ke Menu Utama
            </button>
          </div>
        </div>

        {/* Transparent Wealth & Learning Breakdown */}
        {showDetailedTable && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-sky-400" />
                Rincian Kekayaan & Pencapaian Belajar Setiap Pemain
              </h2>
              <span className="text-xs text-slate-400">
                Total Kekayaan = Sisa Global Coins + Nilai Negara + Nilai Fasilitas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Peringkat & Pemain</th>
                    <th className="px-4 py-3 font-semibold text-right">Sisa GC</th>
                    <th className="px-4 py-3 font-semibold text-right">Nilai Negara</th>
                    <th className="px-4 py-3 font-semibold text-right">Nilai Fasilitas</th>
                    <th className="px-4 py-3 font-semibold text-right">Total Kekayaan</th>
                    <th className="px-4 py-3 font-semibold text-right">Poin Belajar</th>
                    <th className="px-4 py-3 font-semibold text-right">Benar / Tantangan</th>
                    <th className="px-4 py-3 font-semibold">Gelar Pencapaian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {rankedPlayers.map((row, idx) => (
                    <tr key={row.player.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono-num font-bold text-slate-400">#{idx + 1}</span>
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: row.player.color }}
                          />
                          <div>
                            <div className="font-display font-bold text-sm text-white">
                              {row.player.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {row.player.ownedCountries.length > 0
                                ? row.player.ownedCountries
                                    .map((tid) => {
                                      const t = BOARD_TILES.find((bt) => bt.id === tid);
                                      const facs = row.player.facilities[tid] || [];
                                      return facs.length > 0
                                        ? `${t?.name} (${facs.map((f) => FACILITIES[f].shortName).join(', ')})`
                                        : t?.name;
                                    })
                                    .join(' · ')
                                : 'Tidak ada negara'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono-num text-slate-200">
                        {row.player.coins.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono-num text-slate-200">
                        {row.countryBaseValue.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono-num text-slate-200">
                        {row.facilityValue.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono-num font-bold text-amber-300">
                        {row.totalWealth.toLocaleString('id-ID')} GC
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono-num font-bold text-emerald-300">
                        {row.player.learningPoints}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono-num text-slate-300">
                        {row.player.correctAnswers}/{row.player.totalAnswers} ({row.accuracy}%) ·{' '}
                        {row.player.challengesCompleted} misi
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="font-semibold"
                          style={{ color: row.achievement.badgeColor }}
                        >
                          {row.achievement.title}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Closing Messages from Arka, Nara, Saga (PDF Page 10) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['arka', 'nara', 'saga'] as const).map((npcId) => {
            const npc = NPCS[npcId];
            return (
              <div
                key={npc.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start gap-3.5"
              >
                <img
                  src={npc.image}
                  alt={npc.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-800"
                />
                <div className="space-y-1">
                  <div className="font-display font-bold text-sm text-white">
                    {npc.name} · <span className="text-xs font-normal text-sky-400">{npc.role}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">“{npc.closingQuote}”</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
