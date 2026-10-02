/**
 * DnD-Soundscape: Stage Context Menu (Minimal, Non-blocking Floating Card)
 * High-density, intuitive tabletop audio manager anchored beside the map.
 * Includes complete, obvious Credit & Attribution controls for every track and sound.
 */

import { generateId, showToast } from '../utils/helpers.js';

export const RPG_EMOJIS = [
  { icon: '🍺', label: 'Tavern' },
  { icon: '⚔️', label: 'Combat' },
  { icon: '🕯️', label: 'Cavern / Crypt' },
  { icon: '🏰', label: 'Castle / Manor' },
  { icon: '🌲', label: 'Forest / Wild' },
  { icon: '💀', label: 'Boss / Danger' },
  { icon: '🏹', label: 'Ambush' },
  { icon: '🛡️', label: 'Defense' },
  { icon: '🏔️', label: 'Mountain' },
  { icon: '🏕️', label: 'Campsite' },
  { icon: '💎', label: 'Treasure' },
  { icon: '⚡', label: 'Thunder / Magic' },
  { icon: '🔥', label: 'Hearthfire' },
  { icon: '🌊', label: 'Water / Echo' },
  { icon: '🐉', label: 'Dragon' },
  { icon: '👺', label: 'Goblin' },
  { icon: '🐺', label: 'Wolf' },
  { icon: '🧙', label: 'Mage' },
  { icon: '🔮', label: 'Arcane' },
  { icon: '🚪', label: 'Door' }
];

export const PRESET_TRACKS = {
  music: [
    {
      title: 'Cozy Tavern Strings (Adrian von Ziegler)',
      file: 'audio/music/tavern_strings.mp3',
      credit: 'Adrian von Ziegler - The Gilded Tavern',
      sourceUrl: 'https://www.youtube.com/watch?v=orgikrTCKTc'
    },
    {
      title: 'Triboar Skirmish (Soundtale RPG)',
      file: 'audio/music/ambush_combat.mp3',
      credit: 'Soundtale RPG - A Snowy Skirmish',
      sourceUrl: 'https://www.youtube.com/watch?v=gfKUmcAjk0k'
    },
    {
      title: 'Cragmaw Cavern Depths (Soundtale RPG)',
      file: 'audio/music/cragmaw_caverns.mp3',
      credit: 'Soundtale RPG - Mora the Spider (Caverns)',
      sourceUrl: 'https://www.youtube.com/watch?v=iVQSL9Mqlpo'
    },
    {
      title: 'Tresendar Manor Cellars (Soundtale RPG)',
      file: 'audio/music/tresendar_manor.mp3',
      credit: 'Soundtale RPG - Haunted Castle Cellars',
      sourceUrl: 'https://www.youtube.com/watch?v=4ZelokMWpCk'
    },
    {
      title: 'Ruins of Thundertree Dread (Soundtale RPG)',
      file: 'audio/music/thundertree_ruins.mp3',
      credit: 'Soundtale RPG - Aberration Fight',
      sourceUrl: 'https://www.youtube.com/watch?v=WahaiTaVw2k'
    },
    {
      title: 'Wave Echo Cave Climax (Soundtale RPG)',
      file: 'audio/music/wave_echo_climax.mp3',
      credit: 'Soundtale RPG - Shriek Final Phase',
      sourceUrl: 'https://www.youtube.com/watch?v=an-PRFDsxUA'
    }
  ],
  ambience: [
    {
      title: 'Crowded Stonehill Tavern (Michael Ghelfi)',
      file: 'audio/ambience/stonehill_crowd.mp3',
      credit: 'Michael Ghelfi Studios - Crowded Tavern',
      sourceUrl: 'https://www.youtube.com/watch?v=ylj4IS7WP1o'
    },
    {
      title: 'Triboar Trail Mountain Wind (Soundtale RPG)',
      file: 'audio/ambience/triboar_wind.mp3',
      credit: 'Soundtale RPG - Nordland Mountain Winds',
      sourceUrl: 'https://www.youtube.com/watch?v=lkHiqZQilYA'
    },
    {
      title: 'Subterranean Cavern Stream (Soundtale RPG)',
      file: 'audio/ambience/cragmaw_stream_cavern.mp3',
      credit: 'Soundtale RPG - In Wonderment of Winter (Cavern Stream)',
      sourceUrl: 'https://www.youtube.com/watch?v=8z0FC8A3Djk'
    },
    {
      title: 'Tresendar Crypt Draught & Void (Soundtale RPG)',
      file: 'audio/ambience/tresendar_crypt_void.mp3',
      credit: 'Soundtale RPG - The Void (Subterranean Crypt)',
      sourceUrl: 'https://www.youtube.com/watch?v=d3kAxuQSSdA'
    },
    {
      title: 'Thundertree Ashen Howling Winds (White Noise Jack)',
      file: 'audio/ambience/thundertree_ashen_winds.mp3',
      credit: 'White Noise Jack - Howling Wind in Ruins',
      sourceUrl: 'https://www.youtube.com/watch?v=829s22QZmgI'
    },
    {
      title: 'Forge of Spells Arcane Resonance (Soundtale RPG)',
      file: 'audio/ambience/arcane_forge_hum.mp3',
      credit: 'Soundtale RPG - Arcane Forge Shrine Resonance',
      sourceUrl: 'https://www.youtube.com/watch?v=4AyfLQ3i3V4'
    }
  ]
};

