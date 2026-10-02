/**
 * DnD-Soundscape: Equal-Power Crossfader Engine
 * Implements smooth cosine/sine equal-power transitions between stages and tracks.
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

  crossfade(outgoingEngine, incomingEngine, durationSec = 4.0, onComplete = null) {
    const now = this.ctx.currentTime;
    const dur = Math.max(0.05, durationSec);

    // Fade in incoming
    if (incomingEngine) {
      incomingEngine.play(0.01);
      incomingEngine.gainNode.gain.cancelScheduledValues(now);
      incomingEngine.gainNode.gain.setValueAtTime(0.001, now);
      
      // Equal power curve points
      const steps = 20;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const gainIn = Math.sin(t * 0.5 * Math.PI);
        incomingEngine.gainNode.gain.linearRampToValueAtTime(gainIn, now + t * dur);
      }
    }

    // Fade out outgoing
    if (outgoingEngine && outgoingEngine.isPlaying) {
      outgoingEngine.gainNode.gain.cancelScheduledValues(now);
      const startGain = outgoingEngine.gainNode.gain.value;
      const steps = 20;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const gainOut = startGain * Math.cos(t * 0.5 * Math.PI);
        outgoingEngine.gainNode.gain.linearRampToValueAtTime(Math.max(0.0001, gainOut), now + t * dur);
      }

      setTimeout(() => {
        outgoingEngine.stop(0.05);
        if (onComplete) onComplete();
      }, dur * 1000 + 50);
    } else {
      if (onComplete) setTimeout(onComplete, dur * 1000);
    }
  }
}
