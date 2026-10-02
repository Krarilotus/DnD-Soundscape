/**
 * DnD-Soundscape: Clean, Ultra-Responsive Bottom HUD & 3-Layer Live Mixer Component
 * Minimal layout with no text collisions.
 * Track titles and credits display in retro MP3 LCD marquee inside the Mixer drawer.
 */

export class MixerHUD {
  constructor(containerEl, audioEngine, callbacks = {}) {
    this.container = containerEl;
    this.audio = audioEngine;
    this.callbacks = callbacks; // { onOpenSettings, onOpenStudio, onOpenSoundboard }

    this.isMixerOpen = false;
    this.btnDuck = null;
    this.btnMute = null;
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

    this.lcdTexts = {
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
            <span>🎵 Music</span>
          </div>
          <!-- Retro MP3 LCD Display -->
          <div class="channel-lcd-screen">
            <div class="lcd-marquee-wrapper">
              <span id="lcd-music-text" class="lcd-marquee-text">🎵 No Track Loaded</span>
            </div>
          </div>
          <div class="mixer-fader-container">
            <input type="range" id="fader-music" class="fader-vertical" min="0" max="1" step="0.01" value="0.75" aria-label="Music Volume">
          </div>
          <div class="vu-meter">
            <div id="vu-bar-music" class="vu-meter-bar"></div>
          </div>
          <span id="lbl-music-vol" class="vol-readout">75%</span>
        </div>

        <!-- Ambience Channel -->
        <div class="mixer-channel">
          <div class="mixer-channel-header">
            <span>🌲 Ambience</span>
          </div>
          <!-- Retro MP3 LCD Display -->
          <div class="channel-lcd-screen">
            <div class="lcd-marquee-wrapper">
              <span id="lcd-ambience-text" class="lcd-marquee-text">🌲 No Ambience Loaded</span>
            </div>
          </div>
          <div class="mixer-fader-container">
            <input type="range" id="fader-ambience" class="fader-vertical" min="0" max="1" step="0.01" value="0.50" aria-label="Ambience Volume">
          </div>
          <div class="vu-meter">
            <div id="vu-bar-ambience" class="vu-meter-bar"></div>
          </div>
          <span id="lbl-ambience-vol" class="vol-readout">50%</span>
        </div>

        <!-- Effects Channel -->
        <div class="mixer-channel">
          <div class="mixer-channel-header">
            <span>⚡ Effects</span>
          </div>
          <!-- Retro MP3 LCD Display -->
          <div class="channel-lcd-screen">
            <div class="lcd-marquee-wrapper">
              <span id="lcd-effects-text" class="lcd-marquee-text">⚡ No Effects Loaded</span>
            </div>
          </div>
          <div class="mixer-fader-container">
            <input type="range" id="fader-effects" class="fader-vertical" min="0" max="1" step="0.01" value="0.85" aria-label="Effects Volume">
          </div>
          <div class="vu-meter">
            <div id="vu-bar-effects" class="vu-meter-bar"></div>
          </div>
          <span id="lbl-effects-vol" class="vol-readout">85%</span>
        </div>
      </div>

      <!-- Bottom HUD Bar: Ultra-Clean, Non-Colliding Responsive Controls -->
      <footer class="bottom-hud-bar">
        <!-- Left: Vorlesen / Ducking Toggle -->
        <div class="hud-left-group">
          <button id="btn-hud-duck" class="hud-action-btn btn-duck" title="Vorlesen / Ducking (Space)">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
            </svg>
            <span>Vorlesen</span>
            <kbd>Space</kbd>
          </button>
        </div>

        <!-- Center: 3-Layer Live Mixer Toggle -->
        <div class="hud-center-group">
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
        </div>

        <!-- Right: Master Volume & Fullscreen -->
        <div class="hud-right-group">
          <div class="volume-slider-group">
            <button id="btn-hud-mute" class="btn-icon" title="Mute / Fade to Silence (Click to mute/unmute)">
              <svg id="icon-speaker" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path id="speaker-waves" d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            </button>
            <input type="range" id="slider-master-vol" class="slider-custom" min="0" max="1" step="0.01" value="0.8" aria-label="Master Volume">
            <span id="lbl-master-vol" class="vol-readout">80%</span>
          </div>

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
    this.btnDuck = document.getElementById('btn-hud-duck');
    this.btnMute = document.getElementById('btn-hud-mute');
    this.sliderMaster = document.getElementById('slider-master-vol');
    this.lblMaster = document.getElementById('lbl-master-vol');

    this.faders.music = document.getElementById('fader-music');
    this.faders.ambience = document.getElementById('fader-ambience');
    this.faders.effects = document.getElementById('fader-effects');

    this.vuBars.music = document.getElementById('vu-bar-music');
    this.vuBars.ambience = document.getElementById('vu-bar-ambience');
    this.vuBars.effects = document.getElementById('vu-bar-effects');

    this.lcdTexts.music = document.getElementById('lcd-music-text');
    this.lcdTexts.ambience = document.getElementById('lcd-ambience-text');
    this.lcdTexts.effects = document.getElementById('lcd-effects-text');
  }

  bindEvents() {
    this.btnDuck.addEventListener('click', () => {
      const isDucked = this.audio.toggleDucking();
      this.btnDuck.classList.toggle('active', isDucked);
    });

    this.btnMute.addEventListener('click', () => {
      const isMuted = this.audio.toggleMute();
      this.updateMuteVisual(isMuted);
    });

    document.getElementById('btn-hud-mixer').addEventListener('click', () => {
      this.toggleMixerDrawer();
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
      if (val > 0 && this.audio.isMuted) {
        this.audio.toggleMute();
        this.updateMuteVisual(false);
      }
    });

    // Layer Faders
    this.faders.music?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.audio.buses.music?.setVolume(val);
      document.getElementById('lbl-music-vol').textContent = `${Math.round(val * 100)}%`;
    });

