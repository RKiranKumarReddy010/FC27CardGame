// Web Audio API Sound Generator for FC Clash Card Game
class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15, pitchBend = null) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (pitchBend) {
        osc.frequency.exponentialRampToValueAtTime(pitchBend, this.ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  playSelect() {
    this.playTone(520, 'triangle', 0.08, 0.2, 780);
  }

  playHover() {
    this.playTone(380, 'sine', 0.04, 0.05);
  }

  playCardFlip() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    // White noise swoosh
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  playClash() {
    this.playTone(180, 'sawtooth', 0.25, 0.3, 60);
    setTimeout(() => this.playTone(320, 'triangle', 0.18, 0.2, 120), 40);
  }

  playWin() {
    if (this.muted) return;
    // Ascending arpeggio
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.18, 0.22);
      }, idx * 60);
    });
  }

  playLose() {
    if (this.muted) return;
    // Descending notes
    const notes = [440, 370, 311, 220];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.2, 0.18);
      }, idx * 80);
    });
  }

  playTie() {
    this.playTone(350, 'square', 0.15, 0.15);
    setTimeout(() => this.playTone(350, 'square', 0.2, 0.15), 160);
  }

  playFanfare() {
    if (this.muted) return;
    const chords = [
      [523.25, 659.25, 783.99], // C major
      [587.33, 739.99, 880.00], // D major
      [659.25, 830.61, 987.77], // E major
      [1046.50, 1318.51, 1567.98] // High C
    ];
    chords.forEach((chord, i) => {
      setTimeout(() => {
        chord.forEach(freq => this.playTone(freq, 'triangle', 0.4, 0.15));
      }, i * 200);
    });
  }
}

export const sounds = new SoundManager();
