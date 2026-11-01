/**
 * WishCraft AI — Royalty-Free Web Audio API Melodic Synthesizer
 * 100% Client-Side, Zero External Dependencies, Zero Copyright Issues.
 */

class WishCraftAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.currentTrack = 'birthday_celebration';
    this.loopTimer = null;
    this.masterGain = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a soft acoustic chime tone with harmonic resonance
  playTone(freq, startTime, duration = 0.5, type = 'sine', gainVal = 0.3) {
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainVal, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  // Synthesize "Happy Birthday" celebratory melody
  playBirthdayTune() {
    this.initContext();
    this.isPlaying = true;
    const now = this.ctx.currentTime;

    // Happy Birthday notes (in Hz): C4, C4, D4, C4, F4, E4 ...
    const notes = [
      { f: 261.63, d: 0.35, t: 0.0 },
      { f: 261.63, d: 0.35, t: 0.4 },
      { f: 293.66, d: 0.7,  t: 0.8 },
      { f: 261.63, d: 0.7,  t: 1.6 },
      { f: 349.23, d: 0.7,  t: 2.4 },
      { f: 329.63, d: 1.2,  t: 3.2 },

      { f: 261.63, d: 0.35, t: 4.6 },
      { f: 261.63, d: 0.35, t: 5.0 },
      { f: 293.66, d: 0.7,  t: 5.4 },
      { f: 261.63, d: 0.7,  t: 6.2 },
      { f: 392.00, d: 0.7,  t: 7.0 },
      { f: 349.23, d: 1.2,  t: 7.8 },

      { f: 261.63, d: 0.35, t: 9.2 },
      { f: 261.63, d: 0.35, t: 9.6 },
      { f: 523.25, d: 0.7,  t: 10.0 },
      { f: 440.00, d: 0.7,  t: 10.8 },
      { f: 349.23, d: 0.7,  t: 11.6 },
      { f: 329.63, d: 0.7,  t: 12.4 },
      { f: 293.66, d: 1.2,  t: 13.2 },

      { f: 466.16, d: 0.35, t: 14.6 },
      { f: 466.16, d: 0.35, t: 15.0 },
      { f: 440.00, d: 0.7,  t: 15.4 },
      { f: 349.23, d: 0.7,  t: 16.2 },
      { f: 392.00, d: 0.7,  t: 17.0 },
      { f: 349.23, d: 1.8,  t: 17.8 }
    ];

    notes.forEach(n => {
      this.playTone(n.f, now + n.t, n.d, 'triangle', 0.25);
      // Soft overtone chime
      this.playTone(n.f * 2, now + n.t, n.d * 0.8, 'sine', 0.08);
    });

    // Auto-loop after 20 seconds if still active
    this.loopTimer = setTimeout(() => {
      if (this.isPlaying) this.playBirthdayTune();
    }, 20500);
  }

  // Synthesize Romantic Music Box Arpeggio
  playRomanticMelody() {
    this.initContext();
    this.isPlaying = true;
    const now = this.ctx.currentTime;

    // Delicate music box progression in A major / F# minor
    const chords = [
      [220.00, 277.18, 329.63, 440.00], // A
      [185.00, 220.00, 277.18, 370.00], // F#m
      [246.94, 293.66, 369.99, 493.88], // Bm
      [164.81, 246.94, 329.63, 415.30]  // E
    ];

    let offset = 0;
    chords.forEach((chord) => {
      chord.forEach((freq, i) => {
        this.playTone(freq, now + offset + (i * 0.45), 1.6, 'sine', 0.2);
        this.playTone(freq * 2, now + offset + (i * 0.45), 1.2, 'triangle', 0.06);
      });
      offset += 2.2;
    });

    this.loopTimer = setTimeout(() => {
      if (this.isPlaying) this.playRomanticMelody();
    }, 9500);
  }

  // Synthesize Upbeat Celebration Fanfare
  playCelebrationTune() {
    this.initContext();
    this.isPlaying = true;
    const now = this.ctx.currentTime;

    const notes = [
      { f: 392.00, t: 0.0 }, { f: 523.25, t: 0.3 }, { f: 659.25, t: 0.6 },
      { f: 783.99, t: 0.9 }, { f: 659.25, t: 1.4 }, { f: 783.99, t: 1.8 }
    ];

    notes.forEach(n => {
      this.playTone(n.f, now + n.t, 0.8, 'triangle', 0.25);
    });

    this.loopTimer = setTimeout(() => {
      if (this.isPlaying) this.playCelebrationTune();
    }, 8000);
  }

  // Candle blow-out sound effect: Soft breath whoosh + celebratory chime cascade
  playBlowOutSound() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;

    // 1. Whoosh noise buffer
    const bufferSize = this.ctx.sampleRate * 0.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(200, now + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    whiteNoise.start(now);

    // 2. Triumphant sparkle chimes right after
    setTimeout(() => {
      const chimes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      const chimeNow = this.ctx.currentTime;
      chimes.forEach((f, idx) => {
        this.playTone(f, chimeNow + idx * 0.08, 1.2, 'sine', 0.28);
      });
    }, 300);
  }

  // Toggle playback
  toggle(track = 'birthday_celebration') {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play(track);
    }
  }

  play(track = 'birthday_celebration') {
    this.pause();
    this.currentTrack = track;
    if (track.includes('romantic')) {
      this.playRomanticMelody();
    } else if (track.includes('friendship') || track.includes('celebration')) {
      this.playCelebrationTune();
    } else {
      this.playBirthdayTune();
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}

// Global audio singleton
window.wishAudio = new WishCraftAudio();
