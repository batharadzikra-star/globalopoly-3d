import React from 'react';
import {
  Building2,
  CheckCircle2,
  Coins,
  KeyRound,
  Lock,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import {
  BOARD_TILES,
  FACILITIES,
  FACILITY_ORDER,
  calculateCountryAssetValue,
  calculateCountryRent,
} from '../data/boardConfig';
import { NPCS } from '../data/characters';
import { ActiveModalState, FacilityId, GameConfig, Player, TileConfig } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { CountryBackdrop } from './CountryBackdrop';

interface ActionModalProps {
  modal: ActiveModalState;
  activePlayer: Player;
  players: Player[];
  config: GameConfig;
  onSelectQuizOption: (optionIdx: number) => void;
  onProceedAfterQuiz: () => void;
  onBuyCountry: (tile: TileConfig) => void;
  onSkipBuy: () => void;
  onBuildFacility: (tile: TileConfig, facilityId: FacilityId) => void;
  onFinishDevelop: () => void;
  onApplyCardEffect: () => void;
  onSelectCardQuizOption: (optionIdx: number) => void;
  onFinishCardQuiz: () => void;
  onConfirmRent: () => void;
  onJailPayFine: () => void;
  onJailUseCard: () => void;
  onJailRollEscape: () => void;
  onCloseTileInfo: () => void;
}

const CountryFlagBadge: React.FC<{ tile: TileConfig }> = ({ tile }) => {
  const c = tile.flagColors || ['#2563EB', '#FFFFFF', '#DC2626'];
  if (tile.flagDirection === 'vertical') {
    return (
      <div className="w-12 h-8 rounded overflow-hidden border border-slate-600 flex shrink-0">
        <div className="flex-1" style={{ backgroundColor: c[0] }} />
        <div className="flex-1" style={{ backgroundColor: c[1] }} />
        <div className="flex-1" style={{ backgroundColor: c[2] }} />
      </div>
    );
  }
  if (tile.flagDirection === 'circle') {
    return (
      <div
        className="w-12 h-8 rounded overflow-hidden border border-slate-600 flex items-center justify-center shrink-0"
        style={{ backgroundColor: c[0] }}
      >
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c[1] }} />
      </div>
    );
  }
  return (
    <div className="w-12 h-8 rounded overflow-hidden border border-slate-600 flex flex-col shrink-0">
      <div className="flex-1" style={{ backgroundColor: c[0] }} />
      <div className="flex-1" style={{ backgroundColor: c[1] }} />
      <div className="flex-1" style={{ backgroundColor: c[2] }} />
    </div>
  );
};

