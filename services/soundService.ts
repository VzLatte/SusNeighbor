
/**
 * SoundService: Final Bulletproof Version
 * Restores all original SFX methods while fixing MP3 loading and race conditions.
 */
class SoundService {
  private ctx: AudioContext | null = null;
  private currentBGM: { nodes: AudioNode[], type: 'MENU' | 'MEETING' | 'SECRET' | null, masterGain?: GainNode } | null = null;
  private secretLoopTimeout: any = null;

  private menuAudio: HTMLAudioElement | null = null;
  private secretAudio: HTMLAudioElement | null = null;
  private activePlayPromise: Promise<void> | null = null;

  private isUsingFallback: boolean = false;
  private bgmVolume: number = 0.5;

  // ENSURE THESE LINKS ARE PUBLIC AND ACCURATE
  private readonly MENU_URL = "https://raw.githubusercontent.com/VzLatte/SusNeighbor/refs/heads/main/menu_music.mp3";
  private readonly SECRET_URL = "https://raw.githubusercontent.com/VzLatte/SusNeighbor/refs/heads/main/secret_song.mp3";

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  public getBGMType() {
    return this.currentBGM?.type || null;
  }

  public setBGMVolume(volume: number) {
    this.bgmVolume = volume;
    // Update active HTML audio elements
    if (this.menuAudio) {
      this.menuAudio.volume = volume * 0.35;
    }
    if (this.secretAudio) {
      this.secretAudio.volume = volume * 0.7;
    }
    // Update active Synth gain nodes
    if (this.currentBGM?.masterGain) {
      const now = this.init().currentTime;
      this.currentBGM.masterGain.gain.setTargetAtTime(this.getSynthTargetVolume(this.currentBGM.type), now, 0.1);
    }
  }

  private getSynthTargetVolume(type: 'MENU' | 'MEETING' | 'SECRET' | null): number {
    if (type === 'MEETING') return this.bgmVolume * 0.15;
    if (type === 'SECRET' || type === 'MENU') return this.bgmVolume * 0.6; // Fallback synth volume
    return 0;
  }

  /**
   * Starts the background music.
   */
  async startBGM(type: 'MENU' | 'MEETING' | 'SECRET') {
    const context = this.init();
    if (context.state === 'suspended') await context.resume();

    if (this.currentBGM?.type === type && !this.isUsingFallback) return;

    // Handle any pending play promises to avoid interruptions
    if (this.activePlayPromise) {
      try { await this.activePlayPromise; } catch (e) { }
    }

    this.stopBGM();

    if (type === 'MENU' || type === 'SECRET') {
      this.isUsingFallback = false;
      const url = type === 'MENU' ? this.MENU_URL : this.SECRET_URL;
      const audioEl = new Audio(url);
      audioEl.loop = true;
      audioEl.crossOrigin = "anonymous"; 
      
      const multiplier = type === 'MENU' ? 0.35 : 0.7;
      audioEl.volume = this.bgmVolume * multiplier;

      if (type === 'MENU') this.menuAudio = audioEl;
      else this.secretAudio = audioEl;

      try {
        this.activePlayPromise = audioEl.play();
        await this.activePlayPromise;
        this.currentBGM = { nodes: [], type };
      } catch (err) {
        console.warn(`${type} audio failed. Starting synth fallback.`, err);
        this.isUsingFallback = true;
        this.startSynthSecret(type); 
      }
      return;
    }

    if (type === 'MEETING') {
       this.startMeetingSynth();
    }
  }

  private startMeetingSynth() {
    const context = this.init();
    const nodes: AudioNode[] = [];
    const masterGain = context.createGain();
    masterGain.gain.setValueAtTime(0, context.currentTime);
    masterGain.gain.linearRampToValueAtTime(this.getSynthTargetVolume('MEETING'), context.currentTime + 1.5);
    masterGain.connect(context.destination);
    nodes.push(masterGain);

    [110, 111, 220, 330].forEach(f => {
      const osc = context.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, context.currentTime);
      osc.connect(masterGain);
      osc.start();
      nodes.push(osc);
    });
    
