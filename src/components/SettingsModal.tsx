import React from 'react';
import { Volume2, VolumeX, Music, Pause, Play, Sliders, X } from 'lucide-react';
import { AudioSettings, GameConfig } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface SettingsModalProps {
  audio: AudioSettings;
  onChangeAudio: (next: AudioSettings) => void;
  config: GameConfig;
  onChangeConfig: (next: GameConfig) => void;
  animSpeed: number;
  onChangeAnimSpeed: (speed: number) => void;
  inActiveMatch: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  audio,
  onChangeAudio,
  config,
  onChangeConfig,
  animSpeed,
  onChangeAnimSpeed,
  inActiveMatch,
  onClose,
}) => {
  const activeTrackLabel = soundEngine.getCurrentTrackLabel();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h2 className="font-display text-lg font-bold text-white">
              Pengaturan Audio & Permainan
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx('buttonClick');
              onClose();
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Audio Section */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display font-bold text-sm text-slate-200">
                Audio, Musik Latar & Efek Suara
              </h3>
              <span className="text-[11px] text-sky-300">
                Aktif: {activeTrackLabel}
              </span>
            </div>

            {/* Music toggle, Play/Pause & slider */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSfx('buttonClick');
                    onChangeAudio({ ...audio, musicEnabled: !audio.musicEnabled });
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border ${
                    audio.musicEnabled
                      ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  <Music className="w-4 h-4" />
                  Musik: {audio.musicEnabled ? 'ON' : 'OFF'}
                </button>

                <button
                  type="button"
                  disabled={!audio.musicEnabled}
                  onClick={() => {
                    soundEngine.playSfx('buttonClick');
                    onChangeAudio({ ...audio, musicPaused: !audio.musicPaused });
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${
                    !audio.musicEnabled
                      ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                      : audio.musicPaused
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 cursor-pointer'
                        : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 cursor-pointer'
                  }`}
                >
                  {audio.musicPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Putar
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      Jeda
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 flex-1 min-w-[180px] max-w-xs">
                <span className="text-xs text-slate-400 w-24">
                  Volume ({Math.round(audio.musicVolume * 100)}%)
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={audio.musicVolume}
                  onChange={(e) =>
                    onChangeAudio({ ...audio, musicVolume: parseFloat(e.target.value) })
                  }
                  className="flex-1 accent-sky-400 cursor-pointer"
                />
              </div>
            </div>

            {/* SFX toggle & slider */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  const nextVal = !audio.sfxEnabled;
                  onChangeAudio({ ...audio, sfxEnabled: nextVal });
                  if (nextVal) soundEngine.playSfx('buttonClick');
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer border ${
                  audio.sfxEnabled
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {audio.sfxEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                Sound Effect: {audio.sfxEnabled ? 'ON' : 'OFF'}
              </button>
              <div className="flex items-center gap-3 flex-1 min-w-[180px] max-w-xs">
                <span className="text-xs text-slate-400 w-24">
                  Volume ({Math.round(audio.sfxVolume * 100)}%)
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={audio.sfxVolume}
                  onChange={(e) =>
                    onChangeAudio({ ...audio, sfxVolume: parseFloat(e.target.value) })
                  }
                  className="flex-1 accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Animation Speed */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-display font-bold text-sm text-white">Kecepatan Animasi 3D</div>
              <div className="text-xs text-slate-400">
                Mengatur kecepatan gerak pion dan guliran dadu 3D.
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {[
                { label: 'Normal (1x)', val: 1 },
                { label: 'Cepat (1.5x)', val: 1.5 },
                { label: 'Kilat (2.2x)', val: 2.2 },
              ].map((s) => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => {
                    soundEngine.playSfx('buttonClick');
                    onChangeAnimSpeed(s.val);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    animSpeed === s.val
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-900 text-slate-300 border border-slate-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Game Rules Config */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-slate-200">
                Konfigurasi Aturan & Ekonomi Permainan
              </h3>
              {inActiveMatch && (
                <span className="text-xs text-amber-400">
                  Sebagian aturan berlaku pada sesi baru
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="block space-y-1">
                <span className="text-slate-400">Modal Awal (GC)</span>
                <input
                  type="number"
                  step={100}
                  min={500}
                  max={5000}
                  value={config.startingCoins}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      startingCoins: Math.max(200, Number(e.target.value) || 1000),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono-num"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-slate-400">Bonus Lewat START (GC)</span>
                <input
                  type="number"
                  step={50}
                  min={50}
                  max={1000}
                  value={config.startPassBonus}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      startPassBonus: Math.max(50, Number(e.target.value) || 200),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono-num"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-slate-400">Poin Kuis Negara Benar</span>
                <input
                  type="number"
                  step={5}
                  min={5}
                  max={50}
                  value={config.correctAnswerPoints}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      correctAnswerPoints: Math.max(5, Number(e.target.value) || 10),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono-num"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-slate-400">Poin Tantangan Kartu</span>
                <input
                  type="number"
                  step={5}
                  min={10}
                  max={100}
                  value={config.challengePoints}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      challengePoints: Math.max(10, Number(e.target.value) || 20),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono-num"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