export const ActionModal: React.FC<ActionModalProps> = ({
  modal,
  activePlayer,
  players,
  config,
  onSelectQuizOption,
  onProceedAfterQuiz,
  onBuyCountry,
  onSkipBuy,
  onBuildFacility,
  onFinishDevelop,
  onApplyCardEffect,
  onSelectCardQuizOption,
  onFinishCardQuiz,
  onConfirmRent,
  onJailPayFine,
  onJailUseCard,
  onJailRollEscape,
  onCloseTileInfo,
}) => {
  if (modal.type === 'none') return null;

  // 1. Country Quiz Modal
  if (modal.type === 'country_quiz') {
    const { tile, question, selectedOption, answered, isCorrect } = modal;
    const npc = NPCS[question.npc];
    const letters = ['A', 'B', 'C', 'D'];

    return (
      <div className="fixed inset-0 z-40 bg-slate-950/80 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          {/* Header with Country Scenic Backdrop */}
          <div className="relative px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 overflow-hidden">
            <CountryBackdrop tile={tile} />
            <div className="relative z-10 flex items-center gap-3">
              <CountryFlagBadge tile={tile} />
              <div>
                <div className="text-xs font-semibold text-sky-300">
                  {tile.continentLabel} · Tantangan Pembelian Negara
                </div>
                <h2 className="font-display text-xl font-bold text-white">{tile.name}</h2>
              </div>
            </div>
            <div className="relative z-10 text-right text-xs text-slate-200 font-mono-num">
              <div>Harga: <strong className="text-amber-300">{tile.price} GC</strong></div>
              <div>Sewa Dasar: <strong className="text-emerald-300">{tile.baseRent} GC</strong></div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto space-y-4">
            <p className="text-xs text-slate-300 bg-slate-950/70 border border-slate-800 rounded-lg px-3.5 py-2.5">
              {tile.shortInfo}
            </p>

            {/* Question */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Kategori: {question.category} · Tingkat: {question.difficulty}</span>
                <span>Jawab benar untuk membuka hak beli negara</span>
              </div>
              <h3 className="font-display text-base lg:text-lg font-semibold text-white leading-snug">
                {question.text}
              </h3>

              <div className="grid grid-cols-1 gap-2.5">
                {question.options.map((opt, idx) => {
                  const isChosen = selectedOption === idx;
                  const isRightAnswer = idx === question.correctIndex;
                  let btnStyle =
                    'bg-slate-950 border-slate-800 hover:border-sky-400 text-slate-200 cursor-pointer';
                  if (answered) {
                    if (isRightAnswer) {
                      btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-100';
                    } else if (isChosen) {
                      btnStyle = 'bg-rose-950/70 border-rose-500 text-rose-100';
                    } else {
                      btnStyle = 'bg-slate-950/50 border-slate-800/60 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={answered || activePlayer.isBot}
                      onClick={() => {
                        soundEngine.playSfx('buttonClick');
                        onSelectQuizOption(idx);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm flex items-start gap-3 transition-colors ${btnStyle}`}
                    >
                      <span className="font-mono-num font-bold text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-200 shrink-0 mt-0.5">
                        {letters[idx]}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explanation after answering */}
            {answered && (
              <div
                className={`rounded-xl p-4 border space-y-2 ${
                  isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/40'
                    : 'bg-rose-950/40 border-rose-500/40'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-display font-bold text-sm">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-300">
                          Jawaban Benar! +{config.correctAnswerPoints} Poin Pembelajaran
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-400" />
                        <span className="text-rose-300">
                          Belum Tepat (Kunci: {letters[question.correctIndex]}) · 0 Poin
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  <strong>Pembahasan:</strong> {question.explanation}
                </p>
                <div className="flex items-center gap-2.5 pt-2 border-t border-slate-800/70">
                  <img
                    src={npc.image}
                    alt={npc.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <p className="text-xs text-slate-300">
                    <strong>{npc.name}:</strong>{' '}
                    {isCorrect
                      ? 'Hebat! Kamu berhak membeli negara ini.'
                      : 'Tidak masalah, pahami pembahasannya dan bersiap untuk giliran berikutnya!'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {answered && !activePlayer.isBot && (
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx('buttonClick');
                  onProceedAfterQuiz();
                }}
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-sm cursor-pointer"
              >
                {isCorrect ? 'Lanjut ke Pembelian Negara' : 'Selesai Giliran'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Country Buy Confirmation Modal
  if (modal.type === 'country_buy') {
    const { tile } = modal;
    const price = tile.price ?? 0;
    const canAfford = activePlayer.coins >= price;

    return (
      <div className="fixed inset-0 z-40 bg-slate-950/80 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center gap-3 overflow-hidden">
            <CountryBackdrop tile={tile} />
            <div className="relative z-10 flex items-center gap-3">
              <CountryFlagBadge tile={tile} />
              <div>
                <div className="text-xs text-emerald-300 font-semibold">
                  Hak Membeli Terbuka · {tile.continentLabel}
                </div>
                <h2 className="font-display text-xl font-bold text-white">{tile.name}</h2>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-300">{tile.shortInfo}</p>

            <div className="grid grid-cols-3 gap-3 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-center">
              <div>
                <div className="text-xs text-slate-400">Harga Beli</div>
                <div className="font-mono-num font-bold text-base text-amber-300 mt-0.5">
                  {price} GC
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Biaya Sewa</div>
                <div className="font-mono-num font-bold text-base text-emerald-300 mt-0.5">
                  {tile.baseRent} GC
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Saldo Kamu</div>
                <div className="font-mono-num font-bold text-base text-sky-300 mt-0.5">
                  {activePlayer.coins} GC
                </div>
              </div>
            </div>

            {!canAfford && (
              <p className="text-xs text-rose-400">
                Global Coins kamu belum mencukupi untuk membeli {tile.name}.
              </p>
            )}
          </div>

          <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('buttonClick');
                onSkipBuy();
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm cursor-pointer"
            >
              Lewati
            </button>
            <button
              type="button"
              disabled={!canAfford}
              onClick={() => onBuyCountry(tile)}
              className={`px-5 py-2.5 font-bold rounded-xl text-sm flex items-center gap-2 ${
                canAfford
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Coins className="w-4 h-4" />
              Beli Negara ({price} GC)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Country Develop Facilities Modal
  if (modal.type === 'country_develop') {
    const { tile } = modal;
    const built = activePlayer.facilities[tile.id] || [];
    const currentRent = calculateCountryRent(tile, built);
    const currentValue = calculateCountryAssetValue(tile, built);

    return (
      <div className="fixed inset-0 z-40 bg-slate-950/80 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between overflow-hidden">
            <CountryBackdrop tile={tile} />
            <div className="relative z-10 flex items-center gap-3">
              <CountryFlagBadge tile={tile} />
              <div>
                <div className="text-xs text-sky-300 font-semibold">
                  Negara Milikmu · Pengembangan Fasilitas
                </div>
                <h2 className="font-display text-xl font-bold text-white">{tile.name}</h2>
              </div>
            </div>
            <div className="relative z-10 text-right text-xs font-mono-num">
              <div className="text-slate-200">Sewa Saat Ini: <strong className="text-emerald-300">{currentRent} GC</strong></div>
              <div className="text-slate-200">Nilai Aset: <strong className="text-amber-300">{currentValue} GC</strong></div>
            </div>
          </div>

          <div className="p-6 space-y-3">
            {FACILITY_ORDER.map((fid) => {
              const def = FACILITIES[fid];
              const isBuilt = built.includes(fid);
              const cost = Math.round((tile.price || 200) * def.costMultiplier);
              const canBuild = !isBuilt && activePlayer.coins >= cost;
              const nextRent = currentRent + def.rentBonus;
              const nextValue = currentValue + cost;

              return (
                <div
                  key={fid}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="font-display font-bold text-sm text-white">{def.name}</span>
                    </div>
                    <p className="text-xs text-slate-400">{def.description}</p>
                    {!isBuilt && (
                      <p className="text-xs text-slate-300 font-mono-num">
                        Sewa Baru: <span className="text-emerald-300">{nextRent} GC</span> · Nilai Aset Baru:{' '}
                        <span className="text-amber-300">{nextValue} GC</span>
                      </p>
                    )}
                  </div>

                  {isBuilt ? (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shrink-0">
                      Sudah Dibangun
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={!canBuild}
                      onClick={() => onBuildFacility(tile, fid)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 ${
                        canBuild
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Bangun ({cost} GC)
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-400 font-mono-num">
              Saldo: <strong className="text-white">{activePlayer.coins} GC</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('buttonClick');
                onFinishDevelop();
              }}
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-sm cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Chance / Community Chest Card Modal
  if (modal.type === 'card_draw') {
    const { card, question, selectedOption, answered, isCorrect } = modal;
    const isChance = card.deck === 'chance';
    const npc = NPCS[card.npc];
    const letters = ['A', 'B', 'C', 'D'];

    return (
      <div className="fixed inset-0 z-40 bg-slate-950/80 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          {/* Visual Card Header differentiating Chance vs Community Chest */}
          <div
            className={`px-6 py-4 border-b flex items-center justify-between ${
              isChance
                ? 'bg-gradient-to-r from-pink-700 to-rose-700 border-pink-500/40'
                : 'bg-gradient-to-r from-sky-700 to-cyan-700 border-cyan-500/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-white shrink-0" />
              <div>
                <div className="text-xs font-bold tracking-wider text-white/85 uppercase">
                  {isChance ? 'Kartu Kesempatan · Chance' : 'Kartu Dana Umum · Community Chest'}
                </div>
                <h2 className="font-display text-xl font-bold text-white">{card.title}</h2>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto space-y-4">
            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950 border border-slate-800 rounded-xl p-4">
              {card.description}
            </p>

            {/* Case A: Non-trivia effect card */}
            {card.effectType !== 'trivia' && (
              <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                <img
                  src={npc.image}
                  alt={npc.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
                <div className="text-xs text-slate-300">
                  <strong>{npc.name} ({npc.role}):</strong>{' '}
                  {card.effectType === 'coins' && (card.coinDelta || 0) >= 0
                    ? `Selamat! Kamu memperoleh +${card.coinDelta} Global Coins.`
                    : card.effectType === 'coins'
                      ? `Waspada! Kamu harus membayar ${Math.abs(card.coinDelta || 0)} Global Coins.`
                      : card.effectType === 'move'
                        ? `Ekspedisi bergerak maju ${card.moveSteps} petak dan memicu aturan petak tujuan.`
                        : 'Simpan kartu ini baik-baik untuk membebaskan diri dari karantina JAIL.'}
                </div>
              </div>
            )}

            {/* Case B: Trivia / Case Study Card */}
            {card.effectType === 'trivia' && question && (
              <div className="space-y-3">
                {question.scenario && (
                  <div className="text-xs text-amber-200 bg-amber-950/40 border border-amber-500/30 rounded-lg p-3">
                    <strong>Skenario Kasus:</strong> {question.scenario}
                  </div>
                )}
                <h3 className="font-display text-base font-semibold text-white">
                  {question.text}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {question.options.map((opt, idx) => {
                    const isChosen = selectedOption === idx;
                    const isRight = idx === question.correctIndex;
                    let cls =
                      'bg-slate-950 border-slate-800 hover:border-sky-400 text-slate-200 cursor-pointer';
                    if (answered) {
                      if (isRight) cls = 'bg-emerald-950/70 border-emerald-500 text-emerald-100';
                      else if (isChosen) cls = 'bg-rose-950/70 border-rose-500 text-rose-100';
                      else cls = 'bg-slate-950/50 border-slate-800/60 text-slate-500';
                    }
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={answered || activePlayer.isBot}
                        onClick={() => {
                          soundEngine.playSfx('buttonClick');
                          onSelectCardQuizOption(idx);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm flex items-start gap-3 transition-colors ${cls}`}
                      >
                        <span className="font-mono-num font-bold text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-200 shrink-0 mt-0.5">
                          {letters[idx]}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {answered && (
                  <div
                    className={`rounded-xl p-3.5 border text-xs space-y-1.5 ${
                      isCorrect
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-100'
                    }`}
                  >
                    <div className="font-bold">
                      {isCorrect
                        ? `Benar! +${card.coinDelta || 120} GC & +${config.challengePoints} Poin Pembelajaran`
                        : `Kurang tepat (Kunci: ${letters[question.correctIndex]}).`}
                    </div>
                    <p className="text-slate-200">
                      <strong>Pembahasan:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {!activePlayer.isBot && (
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              {card.effectType !== 'trivia' ? (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSfx('buttonClick');
                    onApplyCardEffect();
                  }}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm cursor-pointer"
                >
                  Terapkan Efek Kartu
                </button>
              ) : answered || !question ? (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSfx('buttonClick');
                    onFinishCardQuiz();
                  }}
                  className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-sm cursor-pointer"
                >
                  Lanjutkan Ekspedisi
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 5. Rent Payment Notice
  if (modal.type === 'rent_notice') {
    const { tile, ownerName, ownerColor, amount } = modal;
    return (
      <div className="fixed inset-0 z-40 bg-slate-950/80 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
            <CountryFlagBadge tile={tile} />
            <div>
              <div className="text-xs text-rose-400 font-semibold">Biaya Sewa Wilayah</div>
              <h2 className="font-display text-lg font-bold text-white">{tile.name}</h2>
            </div>
          </div>
          <div className="p-6 space-y-4 text-sm text-slate-200">
            <p>
              Wilayah ini dikuasai oleh{' '}
              <strong style={{ color: ownerColor }}>{ownerName}</strong>. Kamu perlu membayar biaya sewa sebesar:
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center font-mono-num text-2xl font-bold text-amber-300">
              {amount} Global Coins
            </div>
          </div>
          {!activePlayer.isBot && (
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={onConfirmRent}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm cursor-pointer"
              >
                Bayar Sewa ({amount} GC)
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 6. Jail Turn Options Modal
  if (modal.type === 'jail_turn') {
    const canPayFine = activePlayer.coins >= config.jailFine;
    const hasCard = activePlayer.jailFreeCards > 0;
    return (
      <div className="fixed inset-0 z-40 bg-slate-950/80 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
            <Lock className="w-5 h-5 text-rose-400" />
            <div>
              <div className="text-xs text-rose-400 font-semibold">Status: Ditahan di JAIL</div>
              <h2 className="font-display text-lg font-bold text-white">
                Giliran {activePlayer.name} (Percobaan {activePlayer.jailTurns + 1}/3)
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-3 text-sm text-slate-300">
            <p>
              Pilih cara keluar dari JAIL: bayar denda {config.jailFine} Global Coins, gunakan Kartu Bebas Penjara, atau lempar dadu (angka 5 atau 6 untuk bebas).
            </p>

            <div className="grid grid-cols-1 gap-2.5 pt-2">
              <button
                type="button"
                disabled={!canPayFine}
                onClick={onJailPayFine}
                className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-between ${
                  canPayFine
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>Bayar Denda Pemulihan</span>
                <span className="font-mono-num">{config.jailFine} GC</span>
              </button>

              {hasCard && (
                <button
                  type="button"
                  onClick={onJailUseCard}
                  className="w-full px-4 py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    Gunakan Kartu Bebas Penjara
                  </span>
                  <span>Gratis (Sisa: {activePlayer.jailFreeCards})</span>
                </button>
              )}

              <button
                type="button"
                onClick={onJailRollEscape}
                className="w-full px-4 py-3 rounded-xl font-bold text-sm bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-between cursor-pointer"
              >
                <span>Coba Lempar Dadu (Butuh 5 atau 6)</span>
                <span>Uji Keberuntungan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 7. Tile Inspection Modal (when user clicks a 3D tile)
  if (modal.type === 'tile_info') {
    const { tile } = modal;
    const owner = players.find((p) => p.ownedCountries.includes(tile.id));
    const built = owner ? owner.facilities[tile.id] || [] : [];
    const currentRent = tile.type === 'country' ? calculateCountryRent(tile, built) : 0;

    return (
      <div className="fixed inset-0 z-40 bg-slate-950/70 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between overflow-hidden">
            {tile.type === 'country' && <CountryBackdrop tile={tile} />}
            <div className="relative z-10 flex items-center gap-3">
              {tile.type === 'country' && <CountryFlagBadge tile={tile} />}
              <div>
                <div className="text-xs text-sky-300 font-semibold">{tile.continentLabel}</div>
                <h2 className="font-display text-lg font-bold text-white">{tile.name}</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('buttonClick');
                onCloseTileInfo();
              }}
              className="relative z-10 p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-3 text-sm text-slate-300">
            <p>{tile.shortInfo}</p>
            {tile.type === 'country' && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Kepemilikan</span>
                  <span className="font-bold" style={{ color: owner ? owner.color : '#94A3B8' }}>
                    {owner ? owner.name : 'Belum Dimiliki (Bank)'}
                  </span>
                </div>
                <div className="flex justify-between font-mono-num">
                  <span className="text-slate-400">Harga Negara</span>
                  <span className="text-amber-300 font-bold">{tile.price} GC</span>
                </div>
                <div className="flex justify-between font-mono-num">
                  <span className="text-slate-400">Biaya Sewa Saat Ini</span>
                  <span className="text-emerald-300 font-bold">{currentRent} GC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fasilitas Dibangun</span>
                  <span className="text-slate-200">
                    {built.length > 0
                      ? built.map((f) => FACILITIES[f].shortName).join(', ')
                      : 'Belum ada'}
                  </span>
                </div>
              </div>
            )}
            <div className="text-xs text-slate-400">
              Posisi di Papan: Petak #{tile.index + 1} dari {BOARD_TILES.length}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
