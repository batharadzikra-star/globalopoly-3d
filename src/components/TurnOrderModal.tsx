import React, { useEffect, useState } from 'react';
import { ArrowRight, Dices, RefreshCw } from 'lucide-react';
import { Player } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface TurnOrderModalProps {
  players: Player[];
  onOrderConfirmed: (orderedPlayers: Player[]) => void;
}

export const TurnOrderModal: React.FC<TurnOrderModalProps> = ({
  players,
  onOrderConfirmed,
}) => {
  const [rolls, setRolls] = useState<Record<string, number>>({});
  const [candidates, setCandidates] = useState<string[]>(() => players.map((p) => p.id));
  const [roundStep, setRoundStep] = useState(1);
  const [resolvedOrder, setResolvedOrder] = useState<Player[] | null>(null);
  const [tieNotice, setTieNotice] = useState<string | null>(null);

  const rollForPlayer = (playerId: string) => {
    soundEngine.playSfx('diceRoll');
    const val = Math.floor(Math.random() * 6) + 1;
    setRolls((prev) => ({ ...prev, [playerId]: val }));
  };

  // Auto-roll for Bot players in candidate pool
  useEffect(() => {
    if (resolvedOrder) return;
    const unrolledBots = candidates.filter((id) => {
      const p = players.find((pl) => pl.id === id);
      return p?.isBot && rolls[id] === undefined;
    });
    if (unrolledBots.length === 0) return;
    const timer = window.setTimeout(() => {
      rollForPlayer(unrolledBots[0]);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [candidates, rolls, players, resolvedOrder]);

  // Evaluate once all current candidates have rolled
  useEffect(() => {
    if (resolvedOrder) return;
    const allRolled = candidates.every((id) => rolls[id] !== undefined);
    if (!allRolled) return;

    const timer = window.setTimeout(() => {
      let maxRoll = 0;
      candidates.forEach((id) => {
        if ((rolls[id] || 0) > maxRoll) maxRoll = rolls[id];
      });
      const tiedTop = candidates.filter((id) => rolls[id] === maxRoll);

      if (tiedTop.length > 1) {
        const tiedNames = tiedTop
          .map((id) => players.find((p) => p.id === id)?.name)
          .join(' & ');
        setTieNotice(
          `Hasil seri (${maxRoll}) antara ${tiedNames}! Pemain yang seri melempar ulang.`,
        );
        // Clear rolls only for tied players to re-roll
        setRolls((prev) => {
          const next = { ...prev };
          tiedTop.forEach((id) => delete next[id]);
          return next;
        });
        setCandidates(tiedTop);
        setRoundStep((s) => s + 1);
      } else {
        // Order: highest first, keeping full list sorted by last known roll + original index
        const winnerId = tiedTop[0];
        const sorted = [...players].sort((a, b) => {
          if (a.id === winnerId) return -1;
          if (b.id === winnerId) return 1;
          return (rolls[b.id] || 0) - (rolls[a.id] || 0);
        });
        setTieNotice(null);
        setResolvedOrder(sorted);
      }
    }, 550);

    return () => window.clearTimeout(timer);
  }, [candidates, rolls, players, resolvedOrder]);

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex items-center justify-center p-5 lg:p-8">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
              Persiapan Ekspedisi · Putaran Penentuan #{roundStep}
            </p>
            <h1 className="font-display text-2xl font-bold text-white mt-0.5">
              Lempar Dadu Penentuan Urutan Giliran
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Pemain dengan angka dadu tertinggi berjalan terlebih dahulu. Jika seri, pemain yang seri melempar ulang.
            </p>
          </div>
        </div>

        {tieNotice && (
          <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl px-4 py-3 text-xs text-amber-200 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{tieNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {players.map((p) => {
            const val = rolls[p.id];
            const isCandidate = candidates.includes(p.id);
            const orderRank = resolvedOrder
              ? resolvedOrder.findIndex((rp) => rp.id === p.id) + 1
              : null;

            return (
              <div
                key={p.id}
                className={`rounded-xl p-4 border flex flex-col justify-between gap-3 ${
                  orderRank === 1
                    ? 'bg-slate-800 border-amber-400'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="font-display font-bold text-sm text-white truncate">
                      {p.name}
                    </span>
                  </div>
                  {orderRank && (
                    <span className="font-mono-num text-xs font-bold text-amber-300">
                      Giliran #{orderRank}
                    </span>
                  )}
                </div>

                <div className="py-3 text-center bg-slate-900 rounded-lg border border-slate-800">
                  {val !== undefined ? (
                    <span className="font-mono-num text-3xl font-extrabold text-amber-300">
                      {val}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">
                      {isCandidate ? 'Menunggu lemparan...' : 'Selesai'}
                    </span>
                  )}
                </div>

                {!resolvedOrder && isCandidate && val === undefined && !p.isBot && (
                  <button
                    type="button"
                    onClick={() => rollForPlayer(p.id)}
                    className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Dices className="w-4 h-4" />
                    Lempar Dadu
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {resolvedOrder && (
          <div className="pt-2 flex items-center justify-between gap-4 border-t border-slate-800">
            <div className="text-sm text-slate-300">
              Urutan Bermain:{' '}
              <strong className="text-white">
                {resolvedOrder.map((p, idx) => `${idx + 1}. ${p.name}`).join(' → ')}
              </strong>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('buttonClick');
                onOrderConfirmed(resolvedOrder);
              }}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 cursor-pointer shrink-0"
            >
              Mulai Putaran 1
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