    this.faders.ambience?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.audio.buses.ambience?.setVolume(val);
      document.getElementById('lbl-ambience-vol').textContent = `${Math.round(val * 100)}%`;
    });

    this.faders.effects?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.audio.buses.effects?.setVolume(val);
      document.getElementById('lbl-effects-vol').textContent = `${Math.round(val * 100)}%`;
    });
  }

  updateMuteVisual(isMuted) {
    if (!this.btnMute) return;
    const waves = document.getElementById('speaker-waves');
    if (isMuted) {
      this.btnMute.style.color = '#e74c3c';
      if (waves) waves.style.display = 'none';
      this.btnMute.title = 'Unmute (M)';
    } else {
      this.btnMute.style.color = 'inherit';
      if (waves) waves.style.display = 'block';
      this.btnMute.title = 'Mute / Silence (M)';
    }
  }

  toggleMixerDrawer() {
    this.isMixerOpen = !this.isMixerOpen;
    document.getElementById('mixer-drawer')?.classList.toggle('open', this.isMixerOpen);
    document.getElementById('btn-hud-mixer')?.classList.toggle('active', this.isMixerOpen);
  }

  setLCDText(el, text) {
    if (!el) return;
    el.textContent = text;
    // Normalize speed: roughly 3 to 4 characters per second so longer titles take longer instead of speeding up!
    const charCount = text.length;
    const durSec = Math.max(9, Math.round(charCount * 0.28));
    el.style.animationDuration = `${durSec}s`;
  }

  updateStageInfo(stage) {
    if (!stage) {
      if (this.lcdTexts.music) this.setLCDText(this.lcdTexts.music, '🎵 Silence');
      if (this.lcdTexts.ambience) this.setLCDText(this.lcdTexts.ambience, '🌲 Silence');
      if (this.lcdTexts.effects) this.setLCDText(this.lcdTexts.effects, '⚡ Silence');
      return;
    }

    const musicTrack = stage.layers?.music?.tracks?.[0];
    const ambTrack = stage.layers?.ambience?.tracks?.[0];
    const fxTrack = stage.layers?.effects?.tracks?.[0];

    const musicTitle = musicTrack?.title || stage.layers?.music?.name || 'No Soundtrack';
    const musicCredit = musicTrack?.credit ? ` · 👤 ${musicTrack.credit}` : '';
    if (this.lcdTexts.music) {
      this.setLCDText(this.lcdTexts.music, `🎵 ${musicTitle}${musicCredit}`);
    }

    const ambTitle = ambTrack?.title || stage.layers?.ambience?.name || 'No Ambience';
    const ambCredit = ambTrack?.credit ? ` · 👤 ${ambTrack.credit}` : '';
    if (this.lcdTexts.ambience) {
      this.setLCDText(this.lcdTexts.ambience, `🌲 ${ambTitle}${ambCredit}`);
    }

    const fxTitle = fxTrack?.title || (stage.layers?.effects?.triggers?.length ? `${stage.layers.effects.triggers.length} Stage Triggers` : 'No SFX');
    const fxCredit = fxTrack?.credit ? ` · 👤 ${fxTrack.credit}` : '';
    if (this.lcdTexts.effects) {
      this.setLCDText(this.lcdTexts.effects, `⚡ ${fxTitle}${fxCredit}`);
    }

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
