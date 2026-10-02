/**
 * DnD-Soundscape: Bottom HUD & 3-Layer Live Mixer Drawer Component
 */

export class MixerHUD {
  constructor(containerEl, audioEngine, callbacks = {}) {
    this.container = containerEl;
    this.audio = audioEngine;
    this.callbacks = callbacks; // { onOpenSettings, onOpenStudio, onOpenSoundboard }

    this.isMixerOpen = false;
    this.stageTitleEl = null;
    this.musicTrackEl = null;
    this.ambienceTrackEl = null;
    this.btnDuck = null;
    this.sliderMaster = null;
    this.lblMaster = null;

    this.faders = {
      music: null,
      ambience: null,
      effects: null
    };

    this.vuBars = {
      music: null,
      ambience: null,
      effects: null
    };

    this.animFrameId = null;
  }

  render() {
    this.container.innerHTML = `
      <!-- 3-Layer Live Mixer Drawer (Expandable) -->
      <div id="mixer-drawer" class="mixer-drawer">
        <!-- Music Channel -->
        <div class="mixer-channel">
          <div class="mixer-channel-header">
            <span>🎵</span>
            <span>Music</span>
          </div>
          <div class="mixer-fader-container">
            <input type="range" id="fader-music" class="fader-vertical" min="0" max="1" step="0.01" value="0.75">
          </div>
          <div class="vu-meter">
            <div id="vu-bar-music" class="vu-meter-bar"></div>
          </div>
          <span id="lbl-music-vol" class="vol-readout">75%</span>
        </div>

        <!-- Ambience Channel -->
        <div class="mixer-channel">
          <div class="mixer-channel-header">
            <span>🌲</span>
            <span>Ambience</span>
          </div>
          <div class="mixer-fader-container">
            <input type="range" id="fader-ambience" class="fader-vertical" min="0" max="1" step="0.01" value="0.50">
          </div>
          <div class="vu-meter">
            <div id="vu-bar-ambience" class="vu-meter-bar"></div>
          </div>
          <span id="lbl-ambience-vol" class="vol-readout">50%</span>
        </div>

        <!-- Effects Channel -->
        <div class="mixer-channel">
          <div class="mixer-channel-header">
            <span>⚡</span>
            <span>Effects</span>
          </div>
          <div class="mixer-fader-container">
            <input type="range" id="fader-effects" class="fader-vertical" min="0" max="1" step="0.01" value="0.85">
          </div>
          <div class="vu-meter">
            <div id="vu-bar-effects" class="vu-meter-bar"></div>
          </div>
          <span id="lbl-effects-vol" class="vol-readout">85%</span>
        </div>
      </div>

      <!-- Bottom HUD Bar -->
      <footer class="bottom-hud-bar">
        <!-- Left: Stage & Track Meta -->
        <div class="hud-stage-info">
          <div class="hud-stage-badge">
            <span class="pulse-indicator"></span>
            <span id="hud-stage-title" class="hud-stage-title">No Stage Selected</span>
          </div>
          <div class="hud-track-meta">
            <span id="hud-music-name" class="hud-music-name">–</span>
            <span id="hud-ambience-name" class="hud-ambience-name">–</span>
          </div>
        </div>

        <!-- Center: Playback Controls -->
        <div class="hud-playback-controls">
          <button id="btn-hud-duck" class="hud-action-btn btn-duck" title="Vorlesen / Ducking (Space)">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
            </svg>
            <span>Vorlesen</span>
            <kbd>Space</kbd>
          </button>

          <button id="btn-hud-soundboard" class="hud-action-btn" title="SFX Soundboard (B)">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>SFX Pad</span>
            <kbd>B</kbd>
          </button>

          <button id="btn-hud-mixer" class="hud-action-btn" title="3-Layer Live Mixer (M)">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="21" x2="4" y2="14"/>
              <line x1="4" y1="10" x2="4" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12" y2="3"/>
              <line x1="20" y1="21" x2="20" y2="16"/>
              <line x1="20" y1="12" x2="20" y2="3"/>
              <circle cx="4" cy="12" r="2"/>
              <circle cx="12" cy="10" r="2"/>
              <circle cx="20" cy="14" r="2"/>
            </svg>
            <span>Mixer</span>
            <kbd>M</kbd>
          </button>

          <button id="btn-hud-silence" class="hud-action-btn btn-silence" title="Stille / Fade Out (Esc)">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
            <span>Stille</span>
            <kbd>Esc</kbd>
          </button>
        </div>

        <!-- Right: Master Volume & Settings -->
        <div class="hud-right-controls">
          <div class="volume-slider-group">
            <button id="btn-hud-mute" class="btn-icon" title="Mute (M)">
              <svg id="icon-mute-off" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            </button>
            <input type="range" id="slider-master-vol" class="slider-custom" min="0" max="1" step="0.01" value="0.8">
            <span id="lbl-master-vol" class="vol-readout">80%</span>
          </div>

          <button id="btn-hud-studio" class="btn-icon" title="Adventure Studio / Stage Editor">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>

          <button id="btn-hud-settings" class="btn-icon" title="Settings (⚙)">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>

          <button id="btn-hud-fullscreen" class="btn-icon" title="Toggle Fullscreen (F)">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          </button>
        </div>
      </footer>
    `;

    this.cacheElements();
    this.bindEvents();
    this.startVUAnimation();
  }

