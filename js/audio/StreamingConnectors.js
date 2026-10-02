/**
 * DnD-Soundscape: Unified Streaming Connectors Router
 * Detects whether a track is a YouTube URL, Spotify link, Web Audio stream, or local file,
 * routing playback and volume seamlessly.
 */

import { YouTubeBridge } from './YouTubeBridge.js';
import { SpotifyBridge } from './SpotifyBridge.js';

export class StreamingConnectors {
  constructor() {
    this.youtube = new YouTubeBridge();
    this.spotify = new SpotifyBridge();
    this.activeStreamingType = null; // 'youtube' | 'spotify' | 'web' | null
  }

  static detectSourceType(sourceString) {
    if (!sourceString || typeof sourceString !== 'string') return 'local';
    const s = sourceString.trim();

    if (s.includes('youtube.com') || s.includes('youtu.be')) {
      return 'youtube';
    }
    if (s.includes('open.spotify.com') || s.startsWith('spotify:')) {
      return 'spotify';
    }
    if (s.startsWith('http://') || s.startsWith('https://')) {
      return 'web_stream';
    }
    return 'local';
  }

  playStream(sourceString, volume = 0.8, startSec = 0, endSec = null) {
    const type = StreamingConnectors.detectSourceType(sourceString);
    this.stopAll();

    if (type === 'youtube') {
      this.activeStreamingType = 'youtube';
      return this.youtube.loadAndPlay(sourceString, volume, startSec, endSec);
    } else if (type === 'spotify') {
      this.activeStreamingType = 'spotify';
      return this.spotify.loadAndPlay(sourceString);
    }
    return false;
  }

  setVolume(volNormalized) {
    if (this.activeStreamingType === 'youtube') {
      this.youtube.setVolume(volNormalized);
    }
  }

  stopAll() {
    if (this.activeStreamingType === 'youtube') {
      this.youtube.stop();
    } else if (this.activeStreamingType === 'spotify') {
      this.spotify.stop();
    }
    this.activeStreamingType = null;
  }
}
