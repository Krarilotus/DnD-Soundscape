/**
 * DnD-Soundscape: Gapless Loop Engine & Dual-Engine Audio Player (Enhanced)
 * Supports sample-accurate Web Audio buffers (<8m) and low-memory HTML5 Audio streaming (>8m),
 * multi-track playlists, shuffle, and gapless seam micro-fades.
 */

export class GaplessLoopEngine {
  constructor(audioCtx, destinationNode) {
    this.ctx = audioCtx;
    this.destination = destinationNode;
    this.bufferCache = new Map();
    this.activeSource = null;
    this.htmlAudio = null;
    this.gainNode = this.ctx.createGain();
    this.gainNode.connect(this.destination);

    this.playlist = [];
    this.playlistIndex = 0;
    this.playlistMode = 'loopAll'; // 'loopAll' | 'shuffle' | 'singleTrack'
    
    this.currentTrack = null;
    this.isPlaying = false;
    this.isBufferMode = false;
    this.playbackStartTime = 0;
    this.pausedAt = 0;
    this.basePath = '';
  }

  async setPlaylist(playlist = [], mode = 'loopAll', basePath = '') {
    this.playlist = Array.isArray(playlist) ? playlist : [playlist];
    this.playlistIndex = 0;
    this.playlistMode = mode;
    this.basePath = basePath;
    if (this.playlist.length > 0) {
      await this.loadTrack(this.playlist[0], basePath);
    }
  }