  cacheElements() {
    this.stageTitleEl = document.getElementById('hud-stage-title');
    this.musicTrackEl = document.getElementById('hud-music-name');
    this.ambienceTrackEl = document.getElementById('hud-ambience-name');
    this.btnDuck = document.getElementById('btn-hud-duck');
    this.sliderMaster = document.getElementById('slider-master-vol');
    this.lblMaster = document.getElementById('lbl-master-vol');

    this.faders.music = document.getElementById('fader-music');
    this.faders.ambience = document.getElementById('fader-ambience');
    this.faders.effects = document.getElementById('fader-effects');

    this.vuBars.music = document.getElementById('vu-bar-music');
    this.vuBars.ambience = document.getElementById('vu-bar-ambience');
    this.vuBars.effects = document.getElementById('vu-bar-effects');
  }

  bindEvents() {
    this.btnDuck.addEventListener('click', () => {
      const isDucked = this.audio.toggleDucking();
      this.btnDuck.classList.toggle('active', isDucked);
    });

    document.getElementById('btn-hud-silence').addEventListener('click', () => {
      this.audio.fadeToSilence(3.0);
      this.updateStageInfo(null);
    });

    document.getElementById('btn-hud-mixer').addEventListener('click', () => {
      this.toggleMixerDrawer();
    });

    document.getElementById('btn-hud-soundboard').addEventListener('click', () => {
      if (this.callbacks.onOpenSoundboard) this.callbacks.onOpenSoundboard();
    });

    document.getElementById('btn-hud-studio').addEventListener('click', () => {
      if (this.callbacks.onOpenStudio) this.callbacks.onOpenStudio();
    });

    document.getElementById('btn-hud-settings').addEventListener('click', () => {
      if (this.callbacks.onOpenSettings) this.callbacks.onOpenSettings();
    });

    document.getElementById('btn-hud-fullscreen').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    this.sliderMaster.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.audio.setMasterVolume(val);
      this.lblMaster.textContent = `${Math.round(val * 100)}%`;
    });

    document.getElementById('btn-hud-mute').addEventListener('click', () => {
      const isMuted = this.audio.toggleMute();
      document.getElementById('btn-hud-mute').style.color = isMuted ? '#e74c3c' : 'inherit';
    });

    // Layer Faders
    this.faders.music.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.audio.buses.music?.setVolume(val);
      document.getElementById('lbl-music-vol').textContent = `${Math.round(val * 100)}%`;
    });

    this.faders.ambience.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.audio.buses.ambience?.setVolume(val);
      document.getElementById('lbl-ambience-vol').textContent = `${Math.round(val * 100)}%`;
    });

    this.faders.effects.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.audio.buses.effects?.setVolume(val);
      document.getElementById('lbl-effects-vol').textContent = `${Math.round(val * 100)}%`;
    });
  }

  toggleMixerDrawer() {
    this.isMixerOpen = !this.isMixerOpen;
    document.getElementById('mixer-drawer')?.classList.toggle('open', this.isMixerOpen);
  }

  updateStageInfo(stage) {
    if (!stage) {
      if (this.stageTitleEl) this.stageTitleEl.textContent = 'Silence / No Stage';
      if (this.musicTrackEl) this.musicTrackEl.textContent = '–';
      if (this.ambienceTrackEl) this.ambienceTrackEl.textContent = '–';
      return;
    }

    if (this.stageTitleEl) this.stageTitleEl.textContent = `${stage.icon || '📍'} ${stage.label}`;
    const musicName = stage.layers?.music?.name || stage.layers?.music?.tracks?.[0]?.title || 'None';
    const ambName = stage.layers?.ambience?.name || stage.layers?.ambience?.tracks?.[0]?.title || 'None';

    if (this.musicTrackEl) this.musicTrackEl.textContent = `🎵 ${musicName}`;
    if (this.ambienceTrackEl) this.ambienceTrackEl.textContent = `🌲 ${ambName}`;

    // Update Fader initial values
    if (stage.layers?.music?.volume !== undefined && this.faders.music) {
      this.faders.music.value = stage.layers.music.volume;
      document.getElementById('lbl-music-vol').textContent = `${Math.round(stage.layers.music.volume * 100)}%`;
    }
    if (stage.layers?.ambience?.volume !== undefined && this.faders.ambience) {
      this.faders.ambience.value = stage.layers.ambience.volume;
      document.getElementById('lbl-ambience-vol').textContent = `${Math.round(stage.layers.ambience.volume * 100)}%`;
    }
    if (stage.layers?.effects?.volume !== undefined && this.faders.effects) {
      this.faders.effects.value = stage.layers.effects.volume;
      document.getElementById('lbl-effects-vol').textContent = `${Math.round(stage.layers.effects.volume * 100)}%`;
    }
  }

  startVUAnimation() {
    const updateVU = () => {
      const levels = this.audio.getLiveLevels();
      if (this.vuBars.music) this.vuBars.music.style.width = `${Math.min(100, levels.music * 130)}%`;
      if (this.vuBars.ambience) this.vuBars.ambience.style.width = `${Math.min(100, levels.ambience * 130)}%`;
      if (this.vuBars.effects) this.vuBars.effects.style.width = `${Math.min(100, levels.effects * 130)}%`;
      this.animFrameId = requestAnimationFrame(updateVU);
    };
    this.animFrameId = requestAnimationFrame(updateVU);
  }
}
