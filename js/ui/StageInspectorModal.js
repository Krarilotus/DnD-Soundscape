/**
 * DnD-Soundscape: Stage Inspector Modal (Popup Window)
 * Intuitive stage configuration popup with:
 * - Title, type, description, and crossfade settings
 * - Rich tabletop RPG emoji catalog picker
 * - 3-Layer volume sliders (Music, Ambience, Effects) directly in the menu
 * - Clean track list with expandable cue points (startSec & endSec) and audition player
 * - One-shot sound triggers and stage deletion
 */

import { generateId, showToast } from '../utils/helpers.js';

export const RPG_EMOJI_CATALOG = [
  // Tavern & Feast
  { icon: '🍺', label: 'Tavern' },
  { icon: '🍻', label: 'Cheers' },
  { icon: '🍷', label: 'Wine / Feast' },
  { icon: '🍖', label: 'Roast / Inn' },
  // Combat & Martial
  { icon: '⚔️', label: 'Combat' },
  { icon: '🛡️', label: 'Defense' },
  { icon: '🏹', label: 'Archery / Ambush' },
  { icon: '🥊', label: 'Brawl' },
  { icon: '🗡️', label: 'Dagger / Stealth' },
  { icon: '🩸', label: 'Danger / Wound' },
  // Wilderness & Nature
  { icon: '🌲', label: 'Forest' },
  { icon: '🏔️', label: 'Mountain' },
  { icon: '🏕️', label: 'Campsite' },
  { icon: '🍂', label: 'Autumn / Trail' },
  { icon: '❄️', label: 'Snow / Frozen' },
  { icon: '🌋', label: 'Volcano / Fire' },
  // Dungeons & Secrets
  { icon: '🕯️', label: 'Candle / Crypt' },
  { icon: '💀', label: 'Death / Boss' },
  { icon: '🚪', label: 'Door / Passage' },
  { icon: '🗝️', label: 'Key / Lock' },
  { icon: '⛓️', label: 'Chains / Prison' },
  { icon: '🕸️', label: 'Web / Spiders' },
  // Settlements & Lore
  { icon: '🏰', label: 'Castle' },
  { icon: '🏛️', label: 'Temple' },
  { icon: '🏚️', label: 'Ruins' },
  { icon: '💎', label: 'Gems' },
  { icon: '💰', label: 'Treasure' },
  { icon: '👑', label: 'Throne' },
  // Elements
  { icon: '🌊', label: 'Ocean / Stream' },
  { icon: '🌧️', label: 'Rainstorm' },
  { icon: '🔥', label: 'Hearthfire' },
  { icon: '⚡', label: 'Thunder / Magic' },
  { icon: '💨', label: 'Wind' },
  // Monsters & Magic
  { icon: '🐉', label: 'Dragon' },
  { icon: '👺', label: 'Goblin / Demon' },
  { icon: '🐺', label: 'Wolf / Beast' },
  { icon: '🦇', label: 'Bat / Cave' },
  { icon: '🧟', label: 'Undead' },
  { icon: '👻', label: 'Ghost' },
  { icon: '🧙', label: 'Mage' },
  { icon: '🔮', label: 'Arcane Orb' }
];

export class StageInspectorModal {
  constructor(options = {}) {
    this.modalEl = null;
    this.stage = null;
    this.adventure = null;
    this.isOpen = false;
    this.onSave = options.onSave;
    this.onDelete = options.onDelete;
    this.onStageUpdated = options.onStageUpdated;
    this.previewAudioEl = null;
    this.expandedTrackIndexes = { music: new Set(), ambience: new Set() };
  }

  init() {
    let el = document.getElementById('stage-inspector-modal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'stage-inspector-modal';
      el.className = 'modal-backdrop hidden';
      document.body.appendChild(el);
    }
    this.modalEl = el;
  }

  open(stage, adventure) {
    if (!this.modalEl) this.init();
    this.stage = stage;
    this.adventure = adventure;
    this.isOpen = true;
    this.expandedTrackIndexes = { music: new Set(), ambience: new Set() };

    // Ensure 3-layer structure exists
    if (!this.stage.layers) this.stage.layers = {};
    if (!this.stage.layers.music) {
      this.stage.layers.music = { name: 'Music', volume: 0.7, tracks: [] };
    }
    if (!this.stage.layers.ambience) {
      this.stage.layers.ambience = { name: 'Ambience', volume: 0.55, tracks: [] };
    }
    if (!this.stage.layers.effects) {
      this.stage.layers.effects = { name: 'Effects', volume: 0.85, triggers: [] };
    }

    this.render();
    this.modalEl.classList.remove('hidden');
  }

