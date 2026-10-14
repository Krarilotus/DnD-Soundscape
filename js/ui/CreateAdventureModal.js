/**
 * DnD-Soundscape: Create Adventure Wizard Modal Component
 */

import { generateId, showToast } from '../utils/helpers.js';
import { FantasyIcons } from './FantasyIcons.js';
import { THEME_CATALOG } from './ThemeCatalog.js';

export class CreateAdventureModal {
  constructor(adventureStore, onCreatedCallback) {
    this.store = adventureStore;
    this.onCreatedCallback = onCreatedCallback;
    this.modalEl = null;
    this.isOpen = false;
  }

  init() {
    let el = document.getElementById('create-adventure-modal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'create-adventure-modal';
      el.className = 'modal-backdrop hidden';
      document.body.appendChild(el);
    }
    this.modalEl = el;
    this.render();
  }

  render() {
    if (!this.modalEl) return;

    this.modalEl.innerHTML = `
      <div class="modal-window theme-card" style="max-width: 680px;">
        <header class="modal-header">
          <h2>
            <span>${FantasyIcons.get('spark', { size: 20 })}</span>
            <span>Create New Adventure Soundscape</span>
          </h2>
          <button id="btn-create-adv-close" class="btn-icon" aria-label="Close">${FantasyIcons.get('close', { size: 16 })}</button>
        </header>

        <div class="modal-body" style="flex-direction: column; gap: 18px;">
          <!-- Basic Info -->
          <div class="form-row-2">
            <div class="form-group">
              <label>Adventure Title</label>
              <input type="text" id="input-new-title" class="form-input" placeholder="e.g. Shadows of the Sunken Citadel" required>
            </div>
            <div class="form-group">
              <label>Author / DM Name</label>
              <input type="text" id="input-new-author" class="form-input" placeholder="e.g. Dungeon Master" value="Dungeon Master">
            </div>
          </div>

          <div class="form-group">
            <label>Subtitle / Setting</label>
            <input type="text" id="input-new-subtitle" class="form-input" placeholder="e.g. An Underdark Exploration Campaign">
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea id="input-new-desc" class="form-textarea" rows="2" placeholder="Brief summary of the campaign or one-shot setting..."></textarea>
          </div>

          <!-- Preset Map & Theme -->
          <div class="form-row-2">
            <div class="form-group">
              <label>Starter Regional Map</label>
              <select id="select-new-map" class="form-select">
                <option value="../../adventures/phandelver/img/panorama.jpg">Sword Mountains & Phandalin Panorama</option>
                <option value="../../adventures/hochsattel/img/panorama.png">Alpine Mountain Panorama (Hochsattel)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Visual UI Theme</label>
              <select id="select-new-theme" class="form-select">
                ${THEME_CATALOG.map(t => `
                  <option value="${t.id}">${t.name} (${t.subtitle})</option>
                `).join('')}
              </select>
            </div>
          </div>

          <!-- Starter Template -->
          <div class="form-group">
            <label>Starter Stages Template</label>
            <select id="select-new-template" class="form-select">
              <option value="3stage">3 Stages (Tavern, Dungeon, Boss Fight)</option>
              <option value="6stage">6 Stages (Full Campaign Arc)</option>
              <option value="blank">1 Blank Stage (Fresh Canvas)</option>
            </select>
          </div>
        </div>

        <footer class="modal-footer">
          <button id="btn-create-adv-cancel" class="btn-secondary">Cancel</button>
          <button id="btn-create-adv-submit" class="btn-primary">
            ${FantasyIcons.get('plus', { size: 16 })}
            <span>Create Adventure</span>
          </button>
        </footer>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.modalEl.querySelector('#btn-create-adv-close')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-create-adv-cancel')?.addEventListener('click', () => this.close());

    this.modalEl.querySelector('#btn-create-adv-submit')?.addEventListener('click', async () => {
      const title = document.getElementById('input-new-title')?.value.trim();
      if (!title) {
        showToast('Please enter an adventure title', 'error');
        return;
      }

      const author = document.getElementById('input-new-author')?.value.trim() || 'DM';
      const subtitle = document.getElementById('input-new-subtitle')?.value.trim() || 'Custom D&D Campaign';
      const desc = document.getElementById('input-new-desc')?.value.trim() || 'Custom adventure soundscape.';
      const map = document.getElementById('select-new-map')?.value;
      const theme = document.getElementById('select-new-theme')?.value;
      const template = document.getElementById('select-new-template')?.value;

      let stages = [];
      if (template === '3stage') {
        stages = [
          {
            id: 'stage_tavern',
            label: '1. Starting Tavern / Town',
            type: 'roleplay',
            icon: '🍺',
            hotkey: '1',
            crossfadeSec: 4.0,
            hotspot: { x: 25.0, y: 70.0, r: 6 },
            description: 'Where the party gathers.',
            layers: {
              music: { name: 'Tavern Melody', volume: 0.65, playlistMode: 'loopAll', tracks: [{ title: 'Tavern Lute', file: '../../audio_presets/tavern_lute.wav' }] },
              ambience: { name: 'Campfire', volume: 0.50, playlistMode: 'loopAll', tracks: [{ title: 'Campfire', file: '../../audio_presets/campfire_ambience.wav' }] },
              effects: { name: 'Town SFX', volume: 0.80, triggers: [{ id: 'spell', label: 'Magic', icon: '✨', hotkey: 'Q', file: '../../audio_presets/spell_surge.wav' }] }
            }
          },
          {
            id: 'stage_dungeon',
            label: '2. Dungeon Exploration',
            type: 'exploration',
            icon: '🕯️',
            hotkey: '2',
            crossfadeSec: 4.0,
            hotspot: { x: 50.0, y: 50.0, r: 6 },
            description: 'Dark underground corridors with mysterious echoes.',
            layers: {
              music: { name: 'Dungeon Drone', volume: 0.60, playlistMode: 'loopAll', tracks: [{ title: 'Dungeon Drone', file: '../../audio_presets/dungeon_drone.wav' }] },
              ambience: { name: 'Cave Drips', volume: 0.60, playlistMode: 'loopAll', tracks: [{ title: 'Cave Drips', file: '../../audio_presets/cave_drips.wav' }] },
              effects: { name: 'Dungeon SFX', volume: 0.85, triggers: [{ id: 'sword', label: 'Trap', icon: '🪤', hotkey: 'Q', file: '../../audio_presets/sword_clash.wav' }] }
            }
          },
          {
            id: 'stage_combat',
            label: '3. Boss Encounter',
            type: 'boss',
            icon: '💀',
            hotkey: '3',
            crossfadeSec: 1.5,
            hotspot: { x: 75.0, y: 30.0, r: 6 },
            description: 'Climactic boss fight with driving war drums.',
            layers: {
              music: { name: 'Combat Drums', volume: 0.80, playlistMode: 'loopAll', tracks: [{ title: 'Combat Drums', file: '../../audio_presets/combat_drums.wav' }] },
              ambience: { name: 'Storm Wind', volume: 0.50, playlistMode: 'loopAll', tracks: [{ title: 'Wind', file: '../../audio_presets/forest_wind.wav' }] },
              effects: { name: 'Boss SFX', volume: 0.90, triggers: [{ id: 'roar', label: 'Roar', icon: '🐉', hotkey: 'Q', file: '../../audio_presets/monster_roar.wav' }] }
            }
          }
        ];
      } else {
        stages = [
          {
            id: 'stage_1',
            label: '1. Initial Location',
            type: 'roleplay',
            icon: '📍',
            hotkey: '1',
            crossfadeSec: 4.0,
            hotspot: { x: 50.0, y: 50.0, r: 6 },
            description: 'Starting point of the adventure.',
            layers: {
              music: { name: 'Music', volume: 0.70, playlistMode: 'loopAll', tracks: [{ title: 'Tavern Lute', file: '../../audio_presets/tavern_lute.wav' }] },
              ambience: { name: 'Ambience', volume: 0.50, playlistMode: 'loopAll', tracks: [{ title: 'Campfire', file: '../../audio_presets/campfire_ambience.wav' }] },
              effects: { name: 'SFX', volume: 0.85, triggers: [] }
            }
          }
        ];
      }

      const advId = title.toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 32);
      const newAdv = {
        id: advId,
        title,
        subtitle,
        author,
        version: '1.0.0',
        description: desc,
        previewImage: map,
        coverImage: map,
        theme,
        defaultCrossfadeSec: 4.0,
        duckLevel: 0.35,
        masterVolume: 0.8,
        stages
      };

      try {
        await this.store.saveAdventure(newAdv);
        showToast(`Created adventure "${title}"!`, 'success');
        if (this.onCreatedCallback) this.onCreatedCallback(newAdv);
        this.close();
      } catch (err) {
        showToast(`Failed to create adventure: ${err.message}`, 'error');
      }
    });
  }

  open() {
    if (!this.modalEl) this.init();
    this.modalEl.classList.remove('hidden');
    this.isOpen = true;
  }

  close() {
    if (this.modalEl) this.modalEl.classList.add('hidden');
    this.isOpen = false;
  }
}