export class StageInspectorModal {
  constructor(options = {}) {
    this.panelEl = null;
    this.stage = null;
    this.adventure = null;
    this.isOpen = false;
    this.showEmojiPicker = false;
    this.onSave = options.onSave;
    this.onDelete = options.onDelete;
    this.onStageUpdated = options.onStageUpdated;
    this.previewAudioEl = null;
    this.activePreviewFile = null;
  }

  init() {
    let el = document.getElementById('stage-context-panel');
    if (!el) {
      el = document.createElement('div');
      el.id = 'stage-context-panel';
      el.className = 'stage-context-panel hidden';
      const container = document.getElementById('stage-viewport') || document.body;
      container.appendChild(el);
    }
    this.panelEl = el;
  }

  open(stage, adventure) {
    if (!this.panelEl) this.init();
    this.stage = stage;
    this.adventure = adventure;
    this.isOpen = true;
    this.showEmojiPicker = false;

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
    this.panelEl.classList.remove('hidden');
  }

  close() {
    this.stopPreviewAudio();
    this.isOpen = false;
    this.showEmojiPicker = false;
    if (this.panelEl) this.panelEl.classList.add('hidden');
    if (this.onSave && this.stage) {
      this.onSave(this.stage);
    }
  }

  stopPreviewAudio() {
    if (this.previewAudioEl) {
      this.previewAudioEl.pause();
      this.previewAudioEl = null;
      this.activePreviewFile = null;
    }
  }

  togglePreview(file) {
    if (!file) return;
    if (this.activePreviewFile === file && this.previewAudioEl && !this.previewAudioEl.paused) {
      this.stopPreviewAudio();
      this.render();
      return;
    }
    this.stopPreviewAudio();
    let url = file;
    if (this.adventure && !url.startsWith('http') && !url.startsWith('/')) {
      url = `adventures/${this.adventure.id}/${url}`;
    }
    try {
      this.previewAudioEl = new Audio(url);
      this.previewAudioEl.volume = 0.8;
      this.activePreviewFile = file;
      this.previewAudioEl.play().catch(e => console.warn('Preview blocked:', e));
      this.previewAudioEl.onended = () => {
        this.activePreviewFile = null;
        this.render();
      };
      this.render();
    } catch (e) {
      console.warn('Audio preview error:', e);
    }
  }

