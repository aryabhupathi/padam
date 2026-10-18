/**
 * Web Audio API Synthesizer for Authentic Vijayanagara Temple Acoustics
 * Pure browser-synthesized audio with zero external CDN dependencies, 
 * zero latency, and 100% offline reliability.
 */

class TempleAudioEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    // Check saved mute preference
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('padam_sound_muted');
      this.muted = savedMute === 'true';
    }
  }

  private getContext(): AudioContext | null {
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
    return this.muted;
  }

  /**
   * Resonant Bronze Temple Bell (ఘంటానాదం)
   * Warm harmonic decay reminiscent of South Indian temple bells.
   */
  public playTempleBell(baseFreq = 587.33) { // D5 note
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Main fundamental + overtones
      const harmonics = [1, 2.02, 3.01, 4.2];
      const gains = [0.25, 0.12, 0.06, 0.03];

      harmonics.forEach((h, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * h, now);
        // Exponential fade for resonant bell decay
        gain.gain.setValueAtTime(gains[i], now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.8);
      });
    } catch (e) {
      // Audio autoplay gracefully handled
    }
  }

  /**
   * Tactile Ivory Tile Tap (టక్ ధ్వని)
   * Light click when selecting or filling a tile.
   */
  public playTileTap() {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  /**
   * Royal Victory Fanfare (జయధ్వానం / శంఖధ్వని)
   * Arpeggiated chime sequence celebrating correct word or puzzle solve.
   */
  public playSuccessFanfare() {
    if (this.muted) return;
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTempleBell(freq);
      }, idx * 110);
    });
  }

  /**
   * Soft Gentle Thud on Invalid Input
   */
  public playWrongChime() {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }
}

export const templeAudio = new TempleAudioEngine();
