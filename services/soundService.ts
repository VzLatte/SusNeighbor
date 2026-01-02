class SoundService {
  private ctx: AudioContext | null = null;
  private currentBGM: { nodes: AudioNode[], type: 'MENU' | 'MEETING' | null } | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createOsc(type: OscillatorType, freq: number, duration: number, volume: number = 0.1) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Loop-based BGM Synthesis
  startBGM(type: 'MENU' | 'MEETING') {
    this.init();
    if (!this.ctx) return;
    if (this.currentBGM?.type === type) return;
    this.stopBGM();

    const nodes: AudioNode[] = [];
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(type === 'MENU' ? 0.05 : 0.03, this.ctx.currentTime + 2);
    masterGain.connect(this.ctx.destination);
    nodes.push(masterGain);

    if (type === 'MENU') {
      // Deep rhythmic pulse
      const createPulse = (freq: number, startTime: number) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        g.gain.setValueAtTime(0.1, startTime);
        g.gain.exponentialRampToValueAtTime(0.001, startTime + 2);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + 2);
      };

      const loop = () => {
        if (this.currentBGM?.type !== 'MENU') return;
        const now = this.ctx!.currentTime;
        createPulse(60, now);
        createPulse(65, now + 1);
        setTimeout(loop, 2000);
      };
      loop();
    } else {
      // Tense meeting ambient drone
      const freqs = [110, 111, 220, 330];
      freqs.forEach(f => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, this.ctx!.currentTime);
        g.gain.setValueAtTime(0.02, this.ctx!.currentTime);
        
        // Slight LFO-like movement
        const lfo = this.ctx!.createOscillator();
        lfo.frequency.setValueAtTime(0.2, this.ctx!.currentTime);
        const lfoGain = this.ctx!.createGain();
        lfoGain.gain.setValueAtTime(0.01, this.ctx!.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(g.gain);
        lfo.start();
        
        osc.connect(g);
        g.connect(masterGain);
        osc.start();
        nodes.push(osc, lfo);
      });
    }

    this.currentBGM = { nodes, type };
  }

  stopBGM() {
    if (this.currentBGM) {
      this.currentBGM.nodes.forEach(n => {
        try { (n as any).stop?.(); } catch(e) {}
        n.disconnect();
      });
      this.currentBGM = null;
    }
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
    tones.forEach((t, i) => {
      setTimeout(() => this.createOsc('triangle', t, 1.5, 0.1), i * 150);
    });
  }

  playDefeat() {
    const tones = [311.13, 293.66, 261.63, 196.00]; 
    tones.forEach((t, i) => {
      setTimeout(() => this.createOsc('square', t, 1.0, 0.05), i * 300);
    });
  }

  playTick() {
    this.createOsc('sine', 1200, 0.05, 0.03);
  }

  playPass() {
    this.createOsc('sine', 440, 0.1, 0.05);
    setTimeout(() => this.createOsc('sine', 554.37, 0.15, 0.05), 80);
  }

  playClick() {
    this.createOsc('sine', 600, 0.05, 0.02);
  }

  playTransition() {
    this.createOsc('sine', 200, 0.5, 0.1);
    const now = this.ctx?.currentTime || 0;
    const osc = this.ctx?.createOscillator();
    const gain = this.ctx?.createGain();
    if (osc && gain && this.ctx) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.3);
    }
  }
}

export const soundService = new SoundService();