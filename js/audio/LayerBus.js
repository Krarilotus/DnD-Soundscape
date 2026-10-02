/**
 * DnD-Soundscape: Layer Bus Channel Strip (Music, Ambience, Effects)
 * Handles individual gain control, analyser nodes, mute, and solo.
 */

export class LayerBus {
  constructor(name, audioCtx, destinationNode) {
    this.name = name; // 'music' | 'ambience' | 'effects'
    this.ctx = audioCtx;
    
    this.inputNode = this.ctx.createGain();
    this.gainNode = this.ctx.createGain();
    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 64;
    this.analyserData = new Uint8Array(this.analyserNode.frequencyBinCount);

    // Audio routing: inputNode -> gainNode -> analyserNode -> destinationNode
    this.inputNode.connect(this.gainNode);
    this.gainNode.connect(this.analyserNode);
    this.analyserNode.connect(destinationNode);

    this.volume = 0.8;
    this.isMuted = false;
    this.isSolo = false;
  }

  setVolume(val, rampSec = 0.05) {
    this.volume = Math.max(0, Math.min(1, val));
    if (!this.isMuted) {
      const now = this.ctx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.linearRampToValueAtTime(this.volume, now + rampSec);
    }
  }

  setMute(mute) {
    this.isMuted = mute;
    const now = this.ctx.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    if (this.isMuted) {
      this.gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.05);
    } else {
      this.gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.05);
    }
  }

  toggleMute() {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  getPeakLevel() {
    this.analyserNode.getByteFrequencyData(this.analyserData);
    let sum = 0;
    for (let i = 0; i < this.analyserData.length; i++) {
      sum += this.analyserData[i];
    }
    const avg = sum / this.analyserData.length;
    return avg / 255; // 0.0 to 1.0
  }
}
