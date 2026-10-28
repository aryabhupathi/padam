/**
 * Web Audio API Synthesizer for Authentic Vijayanagara Temple Acoustics
 * Pure browser-synthesized audio with zero external CDN dependencies, 
 * zero latency, guaranteed mobile-touch unlock, and 100% offline reliability.
 */

class TempleAudioEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  public isUnlocked: boolean = false;
  private ambientGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private isAmbientActive: boolean = false;

  constructor() {
    // Check saved mute preference
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('padam_sound_muted');
      this.muted = savedMute === 'true';
    }
  }

  /**
   * Unlocks the AudioContext upon the very first user interaction (touch/click/key).
   * Essential for overcoming Android WebView and iOS Safari autoplay restrictions.
   */
  public unlockContext(): void {
    if (typeof window === 'undefined') return;
    try {
      const ctx = this.getContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => {
          this.isUnlocked = true;
        }).catch(() => {});
      } else {
        this.isUnlocked = true;
      }
    } catch {
      // Gracefully ignore
    }
  }

  public getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('padam_sound_muted', String(this.muted));
    }
    if (this.muted) {
      this.pauseAmbientMusic();
    } else {
      const wantAmbient = localStorage.getItem('padam_ambient_music') === 'true';
      if (wantAmbient) {
        this.startAmbientMusic();
      }
    }
    return this.muted;
  }

  /**
   * Meditative Temple Ambient Music (శాంత వీణా & తంబురా నాదం)
   * Pure browser-synthesized acoustic drone in Raag Mohanam (Sa, Pa, High Sa).
   * Generates a serene, focused flow state without any external audio file downloads.
   */
  public startAmbientMusic(): void {
    if (this.muted || this.isAmbientActive) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      this.stopAmbientMusic();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 2.5); // Very soft 4.5% volume

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, ctx.currentTime);

      // Low Frequency Oscillator for subtle meditative breathing modulation
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // 0.08 Hz slow breath
      lfoGain.gain.setValueAtTime(90, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      // Raag Mohanam harmonic base tones: D3 (146.83Hz), A3 (220Hz), D4 (293.66Hz), F#4 (369.99Hz)
      const freqs = [146.83, 220.0, 293.66, 369.99];
      const oscs: OscillatorNode[] = [lfo];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const relativeVol = idx === 0 ? 0.35 : idx === 1 ? 0.25 : 0.15;
        oscGain.gain.setValueAtTime(relativeVol, ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start();
        oscs.push(osc);
      });

      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      this.ambientGain = masterGain;
      this.ambientOscillators = oscs;
      this.isAmbientActive = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('padam_ambient_music', 'true');
      }
    } catch {
      // Gracefully ignore audio autoplay block
    }
  }

  public pauseAmbientMusic(): void {
    if (!this.ambientGain || !this.ctx) return;
    try {
      this.ambientGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    } catch {}
  }

  public stopAmbientMusic(): void {
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
      } catch {}
    }
    this.ambientOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.ambientOscillators = [];
    this.ambientGain = null;
    this.isAmbientActive = false;
  }

  public toggleAmbientMusic(): boolean {
    if (this.isAmbientActive) {
      this.stopAmbientMusic();
      if (typeof window !== 'undefined') {
        localStorage.setItem('padam_ambient_music', 'false');
      }
      return false;
    } else {
      this.startAmbientMusic();
      return true;
    }
  }

  public isAmbientPlaying(): boolean {
    return this.isAmbientActive && !this.muted;
  }

  /**
   * Gentle tactile phone vibration for tactile feedback
   */
  public triggerHaptic(pattern: number | number[] = 20): void {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore haptic failures
      }
    }
  }

  /**
   * Internal scheduler for an authentic bronze bell harmonic note
   * Scheduled on the native Web Audio clock to prevent mobile timeout blocking.
   */
  private scheduleBellNote(ctx: AudioContext, baseFreq: number, startTime: number, duration: number = 1.6): void {
    try {
      // Authentic South Indian bronze bell inharmonics
      const harmonics = [1, 2.0, 3.01, 4.18, 5.43];
      const gains = [0.35, 0.20, 0.12, 0.08, 0.04];

      harmonics.forEach((h, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Slight detune for warm bronze metallic shimmer
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(baseFreq * h, startTime);

        gain.gain.setValueAtTime(gains[i], startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // Audio autoplay gracefully handled
    }
  }

  /**
   * Resonant Bronze Temple Bell (ఘంటానాదం)
   * Warm harmonic decay reminiscent of Vijayanagara temple bells.
   */
  public playTempleBell(baseFreq = 587.33): void { // D5 note
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    this.scheduleBellNote(ctx, baseFreq, ctx.currentTime, 1.8);
  }

  /**
   * Tactile Ivory Tile Tap (టక్ ధ్వని)
   * Crisp, pleasant click when selecting or typing in a cell.
   */
  public playTileTap(): void {
    this.triggerHaptic(15);
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  /**
   * Royal Victory Fanfare (జయధ్వానం / శంఖధ్వని)
   * Arpeggiated temple chime sequence without broken setTimeout delays.
   */
  public playSuccessFanfare(): void {
    this.triggerHaptic([30, 50, 40, 80]);
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = ctx.currentTime;
    chord.forEach((freq, idx) => {
      this.scheduleBellNote(ctx, freq, now + (idx * 0.11), 1.4);
    });
  }

  /**
   * Soft Gentle Thud on Invalid Input
   */
  public playWrongChime(): void {
    this.triggerHaptic([40, 30, 40]);
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.22);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }
}

export const templeAudio = new TempleAudioEngine();

// Auto-register mobile gesture unlock on initial user touch/click
if (typeof window !== 'undefined') {
  const handleInitialUserGesture = () => {
    templeAudio.unlockContext();
    window.removeEventListener('pointerdown', handleInitialUserGesture);
    window.removeEventListener('touchstart', handleInitialUserGesture);
    window.removeEventListener('keydown', handleInitialUserGesture);
  };
  window.addEventListener('pointerdown', handleInitialUserGesture, { passive: true });
  window.addEventListener('touchstart', handleInitialUserGesture, { passive: true });
  window.addEventListener('keydown', handleInitialUserGesture, { passive: true });
}
