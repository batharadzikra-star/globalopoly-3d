import { AudioSettings } from '../types/game';

export type BgmMode = 'main' | 'learning' | 'challenge' | 'victory' | 'none';
export type SfxType =
  | 'buttonClick'
  | 'footsteps'
  | 'pawnMove'
  | 'diceRoll'
  | 'coin'
  | 'correct'
  | 'wrong'
  | 'cardDraw'
  | 'victory';

/**
 * Struktur aset MP3 per mode permainan & efek suara.
 * - 'main' menggunakan Amusement Park Theme Track 3 (Monopoly Plus)
 * - 'victory' menggunakan Different Heaven - Safe And Sound
 * - 'learning' & 'challenge' menggunakan sintesis Web Audio API (lo-fi & instrumental tegang)
 *   dan tetap terbuka untuk diisi path file MP3 lain di kemudian hari.
 */
export const AUDIO_MP3_OVERRIDES: Partial<Record<BgmMode | SfxType, string>> = {
  main: '/assets/aistudio/Amusement_Park_Theme_Track_3__Late_game_version__-_Monopoly_Plus_music_9e5f9830.mp3',
  victory:
    '/assets/aistudio/Different_Heaven_-_Safe_And_Sound___House___NCS_-_Copyright_Free_Music_ea822f41.mp3',
};

