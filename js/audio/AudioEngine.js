/**
 * DnD-Soundscape: Master Audio Engine & Stage Orchestrator
 * Connects Web Audio Context, Master Gain, Ducking Gain, 3-Layer Buses,
 * Dual Loop Engines for Crossfading, SFX Trigger Pads, and Streaming Connectors (YouTube/Spotify).
 */

import { LayerBus } from './LayerBus.js';
import { GaplessLoopEngine } from './GaplessLoopEngine.js';
import { Crossfader } from './Crossfader.js';
import { SoundFXPad } from './SoundFXPad.js';
import { ProceduralSynth } from './ProceduralSynth.js';
import { StreamingConnectors } from './StreamingConnectors.js';

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.duckGain = null;
    
    this.buses = {
      music: null,
      ambience: null,
      effects: null
    };

    // Primary & Secondary loop engines for dual-bus crossfading
    this.engines = {
      musicA: null,
      musicB: null,
      activeMusic: 'A',
      ambienceA: null,
      ambienceB: null,
      activeAmbience: 'A',
      effectsA: null,
      effectsB: null,
      activeEffects: 'A'
    };

    this.crossfader = null;
    this.sfxPad = null;
    this.synth = null;
    this.streaming = null;

    this.masterVolume = 0.8;
    this.duckLevel = 0.35;
    this.isDucked = false;
    this.isMuted = false;
    this.unlocked = false;

    this.currentStage = null;
    this.basePath = '';
  }

  async init() {
    if (this.unlocked) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    // Audio Graph:
    // [Sources] -> [Layer Buses: music/ambience/effects] -> [duckGain] -> [masterGain] -> [ctx.destination]
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.duckGain = this.ctx.createGain();
    this.duckGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.duckGain.connect(this.masterGain);

    // Initialize 3 Buses
    this.buses.music = new LayerBus('music', this.ctx, this.duckGain);
    this.buses.ambience = new LayerBus('ambience', this.ctx, this.duckGain);
    this.buses.effects = new LayerBus('effects', this.ctx, this.masterGain); // FX not ducked

    // Initialize Dual Loop Engines for seamless Crossfades
    this.engines.musicA = new GaplessLoopEngine(this.ctx, this.buses.music.inputNode);
    this.engines.musicB = new GaplessLoopEngine(this.ctx, this.buses.music.inputNode);
    this.engines.ambienceA = new GaplessLoopEngine(this.ctx, this.buses.ambience.inputNode);
    this.engines.ambienceB = new GaplessLoopEngine(this.ctx, this.buses.ambience.inputNode);
    this.engines.effectsA = new GaplessLoopEngine(this.ctx, this.buses.effects.inputNode);
    this.engines.effectsB = new GaplessLoopEngine(this.ctx, this.buses.effects.inputNode);

    this.crossfader = new Crossfader(this.ctx);
    this.synth = new ProceduralSynth(this.ctx);
    this.sfxPad = new SoundFXPad(this.ctx, this.buses.effects.inputNode, this.synth);
    this.streaming = new StreamingConnectors();

    this.unlocked = true;
    console.log('DnD-Soundscape Web Audio Engine & Streaming Connectors initialized.');
  }

  setBasePath(path) {
    this.basePath = path;
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && !this.isMuted) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(this.masterVolume, now + 0.05);
    }
    if (this.streaming) {
      this.streaming.setVolume(this.masterVolume);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (!this.masterGain) return this.isMuted;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    if (this.isMuted) {
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.05);
      this.streaming?.setVolume(0);
    } else {
      this.masterGain.gain.linearRampToValueAtTime(this.masterVolume, now + 0.05);
      this.streaming?.setVolume(this.masterVolume);
    }
    return this.isMuted;
  }

  toggleDucking() {
    this.isDucked = !this.isDucked;
    if (!this.duckGain) return this.isDucked;
    const now = this.ctx.currentTime;
    this.duckGain.gain.cancelScheduledValues(now);
    const target = this.isDucked ? this.duckLevel : 1.0;
    const rampTime = this.isDucked ? 0.3 : 0.6;
    this.duckGain.gain.linearRampToValueAtTime(target, now + rampTime);

    if (this.streaming) {
      const streamVol = this.isDucked ? (this.masterVolume * this.duckLevel) : this.masterVolume;
      this.streaming.setVolume(streamVol);
    }
    return this.isDucked;
  }

  fadeToSilence(durationSec = 3.0) {
    const curMusic = this.getActiveMusicEngine();
    const curAmb = this.getActiveAmbienceEngine();
    if (curMusic) curMusic.stop(durationSec);
    if (curAmb) curAmb.stop(durationSec);
    if (this.streaming) this.streaming.stopAll();
    this.currentStage = null;
  }

  getActiveMusicEngine() {
    return this.engines.activeMusic === 'A' ? this.engines.musicA : this.engines.musicB;
  }

  getInactiveMusicEngine() {
    return this.engines.activeMusic === 'A' ? this.engines.musicB : this.engines.musicA;
  }

  getActiveAmbienceEngine() {
    return this.engines.activeAmbience === 'A' ? this.engines.ambienceA : this.engines.ambienceB;
  }

  getInactiveAmbienceEngine() {
    return this.engines.activeAmbience === 'A' ? this.engines.ambienceB : this.engines.ambienceA;
  }

  getActiveEffectsEngine() {
    return this.engines.activeEffects === 'A' ? this.engines.effectsA : this.engines.effectsB;
  }

  getInactiveEffectsEngine() {
    return this.engines.activeEffects === 'A' ? this.engines.effectsB : this.engines.effectsA;
  }

  async transitionToStage(stage, crossfadeDuration = null) {
    if (!this.unlocked) await this.init();
    this.currentStage = stage;

    const fadeDur = crossfadeDuration !== null ? crossfadeDuration : (stage.crossfadeSec || 4.0);

    // 1. Music Transition
    const musicLayer = stage.layers?.music;
    const curMusicEngine = this.getActiveMusicEngine();
    const nextMusicEngine = this.getInactiveMusicEngine();

    if (musicLayer && musicLayer.tracks && musicLayer.tracks.length > 0) {
      const track = musicLayer.tracks[0];
      const sourceStr = track.source || track.file || '';
      const streamType = StreamingConnectors.detectSourceType(sourceStr);

      if (streamType === 'youtube' || streamType === 'spotify') {
        if (curMusicEngine) curMusicEngine.stop(fadeDur);
        const streamVol = (musicLayer.volume !== undefined ? musicLayer.volume : 0.75) * this.masterVolume;
        this.streaming.playStream(sourceStr, streamVol, track.startSec, track.endSec);
      } else {
        if (this.streaming) this.streaming.stopAll();
        await nextMusicEngine.loadTrack(track, this.basePath);
        this.buses.music.setVolume(musicLayer.volume !== undefined ? musicLayer.volume : 0.7);
        this.crossfader.crossfade(curMusicEngine, nextMusicEngine, fadeDur);
        this.engines.activeMusic = this.engines.activeMusic === 'A' ? 'B' : 'A';
      }
    } else {
      if (curMusicEngine) curMusicEngine.stop(fadeDur);
      if (this.streaming) this.streaming.stopAll();
    }

    // 2. Ambience Transition
    const ambLayer = stage.layers?.ambience;
    const curAmbEngine = this.getActiveAmbienceEngine();
    const nextAmbEngine = this.getInactiveAmbienceEngine();

    if (ambLayer && ambLayer.tracks && ambLayer.tracks.length > 0) {
      const track = ambLayer.tracks[0];
      const sourceStr = track.source || track.file || '';
      const streamType = StreamingConnectors.detectSourceType(sourceStr);

      if (streamType === 'youtube' || streamType === 'spotify') {
        if (curAmbEngine) curAmbEngine.stop(fadeDur);
        const streamVol = (ambLayer.volume !== undefined ? ambLayer.volume : 0.5) * this.masterVolume;
        this.streaming.playStream(sourceStr, streamVol, track.startSec, track.endSec);
      } else {
        await nextAmbEngine.loadTrack(track, this.basePath);
        this.buses.ambience.setVolume(ambLayer.volume !== undefined ? ambLayer.volume : 0.5);
        this.crossfader.crossfade(curAmbEngine, nextAmbEngine, fadeDur);
        this.engines.activeAmbience = this.engines.activeAmbience === 'A' ? 'B' : 'A';
      }
    } else {
      if (curAmbEngine) curAmbEngine.stop(fadeDur);
    }

    // 3. Effects / SFX Layer (Continuous Effect Loop + Triggers)
    const fxLayer = stage.layers?.effects;
    const curFxEngine = this.getActiveEffectsEngine();
    const nextFxEngine = this.getInactiveEffectsEngine();

    if (fxLayer && fxLayer.tracks && fxLayer.tracks.length > 0) {
      const track = fxLayer.tracks[0];
      await nextFxEngine.loadTrack(track, this.basePath);
      this.buses.effects.setVolume(fxLayer.volume !== undefined ? fxLayer.volume : 0.85);
      this.crossfader.crossfade(curFxEngine, nextFxEngine, fadeDur);
      this.engines.activeEffects = this.engines.activeEffects === 'A' ? 'B' : 'A';
    } else if (curFxEngine) {
      curFxEngine.stop(fadeDur);
    }

    if (fxLayer) {
      this.buses.effects.setVolume(fxLayer.volume !== undefined ? fxLayer.volume : 0.85);
      this.sfxPad.setTriggers(fxLayer.triggers || [], this.basePath);
    }
  }

  playSFX(triggerId) {
    if (!this.unlocked) return;
    this.sfxPad.playTrigger(triggerId, this.basePath);
  }

  getLiveLevels() {
    if (!this.unlocked) return { music: 0, ambience: 0, effects: 0 };
    return {
      music: this.buses.music?.getPeakLevel() || 0,
      ambience: this.buses.ambience?.getPeakLevel() || 0,
      effects: this.buses.effects?.getPeakLevel() || 0
    };
  }
}
