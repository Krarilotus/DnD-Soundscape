/**
 * DnD-Soundscape: Equal-Power Crossfader Engine
 * Implements smooth cosine/sine equal-power transitions between stages and tracks.
 * Outgoing music fades out from its configured level down to 0.
 * Incoming music fades in from 0 up to its configured target level.
 */

export class Crossfader {
  constructor(audioCtx) {
    this.ctx = audioCtx;
  }

  getFadeDuration(profileOrSec, defaultSec = 4.0) {
    if (typeof profileOrSec === 'number') return profileOrSec;
    switch (profileOrSec) {
      case 'instant': return 0.05;
      case 'fast': return 1.5;
      case 'slow': return 8.0;
      case 'default':
      default: return defaultSec;
    }
  }

  crossfade(outgoingEngine, incomingEngine, durationSec = 4.0, onComplete = null, targetGain = 1.0) {
    const dur = Math.max(0.05, durationSec);
    const now = this.ctx.currentTime;
    const startTime = now + 0.01;

    // 1. Fade in incoming track (starts at 0.0001, ramps up to targetGain along equal-power sine curve)
    if (incomingEngine) {
      incomingEngine.currentGain = targetGain;
      incomingEngine.play(0, targetGain, true);

      const gainParam = incomingEngine.gainNode.gain;
      gainParam.cancelScheduledValues(startTime);
      gainParam.setValueAtTime(0.0001, startTime);

      const steps = 24;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const gainVal = Math.max(0.0001, targetGain * Math.sin(t * 0.5 * Math.PI));
        gainParam.linearRampToValueAtTime(gainVal, startTime + t * dur);
      }
    }

    // 2. Fade out outgoing track (starts at its existing gain, ramps down to 0 along equal-power cosine curve)
    if (outgoingEngine && outgoingEngine.isPlaying) {
      const startGain = Math.max(0.0001, outgoingEngine.currentGain || outgoingEngine.gainNode.gain.value || 0.7);
      const gainParam = outgoingEngine.gainNode.gain;
      gainParam.cancelScheduledValues(startTime);
      gainParam.setValueAtTime(startGain, startTime);

      const steps = 24;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const gainVal = Math.max(0.0001, startGain * Math.cos(t * 0.5 * Math.PI));
        gainParam.linearRampToValueAtTime(gainVal, startTime + t * dur);
      }

      setTimeout(() => {
        outgoingEngine.currentGain = 0;
        outgoingEngine.stopImmediate();
        if (onComplete) onComplete();
      }, (dur + 0.1) * 1000);
    } else {
      if (onComplete) setTimeout(onComplete, dur * 1000);
    }
  }
}