  render() {
    if (!this.panelEl || !this.stage) return;

    const s = this.stage;
    const musicLayer = s.layers.music;
    const ambLayer = s.layers.ambience;
    const fxLayer = s.layers.effects;

    const musicVol = musicLayer.volume !== undefined ? musicLayer.volume : 0.7;
    const ambVol = ambLayer.volume !== undefined ? ambLayer.volume : 0.55;
    const fxVol = fxLayer.volume !== undefined ? fxLayer.volume : 0.85;

    const curMusicTrack = musicLayer.tracks?.[0] || { title: 'None', file: '', credit: '', sourceUrl: '' };
    const curAmbTrack = ambLayer.tracks?.[0] || { title: 'None', file: '', credit: '', sourceUrl: '' };

    const isMusicCustom = curMusicTrack.file && !PRESET_TRACKS.music.some(p => p.file === curMusicTrack.file);
    const isAmbCustom = curAmbTrack.file && !PRESET_TRACKS.ambience.some(p => p.file === curAmbTrack.file);

    this.panelEl.innerHTML = `
      <!-- Compact Header -->
      <div class="ctx-header">
        <button type="button" id="ctx-icon-badge" class="ctx-icon-badge" title="Click to change icon">
          <span>${s.icon || '🗺️'}</span>
        </button>
        <input type="text" id="ctx-stage-title" class="ctx-title-input" value="${s.label || ''}" placeholder="Stage Name">
        <div class="ctx-header-actions">
          <button type="button" id="ctx-btn-delete" class="ctx-btn-icon ctx-btn-danger" title="Delete Stage">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
          <button type="button" id="ctx-btn-close" class="ctx-btn-icon" title="Close (Esc)">✕</button>
        </div>
      </div>

      <!-- Quick Inline Emoji Drawer -->
      <div id="ctx-emoji-drawer" class="ctx-emoji-drawer ${this.showEmojiPicker ? '' : 'hidden'}">
        ${RPG_EMOJIS.map(item => `
          <button type="button" class="ctx-emoji-chip ${item.icon === s.icon ? 'active' : ''}" data-icon="${item.icon}" title="${item.label}">
            ${item.icon}
          </button>
        `).join('')}
      </div>

      <!-- 1. MUSIC LAYER -->
      <div class="ctx-section">
        <div class="ctx-section-header">
          <span class="ctx-section-title">🎵 Music Soundtrack</span>
          <div class="ctx-vol-wrapper">
            <input type="range" id="ctx-vol-music" class="ctx-slider" min="0" max="1" step="0.05" value="${musicVol}">
            <span id="ctx-vol-music-val" class="ctx-vol-label">${Math.round(musicVol * 100)}%</span>
          </div>
        </div>
        <div class="ctx-track-row">
          <select id="ctx-music-select" class="ctx-select">
            ${PRESET_TRACKS.music.map(p => `
              <option value="${p.file}" ${curMusicTrack.file === p.file ? 'selected' : ''}>${p.title}</option>
            `).join('')}
            <option value="__custom__" ${isMusicCustom ? 'selected' : ''}>🔗 Custom / Stream URL...</option>
          </select>
          <button type="button" id="ctx-music-preview" class="ctx-preview-btn ${this.activePreviewFile === curMusicTrack.file ? 'playing' : ''}" title="Test Soundtrack">
            ${this.activePreviewFile === curMusicTrack.file ? '⏹' : '▶'}
          </button>
        </div>
        <div id="ctx-music-custom-box" class="ctx-custom-box ${isMusicCustom ? '' : 'hidden'}">
          <input type="text" id="ctx-music-url" class="ctx-input-sm" placeholder="Paste YouTube, Spotify, or audio URL..." value="${curMusicTrack.file || ''}">
        </div>

        <!-- Obvious Music Credit & Attribution Field -->
        <div class="ctx-attribution-card">
          <div class="ctx-attr-header">
            <span class="ctx-attr-badge">📜 Music Attribution</span>
            ${curMusicTrack.sourceUrl ? `
              <a href="${curMusicTrack.sourceUrl}" target="_blank" rel="noopener" class="ctx-attr-link" title="Open source URL">
                🔗 View Source ↗
              </a>
            ` : ''}
          </div>
          <div class="ctx-attr-grid">
            <div class="ctx-attr-item">
              <span class="ctx-attr-lbl">Artist:</span>
              <input type="text" id="ctx-music-credit" class="ctx-attr-input" placeholder="e.g. Adrian von Ziegler" value="${curMusicTrack.credit || ''}">
            </div>
            <div class="ctx-attr-item">
              <span class="ctx-attr-lbl">Source URL:</span>
              <input type="text" id="ctx-music-source" class="ctx-attr-input" placeholder="https://..." value="${curMusicTrack.sourceUrl || ''}">
            </div>
          </div>
        </div>
      </div>

      <!-- 2. AMBIENCE LAYER -->
      <div class="ctx-section">
        <div class="ctx-section-header">
          <span class="ctx-section-title">🌲 Ambient Atmosphere</span>
          <div class="ctx-vol-wrapper">
            <input type="range" id="ctx-vol-amb" class="ctx-slider" min="0" max="1" step="0.05" value="${ambVol}">
            <span id="ctx-vol-amb-val" class="ctx-vol-label">${Math.round(ambVol * 100)}%</span>
          </div>
        </div>
        <div class="ctx-track-row">
          <select id="ctx-amb-select" class="ctx-select">
            ${PRESET_TRACKS.ambience.map(p => `
              <option value="${p.file}" ${curAmbTrack.file === p.file ? 'selected' : ''}>${p.title}</option>
            `).join('')}
            <option value="__custom__" ${isAmbCustom ? 'selected' : ''}>🔗 Custom / Stream URL...</option>
          </select>
          <button type="button" id="ctx-amb-preview" class="ctx-preview-btn ${this.activePreviewFile === curAmbTrack.file ? 'playing' : ''}" title="Test Ambience">
            ${this.activePreviewFile === curAmbTrack.file ? '⏹' : '▶'}
          </button>
        </div>
        <div id="ctx-amb-custom-box" class="ctx-custom-box ${isAmbCustom ? '' : 'hidden'}">
          <input type="text" id="ctx-amb-url" class="ctx-input-sm" placeholder="Paste YouTube, Spotify, or audio URL..." value="${curAmbTrack.file || ''}">
        </div>

        <!-- Obvious Ambience Credit & Attribution Field -->
        <div class="ctx-attribution-card">
          <div class="ctx-attr-header">
            <span class="ctx-attr-badge">📜 Ambience Attribution</span>
            ${curAmbTrack.sourceUrl ? `
              <a href="${curAmbTrack.sourceUrl}" target="_blank" rel="noopener" class="ctx-attr-link" title="Open source URL">
                🔗 View Source ↗
              </a>
            ` : ''}
          </div>
          <div class="ctx-attr-grid">
            <div class="ctx-attr-item">
              <span class="ctx-attr-lbl">Artist:</span>
              <input type="text" id="ctx-amb-credit" class="ctx-attr-input" placeholder="e.g. Michael Ghelfi" value="${curAmbTrack.credit || ''}">
            </div>
            <div class="ctx-attr-item">
              <span class="ctx-attr-lbl">Source URL:</span>
              <input type="text" id="ctx-amb-source" class="ctx-attr-input" placeholder="https://..." value="${curAmbTrack.sourceUrl || ''}">
            </div>
          </div>
        </div>
      </div>

      <!-- 3. INSTANT EFFECTS (SFX) -->
      <div class="ctx-section">
        <div class="ctx-section-header">
          <span class="ctx-section-title">⚡ Stage SFX Triggers</span>
          <div class="ctx-vol-wrapper">
            <input type="range" id="ctx-vol-fx" class="ctx-slider" min="0" max="1" step="0.05" value="${fxVol}">
            <span id="ctx-vol-fx-val" class="ctx-vol-label">${Math.round(fxVol * 100)}%</span>
          </div>
        </div>
        <div class="ctx-triggers-row">
          ${(fxLayer.triggers || []).map((trig, idx) => `
            <button type="button" class="ctx-sfx-chip" data-idx="${idx}" title="${trig.label} (Credit: ${trig.credit || 'RPG SFX'})">
              <span>${trig.icon || '⚡'}</span>
              <span class="ctx-sfx-label">${trig.label}</span>
              ${trig.hotkey ? `<kbd class="ctx-sfx-key">${trig.hotkey}</kbd>` : ''}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    if (!this.panelEl || !this.stage) return;

    // Close
    this.panelEl.querySelector('#ctx-btn-close')?.addEventListener('click', () => this.close());

    // Delete stage
    this.panelEl.querySelector('#ctx-btn-delete')?.addEventListener('click', () => {
      if (confirm(`Delete location "${this.stage.label}"?`)) {
        const id = this.stage.id;
        this.close();
        if (this.onDelete) this.onDelete(id);
      }
    });

    // Icon Picker toggle
    this.panelEl.querySelector('#ctx-icon-badge')?.addEventListener('click', () => {
      this.showEmojiPicker = !this.showEmojiPicker;
      this.panelEl.querySelector('#ctx-emoji-drawer')?.classList.toggle('hidden', !this.showEmojiPicker);
    });

    // Emoji chip selection
    this.panelEl.querySelectorAll('.ctx-emoji-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const icon = btn.getAttribute('data-icon');
        this.stage.icon = icon;
        this.showEmojiPicker = false;
        this.render();
        if (this.onStageUpdated) this.onStageUpdated(this.stage);
        if (this.onSave) this.onSave(this.stage);
      });
    });

    // Title input
    this.panelEl.querySelector('#ctx-stage-title')?.addEventListener('input', (e) => {
      this.stage.label = e.target.value;
      if (this.onStageUpdated) this.onStageUpdated(this.stage);
      if (this.onSave) this.onSave(this.stage);
    });

    // Music Volume
    this.panelEl.querySelector('#ctx-vol-music')?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.stage.layers.music.volume = val;
      const lbl = this.panelEl.querySelector('#ctx-vol-music-val');
      if (lbl) lbl.textContent = `${Math.round(val * 100)}%`;
      if (this.onSave) this.onSave(this.stage);
    });

    // Ambience Volume
    this.panelEl.querySelector('#ctx-vol-amb')?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.stage.layers.ambience.volume = val;
      const lbl = this.panelEl.querySelector('#ctx-vol-amb-val');
      if (lbl) lbl.textContent = `${Math.round(val * 100)}%`;
      if (this.onSave) this.onSave(this.stage);
    });

    // FX Volume
    this.panelEl.querySelector('#ctx-vol-fx')?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.stage.layers.effects.volume = val;
      const lbl = this.panelEl.querySelector('#ctx-vol-fx-val');
      if (lbl) lbl.textContent = `${Math.round(val * 100)}%`;
      if (this.onSave) this.onSave(this.stage);
    });

    // Music Track Select
    this.panelEl.querySelector('#ctx-music-select')?.addEventListener('change', (e) => {
      const val = e.target.value;
      const customBox = this.panelEl.querySelector('#ctx-music-custom-box');
      if (val === '__custom__') {
        customBox?.classList.remove('hidden');
      } else {
        customBox?.classList.add('hidden');
        const match = PRESET_TRACKS.music.find(p => p.file === val);
        const cur = this.stage.layers.music.tracks?.[0] || {};
        this.stage.layers.music.tracks = [{
          title: match ? match.title : 'Soundtrack',
          file: val,
          credit: match?.credit || cur.credit || 'Tabletop Music',
          sourceUrl: match?.sourceUrl || cur.sourceUrl || '',
          startSec: 0,
          endSec: null
        }];
        this.render();
        if (this.onSave) this.onSave(this.stage);
      }
    });

    // Music Custom URL
    this.panelEl.querySelector('#ctx-music-url')?.addEventListener('change', (e) => {
      const url = e.target.value.trim();
      if (url) {
        const cur = this.stage.layers.music.tracks?.[0] || {};
        this.stage.layers.music.tracks = [{
          title: 'Custom Stream Track',
          file: url,
          credit: cur.credit || 'Stream Source',
          sourceUrl: url,
          startSec: 0,
          endSec: null
        }];
        this.render();
        if (this.onSave) this.onSave(this.stage);
      }
    });

    // Music Credit Edit
    this.panelEl.querySelector('#ctx-music-credit')?.addEventListener('input', (e) => {
      if (!this.stage.layers.music.tracks?.[0]) {
        this.stage.layers.music.tracks = [{ title: 'Soundtrack', file: '', startSec: 0, endSec: null }];
      }
      this.stage.layers.music.tracks[0].credit = e.target.value;
      if (this.onSave) this.onSave(this.stage);
    });

    // Music Source URL Edit
    this.panelEl.querySelector('#ctx-music-source')?.addEventListener('input', (e) => {
      if (!this.stage.layers.music.tracks?.[0]) {
        this.stage.layers.music.tracks = [{ title: 'Soundtrack', file: '', startSec: 0, endSec: null }];
      }
      this.stage.layers.music.tracks[0].sourceUrl = e.target.value;
      if (this.onSave) this.onSave(this.stage);
    });

    // Music Preview
    this.panelEl.querySelector('#ctx-music-preview')?.addEventListener('click', () => {
      const file = this.stage.layers.music.tracks?.[0]?.file;
      this.togglePreview(file);
    });

    // Ambience Track Select
    this.panelEl.querySelector('#ctx-amb-select')?.addEventListener('change', (e) => {
      const val = e.target.value;
      const customBox = this.panelEl.querySelector('#ctx-amb-custom-box');
      if (val === '__custom__') {
        customBox?.classList.remove('hidden');
      } else {
        customBox?.classList.add('hidden');
        const match = PRESET_TRACKS.ambience.find(p => p.file === val);
        const cur = this.stage.layers.ambience.tracks?.[0] || {};
        this.stage.layers.ambience.tracks = [{
          title: match ? match.title : 'Ambience Loop',
          file: val,
          credit: match?.credit || cur.credit || 'Tabletop Ambience',
          sourceUrl: match?.sourceUrl || cur.sourceUrl || '',
          startSec: 0,
          endSec: null
        }];
        this.render();
        if (this.onSave) this.onSave(this.stage);
      }
    });

    // Ambience Custom URL
    this.panelEl.querySelector('#ctx-amb-url')?.addEventListener('change', (e) => {
      const url = e.target.value.trim();
      if (url) {
        const cur = this.stage.layers.ambience.tracks?.[0] || {};
        this.stage.layers.ambience.tracks = [{
          title: 'Custom Ambience Stream',
          file: url,
          credit: cur.credit || 'Stream Source',
          sourceUrl: url,
          startSec: 0,
          endSec: null
        }];
        this.render();
        if (this.onSave) this.onSave(this.stage);
      }
    });

    // Ambience Credit Edit
    this.panelEl.querySelector('#ctx-amb-credit')?.addEventListener('input', (e) => {
      if (!this.stage.layers.ambience.tracks?.[0]) {
        this.stage.layers.ambience.tracks = [{ title: 'Ambience Loop', file: '', startSec: 0, endSec: null }];
      }
      this.stage.layers.ambience.tracks[0].credit = e.target.value;
      if (this.onSave) this.onSave(this.stage);
    });

    // Ambience Source URL Edit
    this.panelEl.querySelector('#ctx-amb-source')?.addEventListener('input', (e) => {
      if (!this.stage.layers.ambience.tracks?.[0]) {
        this.stage.layers.ambience.tracks = [{ title: 'Ambience Loop', file: '', startSec: 0, endSec: null }];
      }
      this.stage.layers.ambience.tracks[0].sourceUrl = e.target.value;
      if (this.onSave) this.onSave(this.stage);
    });

    // Ambience Preview
    this.panelEl.querySelector('#ctx-amb-preview')?.addEventListener('click', () => {
      const file = this.stage.layers.ambience.tracks?.[0]?.file;
      this.togglePreview(file);
    });

    // SFX Chips Test
    this.panelEl.querySelectorAll('.ctx-sfx-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const trig = this.stage.layers.effects?.triggers?.[idx];
        if (trig && trig.file) {
          this.togglePreview(trig.file);
        }
      });
    });
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
        file: relPath,
        credit: 'Custom Sound Effect',
        sourceUrl: relPath
      });
    } else {
      if (!this.stage.layers[layerKey]) {
        this.stage.layers[layerKey] = { name: layerKey, volume: 0.7, tracks: [] };
      }
      this.stage.layers[layerKey].tracks = [{
        title: formattedTitle,
        file: relPath,
        credit: 'Custom Audio Track',
        sourceUrl: relPath,
        startSec: 0,
        endSec: null
      }];
    }

    this.render();
    if (this.onSave) this.onSave(this.stage);
    showToast(`Added ${formattedTitle} to ${layerKey}!`, 'success');
  }
}
