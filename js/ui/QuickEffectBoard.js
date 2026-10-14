/**
 * DnD-Soundscape: Slide-Out Scene Effect Board Drawer (Right-Side Submenu)
 * Dedicated, full-height slide-out drawer for stage sound effects.
 * Keeps the Mixer purely for volume levels, providing ample space for dozens
 * of stage-specific triggers, categories, search, button customization, and presets.
 */

import {
  RPG_SFX_PRESETS,
  RPG_SFX_CATEGORIES,
  getAdventureEffects,
  getNextAvailableHotkey
} from '../audio/PresetEffects.js';
import { generateId, showToast } from '../utils/helpers.js';
import { FantasyIcons } from './FantasyIcons.js';

function detectEffectCategory(trigger) {
  if (trigger.category) return trigger.category;
  const text = `${trigger.shortName || ''} ${trigger.label || ''} ${trigger.icon || ''} ${trigger.file || ''}`.toLowerCase();
  if (/combat|sword|slash|shield|punch|clash|arrow|attack|hit|weapon|brawl|axe|dagger|critical|fall|⚔|🛡|🏹|🗡|🥊/.test(text)) return 'combat';
  if (/magic|spell|fire|heal|surge|curse|teleport|blast|arcane|potion|witch|wand|🔮|🔥|⚡|✨|🧪/.test(text)) return 'magic';
  if (/item|chest|door|lock|pick|coin|gold|trap|creak|gate|box|key|loot|🗝|🚪|🪙|🗄|🪵/.test(text)) return 'items';
  return 'ambient';
}

export class QuickEffectBoard {
  constructor(audioEngine, callbacks = {}) {
    this.audio = audioEngine;
    this.onConfigureTrigger = callbacks.onConfigureTrigger || null;
    this.onSaveStage = callbacks.onSaveStage || null;
    this.container = null;
    this.stage = null;
    this.adventure = null;
    this.isOpen = false;

    this.showAddDrawer = false;
    this.activeEffectTab = 'adventure'; // 'adventure' | 'presets' | 'custom'
    this.activePresetCategory = 'all';
    this.filterCategory = 'all';
    this.searchQuery = '';
    this.previewAudioEl = null;
    this.activePreviewFile = null;
  }

  init(parentContainer = null) {
    let el = document.getElementById('quick-effect-board-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'quick-effect-board-container';
      el.className = 'quick-effect-board-container';
      const target = parentContainer || document.getElementById('app-root') || document.body;
      target.appendChild(el);
    }
    this.container = el;
    this.render();
  }

  show() {
    if (this.container) this.container.classList.remove('hidden');
  }

  hide() {
    if (this.container) this.container.classList.add('hidden');
    this.close();
  }

  setStage(stage, adventure = null) {
    this.stage = stage;
    if (adventure) this.adventure = adventure;
    this.render();
  }

  toggleExpand() {
    this.isOpen = !this.isOpen;
    this.render();
  }

  open() {
    this.isOpen = true;
    this.render();
  }

  close() {
    this.stopPreview();
    this.isOpen = false;
    this.showAddDrawer = false;
    this.render();
  }

  stopPreview() {
    if (this.previewAudioEl) {
      this.previewAudioEl.pause();
      this.previewAudioEl = null;
      this.activePreviewFile = null;
    }
  }

