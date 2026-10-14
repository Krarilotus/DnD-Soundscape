/**
 * DnD-Soundscape: Interactive Scene Effect Board & Soundboard Trigger Modal
 * Allows triggering stage-specific sound effects and adding/relinking effects
 * from other scenes in the campaign or the built-in RPG SFX library.
 */

import { generateId, showToast } from '../utils/helpers.js';
import {
  RPG_SFX_PRESETS,
  RPG_SFX_CATEGORIES,
  getAdventureEffects,
  getNextAvailableHotkey
} from '../audio/PresetEffects.js';

export class SoundboardModal {
  constructor(audioEngine, options = {}) {
    this.audio = audioEngine;
    this.modalEl = null;
    this.triggers = [];
    this.stage = null;
    this.adventure = null;
    this.isOpen = false;
    this.onSaveStage = options.onSaveStage || null;
    this.onConfigureTrigger = options.onConfigureTrigger || null;
    this.getAdventure = options.getAdventure || null;
    this.getCurrentStage = options.getCurrentStage || null;

    this.showAddDrawer = false;
    this.activeEffectTab = 'adventure'; // 'adventure' | 'presets' | 'custom'
    this.activePresetCategory = 'all';
    this.previewAudioEl = null;
    this.activePreviewFile = null;
  }

  init() {
    let el = document.getElementById('soundboard-modal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'soundboard-modal';
      el.className = 'modal-backdrop hidden';
      document.body.appendChild(el);
    }
    this.modalEl = el;
    this.render();
  }

  setStage(stage, adventure = null) {
    this.stage = stage;
    if (adventure) this.adventure = adventure;
    else if (this.getAdventure) this.adventure = this.getAdventure();

    if (stage?.layers?.effects?.triggers) {
      this.triggers = stage.layers.effects.triggers;
    } else {
      this.triggers = [];
    }
    if (this.isOpen) this.render();
  }

