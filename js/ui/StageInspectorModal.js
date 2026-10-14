/**
 * DnD-Soundscape: Stage Context Menu (Minimal, Non-blocking Floating Card)
 * High-density, intuitive tabletop audio manager anchored beside the map.
 * Includes complete, obvious Credit & Attribution controls for every track and sound.
 */

import { generateId, showToast } from '../utils/helpers.js';
import {
  RPG_SFX_PRESETS,
  RPG_SFX_CATEGORIES,
  getAdventureEffects,
  getNextAvailableHotkey
} from '../audio/PresetEffects.js';
import { FantasyIcons } from './FantasyIcons.js';

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
      title: 'Low Level Combat: Goblin Ambush (Magalon the Wizard)',
      file: 'audio/music/triboar_combat.mp3',
      credit: 'Magalon the Wizard - Goblin Ambush',
      sourceUrl: 'https://www.youtube.com/watch?v=trlkGTNuwbM'
    },
    {
      title: '02 - Cragmaw Hideout (Goblin Lair Combat)',
      file: 'audio/music/cragmaw_hideout_battle.mp3',
      credit: 'Lyre RPG Music - Lost Mine of Phandelver Soundtrack',
      sourceUrl: 'https://www.youtube.com/watch?v=uUMZwZlKP4s'
    },
    {
      title: 'Tresendar Manor - Redbrand Hideout Exploration',
      file: 'audio/music/tresendar_manor_soundscape.mp3',
      credit: 'Dungeon Crawler Audio - Lost Mines of Phandelver',
      sourceUrl: 'https://www.youtube.com/watch?v=R4sSxgQizYY'
    },
    {
      title: 'Venomfang Attacks (Green Dragon Battle Theme)',
      file: 'audio/music/venomfang_dragon_battle.mp3',
      credit: 'Lyre RPG Music - Lost Mine of Phandelver Soundtrack',
      sourceUrl: 'https://www.youtube.com/watch?v=vfpOPpPHcpM'
    },
    {
      title: 'In the Spider\'s Web (Nezznar Black Spider Combat)',
      file: 'audio/music/nezznar_boss_battle.mp3',
      credit: 'Connor Ragas (CR Productions) - Lost Mine of Phandelver',
      sourceUrl: 'https://www.youtube.com/watch?v=xvOg88-EGQU'
    }
  ],
  ambience: [
    {
      title: 'Crowded Stonehill Tavern (Michael Ghelfi)',
      file: 'audio/ambience/stonehill_crowd.mp3',
      credit: 'Michael Ghelfi Studios - Pure Tavern Murmur',
      sourceUrl: 'https://www.youtube.com/watch?v=ylj4IS7WP1o'
    },
    {
      title: 'Triboar Trail - Peaceful Woodland & Summer Birds',
      file: 'audio/ambience/triboar_forest_birds.mp3',
      credit: 'TheSilentWatcher - Way of the Singing Forest',
      sourceUrl: 'https://www.youtube.com/watch?v=EHklxmBvzwc'
    },
    {
      title: 'Damp Cave Underground River & Cavern Echo',
      file: 'audio/ambience/cragmaw_damp_cave_stream.mp3',
      credit: 'Sword Coast Soundscapes - Damp Cave',
      sourceUrl: 'https://www.youtube.com/watch?v=3Hwr_BaekgM'
    },
    {
      title: 'Tresendar Crypt Room Tone Draught',
      file: 'audio/ambience/pure_dungeon_cellar.mp3',
      credit: 'Horror Ambience FX - Cellar Room Tone',
      sourceUrl: 'https://www.youtube.com'
    },
    {
      title: 'Ruins of Thundertree - Abandoned Town Atmosphere',
      file: 'audio/ambience/thundertree_ruins_ambience.mp3',
      credit: 'Artificial Ambience - Abandoned Ruins Wind',
      sourceUrl: 'https://www.youtube.com/watch?v=XyRjtAaETFI'
    },
    {
      title: 'Wave Echo Cave Subterranean Forge & Deep Cavern',
      file: 'audio/ambience/wave_echo_subterranean_forge.mp3',
      credit: 'MusicByTerperial - Wave Echo Cave FX',
      sourceUrl: 'https://www.youtube.com/watch?v=chBv4M1ICTo'
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
    this.showAddEffectDrawer = false;
    this.activeEffectTab = 'adventure'; // 'adventure' | 'presets' | 'custom'
    this.activePresetCategory = 'all';
    this.onSave = options.onSave;
    this.onDelete = options.onDelete;
    this.onStageUpdated = options.onStageUpdated;
    this.onConfigureTrigger = options.onConfigureTrigger || null;
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
          <button type="button" id="ctx-btn-close" class="ctx-btn-icon" title="Close (Esc)">${FantasyIcons.get('close', { size: 16 })}</button>
        </div>
      </div>

      <!-- Quick Inline Emoji Drawer -->
      <div id="ctx-emoji-drawer" class="ctx-emoji-drawer ${this.showEmojiPicker ? '' : 'hidden'}">
        ${RPG_EMOJIS.map(item => `
          <button type="button" class="ctx-emoji-chip ${item.icon === s.icon ? 'active' : ''}" data-icon="${item.icon}" title="${item.label}">
            ${FantasyIcons.render(item.icon, { size: 18 })}
          </button>
        `).join('')}
      </div>

      <!-- 1. MUSIC LAYER -->
      <div class="ctx-section">
        <div class="ctx-section-header">
          <span class="ctx-section-title">${FantasyIcons.get('d20', { size: 14 })} Music Soundtrack</span>
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
            ${this.activePreviewFile === curMusicTrack.file ? FantasyIcons.get('stop', { size: 12 }) : FantasyIcons.get('play', { size: 12 })}
          </button>
        </div>
        <div id="ctx-music-custom-box" class="ctx-custom-box ${isMusicCustom ? '' : 'hidden'}">
          <input type="text" id="ctx-music-url" class="ctx-input-sm" placeholder="Paste YouTube, Spotify, or audio URL..." value="${curMusicTrack.file || ''}">
        </div>

        <!-- Obvious Music Credit & Attribution Field -->
        <div class="ctx-attribution-card">
          <div class="ctx-attr-header">
            <span class="ctx-attr-badge">${FantasyIcons.get('scroll', { size: 12 })} Music Attribution</span>
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
          <span class="ctx-section-title">${FantasyIcons.get('tree', { size: 14 })} Ambient Atmosphere</span>
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
            ${this.activePreviewFile === curAmbTrack.file ? FantasyIcons.get('stop', { size: 12 }) : FantasyIcons.get('play', { size: 12 })}
          </button>
        </div>
        <div id="ctx-amb-custom-box" class="ctx-custom-box ${isAmbCustom ? '' : 'hidden'}">
          <input type="text" id="ctx-amb-url" class="ctx-input-sm" placeholder="Paste YouTube, Spotify, or audio URL..." value="${curAmbTrack.file || ''}">
        </div>

        <!-- Obvious Ambience Credit & Attribution Field -->
        <div class="ctx-attribution-card">
          <div class="ctx-attr-header">
            <span class="ctx-attr-badge">${FantasyIcons.get('scroll', { size: 12 })} Ambience Attribution</span>
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

      <!-- 3. SCENE EFFECT BOARD (SFX TRIGGERS) -->
      <div class="ctx-section ctx-effect-board-section">
        <div class="ctx-section-header">
          <div class="ctx-fx-title-group">
            <span class="ctx-section-title">${FantasyIcons.get('lightning', { size: 14 })} Scene Effect Board</span>
            <span class="ctx-fx-badge">${(fxLayer.triggers || []).length} sounds</span>
          </div>
          <div class="ctx-vol-wrapper">
            <input type="range" id="ctx-vol-fx" class="ctx-slider" min="0" max="1" step="0.05" value="${fxVol}">
            <span id="ctx-vol-fx-val" class="ctx-vol-label">${Math.round(fxVol * 100)}%</span>
          </div>
        </div>

        <!-- Active Board Triggers -->
        <div class="ctx-triggers-list">
          ${(fxLayer.triggers || []).length === 0 ? `
            <div class="ctx-fx-empty">
              <span>No sound effects on this board yet. Click below to add scene-specific sounds.</span>
            </div>
          ` : (fxLayer.triggers || []).map((trig, idx) => `
            <div class="ctx-fx-card" data-idx="${idx}">
              <button type="button" class="ctx-fx-card-play ${this.activePreviewFile === trig.file ? 'playing' : ''}" data-idx="${idx}" title="Test Sound">
                ${this.activePreviewFile === trig.file ? FantasyIcons.get('stop', { size: 12 }) : FantasyIcons.get('play', { size: 12 })}
              </button>
              <span class="ctx-fx-card-icon">${FantasyIcons.render(trig.icon, { size: 18 })}</span>
              <div class="ctx-fx-card-info">
                <span class="ctx-fx-card-label" title="${trig.label}">${trig.label}</span>
                <span class="ctx-fx-card-sub">${trig.credit || 'RPG SFX'}</span>
              </div>
              ${trig.hotkey ? `<kbd class="ctx-sfx-key" title="Keyboard trigger">${trig.hotkey}</kbd>` : ''}
              <button type="button" class="ctx-fx-card-edit" data-idx="${idx}" title="Configure Button (Short Name, Symbol, Hotkey)">${FantasyIcons.get('feather', { size: 12 })}</button>
              <button type="button" class="ctx-fx-card-del" data-idx="${idx}" title="Remove sound from board">${FantasyIcons.get('close', { size: 12 })}</button>
            </div>
          `).join('')}
        </div>

        <!-- Add Effect Toggle Button -->
        <button type="button" id="ctx-btn-toggle-add-fx" class="ctx-btn-add-fx ${this.showAddEffectDrawer ? 'active' : ''}">
          <span>${this.showAddEffectDrawer ? '▲ Close Effect Selector' : `${FantasyIcons.get('plus', { size: 14 })} Add Sound Effect to Scene`}</span>
        </button>

        <!-- Inline Effect Selector Drawer -->
        <div id="ctx-add-fx-drawer" class="ctx-add-fx-drawer ${this.showAddEffectDrawer ? '' : 'hidden'}">
          <!-- Drawer Tabs -->
          <div class="ctx-fx-tabs">
            <button type="button" class="ctx-fx-tab-btn ${this.activeEffectTab === 'adventure' ? 'active' : ''}" data-tab="adventure" title="Sounds from other scenes in this campaign">
              ${FantasyIcons.get('reload', { size: 13 })} From Other Scenes (${getAdventureEffects(this.adventure, s.id).length})
            </button>
            <button type="button" class="ctx-fx-tab-btn ${this.activeEffectTab === 'presets' ? 'active' : ''}" data-tab="presets" title="Curated RPG sound effect presets">
              ${FantasyIcons.get('lightning', { size: 13 })} Presets Library (${RPG_SFX_PRESETS.length})
            </button>
            <button type="button" class="ctx-fx-tab-btn ${this.activeEffectTab === 'custom' ? 'active' : ''}" data-tab="custom" title="Enter a custom file path or URL">
              ${FantasyIcons.get('spark', { size: 13 })} Custom Sound
            </button>
          </div>

          <!-- Tab 1: From Other Scenes -->
          <div class="ctx-fx-tab-pane ${this.activeEffectTab === 'adventure' ? '' : 'hidden'}">
            ${(() => {
              const advEffects = getAdventureEffects(this.adventure, s.id);
              const curFiles = new Set((fxLayer.triggers || []).map(t => t.file));
              if (advEffects.length === 0) {
                return `
                  <div class="ctx-fx-empty" style="margin-top: 4px;">
                    <span>No sound effects in other scenes yet. Check out the <strong>⚡ Presets Library</strong> tab!</span>
                  </div>
                `;
              }
              return `
                <div class="ctx-fx-scroll-list">
                  ${advEffects.map(item => {
                    const isAdded = curFiles.has(item.file);
                    return `
                      <div class="ctx-fx-picker-row">
                        <button type="button" class="ctx-fx-row-play ${this.activePreviewFile === item.file ? 'playing' : ''}" data-file="${item.file}" title="Preview sound">
                          ${this.activePreviewFile === item.file ? '⏹' : '▶'}
                        </button>
                        <span class="ctx-fx-row-icon">${item.icon || '⚡'}</span>
                        <div class="ctx-fx-row-info">
                          <span class="ctx-fx-row-title">${item.label}</span>
                          <span class="ctx-fx-row-from">Scene: ${item.fromStageLabel}</span>
                        </div>
                        ${isAdded ? `
                          <span class="ctx-fx-tag-added">✓ On Board</span>
                        ` : `
                          <button type="button" class="ctx-fx-btn-relink" data-file="${item.file}" data-label="${item.label}" data-icon="${item.icon || '⚡'}" data-credit="${item.credit || ''}" data-source="${item.sourceUrl || ''}">
                            ➕ Add
                          </button>
                        `}
                      </div>
                    `;
                  }).join('')}
                </div>
              `;
            })()}
          </div>

          <!-- Tab 2: Presets Library -->
          <div class="ctx-fx-tab-pane ${this.activeEffectTab === 'presets' ? '' : 'hidden'}">
            <div class="ctx-fx-cats">
              ${RPG_SFX_CATEGORIES.map(cat => `
                <button type="button" class="ctx-fx-cat-btn ${this.activePresetCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
                  ${cat.label}
                </button>
              `).join('')}
            </div>
            <div class="ctx-fx-scroll-list">
              ${(() => {
                const curFiles = new Set((fxLayer.triggers || []).map(t => t.file));
                const list = this.activePresetCategory === 'all'
                  ? RPG_SFX_PRESETS
                  : RPG_SFX_PRESETS.filter(p => p.category === this.activePresetCategory);
                return list.map(p => {
                  const isAdded = curFiles.has(p.file);
                  return `
                    <div class="ctx-fx-picker-row">
                      <button type="button" class="ctx-fx-row-play ${this.activePreviewFile === p.file ? 'playing' : ''}" data-file="${p.file}" title="Preview sound">
                        ${this.activePreviewFile === p.file ? '⏹' : '▶'}
                      </button>
                      <span class="ctx-fx-row-icon">${p.icon || '⚡'}</span>
                      <div class="ctx-fx-row-info">
                        <span class="ctx-fx-row-title">${p.label}</span>
                        <span class="ctx-fx-row-from">${p.credit || 'RPG SFX'}</span>
                      </div>
                      ${isAdded ? `
                        <span class="ctx-fx-tag-added">✓ On Board</span>
                      ` : `
                        <button type="button" class="ctx-fx-btn-add-preset" data-id="${p.id}">
                          ➕ Add
                        </button>
                      `}
                    </div>
                  `;
                }).join('');
              })()}
            </div>
          </div>

          <!-- Tab 3: Custom Sound -->
          <div class="ctx-fx-tab-pane ${this.activeEffectTab === 'custom' ? '' : 'hidden'}">
            <div class="ctx-fx-custom-form">
              <div class="ctx-attr-grid">
                <div class="ctx-attr-item">
                  <span class="ctx-attr-lbl">Name:</span>
                  <input type="text" id="ctx-custom-fx-name" class="ctx-attr-input" placeholder="e.g. Magic Missile">
                </div>
                <div class="ctx-attr-item" style="max-width: 70px;">
                  <span class="ctx-attr-lbl">Icon:</span>
                  <input type="text" id="ctx-custom-fx-icon" class="ctx-attr-input" value="⚡" style="text-align: center;">
                </div>
              </div>
              <div class="ctx-attr-item" style="margin-top: 4px;">
                <span class="ctx-attr-lbl">Audio File or URL:</span>
                <input type="text" id="ctx-custom-fx-file" class="ctx-attr-input" placeholder="audio/effects/sound.wav or https://...">
              </div>
              <div class="ctx-attr-grid" style="margin-top: 4px;">
                <div class="ctx-attr-item">
                  <span class="ctx-attr-lbl">Credit:</span>
                  <input type="text" id="ctx-custom-fx-credit" class="ctx-attr-input" placeholder="Author / Artist">
                </div>
                <div class="ctx-attr-item" style="max-width: 70px;">
                  <span class="ctx-attr-lbl">Hotkey:</span>
                  <input type="text" id="ctx-custom-fx-key" class="ctx-attr-input" value="${getNextAvailableHotkey(fxLayer.triggers || [])}" style="text-align: center; text-transform: uppercase;">
                </div>
              </div>
              <button type="button" id="ctx-btn-add-custom-fx" class="ctx-btn-submit-fx" style="margin-top: 8px;">
                ➕ Add to Scene Board
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  addEffectToStage(effectData) {
    if (!this.stage.layers.effects) {
      this.stage.layers.effects = { name: 'Effects', volume: 0.85, triggers: [] };
    }
    if (!this.stage.layers.effects.triggers) {
      this.stage.layers.effects.triggers = [];
    }

    const nextKey = (effectData.hotkey || getNextAvailableHotkey(this.stage.layers.effects.triggers)).toUpperCase();

    const newTrigger = {
      id: generateId('sfx'),
      label: effectData.label || 'Sound Effect',
      icon: effectData.icon || '⚡',
      hotkey: nextKey,
      file: effectData.file || '',
      credit: effectData.credit || 'RPG SFX',
      sourceUrl: effectData.sourceUrl || effectData.file || ''
    };

    this.stage.layers.effects.triggers.push(newTrigger);
    this.render();
    if (this.onStageUpdated) this.onStageUpdated(this.stage);
    if (this.onSave) this.onSave(this.stage);
    showToast(`Added "${newTrigger.label}" to scene board!`, 'success');
  }

  removeEffectFromStage(index) {
    if (!this.stage?.layers?.effects?.triggers) return;
    const removed = this.stage.layers.effects.triggers.splice(index, 1)[0];
    this.render();
    if (this.onStageUpdated) this.onStageUpdated(this.stage);
    if (this.onSave) this.onSave(this.stage);
    showToast(`Removed "${removed?.label}" from board.`, 'info');
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

    // Effect Board: Active Triggers Test Play
    this.panelEl.querySelectorAll('.ctx-fx-card-play').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const trig = this.stage.layers.effects?.triggers?.[idx];
        if (trig && trig.file) {
          this.togglePreview(trig.file);
        }
      });
    });

    // Effect Board: Active Triggers Configure
    this.panelEl.querySelectorAll('.ctx-fx-card-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const trig = this.stage.layers.effects?.triggers?.[idx];
        if (trig && this.onConfigureTrigger) {
          this.onConfigureTrigger(trig, this.stage, this.adventure);
        }
      });
    });

    // Effect Board: Active Triggers Delete
    this.panelEl.querySelectorAll('.ctx-fx-card-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this.removeEffectFromStage(idx);
      });
    });

    // Effect Board: Toggle Add Drawer
    this.panelEl.querySelector('#ctx-btn-toggle-add-fx')?.addEventListener('click', () => {
      this.showAddEffectDrawer = !this.showAddEffectDrawer;
      this.render();
    });

    // Effect Drawer Tabs
    this.panelEl.querySelectorAll('.ctx-fx-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeEffectTab = btn.getAttribute('data-tab');
        this.render();
      });
    });

    // Effect Drawer Category Filter
    this.panelEl.querySelectorAll('.ctx-fx-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activePresetCategory = btn.getAttribute('data-cat');
        this.render();
      });
    });

    // Effect Drawer: Row Audio Preview
    this.panelEl.querySelectorAll('.ctx-fx-row-play').forEach(btn => {
      btn.addEventListener('click', () => {
        const file = btn.getAttribute('data-file');
        this.togglePreview(file);
      });
    });

    // Effect Drawer: Relink sound from another scene
    this.panelEl.querySelectorAll('.ctx-fx-btn-relink').forEach(btn => {
      btn.addEventListener('click', () => {
        const file = btn.getAttribute('data-file');
        const label = btn.getAttribute('data-label');
        const icon = btn.getAttribute('data-icon');
        const credit = btn.getAttribute('data-credit');
        const sourceUrl = btn.getAttribute('data-source');
        this.addEffectToStage({ file, label, icon, credit, sourceUrl });
      });
    });

    // Effect Drawer: Add Preset
    this.panelEl.querySelectorAll('.ctx-fx-btn-add-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const preset = RPG_SFX_PRESETS.find(p => p.id === id);
        if (preset) {
          this.addEffectToStage(preset);
        }
      });
    });

    // Effect Drawer: Submit Custom Sound
    this.panelEl.querySelector('#ctx-btn-add-custom-fx')?.addEventListener('click', () => {
      const nameInput = this.panelEl.querySelector('#ctx-custom-fx-name');
      const iconInput = this.panelEl.querySelector('#ctx-custom-fx-icon');
      const fileInput = this.panelEl.querySelector('#ctx-custom-fx-file');
      const creditInput = this.panelEl.querySelector('#ctx-custom-fx-credit');
      const keyInput = this.panelEl.querySelector('#ctx-custom-fx-key');

      const label = nameInput?.value.trim() || 'Custom Sound';
      const icon = iconInput?.value.trim() || '⚡';
      const file = fileInput?.value.trim();
      const credit = creditInput?.value.trim() || 'Custom SFX';
      const hotkey = keyInput?.value.trim().toUpperCase() || '';

      if (!file) {
        showToast('Please enter an audio file path or URL.', 'error');
        return;
      }

      this.addEffectToStage({ label, icon, file, credit, hotkey });
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
