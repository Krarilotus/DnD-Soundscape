/**
 * DnD-Soundscape: Built-in Procedural Audio Synthesizer (Web Audio API)
 * Provides real-time procedural soundscapes and fallback sounds.
 */

export class ProceduralSynth {
  constructor(audioCtx) {
    this.ctx = audioCtx;
    this.activeNodes = [];
  }

  createTavernLuteBuffer(duration = 16) {
    const sr = this.ctx.sampleRate;
    const numSamples = sr * duration;
    const buffer = this.ctx.createBuffer(2, numSamples, sr);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    const freqs = [146.83, 174.61, 220.0, 261.63, 293.66, 329.63, 349.23, 440.0];
    for (let bar = 0; bar < duration; bar += 0.5) {
      const f = freqs[Math.floor((bar * 3) % freqs.length)];
      const startIdx = Math.floor(bar * sr);
      const noteLen = Math.floor(1.8 * sr);
      for (let i = 0; i < noteLen; i++) {
        const idx = (startIdx + i) % numSamples;
        const t = i / sr;
        const env = Math.exp(-t * 3.0) * (1 - Math.exp(-t * 60));
        const val = (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(4 * Math.PI * f * t)) * env * 0.25;
        left[idx] += val;
        right[idx] += val * 0.9;
      }
    }
    return buffer;
  }

  createCampfireBuffer(duration = 16) {
    const sr = this.ctx.sampleRate;
    const numSamples = sr * duration;
    const buffer = this.ctx.createBuffer(2, numSamples, sr);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    let b0 = 0, b1 = 0;
    for (let i = 0; i < numSamples; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.98 * b0 + white * 0.05;
      b1 = 0.95 * b1 + white * 0.03;
      left[i] = (b0 + b1) * 0.3;
      right[i] = (b0 + b1) * 0.3;
    }

    // Intermittent crackles
    const numPops = duration * 20;
    for (let p = 0; p < numPops; p++) {
      const startIdx = Math.floor(Math.random() * numSamples);
      const popLen = Math.floor(200 + Math.random() * 800);
      for (let j = 0; j < popLen; j++) {
        const idx = (startIdx + j) % numSamples;
        const decay = Math.exp(-j / (popLen * 0.2));
        const pop = (Math.random() * 2 - 1) * decay * 0.5;
        left[idx] += pop;
        right[idx] += pop * 0.8;
      }
    }
    return buffer;
  }

  createDungeonDroneBuffer(duration = 16) {
    const sr = this.ctx.sampleRate;
    const numSamples = sr * duration;
    const buffer = this.ctx.createBuffer(2, numSamples, sr);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sr;
      const f1 = 65.41;
      const s1 = Math.sin(2 * Math.PI * f1 * t) * 0.3;
      const s2 = Math.sin(2 * Math.PI * (f1 * 1.5) * t) * 0.15 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.1 * t));
      left[i] = s1 + s2;
      right[i] = s1 + s2;
    }
    return buffer;
  }

  createWarDrumsBuffer(duration = 16) {
    const sr = this.ctx.sampleRate;
    const numSamples = sr * duration;
    const buffer = this.ctx.createBuffer(2, numSamples, sr);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    const beats = duration * 2;
    for (let b = 0; b < beats; b++) {
      const startIdx = Math.floor(b * 0.5 * sr);
      const hitLen = Math.floor(0.4 * sr);
      for (let j = 0; j < hitLen; j++) {
        const idx = (startIdx + j) % numSamples;
        const t = j / sr;
        const pitch = 65 * (1.0 + 2.0 * Math.exp(-t * 50));
        const env = Math.exp(-t * 8);
        const sig = Math.sin(2 * Math.PI * pitch * t) * env * 0.6;
        left[idx] += sig;
        right[idx] += sig;
      }
    }
    return buffer;
  }

  playOneShotSynth(type, destination) {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'thunder') {
      // Thunder noise burst
      const noise = this.ctx.createBufferSource();
      const sr = this.ctx.sampleRate;
      const b = this.ctx.createBuffer(1, sr * 3, sr);
      const d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.8));
      noise.buffer = b;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, now);

      gain.gain.setValueAtTime(1.0, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(destination);
      noise.start(now);
      noise.stop(now + 3);
    } else if (type === 'spell') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 1.2);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc.connect(gain);
      gain.connect(destination);
      osc.start(now);
      osc.stop(now + 1.6);
    } else {
      // Default sword / impact
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(destination);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  }
}
