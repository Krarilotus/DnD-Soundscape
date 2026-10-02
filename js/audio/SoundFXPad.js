/**
 * DnD-Soundscape: Sound FX Pad & One-Shot Trigger Engine
 */

export class SoundFXPad {
  constructor(audioCtx, effectsBusNode, synthEngine) {
    this.ctx = audioCtx;
    this.destination = effectsBusNode;
    this.synth = synthEngine;
    this.bufferCache = new Map();
    this.currentTriggers = [];
    this.basePath = '';
  }

  setTriggers(triggers = [], basePath = '') {
    this.currentTriggers = triggers;
    if (basePath) this.basePath = basePath;
    const bp = basePath || this.basePath;
    // Preload triggers
    for (const trig of triggers) {
      if (trig.file) {
        let filePath = trig.file;
        if (bp && !filePath.startsWith('http') && !filePath.startsWith('/')) {
          filePath = `${bp}/${filePath}`.replace(/\/\//g, '/');
        }
        this.preloadEffect(filePath);
      }
    }
  }

  async preloadEffect(filePath) {
    if (this.bufferCache.has(filePath)) return;
    try {
      const resp = await fetch(filePath);
      if (resp.ok) {
        const arrayBuf = await resp.arrayBuffer();
        const audioBuf = await this.ctx.decodeAudioData(arrayBuf);
        this.bufferCache.set(filePath, audioBuf);
      }
    } catch (e) {
      console.warn(`Could not preload SFX ${filePath}:`, e);
    }
  }

  playTrigger(triggerId, basePath = '') {
    const trigger = this.currentTriggers.find(t => t.id === triggerId);
    if (!trigger) return;

    let filePath = trigger.file;
    const bp = basePath || this.basePath;
    if (bp && filePath && !filePath.startsWith('http') && !filePath.startsWith('/')) {
      filePath = `${bp}/${filePath}`.replace(/\/\//g, '/');
    }

    if (filePath && this.bufferCache.has(filePath)) {
      const buffer = this.bufferCache.get(filePath);
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(this.destination);
      src.start();
    } else if (filePath) {
      // Direct audio element fallback
      const audio = new Audio(filePath);
      const src = this.ctx.createMediaElementSource(audio);
      src.connect(this.destination);
      audio.play().catch(() => {
        // Synthesis fallback
        this.synth.playOneShotSynth(trigger.id, this.destination);
      });
    } else {
      // Synthesize
      this.synth.playOneShotSynth(trigger.id, this.destination);
    }
  }
}