  togglePreview(file) {
    if (!file) return;
    if (this.activePreviewFile === file && this.previewAudioEl && !this.previewAudioEl.paused) {
      this.stopPreview();
      this.render();
      return;
    }
    this.stopPreview();

    let url = file;
    if (this.adventure && !url.startsWith('http') && !url.startsWith('/') && !url.startsWith('adventures/')) {
      url = `adventures/${this.adventure.id}/${url}`.replace(/\/\//g, '/');
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
    if (!this.stage) {
      showToast('Select a scene first to add effects.', 'info');
      return;
    }

    if (!this.stage.layers) this.stage.layers = {};
    if (!this.stage.layers.effects) this.stage.layers.effects = { name: 'Effects', volume: 0.85, triggers: [] };
    if (!this.stage.layers.effects.triggers) this.stage.layers.effects.triggers = [];

    const nextKey = (effectData.hotkey || getNextAvailableHotkey(this.stage.layers.effects.triggers)).toUpperCase();
    const shortName = effectData.shortName || effectData.label || 'Sound';

    const newTrigger = {
      id: generateId('sfx'),
      shortName: shortName,
      label: effectData.label || shortName,
      icon: effectData.icon || '⚡',
      hotkey: nextKey,
      file: effectData.file || '',
      credit: effectData.credit || 'RPG SFX',
      sourceUrl: effectData.sourceUrl || effectData.file || ''
    };

    this.stage.layers.effects.triggers.push(newTrigger);

    if (this.audio && this.audio.sfxPad) {
      this.audio.sfxPad.setTriggers(this.stage.layers.effects.triggers, this.audio.basePath);
    }

    if (this.onSaveStage) {
      this.onSaveStage(this.stage);
    }

    this.render();
    showToast(`Added "${newTrigger.shortName}" to scene effect board!`, 'success');
  }

  removeEffectFromStage(triggerId) {
    if (!this.stage?.layers?.effects?.triggers) return;
    const idx = this.stage.layers.effects.triggers.findIndex(t => t.id === triggerId);
    if (idx !== -1) {
      const removed = this.stage.layers.effects.triggers.splice(idx, 1)[0];
      if (this.audio && this.audio.sfxPad) {
        this.audio.sfxPad.setTriggers(this.stage.layers.effects.triggers, this.audio.basePath);
      }
      if (this.onSaveStage) {
        this.onSaveStage(this.stage);
      }
      this.render();
      showToast(`Removed "${removed.shortName || removed.label}" from scene board.`, 'info');
    }
  }

  render() {
    if (!this.container) return;

    if (!this.stage) {
      this.container.innerHTML = '';
      return;
    }

    const allTriggers = this.stage.layers?.effects?.triggers || [];
    const count = allTriggers.length;

    // Filter triggers by category and search query
    let filteredTriggers = allTriggers;
    if (this.filterCategory !== 'all') {
      filteredTriggers = filteredTriggers.filter(t => detectEffectCategory(t) === this.filterCategory);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filteredTriggers = filteredTriggers.filter(t => 
        (t.shortName && t.shortName.toLowerCase().includes(q)) ||
        (t.label && t.label.toLowerCase().includes(q)) ||
        (t.hotkey && t.hotkey.toLowerCase().includes(q))
      );
    }

    const curFiles = new Set(allTriggers.map(t => t.file));
    const advEffects = getAdventureEffects(this.adventure, this.stage.id);
    const presetsList = this.activePresetCategory === 'all'
      ? RPG_SFX_PRESETS
      : RPG_SFX_PRESETS.filter(p => p.category === this.activePresetCategory);
    const nextKey = getNextAvailableHotkey(allTriggers);

    this.container.innerHTML = `
      <!-- Slide-Out Effect Board Drawer (Right Side Submenu) -->
      <aside class="effect-board-drawer ${this.isOpen ? 'open' : ''}" role="complementary" aria-label="Scene Effect Board">
        <!-- Attached Right-Edge Toggle Handle (Always accessible) -->
        <button type="button" id="effect-drawer-handle" class="effect-drawer-handle" title="${this.isOpen ? 'Close Effect Board (B)' : 'Slide out Scene Effect Board (B)'}">
          <span class="handle-icon">${FantasyIcons.get('lightning', { size: 16 })}</span>
          <span class="handle-text">Effect Board</span>
          <span class="handle-badge" id="handle-effect-count">${count}</span>
        </button>

        <!-- Drawer Header -->
        <div class="effect-drawer-header">
          <div class="effect-drawer-title-group">
            <span class="effect-drawer-badge">${FantasyIcons.get('lightning', { size: 20 })}</span>
            <div class="effect-drawer-titles">
              <span class="effect-drawer-scene-name" title="${this.stage.label}">${FantasyIcons.get('pin', { size: 14 })} ${this.stage.label}</span>
              <span class="effect-drawer-subtitle">Scene Effect Board (${count} sound${count === 1 ? '' : 's'})</span>
            </div>
          </div>
          <div class="effect-drawer-header-actions">
            <button type="button" id="btn-drawer-add-fx" class="effect-drawer-hbtn ${this.showAddDrawer ? 'active' : ''}" title="Add New Sound Effect to this Scene">
              <span>${this.showAddDrawer ? '▲ Close' : `${FantasyIcons.get('plus', { size: 14 })} Add Sound`}</span>
            </button>
            <button type="button" id="btn-drawer-close" class="effect-drawer-close-btn" title="Slide Drawer In (Esc / B)" aria-label="Close">
              ${FantasyIcons.get('close', { size: 16 })}
            </button>
          </div>
        </div>

        <!-- Inline Add Sound Selector Drawer -->
        ${this.showAddDrawer ? `
          <div class="drawer-add-fx-accordion">
            <div class="ctx-fx-tabs">
              <button type="button" class="ctx-fx-tab-btn ${this.activeEffectTab === 'adventure' ? 'active' : ''}" data-tab="adventure">
                ${FantasyIcons.get('reload', { size: 13 })} Other Scenes (${advEffects.length})
              </button>
              <button type="button" class="ctx-fx-tab-btn ${this.activeEffectTab === 'presets' ? 'active' : ''}" data-tab="presets">
                ${FantasyIcons.get('lightning', { size: 13 })} Presets (${RPG_SFX_PRESETS.length})
              </button>
              <button type="button" class="ctx-fx-tab-btn ${this.activeEffectTab === 'custom' ? 'active' : ''}" data-tab="custom">
                ${FantasyIcons.get('spark', { size: 13 })} Custom
              </button>
            </div>

            <!-- Tab 1: From Other Scenes -->
            <div class="ctx-fx-tab-pane ${this.activeEffectTab === 'adventure' ? '' : 'hidden'}">
              ${advEffects.length === 0 ? `
                <div class="ctx-fx-empty">
                  <span>No effects in other scenes yet. Try the <strong>Presets</strong> tab!</span>
                </div>
              ` : `
                <div class="ctx-fx-scroll-list" style="max-height: 160px;">
                  ${advEffects.map(item => {
                    const isAdded = curFiles.has(item.file);
                    return `
                      <div class="ctx-fx-picker-row">
                        <button type="button" class="ctx-fx-row-play ${this.activePreviewFile === item.file ? 'playing' : ''}" data-file="${item.file}" title="Preview sound">
                          ${this.activePreviewFile === item.file ? FantasyIcons.get('stop', { size: 12 }) : FantasyIcons.get('play', { size: 12 })}
                        </button>
                        <span class="ctx-fx-row-icon">${FantasyIcons.render(item.icon, { size: 18 })}</span>
                        <div class="ctx-fx-row-info">
                          <span class="ctx-fx-row-title">${item.label}</span>
                          <span class="ctx-fx-row-from">Scene: ${item.fromStageLabel}</span>
                        </div>
                        ${isAdded ? `
                          <span class="ctx-fx-tag-added">✓ Added</span>
                        ` : `
                          <button type="button" class="ctx-fx-btn-relink" data-file="${item.file}" data-label="${item.label}" data-icon="${item.icon || '⚡'}" data-credit="${item.credit || ''}" data-source="${item.sourceUrl || ''}">
                            ${FantasyIcons.get('plus', { size: 12 })} Add
                          </button>
                        `}
                      </div>
                    `;
                  }).join('')}
                </div>
              `}
            </div>

            <!-- Tab 2: Presets Library (30+ Sounds) -->
            <div class="ctx-fx-tab-pane ${this.activeEffectTab === 'presets' ? '' : 'hidden'}">
              <div class="ctx-fx-cats">
                ${RPG_SFX_CATEGORIES.map(cat => `
                  <button type="button" class="ctx-fx-cat-btn ${this.activePresetCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
                    ${cat.label}
                  </button>
                `).join('')}
              </div>
              <div class="ctx-fx-scroll-list" style="max-height: 160px;">
                ${presetsList.map(p => {
                  const isAdded = curFiles.has(p.file);
                  return `
                    <div class="ctx-fx-picker-row">
                      <button type="button" class="ctx-fx-row-play ${this.activePreviewFile === p.file ? 'playing' : ''}" data-file="${p.file}" title="Preview sound">
                        ${this.activePreviewFile === p.file ? FantasyIcons.get('stop', { size: 12 }) : FantasyIcons.get('play', { size: 12 })}
                      </button>
                      <span class="ctx-fx-row-icon">${FantasyIcons.render(p.icon, { size: 18 })}</span>
                      <div class="ctx-fx-row-info">
                        <span class="ctx-fx-row-title">${p.label}</span>
                        <span class="ctx-fx-row-from">${p.credit || 'RPG SFX'}</span>
                      </div>
                      ${isAdded ? `
                        <span class="ctx-fx-tag-added">✓ Added</span>
                      ` : `
                        <button type="button" class="ctx-fx-btn-add-preset" data-id="${p.id}">
                          ${FantasyIcons.get('plus', { size: 12 })} Add
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
                    <span class="ctx-attr-lbl">Short Name:</span>
                    <input type="text" id="drawer-custom-name" class="ctx-attr-input" placeholder="e.g. Slash">
                  </div>
                  <div class="ctx-attr-item" style="max-width: 65px;">
                    <span class="ctx-attr-lbl">Symbol:</span>
                    <input type="text" id="drawer-custom-icon" class="ctx-attr-input" value="⚡" style="text-align: center;">
                  </div>
                </div>
                <div class="ctx-attr-item" style="margin-top: 4px;">
                  <span class="ctx-attr-lbl">Audio File or URL:</span>
                  <input type="text" id="drawer-custom-file" class="ctx-attr-input" placeholder="audio_presets/effects/sword_slash.wav">
                </div>
                <div class="ctx-attr-grid" style="margin-top: 4px;">
                  <div class="ctx-attr-item">
                    <span class="ctx-attr-lbl">Hotkey:</span>
                    <input type="text" id="drawer-custom-key" class="ctx-attr-input" value="${nextKey}" style="text-align: center; text-transform: uppercase;">
                  </div>
                  <div class="ctx-attr-item">
                    <span class="ctx-attr-lbl">Credit / Artist:</span>
                    <input type="text" id="drawer-custom-credit" class="ctx-attr-input" placeholder="SFX Source">
                  </div>
                </div>
                <button type="button" id="drawer-btn-add-custom" class="ctx-btn-submit-fx" style="margin-top: 8px;">
                  ${FantasyIcons.get('plus', { size: 14 })} Add to Scene Board
                </button>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Filter & Search Toolbar (When stage has multiple effects) -->
        ${count > 0 ? `
          <div class="effect-drawer-toolbar">
            <div class="effect-drawer-search-box">
              <span class="search-icon">${FantasyIcons.get('spark', { size: 14 })}</span>
              <input type="text" id="drawer-fx-search" class="drawer-search-input" placeholder="Filter sounds..." value="${this.searchQuery}">
              ${this.searchQuery ? `<button type="button" id="btn-clear-fx-search" class="search-clear-btn">${FantasyIcons.get('close', { size: 12 })}</button>` : ''}
            </div>

            <div class="effect-drawer-cat-chips">
              <button type="button" class="drawer-cat-chip ${this.filterCategory === 'all' ? 'active' : ''}" data-cat="all">All (${count})</button>
              <button type="button" class="drawer-cat-chip ${this.filterCategory === 'combat' ? 'active' : ''}" data-cat="combat">${FantasyIcons.get('sword', { size: 13 })} Combat</button>
              <button type="button" class="drawer-cat-chip ${this.filterCategory === 'magic' ? 'active' : ''}" data-cat="magic">${FantasyIcons.get('rune', { size: 13 })} Magic</button>
              <button type="button" class="drawer-cat-chip ${this.filterCategory === 'items' ? 'active' : ''}" data-cat="items">${FantasyIcons.get('key', { size: 13 })} Items</button>
              <button type="button" class="drawer-cat-chip ${this.filterCategory === 'ambient' ? 'active' : ''}" data-cat="ambient">${FantasyIcons.get('tree', { size: 13 })} Ambient</button>
            </div>
          </div>
        ` : ''}

        <!-- Sound Buttons Grid Area -->
        <div class="effect-drawer-body">
          ${count === 0 ? `
            <div class="effect-drawer-empty">
              <span class="empty-icon">${FantasyIcons.get('lightning', { size: 36 })}</span>
              <h4>No sound effects on this scene yet</h4>
              <p>Add fitting sound effects for <strong>${this.stage.label}</strong> to trigger them instantly during your game.</p>
              <button type="button" id="btn-drawer-empty-add" class="drawer-empty-action-btn">
                ${FantasyIcons.get('plus', { size: 16 })} Add Sounds to Scene
              </button>
            </div>
          ` : filteredTriggers.length === 0 ? `
            <div class="effect-drawer-empty" style="padding: 24px;">
              <span>No sounds matched your filter.</span>
              <button type="button" id="btn-drawer-reset-filters" class="drawer-empty-link">Reset filters</button>
            </div>
          ` : `
            <div class="effect-drawer-grid">
              ${filteredTriggers.map((t, idx) => `
                <div class="drawer-fx-card" data-id="${t.id}" data-idx="${idx}">
                  <button type="button" class="drawer-fx-fire-btn" data-id="${t.id}" title="${t.label} (Press ${t.hotkey || 'click'} to play)">
                    ${t.hotkey ? `<kbd class="drawer-fx-hotkey">${t.hotkey}</kbd>` : ''}
                    <span class="drawer-fx-icon">${FantasyIcons.render(t.icon, { size: 26 })}</span>
                    <span class="drawer-fx-name">${t.shortName || t.label}</span>
                    <span class="drawer-fx-credit">${t.credit || 'RPG SFX'}</span>
                  </button>
                  <button type="button" class="drawer-fx-cfg-btn" data-id="${t.id}" title="Configure Button (Short Name, Symbol, Hotkey)">
                    ${FantasyIcons.get('feather', { size: 13 })}
                  </button>
                  <button type="button" class="drawer-fx-del-btn" data-id="${t.id}" title="Remove sound from scene">
                    ${FantasyIcons.get('close', { size: 13 })}
                  </button>
                </div>
              `).join('')}
            </div>
          `}
        </div>
        </div>

        <!-- Drawer Footer Hints -->
        <div class="effect-drawer-footer">
          <span class="drawer-footer-hint">
            Press <kbd>Q</kbd>, <kbd>W</kbd>, <kbd>E</kbd>, etc. to trigger SFX · <kbd>B</kbd> to toggle drawer
          </span>
        </div>
      </aside>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Handle click to toggle drawer
    this.container.querySelector('#effect-drawer-handle')?.addEventListener('click', () => {
      this.toggleExpand();
    });

    // Close button
    this.container.querySelector('#btn-drawer-close')?.addEventListener('click', () => {
      this.close();
    });

    // Toggle Add Drawer
    const toggleAdd = () => {
      this.showAddDrawer = !this.showAddDrawer;
      this.render();
    };
    this.container.querySelector('#btn-drawer-add-fx')?.addEventListener('click', toggleAdd);
    this.container.querySelector('#btn-drawer-empty-add')?.addEventListener('click', toggleAdd);

    // Search input
    const searchInput = this.container.querySelector('#drawer-fx-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.render();
        const inputNow = this.container.querySelector('#drawer-fx-search');
        if (inputNow) {
          inputNow.focus();
          inputNow.selectionStart = inputNow.selectionEnd = inputNow.value.length;
        }
      });
    }

    // Clear search
    this.container.querySelector('#btn-clear-fx-search')?.addEventListener('click', () => {
      this.searchQuery = '';
      this.render();
    });

    // Category filter chips
    this.container.querySelectorAll('.drawer-cat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.filterCategory = chip.getAttribute('data-cat') || 'all';
        this.render();
      });
    });

    // Reset filters
    this.container.querySelector('#btn-drawer-reset-filters')?.addEventListener('click', () => {
      this.filterCategory = 'all';
      this.searchQuery = '';
      this.render();
    });

    // Tab buttons inside Add Drawer
    this.container.querySelectorAll('.ctx-fx-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeEffectTab = btn.getAttribute('data-tab');
        this.render();
      });
    });

    // Category buttons inside Presets Tab
    this.container.querySelectorAll('.ctx-fx-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activePresetCategory = btn.getAttribute('data-cat');
        this.render();
      });
    });

    // Audio Preview buttons inside Add Drawer
    this.container.querySelectorAll('.ctx-fx-row-play').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const file = btn.getAttribute('data-file');
        this.togglePreview(file);
      });
    });

    // Relink from other scenes button
    this.container.querySelectorAll('.ctx-fx-btn-relink').forEach(btn => {
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

    // Add Preset button
    this.container.querySelectorAll('.ctx-fx-btn-add-preset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const preset = RPG_SFX_PRESETS.find(p => p.id === id);
        if (preset) {
          this.addEffectToStage(preset);
        }
      });
    });

    // Add Custom Sound button
    this.container.querySelector('#drawer-btn-add-custom')?.addEventListener('click', () => {
      const nameInput = this.container.querySelector('#drawer-custom-name');
      const iconInput = this.container.querySelector('#drawer-custom-icon');
      const fileInput = this.container.querySelector('#drawer-custom-file');
      const creditInput = this.container.querySelector('#drawer-custom-credit');
      const keyInput = this.container.querySelector('#drawer-custom-key');

      const shortName = nameInput?.value.trim() || 'Custom Sound';
      const icon = iconInput?.value.trim() || '⚡';
      const file = fileInput?.value.trim();
      const credit = creditInput?.value.trim() || 'Custom SFX';
      const hotkey = keyInput?.value.trim().toUpperCase() || '';

      if (!file) {
        showToast('Please enter an audio file path or URL.', 'error');
        return;
      }

      this.addEffectToStage({ shortName, label: shortName, icon, file, credit, hotkey });
    });

    // Configure Button on Card
    this.container.querySelectorAll('.drawer-fx-cfg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const trig = this.stage?.layers?.effects?.triggers?.find(t => t.id === id);
        if (trig && this.onConfigureTrigger) {
          this.onConfigureTrigger(trig, this.stage, this.adventure);
        }
      });
    });

    // Delete Button on Card
    this.container.querySelectorAll('.drawer-fx-del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        this.removeEffectFromStage(id);
      });
    });

    // Fire Button Click
    this.container.querySelectorAll('.drawer-fx-fire-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target.classList.contains('drawer-fx-cfg-btn') || e.target.classList.contains('drawer-fx-del-btn')) return;
        const id = btn.getAttribute('data-id');
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 250);
        this.audio.playSFX(id);
      });
    });
  }
}