  close() {
    this.stopPreviewAudio();
    this.isOpen = false;
    if (this.modalEl) this.modalEl.classList.add('hidden');
  }

  stopPreviewAudio() {
    if (this.previewAudioEl) {
      this.previewAudioEl.pause();
      this.previewAudioEl = null;
    }
  }

  playAudioPreview(path) {
    this.stopPreviewAudio();
    if (!path) return;
    try {
      this.previewAudioEl = new Audio(path);
      this.previewAudioEl.volume = 0.8;
      this.previewAudioEl.play().catch(e => console.warn('Preview blocked:', e));
    } catch (e) {
      console.warn('Audio preview error:', e);
    }
  }

  render() {
    if (!this.modalEl || !this.stage) return;

    const s = this.stage;
    const musicLayer = s.layers.music;
    const ambLayer = s.layers.ambience;
    const fxLayer = s.layers.effects;

    const musicVolPercent = Math.round((musicLayer.volume !== undefined ? musicLayer.volume : 0.7) * 100);
    const ambVolPercent = Math.round((ambLayer.volume !== undefined ? ambLayer.volume : 0.55) * 100);
    const fxVolPercent = Math.round((fxLayer.volume !== undefined ? fxLayer.volume : 0.85) * 100);

    this.modalEl.innerHTML = `
      <div class="modal-window inspector-modal-window">
        <!-- Header -->
        <header class="modal-header">
          <div class="inspector-header-title">
            <span class="inspector-badge-icon" id="inspector-current-icon">${s.icon || '🗺️'}</span>
            <input type="text" id="stage-input-label" class="form-input inspector-title-input" value="${s.label || ''}" placeholder="Stage Name">
          </div>
          <div class="inspector-header-actions">
            <button id="btn-inspector-delete" class="btn-danger-icon" title="Delete Stage">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Delete Stage</span>
            </button>
            <button id="btn-inspector-close" class="btn-icon" aria-label="Close">✕</button>
          </div>
        </header>

        <!-- Body -->
        <div class="modal-body inspector-modal-body">
          <!-- Left Column: Details & Emoji Catalog -->
          <div class="inspector-col-left">
            <div class="inspector-section">
              <div class="form-row">
                <div class="form-group" style="flex: 1;">
                  <label class="form-label">Stage Type</label>
                  <select id="stage-select-type" class="form-select">
                    <option value="roleplay" ${s.type === 'roleplay' ? 'selected' : ''}>🍺 Tavern / Roleplay</option>
                    <option value="exploration" ${s.type === 'exploration' ? 'selected' : ''}>🕯️ Exploration</option>
                    <option value="combat" ${s.type === 'combat' ? 'selected' : ''}>⚔️ Combat</option>
                    <option value="climax" ${s.type === 'climax' ? 'selected' : ''}>💀 Boss / Climax</option>
                    <option value="atmosphere" ${s.type === 'atmosphere' ? 'selected' : ''}>🌲 Atmosphere</option>
                  </select>
                </div>
                <div class="form-group" style="width: 100px;">
                  <label class="form-label">Fade (sec)</label>
                  <input type="number" id="stage-input-fade" class="form-input" min="0" max="30" step="0.5" value="${s.crossfadeSec || 4.0}">
                </div>
                <div class="form-group" style="width: 70px;">
                  <label class="form-label">Hotkey</label>
                  <input type="text" id="stage-input-hotkey" class="form-input" maxlength="2" value="${s.hotkey || ''}" placeholder="1-9" style="text-align: center; font-weight: 700;">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Atmosphere Description</label>
                <textarea id="stage-input-desc" class="form-textarea" rows="2" placeholder="Sensory details for the DM to narrate...">${s.description || ''}</textarea>
              </div>
            </div>

            <!-- Emoji Catalog -->
            <div class="inspector-section">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <label class="form-label" style="margin: 0;">Pin Icon</label>
                <span style="font-size: 11px; color: var(--text-muted);">Choose Map Badge</span>
              </div>
              <div class="emoji-catalog-grid">
                ${RPG_EMOJI_CATALOG.map(item => `
                  <button type="button" class="emoji-picker-btn ${item.icon === s.icon ? 'selected' : ''}" data-icon="${item.icon}" title="${item.label}">
                    ${item.icon}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Right Column: 3-Layer Audio Tracks -->
          <div class="inspector-col-right">
            <!-- 1. MUSIC LAYER -->
            <div class="layer-config-box">
              <div class="layer-config-header">
                <div class="layer-header-title">
                  <span class="layer-icon">🎵</span>
                  <span class="layer-name">Music Layer</span>
                </div>
                <div class="layer-vol-ctrl">
                  <span class="layer-vol-label">Default Vol:</span>
                  <input type="range" id="vol-music" class="volume-slider" min="0" max="1" step="0.05" value="${musicLayer.volume !== undefined ? musicLayer.volume : 0.7}">
                  <span id="vol-music-val" class="layer-vol-percent">${musicVolPercent}%</span>
                </div>
              </div>

              <div class="layer-tracks-list">
                ${(musicLayer.tracks || []).map((t, idx) => this.renderTrackItem('music', t, idx)).join('')}
                ${(!musicLayer.tracks || musicLayer.tracks.length === 0) ? `
                  <div class="empty-layer-hint">No music track assigned. Add local audio or YouTube/Spotify link below.</div>
                ` : ''}
              </div>

              <button type="button" id="btn-add-music-track" class="btn-subtle-add">+ Add Music Track</button>
            </div>

            <!-- 2. AMBIENCE LAYER -->
            <div class="layer-config-box">
              <div class="layer-config-header">
                <div class="layer-header-title">
                  <span class="layer-icon">🌲</span>
                  <span class="layer-name">Ambience Layer</span>
                </div>
                <div class="layer-vol-ctrl">
                  <span class="layer-vol-label">Default Vol:</span>
                  <input type="range" id="vol-ambience" class="volume-slider" min="0" max="1" step="0.05" value="${ambLayer.volume !== undefined ? ambLayer.volume : 0.55}">
                  <span id="vol-ambience-val" class="layer-vol-percent">${ambVolPercent}%</span>
                </div>
              </div>

              <div class="layer-tracks-list">
                ${(ambLayer.tracks || []).map((t, idx) => this.renderTrackItem('ambience', t, idx)).join('')}
                ${(!ambLayer.tracks || ambLayer.tracks.length === 0) ? `
                  <div class="empty-layer-hint">No ambience loop assigned. Add local environmental loop or stream below.</div>
                ` : ''}
              </div>

              <button type="button" id="btn-add-ambience-track" class="btn-subtle-add">+ Add Ambience Track</button>
            </div>

            <!-- 3. EFFECTS LAYER -->
            <div class="layer-config-box">
              <div class="layer-config-header">
                <div class="layer-header-title">
                  <span class="layer-icon">⚡</span>
                  <span class="layer-name">Effects Layer (SFX)</span>
                </div>
                <div class="layer-vol-ctrl">
                  <span class="layer-vol-label">Default Vol:</span>
                  <input type="range" id="vol-effects" class="volume-slider" min="0" max="1" step="0.05" value="${fxLayer.volume !== undefined ? fxLayer.volume : 0.85}">
                  <span id="vol-effects-val" class="layer-vol-percent">${fxVolPercent}%</span>
                </div>
              </div>

              <div class="layer-triggers-grid">
                ${(fxLayer.triggers || []).map((trig, idx) => `
                  <div class="trigger-config-card" data-idx="${idx}">
                    <div class="trigger-card-top">
                      <span class="trigger-icon">${trig.icon || '⚔️'}</span>
                      <input type="text" class="form-input form-input-sm trigger-label-input" value="${trig.label || ''}" placeholder="Trigger Name" data-idx="${idx}">
                      <input type="text" class="form-input form-input-sm trigger-key-input" maxlength="1" value="${trig.hotkey || ''}" placeholder="Key" data-idx="${idx}">
                      <button type="button" class="btn-icon-subtle btn-preview-fx" data-file="${trig.file || ''}" title="Test Sound">▶</button>
                      <button type="button" class="btn-icon-subtle btn-del-fx" data-idx="${idx}" title="Remove">✕</button>
                    </div>
                    <input type="text" class="form-input form-input-sm trigger-file-input" value="${trig.file || ''}" placeholder="audio/effects/sound.wav" data-idx="${idx}">
                  </div>
                `).join('')}
                ${(!fxLayer.triggers || fxLayer.triggers.length === 0) ? `
                  <div class="empty-layer-hint">No one-shot sound effects configured. Add instant triggers below.</div>
                ` : ''}
              </div>

              <button type="button" id="btn-add-fx-trigger" class="btn-subtle-add">+ Add One-Shot Trigger</button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="modal-footer">
          <button id="btn-inspector-done" class="btn-primary">Apply & Close</button>
        </footer>
      </div>
    `;

    this.bindEvents();
  }

  renderTrackItem(layerKey, track, idx) {
    const isExpanded = this.expandedTrackIndexes[layerKey].has(idx);
    const title = track.title || 'Untitled Track';
    const file = track.file || track.source || '';
    const startSec = track.startSec !== undefined && track.startSec !== null ? track.startSec : 0;
    const endSec = track.endSec !== undefined && track.endSec !== null ? track.endSec : '';
    const isStream = file.includes('youtube.com') || file.includes('youtu.be') || file.includes('spotify.com');

    return `
      <div class="track-card-clean ${isExpanded ? 'expanded' : ''}" data-layer="${layerKey}" data-idx="${idx}">
        <div class="track-card-summary" data-layer="${layerKey}" data-idx="${idx}">
          <div class="track-summary-left">
            <span class="track-source-badge">${isStream ? (file.includes('spotify') ? 'Spotify' : 'YouTube') : 'Local'}</span>
            <span class="track-title-text">${title}</span>
            ${(startSec > 0 || endSec !== '') ? `<span class="cue-badge">${startSec}s - ${endSec || 'End'}s</span>` : ''}
          </div>
          <div class="track-summary-right">
            ${!isStream ? `
              <button type="button" class="btn-track-audition" data-file="${file}" title="Audition Track">▶</button>
            ` : ''}
            <span class="track-chevron">${isExpanded ? '▲' : '▼'}</span>
          </div>
        </div>

        ${isExpanded ? `
          <div class="track-card-details">
            <div class="form-group">
              <label class="form-label">Track Title</label>
              <input type="text" class="form-input form-input-sm track-input-title" value="${title}" data-layer="${layerKey}" data-idx="${idx}">
            </div>
            <div class="form-group">
              <label class="form-label">Audio File Path or Stream URL</label>
              <input type="text" class="form-input form-input-sm track-input-file" value="${file}" placeholder="audio/music/track.mp3 or YouTube/Spotify URL" data-layer="${layerKey}" data-idx="${idx}">
            </div>
            <div class="form-row" style="margin-top: 4px;">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Cue Start (sec)</label>
                <input type="number" class="form-input form-input-sm track-input-start" min="0" step="1" value="${startSec}" data-layer="${layerKey}" data-idx="${idx}">
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Cue End (sec)</label>
                <input type="number" class="form-input form-input-sm track-input-end" min="0" step="1" value="${endSec}" placeholder="Full track" data-layer="${layerKey}" data-idx="${idx}">
              </div>
              <div style="display:flex; align-items:flex-end;">
                <button type="button" class="btn-subtle-reset btn-reset-cue" data-layer="${layerKey}" data-idx="${idx}">Reset Cue</button>
              </div>
            </div>
            <div style="display:flex; justify-content:flex-end; margin-top: 6px;">
              <button type="button" class="btn-danger-text btn-del-track" data-layer="${layerKey}" data-idx="${idx}">Remove Track</button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  bindEvents() {
    if (!this.modalEl || !this.stage) return;

    // Close buttons
    this.modalEl.querySelector('#btn-inspector-close')?.addEventListener('click', () => this.saveAndClose());
    this.modalEl.querySelector('#btn-inspector-done')?.addEventListener('click', () => this.saveAndClose());
    
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.saveAndClose();
    });

    // Delete stage
    this.modalEl.querySelector('#btn-inspector-delete')?.addEventListener('click', () => {
      if (confirm(`Delete stage "${this.stage.label}"?`)) {
        const id = this.stage.id;
        this.close();
        if (this.onDelete) this.onDelete(id);
      }
    });

    // Live metadata inputs
    this.modalEl.querySelector('#stage-input-label')?.addEventListener('input', (e) => {
      this.stage.label = e.target.value;
      if (this.onStageUpdated) this.onStageUpdated(this.stage);
    });

    this.modalEl.querySelector('#stage-select-type')?.addEventListener('change', (e) => {
      this.stage.type = e.target.value;
      if (this.onStageUpdated) this.onStageUpdated(this.stage);
    });

    this.modalEl.querySelector('#stage-input-fade')?.addEventListener('change', (e) => {
      this.stage.crossfadeSec = parseFloat(e.target.value) || 4.0;
    });

    this.modalEl.querySelector('#stage-input-hotkey')?.addEventListener('input', (e) => {
      this.stage.hotkey = e.target.value.trim().toUpperCase();
      if (this.onStageUpdated) this.onStageUpdated(this.stage);
    });

    this.modalEl.querySelector('#stage-input-desc')?.addEventListener('input', (e) => {
      this.stage.description = e.target.value;
    });

    // Emoji Catalog Picker
    this.modalEl.querySelectorAll('.emoji-picker-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const icon = btn.getAttribute('data-icon');
        this.stage.icon = icon;
        this.modalEl.querySelectorAll('.emoji-picker-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const badge = this.modalEl.querySelector('#inspector-current-icon');
        if (badge) badge.textContent = icon;
        if (this.onStageUpdated) this.onStageUpdated(this.stage);
      });
    });

    // Volume Sliders
    const bindVol = (sliderId, labelId, layerKey) => {
      const slider = this.modalEl.querySelector(`#${sliderId}`);
      const valLabel = this.modalEl.querySelector(`#${labelId}`);
      slider?.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (this.stage.layers[layerKey]) {
          this.stage.layers[layerKey].volume = val;
        }
        if (valLabel) valLabel.textContent = `${Math.round(val * 100)}%`;
      });
    };
    bindVol('vol-music', 'vol-music-val', 'music');
    bindVol('vol-ambience', 'vol-ambience-val', 'ambience');
    bindVol('vol-effects', 'vol-effects-val', 'effects');

    // Add Track Buttons
    this.modalEl.querySelector('#btn-add-music-track')?.addEventListener('click', () => {
      if (!this.stage.layers.music.tracks) this.stage.layers.music.tracks = [];
      const newIdx = this.stage.layers.music.tracks.length;
      this.stage.layers.music.tracks.push({
        title: 'New Music Track',
        file: 'audio/music/tavern_strings.mp3',
        startSec: 0,
        endSec: null
      });
      this.expandedTrackIndexes.music.add(newIdx);
      this.render();
    });

    this.modalEl.querySelector('#btn-add-ambience-track')?.addEventListener('click', () => {
      if (!this.stage.layers.ambience.tracks) this.stage.layers.ambience.tracks = [];
      const newIdx = this.stage.layers.ambience.tracks.length;
      this.stage.layers.ambience.tracks.push({
        title: 'New Ambience Track',
        file: 'audio/ambience/hearthfire_ambience.mp3',
        startSec: 0,
        endSec: null
      });
      this.expandedTrackIndexes.ambience.add(newIdx);
      this.render();
    });

    this.modalEl.querySelector('#btn-add-fx-trigger')?.addEventListener('click', () => {
      if (!this.stage.layers.effects.triggers) this.stage.layers.effects.triggers = [];
      this.stage.layers.effects.triggers.push({
        id: generateId('sfx'),
        label: 'New Sound Effect',
        icon: '⚔️',
        hotkey: '',
        file: 'audio/effects/sword_clash.wav'
      });
      this.render();
    });

    // Toggle Track expansion
    this.modalEl.querySelectorAll('.track-card-summary').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.btn-track-audition')) return;
        const layer = el.getAttribute('data-layer');
        const idx = parseInt(el.getAttribute('data-idx'), 10);
        if (this.expandedTrackIndexes[layer].has(idx)) {
          this.expandedTrackIndexes[layer].delete(idx);
        } else {
          this.expandedTrackIndexes[layer].add(idx);
        }
        this.render();
      });
    });

    // Audition preview buttons
    this.modalEl.querySelectorAll('.btn-track-audition').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        let file = btn.getAttribute('data-file');
        if (this.adventure && !file.startsWith('http') && !file.startsWith('/')) {
          file = `adventures/${this.adventure.id}/${file}`;
        }
        this.playAudioPreview(file);
      });
    });

    // Track editing inputs
    this.modalEl.querySelectorAll('.track-input-title').forEach(input => {
      input.addEventListener('input', (e) => {
        const layer = e.target.getAttribute('data-layer');
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (this.stage.layers[layer]?.tracks?.[idx]) {
          this.stage.layers[layer].tracks[idx].title = e.target.value;
        }
      });
    });

    this.modalEl.querySelectorAll('.track-input-file').forEach(input => {
      input.addEventListener('change', (e) => {
        const layer = e.target.getAttribute('data-layer');
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (this.stage.layers[layer]?.tracks?.[idx]) {
          this.stage.layers[layer].tracks[idx].file = e.target.value;
        }
      });
    });

    this.modalEl.querySelectorAll('.track-input-start').forEach(input => {
      input.addEventListener('change', (e) => {
        const layer = e.target.getAttribute('data-layer');
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (this.stage.layers[layer]?.tracks?.[idx]) {
          this.stage.layers[layer].tracks[idx].startSec = parseFloat(e.target.value) || 0;
        }
      });
    });

    this.modalEl.querySelectorAll('.track-input-end').forEach(input => {
      input.addEventListener('change', (e) => {
        const layer = e.target.getAttribute('data-layer');
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (this.stage.layers[layer]?.tracks?.[idx]) {
          const val = e.target.value.trim();
          this.stage.layers[layer].tracks[idx].endSec = val === '' ? null : parseFloat(val);
        }
      });
    });

    this.modalEl.querySelectorAll('.btn-reset-cue').forEach(btn => {
      btn.addEventListener('click', () => {
        const layer = btn.getAttribute('data-layer');
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (this.stage.layers[layer]?.tracks?.[idx]) {
          this.stage.layers[layer].tracks[idx].startSec = 0;
          this.stage.layers[layer].tracks[idx].endSec = null;
          this.render();
        }
      });
    });

    this.modalEl.querySelectorAll('.btn-del-track').forEach(btn => {
      btn.addEventListener('click', () => {
        const layer = btn.getAttribute('data-layer');
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (this.stage.layers[layer]?.tracks) {
          this.stage.layers[layer].tracks.splice(idx, 1);
          this.expandedTrackIndexes[layer].delete(idx);
          this.render();
        }
      });
    });

    // FX Triggers editing
    this.modalEl.querySelectorAll('.trigger-label-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (this.stage.layers.effects.triggers[idx]) {
          this.stage.layers.effects.triggers[idx].label = e.target.value;
        }
      });
    });

    this.modalEl.querySelectorAll('.trigger-key-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (this.stage.layers.effects.triggers[idx]) {
          this.stage.layers.effects.triggers[idx].hotkey = e.target.value.trim().toUpperCase();
        }
      });
    });

    this.modalEl.querySelectorAll('.trigger-file-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (this.stage.layers.effects.triggers[idx]) {
          this.stage.layers.effects.triggers[idx].file = e.target.value;
        }
      });
    });

    this.modalEl.querySelectorAll('.btn-preview-fx').forEach(btn => {
      btn.addEventListener('click', () => {
        let file = btn.getAttribute('data-file');
        if (this.adventure && !file.startsWith('http') && !file.startsWith('/')) {
          file = `adventures/${this.adventure.id}/${file}`;
        }
        this.playAudioPreview(file);
      });
    });

    this.modalEl.querySelectorAll('.btn-del-fx').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (this.stage.layers.effects.triggers) {
          this.stage.layers.effects.triggers.splice(idx, 1);
          this.render();
        }
      });
    });
  }

  saveAndClose() {
    this.close();
    if (this.onSave) {
      this.onSave(this.stage);
    }
  }

  addTrackFromDrop(layerKey, fileName, relPath) {
    if (!this.stage || !this.stage.layers) return;
    const cleanTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const formattedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    if (layerKey === 'effects') {
      if (!this.stage.layers.effects.triggers) this.stage.layers.effects.triggers = [];
      this.stage.layers.effects.triggers.push({
        id: generateId('sfx'),
        label: formattedTitle,
        icon: '⚡',
        hotkey: '',
        file: relPath
      });
    } else {
      if (!this.stage.layers[layerKey]) {
        this.stage.layers[layerKey] = { name: layerKey, volume: 0.7, tracks: [] };
      }
      if (!this.stage.layers[layerKey].tracks) this.stage.layers[layerKey].tracks = [];
      const newIdx = this.stage.layers[layerKey].tracks.length;
      this.stage.layers[layerKey].tracks.push({
        title: formattedTitle,
        file: relPath,
        startSec: 0,
        endSec: null
      });
      this.expandedTrackIndexes[layerKey].add(newIdx);
    }

    this.render();
    showToast(`Added track "${formattedTitle}" to ${layerKey}!`, 'success');
  }
}