  setTriggers(stageTriggers = []) {
    if (stageTriggers && stageTriggers.length > 0) {
      this.triggers = stageTriggers;
    } else {
      this.triggers = [];
    }
    if (this.isOpen) this.render();
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
    const adv = this.adventure || (this.getAdventure ? this.getAdventure() : null);
    if (adv && !url.startsWith('http') && !url.startsWith('/') && !url.startsWith('adventures/')) {
      url = `adventures/${adv.id}/${url}`.replace(/\/\//g, '/');
    }

    try {
      this.previewAudioEl = new Audio(url);
      this.previewAudioEl.volume = 0.85;
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

  addEffectToStage(effectData) {
    const adv = this.adventure || (this.getAdventure ? this.getAdventure() : null);
    const st = this.stage || (this.getCurrentStage ? this.getCurrentStage() : null);

    if (!st) {
      showToast('Select a scene first to add effects.', 'info');
      return;
    }

    if (!st.layers) st.layers = {};
    if (!st.layers.effects) st.layers.effects = { name: 'Effects', volume: 0.85, triggers: [] };
    if (!st.layers.effects.triggers) st.layers.effects.triggers = [];

    const nextKey = (effectData.hotkey || getNextAvailableHotkey(st.layers.effects.triggers)).toUpperCase();

    const newTrigger = {
      id: generateId('sfx'),
      label: effectData.label || 'Sound Effect',
      icon: effectData.icon || '⚡',
      hotkey: nextKey,
      file: effectData.file || '',
      credit: effectData.credit || 'RPG SFX',
      sourceUrl: effectData.sourceUrl || effectData.file || ''
    };

    st.layers.effects.triggers.push(newTrigger);
    this.triggers = st.layers.effects.triggers;

    // Synchronize with audio engine
    if (this.audio && this.audio.sfxPad) {
      this.audio.sfxPad.setTriggers(this.triggers, this.audio.basePath);
    }

    if (this.onSaveStage) {
      this.onSaveStage(st);
    }

    this.render();
    showToast(`Added "${newTrigger.label}" to scene effect board!`, 'success');
  }

  removeEffectFromStage(triggerId) {
    const st = this.stage || (this.getCurrentStage ? this.getCurrentStage() : null);
    if (!st?.layers?.effects?.triggers) return;

    const idx = st.layers.effects.triggers.findIndex(t => t.id === triggerId);
    if (idx !== -1) {
      const removed = st.layers.effects.triggers.splice(idx, 1)[0];
      this.triggers = st.layers.effects.triggers;

      if (this.audio && this.audio.sfxPad) {
        this.audio.sfxPad.setTriggers(this.triggers, this.audio.basePath);
      }

      if (this.onSaveStage) {
        this.onSaveStage(st);
      }

      this.render();
      showToast(`Removed "${removed.label}" from scene board.`, 'info');
    }
  }

  render() {
    if (!this.modalEl) return;

    const adv = this.adventure || (this.getAdventure ? this.getAdventure() : null);
    const st = this.stage || (this.getCurrentStage ? this.getCurrentStage() : null);
    const stageName = st?.label || 'Current Scene';
    const curFiles = new Set(this.triggers.map(t => t.file));
    const advEffects = getAdventureEffects(adv, st?.id);
    const presetsList = this.activePresetCategory === 'all'
      ? RPG_SFX_PRESETS
      : RPG_SFX_PRESETS.filter(p => p.category === this.activePresetCategory);
    const nextKey = getNextAvailableHotkey(this.triggers);

    this.modalEl.innerHTML = `
      <div class="modal-window" style="max-width: 720px;">
        <header class="modal-header">
          <h2>
            <span>⚡</span>
            <span>Scene Effect Board</span>
          </h2>
          <button id="btn-close-soundboard" class="btn-icon" aria-label="Close">✕</button>
        </header>

        <div class="modal-body" style="flex-direction: column;">
          <!-- Top Row with Stage Badge & Add Button -->
          <div class="soundboard-header-row">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="soundboard-stage-badge">📍 ${stageName}</span>
              <span style="font-size: 12px; color: var(--text-muted);">${this.triggers.length} sound${this.triggers.length === 1 ? '' : 's'} on board</span>
            </div>
            <button type="button" id="btn-sb-toggle-add" class="soundboard-btn-add ${this.showAddDrawer ? 'active' : ''}">
              <span>${this.showAddDrawer ? '▲ Close Picker' : '➕ Add Effect to Scene'}</span>
            </button>
          </div>

          <!-- Inline Effect Selector Drawer -->
          ${this.showAddDrawer ? `
            <div class="ctx-add-fx-drawer" style="margin-bottom: 16px;">
              <div class="ctx-fx-tabs">
                <button type="button" class="ctx-fx-tab-btn ${this.activeEffectTab === 'adventure' ? 'active' : ''}" data-tab="adventure">
                  🔁 From Other Scenes (${advEffects.length})
                </button>
                <button type="button" class="ctx-fx-tab-btn ${this.activeEffectTab === 'presets' ? 'active' : ''}" data-tab="presets">
                  ⚡ Presets Library (${RPG_SFX_PRESETS.length})
                </button>
                <button type="button" class="ctx-fx-tab-btn ${this.activeEffectTab === 'custom' ? 'active' : ''}" data-tab="custom">
                  🔗 Custom Sound
                </button>
              </div>

              <!-- Tab 1: From Other Scenes -->
              <div class="ctx-fx-tab-pane ${this.activeEffectTab === 'adventure' ? '' : 'hidden'}">
                ${advEffects.length === 0 ? `
                  <div class="ctx-fx-empty">
                    <span>No sound effects found in other scenes yet. Check out the <strong>⚡ Presets Library</strong>!</span>
                  </div>
                ` : `
                  <div class="ctx-fx-scroll-list" style="max-height: 180px;">
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
                `}
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
                <div class="ctx-fx-scroll-list" style="max-height: 180px;">
                  ${presetsList.map(p => {
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
                  }).join('')}
                </div>
              </div>

              <!-- Tab 3: Custom Sound -->
              <div class="ctx-fx-tab-pane ${this.activeEffectTab === 'custom' ? '' : 'hidden'}">
                <div class="ctx-fx-custom-form">
                  <div class="ctx-attr-grid">
                    <div class="ctx-attr-item">
                      <span class="ctx-attr-lbl">Name:</span>
                      <input type="text" id="sb-custom-fx-name" class="ctx-attr-input" placeholder="e.g. Thunder Wave">
                    </div>
                    <div class="ctx-attr-item" style="max-width: 70px;">
                      <span class="ctx-attr-lbl">Icon:</span>
                      <input type="text" id="sb-custom-fx-icon" class="ctx-attr-input" value="⚡" style="text-align: center;">
                    </div>
                  </div>
                  <div class="ctx-attr-item" style="margin-top: 4px;">
                    <span class="ctx-attr-lbl">Audio File or URL:</span>
                    <input type="text" id="sb-custom-fx-file" class="ctx-attr-input" placeholder="audio/effects/sound.wav or https://...">
                  </div>
                  <div class="ctx-attr-grid" style="margin-top: 4px;">
                    <div class="ctx-attr-item">
                      <span class="ctx-attr-lbl">Credit / Artist:</span>
                      <input type="text" id="sb-custom-fx-credit" class="ctx-attr-input" placeholder="Author name">
                    </div>
                    <div class="ctx-attr-item" style="max-width: 70px;">
                      <span class="ctx-attr-lbl">Hotkey:</span>
                      <input type="text" id="sb-custom-fx-key" class="ctx-attr-input" value="${nextKey}" style="text-align: center; text-transform: uppercase;">
                    </div>
                  </div>
                  <button type="button" id="sb-btn-add-custom-fx" class="ctx-btn-submit-fx" style="margin-top: 8px;">
                    ➕ Add to Scene Board
                  </button>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Soundboard Pads Grid -->
          ${this.triggers.length === 0 ? `
            <div class="ctx-fx-empty" style="padding: 24px; text-align: center;">
              <span style="font-size: 24px; display: block; margin-bottom: 6px;">⚡</span>
              <p style="margin: 0; font-size: 13.5px; color: #fff;">No sound effects configured for this scene yet.</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: var(--text-muted);">
                Click <strong>"➕ Add Effect to Scene"</strong> above to pick sounds from other scenes or the RPG library.
              </p>
            </div>
          ` : `
            <div class="sfx-grid">
              ${this.triggers.map(t => `
                <button class="sfx-pad-btn" data-id="${t.id}" title="${t.label} (Credit: ${t.credit || 'Tabletop SFX'})">
                  <span class="sfx-pad-cfg-btn" data-id="${t.id}" title="Configure Button (Name, Symbol, Hotkey)">✏️</span>
                  <span class="sfx-pad-del-btn" data-id="${t.id}" title="Remove effect from this scene">✕</span>
                  ${t.hotkey ? `<kbd class="sfx-pad-hotkey">${t.hotkey}</kbd>` : ''}
                  <span class="sfx-pad-icon">${t.icon || '⚡'}</span>
                  <span class="sfx-pad-label">${t.shortName || t.label}</span>
                  <span style="font-size: 10px; color: var(--gold-light); opacity: 0.85; margin-top: 2px;">
                    👤 ${t.credit || 'SFX'}
                  </span>
                </button>
              `).join('')}
            </div>
          `}
        </div>

        <footer class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11.5px; color: var(--text-muted);">
            Press <kbd>Q</kbd>, <kbd>W</kbd>, <kbd>E</kbd>, etc. to fire triggers instantly.
          </span>
          <button id="btn-soundboard-done" class="btn-primary">Done</button>
        </footer>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.modalEl.querySelector('#btn-close-soundboard')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-soundboard-done')?.addEventListener('click', () => this.close());

    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    // Toggle Add Drawer
    this.modalEl.querySelector('#btn-sb-toggle-add')?.addEventListener('click', () => {
      this.showAddDrawer = !this.showAddDrawer;
      this.render();
    });

    // Tab buttons
    this.modalEl.querySelectorAll('.ctx-fx-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeEffectTab = btn.getAttribute('data-tab');
        this.render();
      });
    });

    // Category buttons
    this.modalEl.querySelectorAll('.ctx-fx-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activePresetCategory = btn.getAttribute('data-cat');
        this.render();
      });
    });

    // Audio Preview buttons
    this.modalEl.querySelectorAll('.ctx-fx-row-play').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const file = btn.getAttribute('data-file');
        this.togglePreview(file);
      });
    });

    // Relink from other scenes
    this.modalEl.querySelectorAll('.ctx-fx-btn-relink').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const file = btn.getAttribute('data-file');
        const label = btn.getAttribute('data-label');
        const icon = btn.getAttribute('data-icon');
        const credit = btn.getAttribute('data-credit');
        const sourceUrl = btn.getAttribute('data-source');
        this.addEffectToStage({ file, label, icon, credit, sourceUrl });
      });
    });

    // Add preset
    this.modalEl.querySelectorAll('.ctx-fx-btn-add-preset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const preset = RPG_SFX_PRESETS.find(p => p.id === id);
        if (preset) {
          this.addEffectToStage(preset);
        }
      });
    });

    // Add custom sound
    this.modalEl.querySelector('#sb-btn-add-custom-fx')?.addEventListener('click', () => {
      const nameInput = this.modalEl.querySelector('#sb-custom-fx-name');
      const iconInput = this.modalEl.querySelector('#sb-custom-fx-icon');
      const fileInput = this.modalEl.querySelector('#sb-custom-fx-file');
      const creditInput = this.modalEl.querySelector('#sb-custom-fx-credit');
      const keyInput = this.modalEl.querySelector('#sb-custom-fx-key');

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

    // Configure buttons on pads
    this.modalEl.querySelectorAll('.sfx-pad-cfg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const trig = this.triggers.find(t => t.id === id);
        if (trig && this.onConfigureTrigger) {
          const st = this.stage || (this.getCurrentStage ? this.getCurrentStage() : null);
          const adv = this.adventure || (this.getAdventure ? this.getAdventure() : null);
          this.onConfigureTrigger(trig, st, adv);
        }
      });
    });

    // Delete buttons on pads
    this.modalEl.querySelectorAll('.sfx-pad-del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        this.removeEffectFromStage(id);
      });
    });

    // Pad trigger click
    this.modalEl.querySelectorAll('.sfx-pad-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target.classList.contains('sfx-pad-del-btn') || e.target.classList.contains('sfx-pad-cfg-btn')) return;
        const id = btn.getAttribute('data-id');
        this.triggerEffect(id, btn);
      });
    });
  }

  triggerEffect(id, btnEl = null) {
    if (!btnEl && this.modalEl) {
      btnEl = this.modalEl.querySelector(`.sfx-pad-btn[data-id="${id}"]`);
    }

    if (btnEl) {
      btnEl.classList.add('active');
      setTimeout(() => btnEl.classList.remove('active'), 250);
    }

    const trig = this.triggers.find(t => t.id === id);
    if (trig) {
      this.audio.playSFX(id);
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    if (!this.modalEl) this.init();
    this.isOpen = true;
    this.render();
    this.modalEl.classList.remove('hidden');
  }

  close() {
    this.stopPreviewAudio();
    this.isOpen = false;
    this.showAddDrawer = false;
    if (this.modalEl) this.modalEl.classList.add('hidden');
  }
}