export const BGM_TRACK_LABELS: Record<BgmMode, string> = {
  main: 'Amusement Park 3 (Permainan Utama)',
  learning: 'Lo-Fi Santai (Mode Belajar)',
  challenge: 'Instrumental Taktis (Mode Tantangan)',
  victory: 'Different Heaven — Safe And Sound (Kemenangan)',
  none: 'Tidak Ada Musik',
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private settings: AudioSettings = {
    musicEnabled: true,
    musicPaused: false,
    sfxEnabled: true,
    musicVolume: 0.4,
    sfxVolume: 0.7,
  };
  private currentMode: BgmMode = 'none';
  private loopTimer: number | null = null;
  private stepIndex = 0;
  private unlocked = false;

  private mp3Elements = new Map<string, HTMLAudioElement>();
  private failedMp3Urls = new Set<string>();
  private activeMp3Mode: BgmMode | null = null;
  private stepTimeoutIds: number[] = [];

  private ensureAudioContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
      this.applyVolumes();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  public unlock() {
    if (typeof window === 'undefined') return;
    this.ensureAudioContext();
    const wasUnlocked = this.unlocked;
    this.unlocked = true;
    if (!wasUnlocked || !this.isMusicCurrentlyActive()) {
      this.syncPlayback(false);
    }
  }

  public getCurrentMode(): BgmMode {
    return this.currentMode;
  }

  public getCurrentTrackLabel(): string {
    return BGM_TRACK_LABELS[this.currentMode];
  }

  public updateSettings(next: AudioSettings) {
    const prevPaused = this.settings.musicPaused;
    const prevEnabled = this.settings.musicEnabled;
    this.settings = { ...next };
    this.applyVolumes();

    if (prevEnabled !== next.musicEnabled || prevPaused !== next.musicPaused) {
      this.syncPlayback(false);
    }
  }

  public setBgmMode(mode: BgmMode) {
    if (this.currentMode === mode) return;
    const prevMode = this.currentMode;
    this.currentMode = mode;
    this.stepIndex = 0;

    // Reset track sebelumnya agar tidak pernah memutar dua musik bersamaan
    if (prevMode !== 'none') {
      this.stopModeTrack(prevMode, true);
    }
    this.syncPlayback(true);
  }

  private isMusicCurrentlyActive(): boolean {
    if (this.loopTimer !== null) return true;
    for (const el of this.mp3Elements.values()) {
      if (!el.paused) return true;
    }
    return false;
  }

  private getOrCreateMp3(url: string): HTMLAudioElement | null {
    if (typeof window === 'undefined' || this.failedMp3Urls.has(url)) return null;
    let el = this.mp3Elements.get(url);
    if (!el) {
      el = new Audio(url);
      el.preload = 'auto';
      el.loop = true;
      el.addEventListener('error', () => {
        this.failedMp3Urls.add(url);
        this.syncPlayback(false);
      });
      this.mp3Elements.set(url, el);
    }
    return el;
  }

  private stopAllMp3s(resetTime: boolean, exceptUrl?: string) {
    this.mp3Elements.forEach((el, url) => {
      if (exceptUrl && url === exceptUrl) return;
      if (!el.paused) {
        el.pause();
      }
      if (resetTime) {
        try {
          el.currentTime = 0;
        } catch {
          // Ignore seek error if metadata not loaded
        }
      }
    });
  }

  private stopModeTrack(mode: BgmMode, resetTime: boolean) {
    this.stopLoop();
    const url = AUDIO_MP3_OVERRIDES[mode];
    if (url) {
      const el = this.mp3Elements.get(url);
      if (el) {
        if (!el.paused) el.pause();
        if (resetTime) {
          try {
            el.currentTime = 0;
          } catch {
            // Ignore seek error
          }
        }
      }
    }
    if (this.activeMp3Mode === mode) {
      this.activeMp3Mode = null;
    }
  }

  private syncPlayback(resetOnStart: boolean) {
    const shouldPlay =
      this.currentMode !== 'none' &&
      this.settings.musicEnabled &&
      !this.settings.musicPaused &&
      this.unlocked;

    if (!shouldPlay) {
      this.stopLoop();
      this.stopAllMp3s(!this.settings.musicEnabled || this.currentMode === 'none');
      return;
    }

    const mp3Url = AUDIO_MP3_OVERRIDES[this.currentMode];
    if (mp3Url && !this.failedMp3Urls.has(mp3Url)) {
      this.stopLoop();
      this.stopAllMp3s(true, mp3Url);
      const el = this.getOrCreateMp3(mp3Url);
      if (el) {
        el.loop = true;
        el.volume = Math.max(0, Math.min(1, this.settings.musicVolume));
        if (resetOnStart) {
          try {
            el.currentTime = 0;
          } catch {
            // Ignore before metadata load
          }
        }
        this.activeMp3Mode = this.currentMode;
        if (el.paused) {
          const playPromise = el.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
              // Browser autoplay mungkin masih menunggu interaksi; akan dicoba lagi saat unlock
            });
          }
        }
        return;
      }
    }

    // Mode synth (Learning Mode, Challenge Mode, atau fallback jika MP3 gagal)
    this.stopAllMp3s(true);
    this.activeMp3Mode = null;
    if (this.loopTimer === null) {
      this.startLoop();
    }
  }

  private applyVolumes() {
    const musicVol =
      this.settings.musicEnabled && !this.settings.musicPaused
        ? Math.max(0, Math.min(1, this.settings.musicVolume))
        : 0;

    this.mp3Elements.forEach((el) => {
      el.volume = musicVol;
    });

    if (!this.ctx || !this.musicGain || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.setTargetAtTime(musicVol * 0.28, now, 0.05);
    this.sfxGain.gain.setTargetAtTime(
      this.settings.sfxEnabled ? Math.max(0, Math.min(1, this.settings.sfxVolume)) * 0.58 : 0,
      now,
      0.03,
    );
  }

  private stopLoop() {
    if (this.loopTimer !== null) {
      window.clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
  }

  private startLoop() {
    this.stopLoop();
    const intervalMs =
      this.currentMode === 'main'
        ? 240
        : this.currentMode === 'learning'
          ? 440
          : this.currentMode === 'victory'
            ? 230
            : 210;

    this.loopTimer = window.setInterval(() => {
      if (
        !this.ctx ||
        !this.musicGain ||
        !this.settings.musicEnabled ||
        this.settings.musicPaused
      ) {
        return;
      }
      if (this.ctx.state === 'suspended') return;
      this.scheduleMusicStep(this.stepIndex++);
    }, intervalMs);
  }

  private scheduleMusicStep(step: number) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    if (this.currentMode === 'main') {
      // Fallback arcade ceria apabila MP3 tidak tersedia
      const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.0, 783.99];
      const bass = [130.81, 0, 196.0, 0, 146.83, 0, 196.0, 0];
      const freq = melody[step % melody.length];
      const bassFreq = bass[step % bass.length];
      if (step % 2 === 0 || step % 4 === 3) {
        this.playTone(freq, now, 0.14, 'triangle', 0.22, this.musicGain);
      }
      if (bassFreq > 0) {
        this.playTone(bassFreq, now, 0.2, 'sine', 0.28, this.musicGain);
      }
    } else if (this.currentMode === 'learning') {
      // Musik lo-fi santai & hangat agar fokus membaca materi
      const chords = [
        [261.63, 329.63, 392.0, 493.88], // Cmaj7
        [220.0, 261.63, 329.63, 392.0], // Am7
        [174.61, 220.0, 261.63, 349.23], // Fmaj7
        [196.0, 246.94, 293.66, 392.0], // G6
      ];
      const bassRoots = [130.81, 110.0, 87.31, 98.0];
      const chordIdx = Math.floor(step / 4) % chords.length;
      if (step % 4 === 0) {
        const chord = chords[chordIdx];
        chord.forEach((f, idx) => {
          this.playTone(f, now + idx * 0.04, 1.25, 'sine', 0.095, this.musicGain!);
        });
        this.playTone(bassRoots[chordIdx], now, 0.9, 'sine', 0.16, this.musicGain);
      } else if (step % 4 === 2) {
        const lofiNotes = [659.25, 587.33, 523.25, 493.88];
        this.playTone(
          lofiNotes[chordIdx],
          now,
          0.38,
          'triangle',
          0.075,
          this.musicGain,
        );
      }
    } else if (this.currentMode === 'challenge') {
      // Musik instrumental sedikit tegang untuk kuis negara & kartu tantangan/krisis global
      const pattern = [293.66, 349.23, 440.0, 415.3, 293.66, 349.23, 523.25, 440.0];
      const f = pattern[step % pattern.length];
      this.playTone(f, now, 0.12, 'sawtooth', 0.08, this.musicGain);
      if (step % 2 === 0) {
        this.playTone(146.83, now, 0.16, 'triangle', 0.2, this.musicGain);
      }
      if (step % 4 === 3) {
        this.playTone(110.0, now, 0.12, 'sine', 0.18, this.musicGain);
      }
    } else if (this.currentMode === 'victory') {
      const fanfare = [523.25, 659.25, 783.99, 1046.5, 783.99, 880.0, 1046.5, 1318.51];
      this.playTone(fanfare[step % fanfare.length], now, 0.22, 'triangle', 0.22, this.musicGain);
    }
  }

  private playTone(
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    dest: AudioNode,
    endFreq?: number,
  ) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), startTime + duration);
    }
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.014);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.025);
  }

  /**
   * Memainkan bunyi gerakan pion (tap/pop) sekaligus langkah kaki kecil yang sinkron
   * dengan durasi lompatan pion per petak.
   */
  public playPawnStep(animationSpeed = 1) {
    this.unlock();
    if (!this.settings.sfxEnabled) return;
    this.playSfx('pawnMove');
    const stepDelay = Math.round(135 / Math.max(0.5, animationSpeed));
    const tid = window.setTimeout(() => {
      this.playSfx('footsteps');
    }, stepDelay);
    this.stepTimeoutIds.push(tid);
    if (this.stepTimeoutIds.length > 16) {
      this.stepTimeoutIds.shift();
    }
  }

  public playSfx(type: SfxType) {
    this.unlock();
    if (!this.settings.sfxEnabled) return;

    const sfxUrl = AUDIO_MP3_OVERRIDES[type];
    if (sfxUrl && !this.failedMp3Urls.has(sfxUrl)) {
      const sfxAudio = new Audio(sfxUrl);
      sfxAudio.volume = Math.max(0, Math.min(1, this.settings.sfxVolume));
      void sfxAudio.play().catch(() => {});
      return;
    }

    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    switch (type) {
      case 'buttonClick':
        this.playTone(720, now, 0.055, 'sine', 0.24, this.sfxGain, 520);
        break;
      case 'footsteps':
        // Dua langkah kaki kecil lembut ketika pion mendarat di petak
        this.playTone(190, now, 0.055, 'triangle', 0.26, this.sfxGain, 105);
        this.playTone(165, now + 0.065, 0.055, 'triangle', 0.2, this.sfxGain, 95);
        break;
      case 'pawnMove':
        // Bunyi pop/tap lembut yang sinkron saat pion melompat antar petak
        this.playTone(410, now, 0.085, 'sine', 0.3, this.sfxGain, 620);
        break;
      case 'diceRoll': {
        for (let i = 0; i < 6; i++) {
          const t = now + i * 0.065;
          this.playTone(250 + (i % 3) * 95, t, 0.05, 'square', 0.14, this.sfxGain, 175);
        }
        break;
      }
      case 'coin':
        this.playTone(987.77, now, 0.09, 'sine', 0.3, this.sfxGain);
        this.playTone(1318.51, now + 0.08, 0.22, 'sine', 0.32, this.sfxGain);
        break;
      case 'correct':
        this.playTone(523.25, now, 0.11, 'triangle', 0.32, this.sfxGain);
        this.playTone(659.25, now + 0.09, 0.11, 'triangle', 0.32, this.sfxGain);
        this.playTone(783.99, now + 0.18, 0.24, 'triangle', 0.36, this.sfxGain);
        break;
      case 'wrong':
        this.playTone(310, now, 0.14, 'sawtooth', 0.2, this.sfxGain, 240);
        this.playTone(230, now + 0.14, 0.22, 'sawtooth', 0.2, this.sfxGain, 170);
        break;
      case 'cardDraw':
        this.playTone(420, now, 0.12, 'triangle', 0.26, this.sfxGain, 760);
        break;
      case 'victory': {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((n, idx) => {
          this.playTone(n, now + idx * 0.1, 0.26, 'triangle', 0.34, this.sfxGain!);
        });
        break;
      }
    }
  }
}

export const soundEngine = new SoundEngine();
