/**
 * DnD-Soundscape: Configure Effect Button Modal
 * Allows customizing effect button short names, symbols, hotkeys, and audio sources.
 */

import { showToast } from '../utils/helpers.js';
import { HOTKEY_SEQUENCE } from '../audio/PresetEffects.js';
import { FantasyIcons } from './FantasyIcons.js';

export const QUICK_SYMBOLS = [
  '⚔️', '🛡️', '🏹', '🗡️', '⚡', '🔥', '🔮', '⛈️', '☠️', '🧪',
  '👺', '🐉', '🐺', '👹', '👁️', '🕸️', '🌿', '🍻', '🪙', '🚪',
  '🎲', '🗄️', '🗝️', '🌊', '💥', '💧', '🔔', '🥁', '🪵', '✨'
];

export class ConfigureEffectModal {
  constructor(audioEngine, onSaveCallback) {
    this.audio = audioEngine;
    this.onSaveCallback = onSaveCallback; // (stage, updatedTrigger, isDelete)
    this.modalEl = null;
    this.trigger = null;
    this.stage = null;
    this.adventure = null;
    this.isOpen = false;
    this.previewAudioEl = null;
  }

  init() {
    let el = document.getElementById('configure-effect-modal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'configure-effect-modal';
      el.className = 'modal-backdrop hidden';
      document.body.appendChild(el);
    }
    this.modalEl = el;
    this.render();
  }

  open(trigger, stage, adventure = null) {
    if (!this.modalEl) this.init();
    this.trigger = JSON.parse(JSON.stringify(trigger)); // clone
    this.stage = stage;
    this.adventure = adventure;
    this.isOpen = true;
    this.render();
    this.modalEl.classList.remove('hidden');
  }

  close() {
    this.stopPreview();
    this.isOpen = false;
    if (this.modalEl) this.modalEl.classList.add('hidden');
  }

  stopPreview() {
    if (this.previewAudioEl) {
      this.previewAudioEl.pause();
      this.previewAudioEl = null;
    }
  }

  togglePreview(file) {
    if (!file) return;
    if (this.previewAudioEl && !this.previewAudioEl.paused) {
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
      this.previewAudioEl.play().catch(e => console.warn('Preview blocked:', e));
      this.previewAudioEl.onended = () => {
        this.previewAudioEl = null;
        this.render();
      };
      this.render();
    } catch (e) {
      console.warn('Audio preview error:', e);
    }
  }