    this.currentBGM = { nodes, type: 'MEETING', masterGain };
  }

  private startSynthSecret(fallbackType: 'MENU' | 'SECRET') {
    const context = this.init();
    const nodes: AudioNode[] = [];
    const masterGain = context.createGain();
    masterGain.gain.setValueAtTime(0, context.currentTime);
    masterGain.gain.linearRampToValueAtTime(this.getSynthTargetVolume(fallbackType), context.currentTime + 0.1);
    masterGain.connect(context.destination);
    nodes.push(masterGain);

    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, context.currentTime);
    filter.Q.setValueAtTime(10, context.currentTime);
    filter.connect(masterGain);
    nodes.push(filter);

    const playKick = (startTime: number) => {
      const osc = context.createOscillator();
      const g = context.createGain();
      osc.frequency.setValueAtTime(200, startTime);
      osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.3);
      g.gain.setValueAtTime(1.0, startTime);
      g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
      osc.connect(g).connect(masterGain);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    };

    const playNote = (freq: number, startTime: number, vol: number = 0.3, dur: number = 0.2, type: OscillatorType = 'sawtooth') => {
      const osc = context.createOscillator();
      const g = context.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      g.gain.setValueAtTime(vol, startTime);
      g.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);
      osc.connect(g).connect(filter);
      osc.start(startTime);
      osc.stop(startTime + dur);
    };

    const loop = () => {
      if (this.currentBGM?.type !== fallbackType) return;
      const now = context.currentTime + 0.1;
      const tempo = 0.16;

      for (let i = 0; i < 8; i += 2) playKick(now + i * tempo);

      const bassLine = [220, 220, 261.63, 220, 293.66, 220, 329.63, 261.63];
      bassLine.forEach((note, i) => playNote(note, now + i * tempo, 0.4, tempo * 0.8, 'sawtooth'));

      this.secretLoopTimeout = setTimeout(loop, tempo * 8 * 1000);
    };

    this.currentBGM = { nodes, type: fallbackType, masterGain };
    loop();
  }

  stopBGM() {
    if (this.secretLoopTimeout) clearTimeout(this.secretLoopTimeout);
    
    [this.menuAudio, this.secretAudio].forEach(el => {
      if (el) {
        el.pause();
        el.src = "";
        el.load();
      }
    });
    this.menuAudio = null;
    this.secretAudio = null;

    if (this.currentBGM) {
      this.currentBGM.nodes.forEach(node => {
        try { (node as any).stop?.(); } catch (e) { }
        node.disconnect();
      });
    }
    this.currentBGM = null;
  }

  // --- ALL ORIGINAL SFX METHODS RESTORED ---

  private createOsc(type: OscillatorType, freq: number, duration: number, volume: number = 0.1) {
    const context = this.init();
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, context.currentTime);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    osc.connect(gain).connect(context.destination);
    osc.start();
    osc.stop(context.currentTime + duration);
  }

  playReveal() {
    this.createOsc('sine', 440, 0.5, 0.1);
    setTimeout(() => this.createOsc('sine', 880, 0.3, 0.05), 50);
  }

  playLockIn() {
    this.createOsc('triangle', 330, 0.2, 0.1);
    setTimeout(() => this.createOsc('triangle', 660, 0.2, 0.1), 100);
  }

  playCaught() {
    this.createOsc('sawtooth', 110, 0.8, 0.2);
    this.createOsc('sawtooth', 115, 0.8, 0.2);
  }

  playError() {
    this.createOsc('sawtooth', 150, 0.2, 0.1);
    setTimeout(() => this.createOsc('sawtooth', 100, 0.3, 0.1), 50);
  }

  playVictory() {
    const tones = [523.25, 659.25, 783.99, 1046.50];
    tones.forEach((t, i) => setTimeout(() => this.createOsc('triangle', t, 1.5, 0.1), i * 150));
  }

  playDefeat() {
    const tones = [311.13, 293.66, 261.63, 196.00];
    tones.forEach((t, i) => setTimeout(() => this.createOsc('square', t, 1.0, 0.05), i * 300));
  }

  playTick() { this.createOsc('sine', 1200, 0.05, 0.03); }

  playPass() {
    this.createOsc('sine', 440, 0.1, 0.05);
    setTimeout(() => this.createOsc('sine', 554.37, 0.15, 0.05), 80);
  }

  playClick() { this.createOsc('sine', 600, 0.05, 0.02); }

  playTransition() {
    const context = this.init();
    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain).connect(context.destination);
    osc.start();
    osc.stop(now + 0.3);
  }
}

export const soundService = new SoundService();
