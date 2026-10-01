/**
 * Sound synthesis engine using Web Audio API for tactical zombie survival FX.
 * Zero external audio dependency, works offline and instantly in any mobile environment.
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private volume: number = 0.8;
  private musicGain: GainNode | null = null;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setConfig(sound: boolean, music: boolean, vol: number) {
    this.soundEnabled = sound;
    this.musicEnabled = music;
    this.volume = Math.max(0, Math.min(1, vol));

    if (!this.musicEnabled && this.musicGain) {
      this.musicGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    } else if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(0.08 * this.volume, this.ctx.currentTime);
    }
  }

  /** Tactical UI button click */
  public playClick() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);

      gain.gain.setValueAtTime(0.2 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    } catch {
      // Audio context handling
    }
  }

  /** Gunshot sound tailored by weapon type */
  public playGunshot(type: 'pistol' | 'shotgun' | 'rifle' | 'sniper') {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // 1. Noise burst for muzzle flash crack
      const bufferSize = this.ctx.sampleRate * (type === 'shotgun' ? 0.25 : type === 'sniper' ? 0.35 : 0.12);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';

      const noiseGain = this.ctx.createGain();

      // 2. Punch oscillator for body punch/thump
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      if (type === 'pistol') {
        filter.frequency.setValueAtTime(1400, t);
        filter.frequency.exponentialRampToValueAtTime(180, t + 0.1);
        noiseGain.gain.setValueAtTime(0.35 * this.volume, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
        oscGain.gain.setValueAtTime(0.4 * this.volume, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
      } else if (type === 'shotgun') {
        filter.frequency.setValueAtTime(900, t);
        filter.frequency.exponentialRampToValueAtTime(120, t + 0.25);
        noiseGain.gain.setValueAtTime(0.6 * this.volume, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.18);
        oscGain.gain.setValueAtTime(0.7 * this.volume, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
      } else if (type === 'rifle') {
        filter.frequency.setValueAtTime(1800, t);
        filter.frequency.exponentialRampToValueAtTime(220, t + 0.1);
        noiseGain.gain.setValueAtTime(0.4 * this.volume, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.07);
        oscGain.gain.setValueAtTime(0.45 * this.volume, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);
      } else {
        // Sniper
        filter.frequency.setValueAtTime(2400, t);
        filter.frequency.exponentialRampToValueAtTime(150, t + 0.35);
        noiseGain.gain.setValueAtTime(0.7 * this.volume, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.005, t + 0.35);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, t);
        osc.frequency.exponentialRampToValueAtTime(25, t + 0.28);
        oscGain.gain.setValueAtTime(0.8 * this.volume, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
      }

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      whiteNoise.start(t);
      osc.start(t);
      osc.stop(t + (type === 'sniper' ? 0.35 : 0.25));
    } catch {
      // Audio context handling
    }
  }

  /** Reload mechanical click and lock sound */
  public playReload() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Mag out clack
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(450, t);
      osc1.frequency.exponentialRampToValueAtTime(120, t + 0.06);
      gain1.gain.setValueAtTime(0.25 * this.volume, t);
      gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.07);

      // Mag in click (0.3s later)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(700, t + 0.3);
      osc2.frequency.exponentialRampToValueAtTime(320, t + 0.38);
      gain2.gain.setValueAtTime(0.3 * this.volume, t + 0.3);
      gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.38);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t + 0.3);
      osc2.stop(t + 0.4);
    } catch {}
  }

  /** Zombie hit impact / flesh squish */
  public playZombieHit() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260 + Math.random() * 80, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.06);

      gain.gain.setValueAtTime(0.25 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    } catch {}
  }

  /** Zombie death groan */
  public playZombieGroan(isBoss: boolean = false) {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const baseFreq = isBoss ? 75 : 120 + Math.random() * 50;
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.linearRampToValueAtTime(baseFreq * 0.7, t + (isBoss ? 0.6 : 0.35));

      gain.gain.setValueAtTime(0.2 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + (isBoss ? 0.6 : 0.35));

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + (isBoss ? 0.65 : 0.4));
    } catch {}
  }

  /** Grenade explosion */
  public playExplosion() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Heavy bass rumble
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.exponentialRampToValueAtTime(20, t + 0.6);
      oscGain.gain.setValueAtTime(0.8 * this.volume, t);
      oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.65);

      // Noise blast
      const bufferSize = this.ctx.sampleRate * 0.45;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, t);
      filter.frequency.exponentialRampToValueAtTime(60, t + 0.45);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.6 * this.volume, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(t);
    } catch {}
  }

  /** Player hurt impact */
  public playPlayerHurt() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.2);

      gain.gain.setValueAtTime(0.4 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.22);
    } catch {}
  }

  /** Coin / Supply pickup chime */
  public playPickup() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, t);
      osc.frequency.setValueAtTime(880, t + 0.06);

      gain.gain.setValueAtTime(0.2 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.16);
    } catch {}
  }

  /** Mission Victory Fanfare */
  public playVictory() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const notes = [440, 554, 659, 880];
      const startT = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const t = startT + idx * 0.12;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.25 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t);
        osc.stop(t + 0.26);
      });
    } catch {}
  }

  /** Ambient city tension drone */
  public startAmbientDrone() {
    if (!this.musicEnabled) return;
    try {
      this.initContext();
      if (!this.ctx || this.ambientOsc1) return;
      const t = this.ctx.currentTime;

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.08 * this.volume, t);
      this.musicGain.connect(this.ctx.destination);

      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = 'sine';
      this.ambientOsc1.frequency.setValueAtTime(55, t); // Low A
      this.ambientOsc1.connect(this.musicGain);
      this.ambientOsc1.start();

      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = 'triangle';
      this.ambientOsc2.frequency.setValueAtTime(82.4, t); // Low E
      this.ambientOsc2.connect(this.musicGain);
      this.ambientOsc2.start();
    } catch {}
  }

  public stopAmbientDrone() {
    try {
      if (this.ambientOsc1) {
        this.ambientOsc1.stop();
        this.ambientOsc1.disconnect();
        this.ambientOsc1 = null;
      }
      if (this.ambientOsc2) {
        this.ambientOsc2.stop();
        this.ambientOsc2.disconnect();
        this.ambientOsc2 = null;
      }
      this.musicGain = null;
    } catch {}
  }
}

export const sound = new SoundService();