  render() {
    if (!this.modalEl || !this.trigger) return;

    const t = this.trigger;
    const isPlaying = this.previewAudioEl && !this.previewAudioEl.paused;

    this.modalEl.innerHTML = `
      <div class="modal-window theme-card" style="max-width: 500px;">
        <header class="modal-header">
          <h2>
            <span>${FantasyIcons.get('gear', { size: 18 })}</span>
            <span>Configure Effect Button</span>
          </h2>
          <button id="btn-close-cfg-fx" class="btn-icon" aria-label="Close">${FantasyIcons.get('close', { size: 16 })}</button>
        </header>

        <div class="modal-body" style="flex-direction: column; gap: 14px;">
          <!-- Symbol / Icon Picker -->
          <div>
            <label class="modal-label" style="font-size: 12px; font-weight: 700; color: var(--theme-primary-light); margin-bottom: 6px; display: block;">
              Button Symbol / Icon:
            </label>
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
              <input type="text" id="cfg-fx-icon" class="ctx-attr-input" value="${t.icon || '⚡'}" style="width: 50px; text-align: center; font-size: 20px; padding: 4px;">
              <span style="font-size: 11.5px; color: var(--theme-text-muted);">Pick from palette or type any symbol</span>
            </div>
            <div class="quick-symbols-grid" style="display: flex; flex-wrap: wrap; gap: 5px; max-height: 90px; overflow-y: auto; background: rgba(0,0,0,0.3); padding: 6px; border-radius: var(--theme-radius-sm); border: 1px solid var(--theme-border-base);">
              ${QUICK_SYMBOLS.map(sym => `
                <button type="button" class="cfg-sym-btn ${sym === t.icon ? 'active' : ''}" data-sym="${sym}" style="width: 28px; height: 28px; background: rgba(255,255,255,0.06); border: 1px solid transparent; border-radius: 4px; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s;">
                  ${FantasyIcons.render(sym, { size: 16 })}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Short Name & Full Label -->
          <div class="ctx-attr-grid">
            <div class="ctx-attr-item">
              <span class="ctx-attr-lbl">Short Name (on Button):</span>
              <input type="text" id="cfg-fx-shortname" class="ctx-attr-input" placeholder="e.g. Slash, Fire, Door" value="${t.shortName || t.label || ''}" maxlength="12">
            </div>
            <div class="ctx-attr-item">
              <span class="ctx-attr-lbl">Full Description / Name:</span>
              <input type="text" id="cfg-fx-label" class="ctx-attr-input" placeholder="e.g. Heavy Sword Clash" value="${t.label || ''}">
            </div>
          </div>

          <!-- Hotkey Selection -->
          <div class="ctx-attr-grid">
            <div class="ctx-attr-item" style="max-width: 140px;">
              <span class="ctx-attr-lbl">Trigger Hotkey:</span>
              <select id="cfg-fx-hotkey" class="ctx-select">
                <option value="" ${!t.hotkey ? 'selected' : ''}>None</option>
                ${HOTKEY_SEQUENCE.map(k => `
                  <option value="${k}" ${t.hotkey === k ? 'selected' : ''}>Key [${k}]</option>
                `).join('')}
              </select>
            </div>
            <div class="ctx-attr-item">
              <span class="ctx-attr-lbl">Artist / Attribution:</span>
              <input type="text" id="cfg-fx-credit" class="ctx-attr-input" placeholder="e.g. Kenney / Freesound" value="${t.credit || ''}">
            </div>
          </div>

          <!-- Audio File Path / URL with Test Button -->
          <div class="ctx-attr-item">
            <span class="ctx-attr-lbl">Audio File or Stream URL:</span>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input type="text" id="cfg-fx-file" class="ctx-attr-input" placeholder="audio_presets/effects/sound.wav" value="${t.file || ''}" style="flex: 1;">
              <button type="button" id="cfg-btn-test-sound" class="ctx-fx-card-play ${isPlaying ? 'playing' : ''}" title="Test Sound" style="width: 32px; height: 32px; font-size: 12px;">
                ${isPlaying ? FantasyIcons.get('stop', { size: 12 }) : FantasyIcons.get('play', { size: 12 })}
              </button>
            </div>
          </div>
        </div>

        <footer class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
          <button type="button" id="cfg-btn-delete-fx" class="btn-danger" style="padding: 6px 12px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px;">
            ${FantasyIcons.get('close', { size: 14 })} Delete Button
          </button>
          <div style="display: flex; gap: 8px;">
            <button type="button" id="cfg-btn-cancel" class="btn-secondary">Cancel</button>
            <button type="button" id="cfg-btn-save-fx" class="btn-primary">Save Button</button>
          </div>
        </footer>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.modalEl.querySelector('#btn-close-cfg-fx')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('#cfg-btn-cancel')?.addEventListener('click', () => this.close());

    // Symbol click
    this.modalEl.querySelectorAll('.cfg-sym-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sym = btn.getAttribute('data-sym');
        this.trigger.icon = sym;
        const iconInput = this.modalEl.querySelector('#cfg-fx-icon');
        if (iconInput) iconInput.value = sym;
        this.modalEl.querySelectorAll('.cfg-sym-btn').forEach(b => b.classList.toggle('active', b === btn));
      });
    });

    // Test sound
    this.modalEl.querySelector('#cfg-btn-test-sound')?.addEventListener('click', () => {
      const file = this.modalEl.querySelector('#cfg-fx-file')?.value.trim() || this.trigger.file;
      this.togglePreview(file);
    });

    // Delete button
    this.modalEl.querySelector('#cfg-btn-delete-fx')?.addEventListener('click', () => {
      if (confirm(`Remove button "${this.trigger.label || this.trigger.shortName}" from this scene?`)) {
        if (this.onSaveCallback && this.stage) {
          this.onSaveCallback(this.stage, this.trigger, true);
        }
        this.close();
      }
    });

    // Save button
    this.modalEl.querySelector('#cfg-btn-save-fx')?.addEventListener('click', () => {
      const shortName = this.modalEl.querySelector('#cfg-fx-shortname')?.value.trim() || 'Sound';
      const label = this.modalEl.querySelector('#cfg-fx-label')?.value.trim() || shortName;
      const icon = this.modalEl.querySelector('#cfg-fx-icon')?.value.trim() || '⚡';
      const hotkey = this.modalEl.querySelector('#cfg-fx-hotkey')?.value || '';
      const credit = this.modalEl.querySelector('#cfg-fx-credit')?.value.trim() || 'RPG SFX';
      const file = this.modalEl.querySelector('#cfg-fx-file')?.value.trim() || this.trigger.file;

      if (!file) {
        showToast('Please specify an audio file or URL.', 'error');
        return;
      }

      this.trigger.shortName = shortName;
      this.trigger.label = label;
      this.trigger.icon = icon;
      this.trigger.hotkey = hotkey;
      this.trigger.credit = credit;
      this.trigger.file = file;

      if (this.onSaveCallback && this.stage) {
        this.onSaveCallback(this.stage, this.trigger, false);
      }
      this.close();
      showToast(`Updated "${shortName}" button!`, 'success');
    });
  }
}