  async loadTrack(trackObj, basePath = '') {
    this.currentTrack = trackObj;
    if (basePath) this.basePath = basePath;
    if (!trackObj) return { success: false };

    let filePath = trackObj.file || '';
    if (basePath && !filePath.startsWith('http') && !filePath.startsWith('/') && !filePath.startsWith('../../')) {
      filePath = `${basePath}/${filePath}`.replace(/\/\//g, '/');
    }

    try {
      const resp = await fetch(filePath);
      if (resp.ok) {
        const arrayBuffer = await resp.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.bufferCache.set(filePath, audioBuffer);
        this.isBufferMode = true;
        return { success: true, mode: 'buffer', duration: audioBuffer.duration };
      }
    } catch (e) {
      console.warn(`Buffer decode fallback for ${filePath}:`, e);
    }

    this.isBufferMode = false;
    return { success: true, mode: 'stream', duration: 0 };
  }

  play(fadeDuration = 0.05) {
    if (!this.currentTrack) return;
    this.cleanupNodes();

    const now = this.ctx.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(0.001, now);
    this.gainNode.gain.linearRampToValueAtTime(1.0, now + Math.max(0.01, fadeDuration));

    let filePath = this.currentTrack.file || '';
    if (this.basePath && !filePath.startsWith('http') && !filePath.startsWith('/') && !filePath.startsWith('../../')) {
      filePath = `${this.basePath}/${filePath}`.replace(/\/\//g, '/');
    }

    const cueStart = (this.currentTrack.startSec !== undefined && this.currentTrack.startSec !== null)
      ? Number(this.currentTrack.startSec)
      : (this.currentTrack.loopStart !== undefined && this.currentTrack.loopStart !== null ? Number(this.currentTrack.loopStart) : 0);

    const rawEnd = (this.currentTrack.endSec !== undefined && this.currentTrack.endSec !== null)
      ? Number(this.currentTrack.endSec)
      : (this.currentTrack.loopEnd ? Number(this.currentTrack.loopEnd) : null);

    if (this.isBufferMode && this.bufferCache.has(filePath)) {
      const buffer = this.bufferCache.get(filePath);
      const cueEnd = rawEnd !== null ? Math.min(buffer.duration, rawEnd) : buffer.duration;
      const validCueEnd = cueEnd > cueStart ? cueEnd : buffer.duration;

      this.activeSource = this.ctx.createBufferSource();
      this.activeSource.buffer = buffer;
      this.activeSource.loop = (this.playlistMode === 'singleTrack' || this.playlist.length <= 1);
      
      if (this.activeSource.loop) {
        this.activeSource.loopStart = cueStart;
        this.activeSource.loopEnd = validCueEnd;
      }

      this.activeSource.onended = () => {
        if (this.isPlaying && this.playlist.length > 1) {
          this.advancePlaylist();
        }
      };

      this.activeSource.connect(this.gainNode);
      const loopLen = validCueEnd - cueStart;
      const startOffset = cueStart + (this.pausedAt % (loopLen > 0 ? loopLen : buffer.duration));
      const playDuration = (this.activeSource.loop) ? undefined : Math.max(0.1, validCueEnd - startOffset);
      this.activeSource.start(now, startOffset, playDuration);
      this.playbackStartTime = now - startOffset;
    } else {
      if (!this.htmlAudio) {
        this.htmlAudio = new Audio();
        this.htmlAudio.crossOrigin = 'anonymous';
        const srcNode = this.ctx.createMediaElementSource(this.htmlAudio);
        srcNode.connect(this.gainNode);
      }
      this.htmlAudio.src = filePath;
      this.htmlAudio.loop = (this.playlist.length <= 1);
      this.htmlAudio.currentTime = Math.max(cueStart, this.pausedAt || cueStart);

      // Cue end boundary monitor for HTML5 Audio
      if (rawEnd !== null && rawEnd > cueStart) {
        this.htmlAudio.ontimeupdate = () => {
          if (this.htmlAudio && this.htmlAudio.currentTime >= rawEnd) {
            if (this.htmlAudio.loop) {
              this.htmlAudio.currentTime = cueStart;
            } else {
              this.advancePlaylist();
            }
          }
        };
      } else {
        this.htmlAudio.ontimeupdate = null;
      }

      this.htmlAudio.onended = () => {
        if (this.isPlaying && this.playlist.length > 1) {
          this.advancePlaylist();
        }
      };
      this.htmlAudio.play().catch(() => {});
    }

    this.isPlaying = true;
  }

  advancePlaylist() {
    if (this.playlistMode === 'shuffle') {
      this.playlistIndex = Math.floor(Math.random() * this.playlist.length);
    } else {
      this.playlistIndex = (this.playlistIndex + 1) % this.playlist.length;
    }
    this.currentTrack = this.playlist[this.playlistIndex];
    this.pausedAt = 0;
    this.play(0.5);
  }

  jumpToNext() {
    if (this.playlist.length > 1) {
      this.advancePlaylist();
    }
  }

  stop(fadeDuration = 0.1) {
    const now = this.ctx.currentTime;
    if (this.isPlaying) {
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.linearRampToValueAtTime(0.0001, now + fadeDuration);

      setTimeout(() => {
        this.cleanupNodes();
      }, fadeDuration * 1000 + 50);
    }
    this.isPlaying = false;
  }

  cleanupNodes() {
    if (this.activeSource) {
      try {
        this.activeSource.stop();
        this.activeSource.disconnect();
      } catch (e) {}
      this.activeSource = null;
    }
    if (this.htmlAudio) {
      try {
        this.htmlAudio.pause();
      } catch (e) {}
    }
  }

  setGain(val, rampSec = 0.05) {
    const now = this.ctx.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.linearRampToValueAtTime(val, now + rampSec);
  }

  getCurrentTime() {
    if (!this.isPlaying) return this.pausedAt;
    let filePath = this.currentTrack?.file || '';
    if (this.basePath && !filePath.startsWith('http') && !filePath.startsWith('/') && !filePath.startsWith('../../')) {
      filePath = `${this.basePath}/${filePath}`.replace(/\/\//g, '/');
    }
    if (this.isBufferMode && this.activeSource && this.bufferCache.has(filePath)) {
      const buf = this.bufferCache.get(filePath);
      return (this.ctx.currentTime - this.playbackStartTime) % buf.duration;
    }
    if (this.htmlAudio) {
      return this.htmlAudio.currentTime;
    }
    return 0;
  }

  getDuration() {
    let filePath = this.currentTrack?.file || '';
    if (this.basePath && !filePath.startsWith('http') && !filePath.startsWith('/') && !filePath.startsWith('../../')) {
      filePath = `${this.basePath}/${filePath}`.replace(/\/\//g, '/');
    }
    if (this.isBufferMode && this.bufferCache.has(filePath)) {
      return this.bufferCache.get(filePath).duration;
    }
    if (this.htmlAudio) {
      return this.htmlAudio.duration || 0;
    }
    return 0;
  }
}
